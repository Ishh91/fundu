import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  quotePhone,
  recalculateInspectedQuote,
  lookupResaleBenchmark,
  FUNDU_POLICY,
  FUNDU_SERVICE_LOCALITIES,
} from '../fundu_phone_quote.mjs';
import { createPhoneQuote, processInspectionMismatch, getQuoteAudit } from '../server/services/quoteService.js';

describe('Fundu Phone Buyback Quote Engine', () => {
  // 1. Valid Quote Calculation
  test('generates valid conditional quote for exact variant with correct business formula', () => {
    const input = {
      brand: 'Apple',
      model: 'iPhone 13',
      storage: '128 GB',
      powers_on: true,
      cosmetic_condition: 'flawless',
      screen_condition: 'flawless',
      body_condition: 'flawless',
      battery_health: 'healthy',
      accessories: ['Original Box', 'Original Charger'],
      under_warranty: false,
    };

    const quote = quotePhone(input);

    assert.equal(quote.status, 'quoted');
    assert.equal(quote.isConditionalEstimate, true);
    assert.ok(typeof quote.offerAmount === 'number' && quote.offerAmount > 0);
    assert.equal(quote.currency, 'INR');
    assert.ok(quote.conditionSummary.length > 0);
    assert.ok(quote.disclaimer.includes('conditional estimate subject to physical doorstep inspection'));
    assert.equal(quote.policyVersion, FUNDU_POLICY.version);
    assert.equal(quote.deviceSummary.brand, 'Apple');
    assert.equal(quote.deviceSummary.model, 'iPhone 13');
    assert.equal(quote.deviceSummary.storage, '128 GB');

    // Verify confidential unit economics are kept in _internalAudit and NOT exposed in public fields
    assert.ok(quote._internalAudit);
    assert.equal(quote.targetContributionMargin, undefined);
    assert.equal(quote.pickupInspectionRefurbCost, undefined);
    assert.equal(quote.warrantyAndRiskReserves, undefined);

    // Verify exact math:
    // Base resale proceeds for iPhone 13 128GB: 38,500
    // Flawless cosmetic multiplier: 1.0 -> 38,500
    // Accessories bonus: Box (300) + Charger (300) = 600 -> adjusted = 39,100
    // Pickup/Refurb logistics: 450
    // Reserves: 5% of 38,500 = 1,925
    // Margin: 10% of 38,500 = 3,850
    // Raw offer: 39,100 - 450 - 1,925 - 3,850 = 32,875 -> rounded to nearest 50 = 32,900
    assert.equal(quote.offerAmount, 32900);
  });

  // 2. Missing Pricing Benchmark
  test('returns manual review and reports missing config when variant is not in catalog', () => {
    const input = {
      brand: 'ObscureBrand',
      model: 'SuperPhone 9000 Pro',
      storage: '128 GB',
      powers_on: true,
      screen_condition: 'flawless',
      body_condition: 'flawless',
    };

    const quote = quotePhone(input);

    assert.equal(quote.status, 'requires_manual_review');
    assert.equal(quote.reason, 'MISSING_PRICING_BENCHMARK');
    assert.deepEqual(quote.missingConfig, ['resale_proceeds_benchmark']);
    assert.equal(quote.offerAmount, undefined, 'Must not fabricate a quote');
    assert.ok(quote.contactPath?.phone);
    assert.ok(quote.message.includes('not configured in Fundu catalog'));
  });

  // 3. Stale Pricing Data
  test('returns manual review when pricing benchmark is older than staleness threshold', () => {
    const input = {
      brand: 'Apple',
      model: 'iPhone 13',
      storage: '128 GB',
      powers_on: true,
    };

    // Reference date 200 days after benchmark date (Jan 5, 2025)
    const options = { referenceDate: '2025-09-01' };
    const quote = quotePhone(input, options);

    assert.equal(quote.status, 'requires_manual_review');
    assert.equal(quote.reason, 'STALE_PRICING_BENCHMARK');
    assert.deepEqual(quote.missingConfig, ['updated_resale_proceeds_benchmark']);
    assert.equal(quote.offerAmount, undefined, 'Must not fabricate stale quote');
    assert.ok(quote.message.includes('stale and requires admin rate review'));
  });

  // 4. Invalid Inputs
  test('returns invalid_input when required parameters are missing', () => {
    assert.equal(quotePhone({ model: 'iPhone 13', storage: '128 GB' }).status, 'invalid_input');
    assert.equal(quotePhone({ brand: 'Apple', storage: '128 GB' }).status, 'invalid_input');
    assert.equal(quotePhone({ brand: 'Apple', model: 'iPhone 13' }).status, 'invalid_input');
  });

  // 5. Condition & Repair Deductions
  test('applies exact configured repair costs for cracked screen, degraded battery, and speaker fault', () => {
    const baselineInput = {
      brand: 'Apple',
      model: 'iPhone 13',
      storage: '128 GB',
      powers_on: true,
      cosmetic_condition: 'good',
      screen_condition: 'flawless',
      body_condition: 'flawless',
      battery_health: 'healthy',
      defects: [],
    };

    const baselineQuote = quotePhone(baselineInput);

    // Screen repair deduction
    const screenDamagedQuote = quotePhone({
      ...baselineInput,
      screen_condition: 'cracked',
    });

    // iPhone 13 configured screen replacement cost = 5,499
    // Difference should reflect the screen repair deduction (rounded to 50)
    const expectedScreenDiff = Math.round(5499 / 50) * 50;
    assert.equal(baselineQuote.offerAmount - screenDamagedQuote.offerAmount, expectedScreenDiff);

    // Battery degradation deduction
    const batteryDamagedQuote = quotePhone({
      ...baselineInput,
      battery_health: 'degraded_service',
    });

    // iPhone 13 configured battery replacement cost = 2,299
    const expectedBatteryDiff = Math.round(2299 / 50) * 50;
    assert.equal(baselineQuote.offerAmount - batteryDamagedQuote.offerAmount, expectedBatteryDiff);

    // Hardware defect: speaker_mic
    const speakerDamagedQuote = quotePhone({
      ...baselineInput,
      defects: ['speaker_mic'],
    });

    // iPhone 13 configured speaker repair cost = 799
    const expectedSpeakerDiff = Math.round(799 / 50) * 50;
    assert.equal(baselineQuote.offerAmount - speakerDamagedQuote.offerAmount, expectedSpeakerDiff);
  });

  // 6. Manual-Review Cases
  describe('Manual Review Routing', () => {
    test('routes non-powering phone to manual inspection', () => {
      const quote = quotePhone({
        brand: 'Apple',
        model: 'iPhone 13',
        storage: '128 GB',
        powers_on: false,
      });

      assert.equal(quote.status, 'requires_manual_review');
      assert.equal(quote.reason, 'NON_POWERING_DEVICE');
      assert.equal(quote.offerAmount, undefined);
    });

    test('routes uncleared activation lock to manual review', () => {
      const quote = quotePhone({
        brand: 'Apple',
        model: 'iPhone 13',
        storage: '128 GB',
        powers_on: true,
        activation_lock_cleared: false,
      });

      assert.equal(quote.status, 'requires_manual_review');
      assert.equal(quote.reason, 'UNCLEARED_ACTIVATION_LOCK');
      assert.equal(quote.offerAmount, undefined);
    });

    test('routes unverified ownership to manual verification', () => {
      const quote = quotePhone({
        brand: 'Apple',
        model: 'iPhone 13',
        storage: '128 GB',
        powers_on: true,
        ownership_verified: false,
      });

      assert.equal(quote.status, 'requires_manual_review');
      assert.equal(quote.reason, 'UNVERIFIED_OWNERSHIP');
    });

    test('routes liquid or moisture damage to physical bench inspection', () => {
      const quote = quotePhone({
        brand: 'Apple',
        model: 'iPhone 13',
        storage: '128 GB',
        powers_on: true,
        liquid_damage: true,
      });

      assert.equal(quote.status, 'requires_manual_review');
      assert.equal(quote.reason, 'LIQUID_DAMAGE');
    });

    test('routes unpriced fault defect to manual review and reports missing config', () => {
      const quote = quotePhone({
        brand: 'Apple',
        model: 'iPhone 13',
        storage: '128 GB',
        powers_on: true,
        defects: ['unknown_motherboard_short'],
      });

      assert.equal(quote.status, 'requires_manual_review');
      assert.equal(quote.reason, 'UNPRICED_FAULT_REPAIR');
      assert.deepEqual(quote.missingConfig, ['repair_cost_unknown_motherboard_short']);
    });
  });

  // 7. Inspection Mismatch & Revised Offer Flow
  test('detects physical inspection mismatch, calculates revised amount, and requires seller acceptance', () => {
    // Initial quote made online
    const initialInput = {
      brand: 'Apple',
      model: 'iPhone 13',
      storage: '128 GB',
      powers_on: true,
      cosmetic_condition: 'flawless',
      screen_condition: 'flawless',
      body_condition: 'flawless',
      battery_health: 'healthy',
    };

    const initialQuote = quotePhone(initialInput);
    assert.equal(initialQuote.status, 'quoted');

    // Physical doorstep inspection finds cracked screen and degraded battery
    const inspectedAnswers = {
      screen_condition: 'cracked',
      battery_health: 'degraded_service',
    };

    const mismatch = recalculateInspectedQuote(initialQuote._internalAudit, inspectedAnswers);

    assert.equal(mismatch.hasMismatch, true);
    assert.equal(mismatch.requiresSellerAcceptance, true);
    assert.ok(mismatch.revisedOffer < mismatch.previousOffer);
    assert.ok(mismatch.mismatchExplanations.length >= 2);
    assert.ok(mismatch.mismatchExplanations.some((m) => m.includes('Screen reported as "flawless"')));
    assert.ok(mismatch.mismatchExplanations.some((m) => m.includes('Battery health reported as "healthy"')));
  });

  // 8. Server Quote Service Integration
  test('createPhoneQuote registers audit record and returns safe customer quote', async () => {
    const input = {
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      storage: '256 GB',
      powers_on: true,
      cosmetic_condition: 'good',
    };

    const quote = await createPhoneQuote(input);

    assert.equal(quote.status, 'quoted');
    assert.equal(quote.auditRegistered, true);
    assert.ok(quote.quoteId);

    // Verify audit record is stored on server
    const audit = getQuoteAudit(quote.quoteId);
    assert.ok(audit);
    assert.equal(audit.variant.brand, 'Samsung');
    assert.equal(audit.variant.model, 'Galaxy S24 Ultra');
    assert.ok(audit.economics.targetContributionMargin > 0);
  });
});
