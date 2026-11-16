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

  describe('when the screen is deducted', () => {
    const repairCosts = lookupModelRepairs('Apple', 'iPhone 13', benchmarkPrice);
    const screenStates = ['cracked', 'touch_fault', 'display_lines'];

    test('does not also deduct a dent / back panel repair', () => {
      for (const screen_condition of screenStates) {
        assert.equal(
          deductionFor({ screen_condition, body_condition: 'dents_bent' }),
          deductionFor({ screen_condition }),
          screen_condition,
        );
      }
    });

    test('does not also deduct iPhone battery health wear', () => {
      for (const screen_condition of screenStates) {
        assert.equal(
          deductionFor({ screen_condition, battery_health: 'below_75' }),
          deductionFor({ screen_condition }),
          screen_condition,
        );
        assert.equal(
          deductionFor({ screen_condition, battery_health: '75_to_85' }),
          deductionFor({ screen_condition }),
          screen_condition,
        );
      }
    });

    test('still takes off ageing', () => {
      const fresh = quotePhone({ ...bestCase, screen_condition: 'cracked', age_period: '0_to_3_months' }).offerAmount;
      const old = quotePhone({ ...bestCase, screen_condition: 'cracked', age_period: 'above_11_months' }).offerAmount;
      assert.ok(old < fresh, `${old} should be below ${fresh}`);
      // Ageing takes 20% off the whole aged value, the screen share included.
      assertWithinRounding(old, fresh * 0.8, 'ageing on a cracked screen');
    });

    test('still takes off other hardware faults and missing accessories', () => {
      assertWithinRounding(
        deductionFor({ screen_condition: 'cracked', defects: ['speaker_mic'] }) - deductionFor({ screen_condition: 'cracked' }),
        repairCosts.speaker,
        'speaker fault with a cracked screen',
      );
      assert.equal(
        deductionFor({ screen_condition: 'cracked', accessories: ['Original Box'] }) - deductionFor({ screen_condition: 'cracked' }),
        500,
      );
    });

    test('does not deduct a reported battery fault either', () => {
      for (const screen_condition of screenStates) {
        assert.equal(
          deductionFor({ screen_condition, defects: ['battery_fault'] }),
          deductionFor({ screen_condition }),
          screen_condition,
        );
      }
    });

    test('still deducts the other faults next to a battery fault', () => {
      assertWithinRounding(
        deductionFor({ screen_condition: 'cracked', defects: ['battery_fault', 'biometrics'] }) - deductionFor({ screen_condition: 'cracked' }),
        benchmarkPrice * 0.08,
        'biometrics next to a battery fault',
      );
    });

    test('says why the dent and battery are not deducted separately', () => {
      const quote = quotePhone({ ...bestCase, screen_condition: 'cracked', body_condition: 'dents_bent', battery_health: 'below_75' });
      assert.ok(quote.conditionSummary.some((line) => /not deducted separately/i.test(line)));
      const plain = quotePhone({ ...bestCase, screen_condition: 'cracked' });
      assert.ok(!plain.conditionSummary.some((line) => /not deducted separately/i.test(line)));
    });
  });

  describe('a body-driven look sent by another client', () => {
    const offer = (changes) => quotePhone({ ...bestCase, ...changes }).offerAmount;

    test('does not stack a worn look on a cracked screen, touch fault or display lines', () => {
      for (const screen_condition of ['touch_fault', 'display_lines']) {
        assert.equal(
          offer({ screen_condition, cosmetic_condition: 'fair' }),
          offer({ screen_condition, cosmetic_condition: 'flawless' }),
          screen_condition,
        );
      }
      assert.equal(
        offer({ screen_condition: 'cracked', cosmetic_condition: 'fair' }),
        offer({ screen_condition: 'cracked', cosmetic_condition: 'fair', body_condition: 'dents_bent' }),
      );
    });

    test('keeps the look the seller gave when the screen is fine', () => {
      assert.ok(offer({ cosmetic_condition: 'fair' }) < offer({ cosmetic_condition: 'good' }));
      assert.ok(offer({ cosmetic_condition: 'good' }) < offer({ cosmetic_condition: 'flawless' }));
    });

    test('never makes a better look worse because of the screen', () => {
      assertWithinRounding(
        bestOffer - offer({ screen_condition: 'cracked', cosmetic_condition: 'flawless' }),
        lookupModelRepairs('Apple', 'iPhone 13', benchmarkPrice).screen,
        'cracked screen with a flawless look',
      );
    });
  });

  describe('cracked screen deduction', () => {
    const flawlessOffer = (model, storage, extra = {}) => quotePhone({ ...bestCase, model, storage, ...extra }).offerAmount;
    const shareLost = (model, storage, extra = {}) => {
      const flawless = flawlessOffer(model, storage, extra);
      const cracked = flawlessOffer(model, storage, { ...extra, screen_condition: 'cracked' });
      return (flawless - cracked) / flawless;
    };

    test('takes about a quarter off a premium phone, not three quarters', () => {
      const share = shareLost('iPhone 15 Pro Max', '256 GB');
      assert.ok(share > 0.24 && share < 0.30, `took ${(share * 100).toFixed(1)}%`);
    });

    test('takes about a third off a mid-priced phone', () => {
      const share = shareLost('iPhone 16', '128 GB');
      assert.ok(share > 0.32 && share < 0.38, `took ${(share * 100).toFixed(1)}%`);
    });

    test('scales with the phone age, so an old phone does not lose a larger share', () => {
      const fresh = shareLost('iPhone 15 Pro Max', '256 GB');
      const old = shareLost('iPhone 15 Pro Max', '256 GB', { age_period: 'above_11_months' });
      assert.ok(Math.abs(fresh - old) < 0.02, `${(fresh * 100).toFixed(1)}% fresh vs ${(old * 100).toFixed(1)}% old`);
    });

    test('does not also lower the look: a cracked screen costs the same whatever look is sent with it', () => {
      for (const cosmetic_condition of ['flawless', 'good', 'fair']) {
        assert.equal(
          quotePhone({ ...bestCase, screen_condition: 'cracked', cosmetic_condition }).offerAmount,
          quotePhone({ ...bestCase, screen_condition: 'cracked', cosmetic_condition: 'flawless' }).offerAmount,
          cosmetic_condition,
        );
      }
    });

    test('keeps an old premium phone with a cracked screen above 55% of its flawless price (it was 14%)', () => {
      const share = shareLost('iPhone 15 Pro Max', '256 GB', { age_period: 'above_11_months' });
      assert.ok(1 - share > 0.55, `kept ${((1 - share) * 100).toFixed(1)}%`);
    });
  });

  describe('when the screen is fine or only scratched', () => {
    test('still deducts a reported battery fault', () => {
      for (const screen_condition of ['flawless', 'scratched']) {
        assertWithinRounding(
          deductionFor({ screen_condition, defects: ['battery_fault'] }) - deductionFor({ screen_condition }),
          benchmarkPrice * 0.08,
          `battery fault, ${screen_condition} screen`,
        );
      }
    });

    test('still deducts a dent / back panel repair and battery wear', () => {
      for (const screen_condition of ['flawless', 'scratched']) {
        assert.ok(deductionFor({ screen_condition, body_condition: 'dents_bent' }) > deductionFor({ screen_condition }), screen_condition);
        assertWithinRounding(
          deductionFor({ screen_condition, battery_health: 'below_75' }) - deductionFor({ screen_condition }),
          benchmarkPrice * 0.02,
          `worn battery, ${screen_condition} screen`,
        );
      }
    });

    test('keeps the look the seller gave on a scratched screen', () => {
      const offer = (changes) => quotePhone({ ...bestCase, ...changes }).offerAmount;
      assert.ok(offer({ screen_condition: 'scratched', cosmetic_condition: 'fair' }) < offer({ screen_condition: 'scratched', cosmetic_condition: 'good' }));
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
