import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { transform } from 'esbuild';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/lib/sellCondition.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader: 'ts', format: 'esm' });
const { deriveCondition, hasDisplayOrTouchIssue, needsScreenRepair } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

const flawless = { screenCondition: 'flawless', bodyCondition: 'flawless', cosmeticCondition: 'flawless' };

describe('deriveCondition: screen', () => {
  it('is flawless when nothing is reported', () => {
    assert.deepEqual(deriveCondition({}), flawless);
  });

  it('treats a cracked screen as cracked, above everything else', () => {
    const out = deriveCondition({ screenCracked: true, touchFault: true, displayMajorLines: true, screenMinorScratches: true });
    assert.equal(out.screenCondition, 'cracked');
    assert.equal(out.cosmeticCondition, 'fair');
  });

  it('treats a touch that does not work as a touch fault', () => {
    assert.equal(deriveCondition({ touchFault: true }).screenCondition, 'touch_fault');
  });

  it('treats major spots, major lines and strong discolouration as display lines', () => {
    for (const field of ['displayMajorSpots', 'displayMajorLines', 'displayMajorDiscolouration']) {
      assert.equal(deriveCondition({ [field]: true }).screenCondition, 'display_lines', field);
    }
  });

  it('lets every minor screen and display question change the quote (they used to be ignored)', () => {
    for (const field of [
      'screenMinorScratches', 'screenMajorScratches', 'displayMinorSpotsWhite', 'displayMinorLines', 'displayMinorDiscolouration',
    ]) {
      const out = deriveCondition({ [field]: true });
      assert.equal(out.screenCondition, 'scratched', field);
      assert.equal(out.cosmeticCondition, 'good', field);
    }
  });
});

describe('deriveCondition: body and overall look', () => {
  it('reads light body wear as minor scratches', () => {
    for (const field of ['bodyMinorSideScratches', 'bodyMajorSideScratches', 'bodyMinorDents']) {
      const out = deriveCondition({ [field]: true });
      assert.equal(out.bodyCondition, 'minor_scratches', field);
      assert.equal(out.cosmeticCondition, 'good', field);
    }
  });

  it('reads a broken body or big dents as bent', () => {
    for (const field of ['bodyCrackedOrBroken', 'bodyMajorDents']) {
      const out = deriveCondition({ [field]: true });
      assert.equal(out.bodyCondition, 'dents_bent', field);
      assert.equal(out.cosmeticCondition, 'fair', field);
    }
  });

  it('never makes the overall look better because of a minor screen issue', () => {
    const scratched = deriveCondition({ bodyMajorDents: true, screenMinorScratches: true });
    assert.equal(scratched.screenCondition, 'scratched');
    assert.equal(scratched.bodyCondition, 'dents_bent');
    assert.equal(scratched.cosmeticCondition, 'fair');
  });

  it('judges the overall look by the screen alone once the screen needs a repair', () => {
    const touch = deriveCondition({ bodyMajorDents: true, touchFault: true });
    assert.equal(touch.screenCondition, 'touch_fault');
    assert.equal(touch.cosmeticCondition, 'flawless');
  });

  it('still judges the overall look by the body when the screen is fine', () => {
    assert.equal(deriveCondition({ bodyMajorDents: true }).cosmeticCondition, 'fair');
    assert.equal(deriveCondition({ bodyMinorDents: true }).cosmeticCondition, 'good');
  });

  it('keeps a fair look when a cracked screen meets light body wear', () => {
    assert.equal(deriveCondition({ screenCracked: true, bodyMinorDents: true }).cosmeticCondition, 'fair');
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
