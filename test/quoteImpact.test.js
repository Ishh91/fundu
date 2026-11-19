import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { transform } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { cloneRules, DEFAULT_PRICING_RULES, androidModelKey } from '../fundu_pricing_rules.mjs';

// quoteImpact is a .ts file. Transform it to JS so node --test can run it without a TS loader.
const source = await readFile(new URL('../src/lib/quoteImpact.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader: 'ts', format: 'esm' });
const sanitized = code.replace(
  /from\s*["']\.\/quoteRules["'];?/g,
  'from "./quoteRules-stub.mjs";',
);
// The `.ts` relative import of `../../fundu_phone_quote.mjs` works from a data URI only if we rewrite it to an absolute file URL.
const quotePhoneUrl = new URL('../fundu_phone_quote.mjs', import.meta.url).href;
const absoluteImports = sanitized.replace(/from\s*["']\.\.\/\.\.\/fundu_phone_quote\.mjs["']/g, `from "${quotePhoneUrl}"`);
const { quoteImpactOffer, computeImpactRow, impactPhoneKey, IMPACT_SCENARIOS } =
  await import(`data:text/javascript;base64,${Buffer.from(absoluteImports).toString('base64')}`);

const SAMSUNG_S21 = { brand: 'Samsung', model: 'Galaxy S21', storage: '128 GB', price: 14280 };

describe('quoteImpactOffer', () => {
  it('returns an offer for a priced phone under the default rules', () => {
    const offer = quoteImpactOffer(SAMSUNG_S21, IMPACT_SCENARIOS[0], DEFAULT_PRICING_RULES);
    assert.ok(typeof offer === 'number' && offer > 0, `flawless offer should be a positive number, got ${offer}`);
  });

  it('returns null when the phone has no admin price', () => {
    const offer = quoteImpactOffer({ ...SAMSUNG_S21, price: 0 }, IMPACT_SCENARIOS[0], DEFAULT_PRICING_RULES);
    assert.equal(offer, null);
  });

  it('a cracked screen offer is less than a flawless offer under the same rules', () => {
    const flawless = quoteImpactOffer(SAMSUNG_S21, IMPACT_SCENARIOS.find((s) => s.key === 'flawless'), DEFAULT_PRICING_RULES);
    const cracked = quoteImpactOffer(SAMSUNG_S21, IMPACT_SCENARIOS.find((s) => s.key === 'cracked'), DEFAULT_PRICING_RULES);
    assert.ok(cracked < flawless, `cracked (${cracked}) should be less than flawless (${flawless})`);
  });
});

describe('computeImpactRow', () => {
  it('surfaces a non-zero delta when the draft changes a rule that matters to the phone', () => {
    const key = androidModelKey(SAMSUNG_S21.brand, SAMSUNG_S21.model);
    const live = cloneRules(DEFAULT_PRICING_RULES);
    const draft = cloneRules(DEFAULT_PRICING_RULES);
    draft.androidScreen.crackRupees = { ...draft.androidScreen.crackRupees, [key]: (live.androidScreen.crackRupees[key] ?? 5350) + 1000 };
    const scenario = IMPACT_SCENARIOS.find((s) => s.key === 'cracked');
    const row = computeImpactRow(SAMSUNG_S21, scenario, live, draft);
    assert.ok(row.liveOffer !== null && row.draftOffer !== null, 'both offers resolve');
    assert.equal(row.delta, row.draftOffer - row.liveOffer);
    // A higher crack deduction in the draft means the draft offer is LOWER (delta negative).
    assert.ok(row.delta < 0, `a bigger crack ₹ should lower the offer (delta ${row.delta})`);
  });

  it('reports delta 0 when live and draft are the same', () => {
    const live = cloneRules(DEFAULT_PRICING_RULES);
    const draft = cloneRules(DEFAULT_PRICING_RULES);
    const row = computeImpactRow(SAMSUNG_S21, IMPACT_SCENARIOS[0], live, draft);
    assert.equal(row.delta, 0);
  });
});

describe('impactPhoneKey', () => {
  it('is stable for the same phone and different for a different storage', () => {
    assert.equal(impactPhoneKey(SAMSUNG_S21), impactPhoneKey({ ...SAMSUNG_S21 }));
    assert.notEqual(impactPhoneKey(SAMSUNG_S21), impactPhoneKey({ ...SAMSUNG_S21, storage: '256 GB' }));
  });
});
