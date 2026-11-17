import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { transform } from 'esbuild';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/lib/sellCondition.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader: 'ts', format: 'esm' });
const { deriveCondition, hasDisplayOrTouchIssue, needsScreenRepair, worstScreenState, isScreenRepairState } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

const flawless = { screenCondition: 'flawless', bodyCondition: 'flawless', cosmeticCondition: 'flawless' };

describe('deriveCondition: screen', () => {
  it('is flawless when nothing is reported', () => {
    assert.deepEqual(deriveCondition({}), flawless);
  });

  it('reports a cracked screen above any wear, and a repair never lowers the overall look', () => {
    const out = deriveCondition({ screenCracked: true, screenMinorScratches: true, displayMinorSpotsWhite: true });
    assert.equal(out.screenCondition, 'cracked');
    // The repair cost already covers the cracked screen, so it does not also lower the overall look.
    assert.equal(out.cosmeticCondition, 'flawless');
  });

  it('reports a touch that does not work as the worst screen problem, above a crack', () => {
    assert.equal(deriveCondition({ touchFault: true }).screenCondition, 'touch_fault');
    assert.equal(deriveCondition({ touchFault: true, screenCracked: true }).screenCondition, 'touch_fault');
  });

  it('keeps heavy spots, visible lines and a strong discolouration apart', () => {
    assert.equal(deriveCondition({ displayMajorSpots: true }).screenCondition, 'spots_heavy');
    assert.equal(deriveCondition({ displayMajorLines: true }).screenCondition, 'lines_visible');
    assert.equal(deriveCondition({ displayMajorDiscolouration: true }).screenCondition, 'tint_major');
  });

  it('keeps a chipped screen apart from a cracked one', () => {
    assert.equal(deriveCondition({ screenCracked: true, screenChipped: true }).screenCondition, 'chipped');
    assert.equal(deriveCondition({ screenCracked: true }).screenCondition, 'cracked');
  });

  it('gives every minor screen and display answer its own state, and the "good" look', () => {
    for (const [field, state] of [
      ['screenMinorScratches', 'scratches_minor'],
      ['screenMajorScratches', 'scratches_major'],
      ['displayMinorSpotsWhite', 'spots_few'],
      ['displayMinorLines', 'faded_edges'],
      ['displayMinorDiscolouration', 'tint_minor'],
    ]) {
      const out = deriveCondition({ [field]: true });
      assert.equal(out.screenCondition, state, field);
      assert.equal(out.cosmeticCondition, 'good', field);
    }
    assert.equal(deriveCondition({ displayMinorSpotsWhite: true, displayManyMinorSpots: true }).screenCondition, 'spots_many');
    assert.equal(deriveCondition({ displayMinorLines: true, displayFadedEdges: true }).screenCondition, 'faded_edges');
  });

  it('picks the worse of two wears, as Cashify prices them', () => {
    assert.equal(deriveCondition({ screenMinorScratches: true, displayFadedEdges: true }).screenCondition, 'faded_edges');
    assert.equal(deriveCondition({ screenMinorScratches: true, screenMajorScratches: true }).screenCondition, 'scratches_major');
    assert.equal(deriveCondition({ displayMinorSpotsWhite: true, displayMinorDiscolouration: true }).screenCondition, 'spots_few');
    assert.equal(deriveCondition({ screenMajorScratches: true, displayManyMinorSpots: true, displayMinorSpotsWhite: true }).screenCondition, 'spots_many');
  });

  it('knows which screen states need a repair', () => {
    for (const state of ['cracked', 'chipped', 'touch_fault', 'spots_heavy', 'lines_visible', 'tint_major', 'display_lines']) assert.equal(isScreenRepairState(state), true, state);
    for (const state of ['flawless', 'scratched', 'scratches_minor', 'scratches_major', 'spots_few', 'spots_many', 'tint_minor', 'faded_edges']) assert.equal(isScreenRepairState(state), false, state);
  });

  it('reads the same states from worstScreenState', () => {
    assert.equal(worstScreenState({}), 'flawless');
    assert.equal(worstScreenState({ touchFault: true }), 'touch_fault');
  });
});

describe('deriveCondition: body and overall look', () => {
  it('reads light body wear as minor scratches, without also lowering the overall look', () => {
    for (const field of ['bodyMinorSideScratches', 'bodyMajorSideScratches', 'bodyMinorDents']) {
      const out = deriveCondition({ [field]: true });
      assert.equal(out.bodyCondition, 'minor_scratches', field);
      assert.equal(out.cosmeticCondition, 'flawless', field);
    }
  });

  it('reads big dents as bent, without also lowering the overall look', () => {
    const out = deriveCondition({ bodyMajorDents: true });
    assert.equal(out.bodyCondition, 'dents_bent');
    assert.equal(out.cosmeticCondition, 'flawless');
  });

  it('reads a broken, bent or loose panel as a broken panel', () => {
    for (const field of ['bodyCrackedOrBroken', 'bodyBent', 'bodyLooseScreen']) {
      const out = deriveCondition({ [field]: true });
      assert.equal(out.bodyCondition, 'panel_broken', field);
      assert.equal(out.cosmeticCondition, 'flawless', field);
    }
  });

  it('prices the worse of a dent and a broken panel', () => {
    assert.equal(deriveCondition({ bodyMajorDents: true, bodyCrackedOrBroken: true }).bodyCondition, 'panel_broken');
    assert.equal(deriveCondition({ bodyMinorDents: true, bodyMajorDents: true }).bodyCondition, 'dents_bent');
  });

  it('keeps a scratched screen and a dent as two separate things', () => {
    const scratched = deriveCondition({ bodyMajorDents: true, screenMinorScratches: true });
    assert.equal(scratched.screenCondition, 'scratches_minor');
    assert.equal(scratched.bodyCondition, 'dents_bent');
    assert.equal(scratched.cosmeticCondition, 'good');
  });

  it('judges the overall look by the screen alone once the screen needs a repair', () => {
    const touch = deriveCondition({ bodyMajorDents: true, touchFault: true });
    assert.equal(touch.screenCondition, 'touch_fault');
    assert.equal(touch.cosmeticCondition, 'flawless');
  });

  it('judges the overall look by the screen alone, whatever the body is like', () => {
    assert.equal(deriveCondition({ bodyMajorDents: true }).cosmeticCondition, 'flawless');
    assert.equal(deriveCondition({ bodyMinorDents: true }).cosmeticCondition, 'flawless');
    assert.equal(deriveCondition({ screenMinorScratches: true }).cosmeticCondition, 'good');
  });

  it('does not lower the look for a cracked screen, even with body wear', () => {
    assert.equal(deriveCondition({ screenCracked: true }).cosmeticCondition, 'flawless');
    assert.equal(deriveCondition({ screenCracked: true, bodyMinorDents: true }).cosmeticCondition, 'flawless');
  });

  it('does not change its input', () => {
    const answers = Object.freeze({ screenCracked: true });
    assert.equal(deriveCondition(answers).screenCondition, 'cracked');
  });
});

describe('needsScreenRepair', () => {
  it('is true only for a cracked screen, a touch fault or major display problems', () => {
    assert.equal(needsScreenRepair({}), false);
    assert.equal(needsScreenRepair({ screenMinorScratches: true, displayMinorLines: true, displayMinorSpotsWhite: true }), false);
    for (const field of ['screenCracked', 'touchFault', 'displayMajorLines', 'displayMajorSpots', 'displayMajorDiscolouration']) {
      assert.equal(needsScreenRepair({ [field]: true }), true, field);
    }
  });
});

describe('hasDisplayOrTouchIssue', () => {
  it('is true for any screen, display or touch problem', () => {
    assert.equal(hasDisplayOrTouchIssue({}), false);
    assert.equal(hasDisplayOrTouchIssue({ touchFault: true }), true);
    assert.equal(hasDisplayOrTouchIssue({ displayMinorLines: true }), true);
    assert.equal(hasDisplayOrTouchIssue({ bodyMinorDents: true }), false);
  });
});
