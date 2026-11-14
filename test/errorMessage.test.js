import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadModule() {
  const source = await readFile(path.join(ROOT, 'src', 'lib', 'errorMessage.ts'), 'utf8');
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

describe('getErrorMessage', () => {
  let lib;
  before(async () => {
    lib = await loadModule();
  });

  it('reads the message of an Error', () => {
    assert.equal(lib.getErrorMessage(new Error('Network down')), 'Network down');
  });

  it('reads a thrown string and a plain object with a message', () => {
    assert.equal(lib.getErrorMessage('Card declined'), 'Card declined');
    assert.equal(lib.getErrorMessage({ message: 'Pincode not serviceable' }), 'Pincode not serviceable');
  });

  it('reads the text field EmailJS uses', () => {
    assert.equal(lib.getErrorMessage({ status: 412, text: 'Template not found' }), 'Template not found');
  });

  it('falls back when there is nothing readable', () => {
    assert.equal(lib.getErrorMessage(undefined, 'Could not save'), 'Could not save');
    assert.equal(lib.getErrorMessage(null, 'Could not save'), 'Could not save');
    assert.equal(lib.getErrorMessage({ message: 42 }, 'Could not save'), 'Could not save');
    assert.equal(lib.getErrorMessage(new Error(''), 'Could not save'), 'Could not save');
    assert.equal(lib.getErrorMessage({}), 'Something went wrong. Please try again.');
  });
});

describe('getErrorCode', () => {
  let lib;
  before(async () => {
    lib = await loadModule();
  });

  it('returns the code when present and an empty string otherwise', () => {
    assert.equal(lib.getErrorCode({ code: 'auth/too-many-requests' }), 'auth/too-many-requests');
    assert.equal(lib.getErrorCode(new Error('x')), '');
    assert.equal(lib.getErrorCode(null), '');
    assert.equal(lib.getErrorCode({ code: 500 }), '');
  });
});
