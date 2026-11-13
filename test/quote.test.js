import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  quotePhone,
  recalculateInspectedQuote,
  lookupResaleBenchmark,
  lookupModelRepairs,
  FUNDU_POLICY,
} from '../fundu_phone_quote.mjs';
import { createPhoneQuote, getQuoteAudit } from '../server/services/quoteService.js';

const ROUNDING_STEP = 50;
const ALL_ACCESSORIES = ['Original Box', 'Original Charger', 'Valid Bill'];

// A brand-new, flawless iPhone 13 with every accessory: the best case a seller can declare.
const bestCase = {
  brand: 'Apple',
  model: 'iPhone 13',
  storage: '128 GB',
  powers_on: true,
  cosmetic_condition: 'flawless',
  screen_condition: 'flawless',
  body_condition: 'flawless',
  battery_health: 'healthy',
  defects: [],
  accessories: ALL_ACCESSORIES,
  age_period: '0_to_3_months',
};

const benchmarkPrice = lookupResaleBenchmark('Apple', 'iPhone 13', '128 GB').benchmark.proceeds;
const bestOffer = quotePhone(bestCase).offerAmount;

/** How much less the seller is offered once `changes` are applied to the best case. */
const deductionFor = (changes) => bestOffer - quotePhone({ ...bestCase, ...changes }).offerAmount;

const assertWithinRounding = (actual, expected, label) => {
  assert.ok(Math.abs(actual - expected) <= ROUNDING_STEP, `${label}: expected about ${expected}, got ${actual}`);
};

describe('Fundu Phone Buyback Quote Engine', () => {
  describe('standard quote', () => {
    test('offers the full catalog price for a new, flawless phone with all accessories', () => {
      const quote = quotePhone(bestCase);

      assert.equal(quote.status, 'quoted');
      assert.equal(quote.offerAmount, benchmarkPrice);
      assert.equal(quote.currency, 'INR');
      assert.equal(quote.isConditionalEstimate, true);
      assert.ok(quote.conditionSummary.length > 0);
      assert.ok(quote.disclaimer.includes('conditional estimate subject to physical doorstep inspection'));
      assert.equal(quote.policyVersion, FUNDU_POLICY.version);
      assert.equal(quote.deviceSummary.brand, 'Apple');
      assert.ok(quote.deviceSummary.model.includes('iPhone 13'));
      assert.equal(quote.deviceSummary.storage, '128 GB');
    });

    test('keeps confidential unit economics out of the seller-facing fields', () => {
      const quote = quotePhone(bestCase);

      assert.ok(quote._internalAudit);
      assert.equal(quote.targetContributionMargin, undefined);
      assert.equal(quote.pickupInspectionRefurbCost, undefined);
      assert.equal(quote.warrantyAndRiskReserves, undefined);
    });

    test('never offers more than the catalog price', () => {
      const olderPhone = quotePhone({ ...bestCase, age_period: 'above_9_months', cosmetic_condition: 'good' });

      assert.ok(bestOffer <= benchmarkPrice);
      assert.ok(olderPhone.offerAmount < benchmarkPrice);
    });

    test('gives a model outside the catalog a positive conditional estimate', () => {
      const quote = quotePhone({
        brand: 'ObscureBrand',
        model: 'SuperPhone 9000 Pro',
        storage: '128 GB',
        powers_on: true,
      });

      assert.equal(quote.status, 'quoted');
      assert.equal(quote.isConditionalEstimate, true);
      assert.ok(quote.offerAmount >= FUNDU_POLICY.minOfferFloor);
    });

    test('returns invalid_input when required parameters are missing', () => {
      assert.equal(quotePhone({ model: 'iPhone 13', storage: '128 GB' }).status, 'invalid_input');
      assert.equal(quotePhone({ brand: 'Apple', storage: '128 GB' }).status, 'invalid_input');
      assert.equal(quotePhone({ brand: 'Apple', model: 'iPhone 13' }).status, 'invalid_input');
    });
  });

  describe('condition deductions', () => {
    const repairCosts = lookupModelRepairs('Apple', 'iPhone 13', benchmarkPrice);

    test('deducts the screen replacement cost for a cracked screen', () => {
      assertWithinRounding(deductionFor({ screen_condition: 'cracked' }), repairCosts.screen, 'cracked screen');
    });

    test('deducts 2% of the catalog price for a worn iPhone battery', () => {
      assertWithinRounding(deductionFor({ battery_health: 'below_75' }), benchmarkPrice * 0.02, 'worn battery');
    });

    test('deducts the configured repair cost for a speaker fault', () => {
      assertWithinRounding(deductionFor({ defects: ['speaker_mic'] }), repairCosts.speaker, 'speaker fault');
    });

    test('deducts for a biometrics fault, which has no itemised repair price', () => {
      assertWithinRounding(deductionFor({ defects: ['biometrics'] }), benchmarkPrice * 0.08, 'biometrics fault');
    });

    test('deducts for any other reported fault instead of ignoring it', () => {
      const quote = quotePhone({ ...bestCase, defects: ['unknown_motherboard_short'] });

      assert.equal(quote.status, 'quoted');
      assertWithinRounding(bestOffer - quote.offerAmount, benchmarkPrice * 0.08, 'unlisted fault');
    });

    test('counts a fault reported twice only once', () => {
      assert.equal(deductionFor({ defects: ['biometrics', 'biometrics'] }), deductionFor({ defects: ['biometrics'] }));
    });
  });

  describe('accessories', () => {
    test('offers less for each missing accessory', () => {
      assert.equal(deductionFor({ accessories: ['Original Box', 'Original Charger'] }), 200);
      assert.equal(deductionFor({ accessories: ['Original Box'] }), 500);
    });

    test('offers the least when the seller declares no accessories at all', () => {
      assert.equal(deductionFor({ accessories: [] }), 800);
    });

    test('does not penalise a caller that sends no accessories field', () => {
      const { accessories, ...withoutAccessoriesField } = bestCase;

      assert.equal(quotePhone(withoutAccessoriesField).offerAmount, bestOffer);
    });
  });

  describe('manual review routing', () => {
    const assertSalvageReview = (changes, reason) => {
      const quote = quotePhone({ ...bestCase, ...changes });

      assert.equal(quote.status, 'requires_manual_review');
      assert.equal(quote.reason, reason);
      assert.ok(quote.contactPath?.phone);
      assert.ok(quote.offerAmount >= FUNDU_POLICY.minOfferFloor, 'a salvage estimate is still shown');
      assert.ok(quote.offerAmount < bestOffer, 'the salvage estimate is below a normal quote');
    };

    test('routes a non-powering phone to inspection with a salvage estimate', () => {
      assertSalvageReview({ powers_on: false }, 'NON_POWERING_DEVICE');
    });

    test('routes an uncleared activation lock to manual review', () => {
      assertSalvageReview({ activation_lock_cleared: false }, 'UNCLEARED_ACTIVATION_LOCK');
    });

    test('routes unverified ownership to manual verification', () => {
      assertSalvageReview({ ownership_verified: false }, 'UNVERIFIED_OWNERSHIP');
    });

    test('routes liquid damage to bench inspection', () => {
      assertSalvageReview({ liquid_damage: true }, 'LIQUID_DAMAGE');
    });
  });

  test('detects physical inspection mismatch, calculates revised amount, and requires seller acceptance', () => {
    const initialQuote = quotePhone(bestCase);
    assert.equal(initialQuote.status, 'quoted');

    const mismatch = recalculateInspectedQuote(initialQuote._internalAudit, {
      screen_condition: 'cracked',
      battery_health: 'degraded_service',
    });

    assert.equal(mismatch.hasMismatch, true);
    assert.equal(mismatch.requiresSellerAcceptance, true);
    assert.ok(mismatch.revisedOffer < mismatch.previousOffer);
    assert.ok(mismatch.mismatchExplanations.length >= 2);
    assert.ok(mismatch.mismatchExplanations.some((m) => m.includes('Screen reported as "flawless"')));
    assert.ok(mismatch.mismatchExplanations.some((m) => m.includes('Battery health reported as "healthy"')));
  });

  test('createPhoneQuote registers audit record and returns safe customer quote', async () => {
    const quote = await createPhoneQuote({
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      storage: '256 GB',
      powers_on: true,
      cosmetic_condition: 'good',
    });

    assert.equal(quote.status, 'quoted');
    assert.equal(quote.auditRegistered, true);
    assert.ok(quote.quoteId);

    const audit = getQuoteAudit(quote.quoteId);
    assert.ok(audit);
    assert.equal(audit.variant.brand, 'Samsung');
    assert.equal(audit.variant.model, 'Galaxy S24 Ultra');
    assert.ok(audit.economics.targetContributionMargin > 0);
  });
});
