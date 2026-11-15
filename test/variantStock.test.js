import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanVariantStock,
  findVariantEntry,
  totalVariantStock,
  tracksVariantStock,
} from '../shared/variantStock.js';
import { priceOrderItems } from '../server/services/orderSecurity.js';
import { adjustProductStock, reserveOrderStock } from '../server/services/stockService.js';

const listing = () => ({
  id: 'p1',
  title: 'Phone',
  price: 20000,
  storage: '128 GB',
  color: 'Blue',
  condition: 'Superb',
  is_approved: true,
  stock: 3,
  available_storages: ['128 GB', '256 GB'],
  available_colors: ['Blue', 'Black'],
  variant_stock: [
    { storage: '128 GB', color: 'Blue', stock: 2 },
    { storage: '256 GB', color: 'Black', stock: 1 },
  ],
});

/** A tiny in-memory Product that understands only the query shapes the stock service sends. */
const fakeProduct = (docs) => {
  const elementMatches = (element, spec) =>
    Object.entries(spec).every(([key, want]) =>
      want && typeof want === 'object' && '$gte' in want ? element[key] >= want.$gte : element[key] === want);
  const matches = (doc, filter) => {
    if (filter.$and) return filter.$and.every((part) => matches(doc, part));
    if (filter.$or) return filter.$or.some((part) => matches(doc, part));
    return Object.entries(filter).every(([key, want]) => {
      if (key === '_id') return false;
      if (key === 'variant_stock') return (doc.variant_stock || []).some((entry) => elementMatches(entry, want.$elemMatch));
      return doc[key] === want;
    });
  };
  return {
    docs,
    findOne: (filter) => ({ lean: async () => docs.find((doc) => matches(doc, filter)) || null }),
    findOneAndUpdate: async (filter, update) => {
      const doc = docs.find((candidate) => matches(candidate, filter));
      if (!doc) return null;
      const spec = filter.$and?.find((part) => part.variant_stock)?.variant_stock.$elemMatch;
      for (const [path, delta] of Object.entries(update.$inc)) {
        if (path === 'variant_stock.$.stock') {
          doc.variant_stock.find((entry) => elementMatches(entry, spec)).stock += delta;
        } else {
          doc[path] += delta;
        }
      }
      return doc;
    },
  };
};

describe('variant stock helpers', () => {
  it('finds the entry for a storage + colour, ignoring how the size is written', () => {
    assert.equal(findVariantEntry(listing(), { storage: '256gb', color: 'black' }).stock, 1);
    assert.equal(findVariantEntry(listing(), { storage: '256 GB', color: 'Blue' }), null);
  });

  it('falls back to the listing own storage and colour when the choice is empty', () => {
    assert.equal(findVariantEntry(listing(), {}).stock, 2);
  });

  it('does not track a listing without a variant list', () => {
    assert.equal(tracksVariantStock({ stock: 4 }), false);
    assert.equal(findVariantEntry({ stock: 4 }, { storage: '128 GB' }), null);
  });

  it('cleans a form list: trims, merges repeats, drops negatives and blanks', () => {
    const cleaned = cleanVariantStock([
      { storage: ' 128 GB ', color: 'Blue', stock: '2' },
      { storage: '128gb', color: 'blue', stock: 1 },
      { storage: '256 GB', color: 'Black', stock: -4 },
      { storage: '', color: '', stock: 9 },
    ]);
    assert.deepEqual(cleaned, [
      { storage: '128 GB', color: 'Blue', stock: 3 },
      { storage: '256 GB', color: 'Black', stock: 0 },
    ]);
    assert.equal(totalVariantStock(cleaned), 3);
  });
});

describe('priceOrderItems with per-variant stock', () => {
  const lookup = async () => listing();

  it('accepts an order within the chosen variant stock', async () => {
    const result = await priceOrderItems([{ product_id: 'p1', quantity: 2, storage: '128 GB', color: 'Blue' }], lookup);
    assert.equal(result.quantity, 2);
  });

  it('refuses more than the chosen variant has, even when the listing total is enough', async () => {
    await assert.rejects(
      priceOrderItems([{ product_id: 'p1', quantity: 2, storage: '256 GB', color: 'Black' }], lookup),
      /Not enough stock for Phone \(256 GB, Black\)/,
    );
  });

  it('refuses a storage + colour combination the listing does not count', async () => {
    await assert.rejects(
      priceOrderItems([{ product_id: 'p1', quantity: 1, storage: '256 GB', color: 'Blue' }], lookup),
      /combination is not available/,
    );
  });

  it('shares one variant stock between cart lines of the same variant', async () => {
    await assert.rejects(
      priceOrderItems(
        [
          { product_id: 'p1', quantity: 2, storage: '128 GB', color: 'Blue' },
          { product_id: 'p1', quantity: 1, storage: '128 GB', color: 'Blue' },
        ],
        lookup,
      ),
      /Not enough stock/,
    );
  });
});

describe('adjustProductStock and reserveOrderStock', () => {
  it('takes from the chosen variant and the total only', async () => {
    const Product = fakeProduct([listing()]);
    const ok = await adjustProductStock(Product, 'p1', { storage: '256 GB', color: 'Black' }, 1, 'take');
    assert.equal(ok, true);
    const [doc] = Product.docs;
    assert.equal(doc.variant_stock[1].stock, 0);
    assert.equal(doc.variant_stock[0].stock, 2);
    assert.equal(doc.stock, 2);
  });

  it('refuses to take the last unit twice', async () => {
    const Product = fakeProduct([listing()]);
    const choice = { storage: '256 GB', color: 'Black' };
    assert.equal(await adjustProductStock(Product, 'p1', choice, 1, 'take'), true);
    assert.equal(await adjustProductStock(Product, 'p1', choice, 1, 'take'), false);
    assert.equal(Product.docs[0].variant_stock[1].stock, 0);
    assert.equal(Product.docs[0].stock, 2);
  });

  it('gives units back to the same variant', async () => {
    const Product = fakeProduct([listing()]);
    const choice = { storage: '128 GB', color: 'Blue' };
    await adjustProductStock(Product, 'p1', choice, 2, 'take');
    await adjustProductStock(Product, 'p1', choice, 2, 'give');
    assert.equal(Product.docs[0].variant_stock[0].stock, 2);
    assert.equal(Product.docs[0].stock, 3);
  });

  it('keeps counting a listing without variants by its single stock', async () => {
    const Product = fakeProduct([{ id: 'p2', stock: 5 }]);
    await adjustProductStock(Product, 'p2', { storage: '128 GB' }, 2, 'take');
    assert.equal(Product.docs[0].stock, 3);
  });

  it('gives back earlier lines and throws when a later variant is sold out', async () => {
    const Product = fakeProduct([listing()]);
    const orders = [{
      items: [
        { product_id: 'p1', quantity: 1, storage: '128 GB', color: 'Blue', title: 'Phone' },
        { product_id: 'p1', quantity: 2, storage: '256 GB', color: 'Black', title: 'Phone' },
      ],
    }];
    await assert.rejects(reserveOrderStock(Product, orders), /Not enough stock for Phone/);
    assert.equal(Product.docs[0].variant_stock[0].stock, 2);
    assert.equal(Product.docs[0].variant_stock[1].stock, 1);
    assert.equal(Product.docs[0].stock, 3);
  });
});
