import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';

async function load(file) {
  const source = await readFile(new URL(`../src/lib/${file}`, import.meta.url), 'utf8');
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

const { defaultStorage, modelsOf, filterModels, resolveChoice } = await load('phoneChoice.ts');

const BRANDS = [
  { brand: 'Apple', models: [
    { model: 'iPhone 14', storages: ['128 GB', '256 GB'] },
    { model: 'iPhone 14 Plus', storages: ['256 GB', '512 GB'] },
    { model: 'iPhone 16 Pro Max', storages: ['256 GB', '512 GB', '1 TB'] },
  ] },
  { brand: 'OnePlus', models: [{ model: '12', storages: ['256 GB'] }, { model: 'Nord 4 5G', storages: [] }] },
  { brand: 'Samsung', models: [{ model: 'Galaxy S23', storages: ['128 GB', '256 GB'] }] },
];

describe('the storage a model starts on', () => {
  it('is 128 GB when the model has it, else the smallest', () => {
    assert.equal(defaultStorage(['64 GB', '128 GB', '256 GB']), '128 GB');
    assert.equal(defaultStorage(['256 GB', '512 GB']), '256 GB');
    assert.equal(defaultStorage([]), '');
  });
});

describe('the models of a brand', () => {
  it('are found whatever the case of the brand, and are none for a brand that is not there', () => {
    assert.equal(modelsOf(BRANDS, 'Apple').length, 3);
    assert.equal(modelsOf(BRANDS, ' apple ').length, 3);
    assert.deepEqual(modelsOf(BRANDS, 'Nokia'), []);
    assert.deepEqual(modelsOf([], 'Apple'), []);
  });
});

describe('filtering models by what is typed', () => {
  const apple = BRANDS[0].models;
  it('keeps every model for nothing typed', () => {
    assert.equal(filterModels(apple, '').length, 3);
    assert.equal(filterModels(apple, '   ').length, 3);
  });

  it('finds a model by any part of its name, in any case and order', () => {
    assert.deepEqual(filterModels(apple, '14 plus').map((m) => m.model), ['iPhone 14 Plus']);
    assert.deepEqual(filterModels(apple, 'PLUS 14').map((m) => m.model), ['iPhone 14 Plus']);
    assert.deepEqual(filterModels(apple, 'pro max').map((m) => m.model), ['iPhone 16 Pro Max']);
    assert.deepEqual(filterModels(apple, '14').map((m) => m.model), ['iPhone 14', 'iPhone 14 Plus']);
  });

  it('counts the brand as part of the name, since some models are saved without it', () => {
    const oneplus = [{ model: '12', storages: ['256 GB'] }, { model: 'Nord 4 5G', storages: [] }];
    assert.deepEqual(filterModels(oneplus, 'oneplus 12', 'OnePlus').map((m) => m.model), ['12']);
    assert.deepEqual(filterModels(oneplus, 'nord', 'OnePlus').map((m) => m.model), ['Nord 4 5G']);
    assert.equal(filterModels(oneplus, 'oneplus', 'OnePlus').length, 2);
    assert.deepEqual(filterModels(oneplus, 'oneplus 12'), [], 'without the brand it does not know the word');
  });

  it('finds nothing for a word that is in no model', () => {
    assert.deepEqual(filterModels(apple, 'galaxy'), []);
    assert.deepEqual(filterModels(apple, '14 galaxy'), []);
  });
});

describe('keeping the choice consistent', () => {
  it('keeps a choice that exists, whatever its case', () => {
    assert.deepEqual(resolveChoice(BRANDS, { brand: 'Apple', model: 'iPhone 14 Plus', storage: '512 GB' }), { brand: 'Apple', model: 'iPhone 14 Plus', storage: '512 GB' });
    assert.deepEqual(resolveChoice(BRANDS, { brand: 'apple', model: 'IPHONE 14', storage: '256 gb' }), { brand: 'Apple', model: 'iPhone 14', storage: '256 GB' });
  });

  it('moves to the first model of a brand when the model is not that brand\'s', () => {
    assert.deepEqual(resolveChoice(BRANDS, { brand: 'Samsung', model: 'iPhone 14', storage: '256 GB' }), { brand: 'Samsung', model: 'Galaxy S23', storage: '256 GB' });
  });

  it('moves to the default storage when the storage is not the model\'s', () => {
    assert.deepEqual(resolveChoice(BRANDS, { brand: 'Apple', model: 'iPhone 14', storage: '1 TB' }), { brand: 'Apple', model: 'iPhone 14', storage: '128 GB' });
    assert.deepEqual(resolveChoice(BRANDS, { brand: 'Apple', model: 'iPhone 14 Plus', storage: '64 GB' }), { brand: 'Apple', model: 'iPhone 14 Plus', storage: '256 GB' });
  });

  it('moves to the first brand when the brand is not in the list, or nothing is wanted', () => {
    assert.deepEqual(resolveChoice(BRANDS, { brand: 'Nokia', model: 'x', storage: 'y' }), { brand: 'Apple', model: 'iPhone 14', storage: '128 GB' });
    assert.deepEqual(resolveChoice(BRANDS, {}), { brand: 'Apple', model: 'iPhone 14', storage: '128 GB' });
  });

  it('gives an empty storage for a model that has none, and an empty choice for an empty list', () => {
    assert.deepEqual(resolveChoice(BRANDS, { brand: 'OnePlus', model: 'Nord 4 5G', storage: '128 GB' }), { brand: 'OnePlus', model: 'Nord 4 5G', storage: '' });
    assert.deepEqual(resolveChoice([], { brand: 'Apple', model: 'iPhone 14', storage: '128 GB' }), { brand: '', model: '', storage: '' });
    assert.deepEqual(resolveChoice([{ brand: 'Empty', models: [] }], { brand: 'Empty' }), { brand: 'Empty', model: '', storage: '' });
  });
});
