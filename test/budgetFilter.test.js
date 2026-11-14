import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadModule() {
  const source = await readFile(path.join(ROOT, 'src', 'lib', 'budgetFilter.ts'), 'utf8');
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

const PRESETS = [
  { label: 'All Prices', min: 0, max: 250000 },
  { label: 'Under 10,000', min: 0, max: 10000 },
  { label: 'Above 50,000', min: 50000, max: 250000 },
];

describe('budget filter', () => {
  let budget;
  before(async () => {
    budget = await loadModule();
  });

  it('shows every price when no chip is picked and the slider is at the top', () => {
    const { matchesBudget, BUDGET_SLIDER_MAX } = budget;

    assert.equal(matchesBudget(5000, PRESETS, 0, BUDGET_SLIDER_MAX), true);
    assert.equal(matchesBudget(185000, PRESETS, 0, BUDGET_SLIDER_MAX), true);
  });

  it('applies the slider as an upper limit when it is below the top', () => {
    const { matchesBudget } = budget;

    assert.equal(matchesBudget(30000, PRESETS, 0, 30000), true);
    assert.equal(matchesBudget(30001, PRESETS, 0, 30000), false);
  });

  it('uses the chip range and ignores the slider when a chip is picked', () => {
    const { matchesBudget } = budget;

    assert.equal(matchesBudget(9000, PRESETS, 1, 150000), true);
    assert.equal(matchesBudget(12000, PRESETS, 1, 150000), false);
    assert.equal(matchesBudget(90000, PRESETS, 2, 20000), true);
    assert.equal(matchesBudget(40000, PRESETS, 2, 150000), false);
  });

  it('falls back to the slider for an unknown chip index', () => {
    assert.equal(budget.matchesBudget(40000, PRESETS, 9, 150000), true);
  });

  it('counts a lowered slider as an active filter, not only a chip', () => {
    const { isBudgetFilterActive, BUDGET_SLIDER_MAX } = budget;

    assert.equal(isBudgetFilterActive(0, BUDGET_SLIDER_MAX), false);
    assert.equal(isBudgetFilterActive(0, 20000), true);
    assert.equal(isBudgetFilterActive(2, BUDGET_SLIDER_MAX), true);
  });

  it('labels the top of the slider as no limit', () => {
    const { budgetLabel, BUDGET_SLIDER_MAX } = budget;
    const format = (amount) => `Rs ${amount}`;

    assert.equal(budgetLabel(BUDGET_SLIDER_MAX, format), 'No limit');
    assert.equal(budgetLabel(45000, format), 'Rs 45000');
  });
});
