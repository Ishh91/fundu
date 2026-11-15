import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

// Bundled, because the cart rules import the shared variant-stock helpers.
const bundle = async (path) => {
  const { outputFiles } = await build({ entryPoints: [new URL(path, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')], bundle: true, format: 'esm', write: false });
  return import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
};
const limits = await bundle('../src/lib/cartLimits.ts');
const availability = await bundle('../src/lib/variantAvailability.ts');
const { stockCap, maxForLine, clampLineQuantity, unitsInCart, stockNotice, missingChoices, reconcileLines, MAX_PER_LISTING } = limits;
const { variantInStock, storageInStock, firstInStockChoice } = availability;

const line = (id, quantity, item, type = 'product') => ({ id, type, quantity, item });

describe('stockCap', () => {
  it('is the stock when it is below the per-listing maximum', () => {
    assert.equal(stockCap({ stock: 2 }), 2);
    assert.equal(stockCap({ stock: 0 }), 0);
  });

  it('never goes above the per-listing maximum', () => {
    assert.equal(stockCap({ stock: 500 }), MAX_PER_LISTING);
  });

  it('allows the maximum when the stock is unknown', () => {
    assert.equal(stockCap({}), MAX_PER_LISTING);
    assert.equal(stockCap({ stock: null }), MAX_PER_LISTING);
  });

  it('never goes below zero', () => {
    assert.equal(stockCap({ stock: -3 }), 0);
  });
});

describe('clampLineQuantity', () => {
  it('stops a single line at the stock', () => {
    const lines = [line('a', 2, { id: 'p1', stock: 2 })];
    assert.deepEqual(clampLineQuantity(lines, lines[0], 3), { quantity: 2, limited: true });
  });

  it('lets a line grow while stock remains', () => {
    const lines = [line('a', 1, { id: 'p1', stock: 3 })];
    assert.deepEqual(clampLineQuantity(lines, lines[0], 2), { quantity: 2, limited: false });
  });

  it('shares one stock across lines of the same listing (different storage or colour)', () => {
    const lines = [line('a', 1, { id: 'p1', stock: 2 }), line('b', 1, { id: 'p1', stock: 2 })];
    assert.equal(maxForLine(lines, lines[0]), 1);
    assert.deepEqual(clampLineQuantity(lines, lines[1], 2), { quantity: 1, limited: true });
  });

  it('keeps different listings apart', () => {
    const lines = [line('a', 2, { id: 'p1', stock: 2 }), line('b', 1, { id: 'p2', stock: 2 })];
    assert.equal(maxForLine(lines, lines[1]), 2);
  });

  it('does not mix a product with a spare part that has the same id', () => {
    const lines = [line('a', 2, { id: 'x', stock: 2 }, 'product'), line('b', 1, { id: 'x', stock: 2 }, 'spare_part')];
    assert.equal(maxForLine(lines, lines[1]), 2);
  });

  it('gives zero for an out-of-stock listing and rejects fractions and junk', () => {
    const lines = [line('a', 1, { id: 'p1', stock: 0 })];
    assert.deepEqual(clampLineQuantity(lines, lines[0], 1), { quantity: 0, limited: true });
    const ok = [line('b', 1, { id: 'p2', stock: 5 })];
    assert.equal(clampLineQuantity(ok, ok[0], 2.7).quantity, 2);
    assert.equal(clampLineQuantity(ok, ok[0], Number.NaN).quantity, 0);
  });
});

describe('unitsInCart', () => {
  it('counts a listing across lines, excluding one line when asked', () => {
    const lines = [line('a', 2, { id: 'p1' }), line('b', 3, { id: 'p1' }), line('c', 4, { id: 'p2' })];
    assert.equal(unitsInCart(lines, 'product', { id: 'p1' }), 5);
    assert.equal(unitsInCart(lines, 'product', { id: 'p1' }, 'a'), 3);
  });
});

describe('stockNotice', () => {
  it('words the three cases', () => {
    assert.equal(stockNotice(0), 'Out of stock');
    assert.equal(stockNotice(1), 'Only 1 left in stock');
    assert.equal(stockNotice(2), 'Only 2 left in stock');
  });
});

describe('missingChoices', () => {
  it('needs nothing when the listing has no options', () => {
    assert.deepEqual(missingChoices({ storage: '128 GB', color: '' }), []);
    assert.deepEqual(missingChoices({ available_storages: ['128 GB'], available_colors: ['Black'] }), []);
  });

  it('asks for a storage that is not one of the options', () => {
    assert.deepEqual(missingChoices({ available_storages: ['128 GB', '256 GB'], storage: '' }), ['storage']);
    assert.deepEqual(missingChoices({ available_storages: ['128 GB', '256 GB'], storage: '512 GB' }), ['storage']);
    assert.deepEqual(missingChoices({ available_storages: ['128 GB', '256 GB'], storage: '256 gb ' }), []);
  });

  it('asks for a colour when there are options and none is chosen', () => {
    assert.deepEqual(missingChoices({ available_colors: ['Black', 'Blue'], color: '  ' }), ['colour']);
    assert.deepEqual(missingChoices({ available_colors: ['Black', 'Blue'], color: 'Blue' }), []);
  });

  it('reports both when both are missing', () => {
    assert.deepEqual(missingChoices({ available_storages: ['64 GB', '128 GB'], available_colors: ['A', 'B'] }), ['storage', 'colour']);
  });
});

describe('reconcileLines', () => {
  const { reconcileLines } = limits;

  it('leaves the cart alone when stock is still enough', () => {
    const lines = [line('a', 2, { id: 'p1', stock: 5, title: 'Phone' })];
    const { lines: next, messages } = reconcileLines(lines, { p1: { stock: 5 } });
    assert.equal(next[0].quantity, 2);
    assert.deepEqual(messages, []);
  });

  it('cuts a line down to the fresh stock and says so', () => {
    const lines = [line('a', 3, { id: 'p1', stock: 5, title: 'Phone' })];
    const { lines: next, messages } = reconcileLines(lines, { p1: { stock: 1 } });
    assert.equal(next[0].quantity, 1);
    assert.equal(next[0].item.stock, 1);
    assert.match(messages[0], /Only 1 left in stock for Phone/);
  });

  it('spreads one listing\'s stock over its lines in order', () => {
    const lines = [line('a', 1, { id: 'p1', stock: 5, title: 'Phone' }), line('b', 2, { id: 'p1', stock: 5, title: 'Phone' })];
    const { lines: next } = reconcileLines(lines, { p1: { stock: 2 } });
    assert.deepEqual(next.map((l) => l.quantity), [1, 1]);
  });

  it('removes sold-out and withdrawn listings', () => {
    const lines = [line('a', 1, { id: 'p1', stock: 5, title: 'Sold' }), line('b', 1, { id: 'p2', stock: 5, title: 'Gone' })];
    const { lines: next, messages } = reconcileLines(lines, { p1: { stock: 0 }, p2: { stock: null } });
    assert.equal(next.length, 0);
    assert.equal(messages.length, 2);
  });

  it('keeps lines it knows nothing about, and spare parts', () => {
    const lines = [line('a', 4, { id: 'x', stock: 9 }), line('b', 2, { id: 'p1', stock: 9 }, 'spare_part')];
    const { lines: next } = reconcileLines(lines, { p1: { stock: 0 } });
    assert.equal(next.length, 2);
  });
});

describe('per-variant stock in the cart', () => {
  const phone = {
    id: 'p1',
    title: 'Phone',
    stock: 3,
    storage: '128 GB',
    color: 'Blue',
    variant_stock: [
      { storage: '128 GB', color: 'Blue', stock: 2 },
      { storage: '256 GB', color: 'Black', stock: 1 },
      { storage: '256 GB', color: 'Blue', stock: 0 },
    ],
  };
  const choose = (storage, color) => ({ ...phone, storage, color });

  it('caps a line by the stock of its own storage and colour', () => {
    assert.equal(stockCap(choose('128 GB', 'Blue')), 2);
    assert.equal(stockCap(choose('256 GB', 'Black')), 1);
    assert.equal(stockCap(choose('256 GB', 'Blue')), 0);
  });

  it('shares stock only between lines of the same variant', () => {
    const lines = [line('a', 2, choose('128 GB', 'Blue')), line('b', 1, choose('256 GB', 'Black'))];
    assert.equal(maxForLine(lines, lines[0]), 2);
    assert.equal(maxForLine(lines, lines[1]), 1);
    const twoBlue = [line('a', 1, choose('128 GB', 'Blue')), line('c', 1, choose('128 GB', 'Blue'))];
    assert.equal(maxForLine(twoBlue, twoBlue[0]), 1);
  });

  it('a combination the listing does not count cannot be bought', () => {
    assert.equal(stockCap(choose('512 GB', 'Red')), 0);
  });

  it('a listing without variant stock still uses its single stock', () => {
    assert.equal(stockCap({ id: 'p2', stock: 4 }), 4);
  });

  it('reconcile cuts a line to the fresh variant stock', () => {
    const lines = [line('a', 2, choose('256 GB', 'Black'))];
    const fresh = { p1: { stock: 5, variant_stock: [{ storage: '256 GB', color: 'Black', stock: 1 }] } };
    const result = reconcileLines(lines, fresh);
    assert.equal(result.lines[0].quantity, 1);
    assert.equal(result.messages.length, 1);
  });

  it('reconcile drops a line whose variant sold out', () => {
    const lines = [line('a', 1, choose('256 GB', 'Black'))];
    const fresh = { p1: { stock: 2, variant_stock: [{ storage: '256 GB', color: 'Black', stock: 0 }] } };
    assert.equal(reconcileLines(lines, fresh).lines.length, 0);
  });
});

describe('variant availability on the product page', () => {
  const listing = {
    storage: '128 GB',
    color: 'Blue',
    variant_stock: [
      { storage: '128 GB', color: 'Blue', stock: 0 },
      { storage: '128 GB', color: 'Black', stock: 2 },
      { storage: '256 GB', color: 'Blue', stock: 0 },
      { storage: '256 GB', color: 'Black', stock: 0 },
    ],
  };

  it('flags a sold-out colour for the chosen storage', () => {
    assert.equal(variantInStock(listing, '128 GB', 'Blue'), false);
    assert.equal(variantInStock(listing, '128 GB', 'Black'), true);
  });

  it('flags a storage with no colour left', () => {
    assert.equal(storageInStock(listing, '256 GB', ['Blue', 'Black']), false);
    assert.equal(storageInStock(listing, '128 GB', ['Blue', 'Black']), true);
  });

  it('picks the first choice still in stock, preferring the given storage', () => {
    assert.deepEqual(firstInStockChoice(listing, ['256 GB', '128 GB'], ['Blue', 'Black'], '128 GB'), { storage: '128 GB', color: 'Black' });
    assert.equal(firstInStockChoice({ ...listing, variant_stock: [{ storage: '128 GB', color: 'Blue', stock: 0 }] }, ['128 GB'], ['Blue']), null);
  });

  it('never blocks a listing that does not count stock per variant', () => {
    assert.equal(variantInStock({ storage: '128 GB' }, '256 GB', 'Red'), true);
  });
});
