import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { calculateHardwareVariantMultiplier as engineMultiplier } from '../fundu_phone_quote.mjs';

// The sell page keeps its own copy of the storage multiplier, so both are checked against each other.
const { outputFiles } = await build({
  entryPoints: [new URL('../src/lib/deviceSpecs.ts', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')],
  bundle: true,
  format: 'esm',
  write: false,
  logLevel: 'error',
});
const { calculateHardwareVariantMultiplier: pageMultiplier } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
);

describe('storage multiplier: quote engine and sell page agree', () => {
  const sizes = ['16 GB', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', '2 TB', '1024 GB', '2048 GB', '2TB'];

  it('gives the same multiplier for every size, brand and RAM', () => {
    for (const brand of ['Apple', 'Samsung']) {
      for (const ram of ['', '8 GB', '12 GB']) {
        for (const size of sizes) {
          assert.equal(pageMultiplier(size, ram, brand), engineMultiplier(size, ram, brand), `${brand} ${ram} ${size}`);
        }
      }
    }
  });

  it('prices 2 TB above 1 TB on the sell page too', () => {
    assert.ok(pageMultiplier('2 TB', '', 'Apple') > pageMultiplier('1 TB', '', 'Apple'));
  });
});
