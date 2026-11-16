import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { transform } from 'esbuild';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/lib/repairIssueInfo.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader: 'ts', format: 'esm' });
const { summarizeIssues } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

const screen = { warranty: '6 Months Warranty', time: '30 Mins Doorstep' };
const port = { warranty: '3 Months Warranty', time: '25 Mins Doorstep' };
const lab = { warranty: 'Inspection Diagnostic', time: '24 Hr Lab Repair' };

describe('summarizeIssues', () => {
  it('reports one warranty and the visit time for a single repair', () => {
    assert.deepEqual(summarizeIssues([screen]), { warranty: '6 Months Warranty', time: 'About 30 Mins On-Spot' });
  });

  it('shows the range when the chosen repairs have different warranties and adds their times', () => {
    assert.deepEqual(summarizeIssues([screen, port]), { warranty: '3-6 Months Warranty', time: 'About 55 Mins On-Spot' });
  });

  it('does not promise a visit time when a repair is done in the lab', () => {
    assert.equal(summarizeIssues([screen, lab]).time, null);
  });

  it('gives no warranty for an inspection only', () => {
    assert.deepEqual(summarizeIssues([lab]), { warranty: null, time: null });
  });

  it('handles nothing selected and a single month', () => {
    assert.deepEqual(summarizeIssues([]), { warranty: null, time: null });
    assert.equal(summarizeIssues([{ warranty: '1 Month Warranty', time: '10 Mins' }]).warranty, '1 Month Warranty');
  });
});
