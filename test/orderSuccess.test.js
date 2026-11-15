import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { transform } from 'esbuild';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/lib/orderSuccess.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader: 'ts', format: 'esm' });
const { placedOrderIdFrom } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

describe('placedOrderIdFrom', () => {
  it('returns the order id handed over by the payment page', () => {
    assert.equal(placedOrderIdFrom({ placedOrderId: 'ord_123' }), 'ord_123');
  });

  it('is null when the page was opened directly', () => {
    assert.equal(placedOrderIdFrom(null), null);
    assert.equal(placedOrderIdFrom(undefined), null);
    assert.equal(placedOrderIdFrom({}), null);
  });

  it('ignores a blank or non-text id', () => {
    assert.equal(placedOrderIdFrom({ placedOrderId: '  ' }), null);
    assert.equal(placedOrderIdFrom({ placedOrderId: 42 }), null);
  });
});
