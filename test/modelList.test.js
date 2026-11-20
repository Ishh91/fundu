import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildModelList, normalizeStorageLabel } from '../server/services/modelList.js';

const row = (brand, model, storage) => ({ brand, model, storage, base_price: 10000 });
const names = (list) => list.map((b) => b.brand);
const modelsOf = (list, brand) => list.find((b) => b.brand === brand)?.models ?? [];

describe('storage labels', () => {
  it('are one spelling, in GB or TB', () => {
    assert.equal(normalizeStorageLabel('128 GB'), '128 GB');
    assert.equal(normalizeStorageLabel('128GB'), '128 GB');
    assert.equal(normalizeStorageLabel('256'), '256 GB');
    assert.equal(normalizeStorageLabel('1 TB'), '1 TB');
    assert.equal(normalizeStorageLabel('1tb'), '1 TB');
    assert.equal(normalizeStorageLabel('2 tb'), '2 TB');
  });

  it('are nothing for a value that is not a size', () => {
    for (const odd of [null, undefined, '', '  ', 'null', 'abc', {}, 0]) assert.equal(normalizeStorageLabel(odd), null, String(odd));
  });
});

describe('the price of a model in the list', () => {
  const priced = (storage, base_price) => ({ brand: 'Samsung', model: 'Galaxy S24', storage, base_price });

  it('is the price of the 128 GB row when the model has one, else of the smallest storage', () => {
    assert.equal(modelsOf(buildModelList([priced('256 GB', 40000), priced('128 GB', 34000), priced('512 GB', 50000)]), 'Samsung')[0].price, 34000);
    assert.equal(modelsOf(buildModelList([priced('512 GB', 50000), priced('256 GB', 40000)]), 'Samsung')[0].price, 40000);
  });

  it('is the dearest of the rows when one storage is listed twice, and ignores a row with no usable price', () => {
    assert.equal(modelsOf(buildModelList([priced('128GB', 30000), priced('128 GB', 34000), priced('128 GB', 0), priced('128 GB', null)]), 'Samsung')[0].price, 34000);
  });

  it('is 0 when no row has a price', () => {
    assert.equal(modelsOf(buildModelList([priced('128 GB', 0), priced('256 GB', undefined)]), 'Samsung')[0].price, 0);
  });
});

describe('the brand and model list for the preview', () => {
  it('groups models under their brand, brands A to Z', () => {
    const list = buildModelList([row('Samsung', 'Galaxy S23', '128 GB'), row('Apple', 'iPhone 13', '128 GB'), row('OnePlus', '12', '256 GB')]);
    assert.deepEqual(names(list), ['Apple', 'OnePlus', 'Samsung']);
    assert.deepEqual(modelsOf(list, 'Apple').map((m) => m.model), ['iPhone 13']);
  });

  it('lists each model once, with every storage it is priced in, smallest first', () => {
    const list = buildModelList([row('Apple', 'iPhone 13', '256 GB'), row('Apple', 'iPhone 13', '128 GB'), row('Apple', 'iPhone 13', '512GB'), row('Apple', 'iPhone 13', '128 GB'), row('Apple', 'iPhone 13', '1 TB')]);
    assert.deepEqual(modelsOf(list, 'Apple'), [{ model: 'iPhone 13', storages: ['128 GB', '256 GB', '512 GB', '1 TB'], price: 10000 }]);
  });

  it('sorts models the way a person reads them: iPhone 8 before iPhone 11, 12 before 13', () => {
    const list = buildModelList(['iPhone 13', 'iPhone 8', 'iPhone 11 Pro', 'iPhone 11', 'iPhone 12'].map((m) => row('Apple', m, '128 GB')));
    assert.deepEqual(modelsOf(list, 'Apple').map((m) => m.model), ['iPhone 8', 'iPhone 11', 'iPhone 11 Pro', 'iPhone 12', 'iPhone 13']);
  });

  it('joins one model spelled two ways into one, keeping the spelling most rows use', () => {
    const list = buildModelList([
      row('Apple', 'iPhone 16 Pro Max', '256 GB'), row('Apple', 'iPhone 16 Pro Max', '512 GB'), row('Apple', 'iPhone 16 Pro max', '256 GB'),
      row('Apple', 'iPhone air', '128 GB'), row('Apple', 'iPhone Air', '256 GB'), row('Apple', 'iPhone Air', '512 GB'),
    ]);
    const models = modelsOf(list, 'Apple').map((m) => m.model);
    assert.deepEqual(models, ['iPhone 16 Pro Max', 'iPhone Air']);
    assert.deepEqual(modelsOf(list, 'Apple').find((m) => m.model === 'iPhone Air').storages, ['128 GB', '256 GB', '512 GB'], 'the storages of both spellings');
  });

  it('joins a brand spelled two ways, and ignores spaces around it', () => {
    const list = buildModelList([row('Samsung', 'Galaxy S23', '128 GB'), row(' samsung ', 'Galaxy S24', '128 GB'), row('SAMSUNG', 'Galaxy S25', '128 GB')]);
    assert.equal(list.length, 1);
    assert.equal(list[0].brand, 'Samsung');
    assert.equal(list[0].models.length, 3);
  });

  it('leaves out an Apple row that is not an iPhone, such as a Redmi Note filed under Apple', () => {
    const list = buildModelList([
      row('Apple', 'iPhone 14', '128 GB'), row('Apple', 'Redmi Note 11 Pro+ 5g', '128 GB'), row('Apple', 'Note 40 Pro+ 5G', '256 GB'),
    ]);
    assert.deepEqual(modelsOf(list, 'Apple').map((m) => m.model), ['iPhone 14']);
  });

  it('leaves out a Redmi row that is filed under a brand that does not make it', () => {
    const list = buildModelList([row('Xiaomi', 'Redmi Note 11 Pro', '128 GB'), row('Samsung', 'Redmi Note 12', '128 GB'), row('Poco', 'Redmi Note 10', '64 GB')]);
    assert.deepEqual(names(list), ['Poco', 'Xiaomi']);
  });

  it('leaves out a row with no brand or no model', () => {
    const list = buildModelList([row('', 'Galaxy S23', '128 GB'), row('Samsung', '', '128 GB'), row(null, null, null), row(undefined, 'x', '1'), row('Samsung', 'Galaxy S24', '128 GB')]);
    assert.deepEqual(names(list), ['Samsung']);
    assert.deepEqual(modelsOf(list, 'Samsung').map((m) => m.model), ['Galaxy S24']);
  });

  it('keeps a model that has no storage, with an empty list of storages', () => {
    const list = buildModelList([row('OnePlus', 'Nord 4 5G', null), row('OnePlus', 'Nord 4 5G', 'null')]);
    assert.deepEqual(modelsOf(list, 'OnePlus'), [{ model: 'Nord 4 5G', storages: [], price: 10000 }]);
  });

  it('is empty for nothing, and for something that is not a list', () => {
    assert.deepEqual(buildModelList([]), []);
    for (const bad of [undefined, null, 'x', 5, {}]) assert.deepEqual(buildModelList(bad), []);
  });

  it('survives rows that are not objects', () => {
    assert.deepEqual(names(buildModelList([null, undefined, 5, 'x', row('Apple', 'iPhone 13', '128 GB')])), ['Apple']);
  });

  it('trims the model name and its inner spaces', () => {
    const list = buildModelList([row('Apple', '  iPhone   13  ', '128 GB')]);
    assert.deepEqual(modelsOf(list, 'Apple').map((m) => m.model), ['iPhone 13']);
  });

  it('does not let a brand or model named like an object property break it', () => {
    const list = buildModelList([row('constructor', '__proto__', '128 GB'), row('toString', 'hasOwnProperty', '64 GB')]);
    assert.deepEqual(names(list), ['constructor', 'toString']);
    assert.deepEqual(modelsOf(list, 'constructor'), [{ model: '__proto__', storages: ['128 GB'], price: 10000 }]);
  });
});

describe('a model name with a plus sign', () => {
  it('is its own model: Pro+ is not Pro, and S23+ is not S23', () => {
    const list = buildModelList([
      row('Realme', '12 Pro 5G', '128 GB'), row('Realme', '12 Pro+ 5G', '256 GB'), row('Realme', '13+ 5G', '128 GB'), row('Realme', '13 5G', '128 GB'),
      row('Samsung', 'Galaxy S23', '128 GB'), row('Samsung', 'Galaxy S23+', '256 GB'),
    ]);
    assert.deepEqual(modelsOf(list, 'Realme').map((m) => m.model).sort(), ['12 Pro 5G', '12 Pro+ 5G', '13 5G', '13+ 5G']);
    assert.deepEqual(modelsOf(list, 'Samsung').map((m) => m.model).sort(), ['Galaxy S23', 'Galaxy S23+']);
  });

  it('keeps each one with its own storages and price', () => {
    const list = buildModelList([row('Realme', '12 Pro 5G', '128 GB'), { ...row('Realme', '12 Pro+ 5G', '256 GB'), base_price: 30000 }]);
    const plus = modelsOf(list, 'Realme').find((m) => m.model === '12 Pro+ 5G');
    assert.deepEqual(plus.storages, ['256 GB']);
    assert.equal(plus.price, 30000);
  });

  it('treats "Pro Plus" and "Pro+" as one model, since the price rows spell it both ways', () => {
    const list = buildModelList([row('Realme', '12 Pro Plus 5G', '128 GB'), row('Realme', '12 Pro+ 5G', '256 GB')]);
    const realme = modelsOf(list, 'Realme');
    assert.equal(realme.length, 1);
    assert.deepEqual(realme[0].storages, ['128 GB', '256 GB']);
  });
});
