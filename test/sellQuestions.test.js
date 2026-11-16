import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';

/** Compiles one of the pure TypeScript sell modules so plain Node can import it. */
async function load(file) {
  const source = await readFile(new URL(`../src/lib/${file}`, import.meta.url), 'utf8');
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  return code;
}

// sellQuestions only imports a type from sellCondition, so it compiles on its own.
const questions = await import(`data:text/javascript;base64,${Buffer.from(await load('sellQuestions.ts')).toString('base64')}`);
const condition = await import(`data:text/javascript;base64,${Buffer.from(await load('sellCondition.ts')).toString('base64')}`);
const { QUESTION_SECTIONS, ALL_QUESTION_GROUPS, applyChoice, selectedOptionId, clearSection, sectionHasAnswers } = questions;
const section = (id) => QUESTION_SECTIONS.find((s) => s.id === id);
const { deriveCondition } = condition;

const group = (id) => ALL_QUESTION_GROUPS.find((g) => g.id === id);
const pick = (answers, groupId, optionId) => applyChoice(group(groupId), optionId, answers);
const derived = (answers) => deriveCondition(answers);

describe('Cashify-style condition questions', () => {
  it('asks one question group per part of the phone, with "nothing wrong" first', () => {
    for (const g of ALL_QUESTION_GROUPS) {
      assert.equal(g.options[0].id, 'none', g.id);
      assert.deepEqual(g.options[0].sets, {}, g.id);
    }
  });

  it('covers the screen, display, body and panel sections Cashify asks about', () => {
    assert.deepEqual(QUESTION_SECTIONS.map((s) => s.id), ['screen', 'display', 'body', 'panel']);
    const labels = ALL_QUESTION_GROUPS.flatMap((g) => g.options.map((o) => o.label));
    for (const expected of [
      'Screen cracked / glass broken',
      'Chipped/cracked outside display area',
      'More than 2 scratches on screen',
      '1-2 scratches on screen',
      'Large / heavy visible spots on screen',
      'Display faded along edges',
      'Major discoloration',
      'Major dent(s) or more than 2',
      'Missing side or back panel',
      'Bent / curved panel',
      'Loose screen (gap between screen and body)',
    ]) {
      assert.ok(labels.includes(expected), expected);
    }
  });

  it('starts with every group on "nothing wrong"', () => {
    for (const g of ALL_QUESTION_GROUPS) assert.equal(selectedOptionId(g, {}), 'none', g.id);
  });

  it('remembers the picked description for every option of every group', () => {
    for (const g of ALL_QUESTION_GROUPS) {
      for (const option of g.options) {
        assert.equal(selectedOptionId(g, applyChoice(g, option.id, {})), option.id, `${g.id}/${option.id}`);
      }
    }
  });

  it('lets only one description be on per group', () => {
    let answers = pick({}, 'screenPhysical', 'scratches_1_2');
    answers = pick(answers, 'screenPhysical', 'cracked');
    assert.equal(answers.screenMinorScratches, false);
    assert.equal(answers.screenCracked, true);
    answers = pick(answers, 'screenPhysical', 'none');
    assert.equal(answers.screenCracked, false);
  });

  it('keeps a choice in one group from touching another group', () => {
    let answers = pick({}, 'screenPhysical', 'scratches_1_2');
    answers = pick(answers, 'bodyDents', 'dents_minor');
    answers = pick(answers, 'displaySpots', 'spots_1_2');
    assert.equal(answers.screenMinorScratches, true);
    assert.equal(answers.bodyMinorDents, true);
    answers = pick(answers, 'displaySpots', 'none');
    assert.equal(answers.screenMinorScratches, true);
    assert.equal(answers.bodyMinorDents, true);
  });

  it('keeps the dent and the bent choices apart, so one never shows as the other', () => {
    let answers = pick({}, 'bodyBent', 'bent');
    assert.equal(selectedOptionId(group('bodyBent'), answers), 'bent');
    assert.equal(selectedOptionId(group('bodyDents'), answers), 'none');
    answers = pick({}, 'bodyDents', 'dents_major');
    assert.equal(selectedOptionId(group('bodyBent'), answers), 'none');
  });
});

describe('choosing which kinds of damage apply', () => {
  it('lets the customer tick the four kinds of damage in Cashify\'s words', () => {
    assert.deepEqual(
      QUESTION_SECTIONS.map((s) => s.applies),
      [
        'Broken/scratch on device screen',
        'Dead spot / visible line and discoloration on screen',
        'Scratch/dent on device body',
        'Device panel missing/broken',
      ],
    );
  });

  it('says a section has answers only when something in it is wrong', () => {
    assert.equal(sectionHasAnswers(section('display'), {}), false);
    assert.equal(sectionHasAnswers(section('display'), pick({}, 'displayLines', 'lines_visible')), true);
    assert.equal(sectionHasAnswers(section('panel'), pick({}, 'bodyBent', 'bent')), true);
  });

  it('puts every group of a section back on "nothing wrong" when its damage does not apply', () => {
    let answers = pick({}, 'displaySpots', 'spots_heavy');
    answers = pick(answers, 'displayColour', 'colour_major');
    answers = pick(answers, 'screenPhysical', 'cracked');
    const cleared = clearSection(section('display'), answers);
    assert.equal(sectionHasAnswers(section('display'), cleared), false);
    assert.equal(cleared.screenCracked, true, 'other sections are kept');
  });

  it('prices a phone as flawless again once its damage is cleared', () => {
    const damaged = pick(pick({}, 'bodyBent', 'loose'), 'bodyPanel', 'panel_cracked');
    assert.equal(derived(damaged).bodyCondition, 'panel_broken');
    assert.equal(derived(clearSection(section('panel'), damaged)).bodyCondition, 'flawless');
  });
});

describe('what each description is priced as', () => {
  it('prices a chipped screen the same as a cracked one', () => {
    assert.deepEqual(derived(pick({}, 'screenPhysical', 'chipped')), derived(pick({}, 'screenPhysical', 'cracked')));
    assert.equal(derived(pick({}, 'screenPhysical', 'chipped')).screenCondition, 'cracked');
  });

  it('prices scratches as a scratched screen', () => {
    assert.equal(derived(pick({}, 'screenPhysical', 'scratches_1_2')).screenCondition, 'scratched');
    assert.equal(derived(pick({}, 'screenPhysical', 'scratches_3_plus')).screenCondition, 'scratched');
  });

  it('prices minor spots, faded edges and minor discoloration as a scratched screen', () => {
    assert.equal(derived(pick({}, 'displaySpots', 'spots_3_plus')).screenCondition, 'scratched');
    assert.equal(derived(pick({}, 'displayLines', 'lines_faded')).screenCondition, 'scratched');
    assert.equal(derived(pick({}, 'displayColour', 'colour_minor')).screenCondition, 'scratched');
  });

  it('prices heavy spots, visible lines and major discoloration as a screen that needs a repair', () => {
    assert.equal(derived(pick({}, 'displaySpots', 'spots_heavy')).screenCondition, 'display_lines');
    assert.equal(derived(pick({}, 'displayLines', 'lines_visible')).screenCondition, 'display_lines');
    assert.equal(derived(pick({}, 'displayColour', 'colour_major')).screenCondition, 'display_lines');
  });

  it('prices a missing, cracked, bent or loose panel as a broken panel, and a major dent as a dent', () => {
    assert.equal(derived(pick({}, 'bodyPanel', 'panel_missing')).bodyCondition, 'panel_broken');
    assert.equal(derived(pick({}, 'bodyBent', 'bent')).bodyCondition, 'panel_broken');
    assert.equal(derived(pick({}, 'bodyBent', 'loose')).bodyCondition, 'panel_broken');
    assert.equal(derived(pick({}, 'bodyDents', 'dents_major')).bodyCondition, 'dents_bent');
  });

  it('prices body scratches and minor dents as a lightly worn body', () => {
    assert.equal(derived(pick({}, 'bodyScratches', 'body_scratches_3_plus')).bodyCondition, 'minor_scratches');
    assert.equal(derived(pick({}, 'bodyDents', 'dents_minor')).bodyCondition, 'minor_scratches');
  });

  it('prices a phone with nothing wrong as flawless', () => {
    assert.deepEqual(derived({}), { screenCondition: 'flawless', bodyCondition: 'flawless', cosmeticCondition: 'flawless' });
  });

  it('does not deduct a dent on top of a screen that needs a repair', () => {
    const answers = pick(pick({}, 'screenPhysical', 'cracked'), 'bodyDents', 'dents_major');
    assert.equal(derived(answers).cosmeticCondition, 'flawless');
  });
});
