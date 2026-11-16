import type { ConditionAnswers } from './sellCondition';

/**
 * The look-and-feel questions of the sell form, written the way Cashify asks them: for each part of the phone
 * the customer picks exactly one description, from "nothing wrong" to the worst case.
 * Each description is stored as the yes/no answers the quote engine already understands (see sellCondition.ts).
 */
export interface QuestionOption {
  id: string;
  label: string;
  /** The answers this description turns on. Empty for "nothing wrong". */
  sets: Partial<ConditionAnswers>;
  /** Shown in red: the phone needs a repair or is badly damaged. */
  severe?: boolean;
}

export interface QuestionGroup {
  id: string;
  title: string;
  help: string;
  options: QuestionOption[];
}

export type DefectArea = 'screen' | 'display' | 'body' | 'panel';

/**
 * A part of the form the customer opens by saying it applies to their phone, in the order they see them.
 * Cashify first asks which kinds of damage the phone has and then only asks about those; so do we.
 */
export interface QuestionSection {
  id: DefectArea;
  /** What the customer ticks to say this kind of damage applies (Cashify's wording). */
  applies: string;
  title: string;
  subtitle: string;
  groups: QuestionGroup[];
}

const NONE = (label: string): QuestionOption => ({ id: 'none', label, sets: {} });

export const QUESTION_SECTIONS: QuestionSection[] = [
  {
    id: 'screen',
    applies: 'Broken/scratch on device screen',
    title: 'Screen Condition',
    subtitle: 'Check the glass on the front of the phone',
    groups: [
      {
        id: 'screenPhysical',
        title: 'Screen physical condition',
        help: 'Check the physical condition of the display screen',
        options: [
          NONE('No scratches or cracks on the screen'),
          { id: 'scratches_1_2', label: '1-2 scratches on screen', sets: { screenMinorScratches: true } },
          { id: 'scratches_3_plus', label: 'More than 2 scratches on screen', sets: { screenMajorScratches: true } },
          { id: 'chipped', label: 'Chipped/cracked outside display area', sets: { screenCracked: true, screenChipped: true }, severe: true },
          { id: 'cracked', label: 'Screen cracked / glass broken', sets: { screenCracked: true }, severe: true },
        ],
      },
    ],
  },
  {
    id: 'display',
    applies: 'Dead spot / visible line and discoloration on screen',
    title: 'Display Defects',
    subtitle: 'Spots, lines and colour problems on the screen',
    groups: [
      {
        id: 'displaySpots',
        title: 'Dead pixels / spots on screen',
        help: 'Check the screen for visible spots',
        options: [
          NONE('No spots on screen'),
          { id: 'spots_1_2', label: '1-2 minor spots on screen', sets: { displayMinorSpotsWhite: true } },
          { id: 'spots_3_plus', label: '3 or more minor spots on screen', sets: { displayMinorSpotsWhite: true, displayManyMinorSpots: true } },
          { id: 'spots_heavy', label: 'Large / heavy visible spots on screen', sets: { displayMajorSpots: true }, severe: true },
        ],
      },
      {
        id: 'displayLines',
        title: 'Visible lines on screen',
        help: 'Check the screen for visible lines',
        options: [
          NONE('No line(s) on display'),
          { id: 'lines_faded', label: 'Display faded along edges', sets: { displayMinorLines: true, displayFadedEdges: true } },
          { id: 'lines_visible', label: 'Visible line(s) on display', sets: { displayMajorLines: true }, severe: true },
        ],
      },
      {
        id: 'displayColour',
        title: 'Discoloration on screen',
        help: 'Check the screen for discoloration',
        options: [
          NONE('No discoloration'),
          { id: 'colour_minor', label: 'Minor discoloration', sets: { displayMinorDiscolouration: true } },
          { id: 'colour_major', label: 'Major discoloration', sets: { displayMajorDiscolouration: true }, severe: true },
        ],
      },
    ],
  },
  {
    id: 'body',
    applies: 'Scratch/dent on device body',
    title: 'Body Condition',
    subtitle: 'Scratches and dents on the body of the phone',
    groups: [
      {
        id: 'bodyScratches',
        title: 'Scratches on device body',
        help: 'Check for scratches on the body of the phone',
        options: [
          NONE('No scratches'),
          { id: 'body_scratches_1_2', label: '1-2 scratches', sets: { bodyMinorSideScratches: true } },
          { id: 'body_scratches_3_plus', label: 'More than 2 scratches', sets: { bodyMajorSideScratches: true } },
        ],
      },
      {
        id: 'bodyDents',
        title: 'Dents on device body',
        help: 'Check for dents on the body of the phone',
        options: [
          NONE('No dents'),
          { id: 'dents_minor', label: '1-2 minor dents', sets: { bodyMinorDents: true } },
          { id: 'dents_major', label: 'Major dent(s) or more than 2', sets: { bodyMajorDents: true }, severe: true },
        ],
      },
    ],
  },
  {
    id: 'panel',
    applies: 'Device panel missing/broken',
    title: 'Panel & Frame Condition',
    subtitle: 'Side and back panels, bending and a loose screen',
    groups: [
      {
        id: 'bodyPanel',
        title: 'Device side / back panel condition',
        help: 'Check the side and back panels of the phone',
        options: [
          NONE('No defect on side or back panel'),
          { id: 'panel_cracked', label: 'Cracked / broken side or back panel', sets: { bodyCrackedOrBroken: true }, severe: true },
          { id: 'panel_missing', label: 'Missing side or back panel', sets: { bodyCrackedOrBroken: true, bodyMissingPanel: true }, severe: true },
        ],
      },
      {
        id: 'bodyBent',
        title: 'Device bent / screen loose',
        help: 'Check if the phone is bent or the display is loose',
        options: [
          NONE('Phone not bent'),
          { id: 'bent', label: 'Bent / curved panel', sets: { bodyBent: true }, severe: true },
          { id: 'loose', label: 'Loose screen (gap between screen and body)', sets: { bodyLooseScreen: true }, severe: true },
        ],
      },
    ],
  },
];

export const ALL_QUESTION_GROUPS: QuestionGroup[] = QUESTION_SECTIONS.flatMap((section) => section.groups);

/** True when any group of the section says something is wrong. */
export function sectionHasAnswers(section: QuestionSection, answers: ConditionAnswers): boolean {
  return section.groups.some((group) => selectedOptionId(group, answers) !== 'none');
}

/** The answers with every group of the section back on "nothing wrong". Used when the customer says that kind of damage does not apply. */
export function clearSection(section: QuestionSection, answers: ConditionAnswers): ConditionAnswers {
  return section.groups.reduce((current, group) => applyChoice(group, 'none', current), answers);
}

/** Every answer a group can turn on. */
const groupFields = (group: QuestionGroup): (keyof ConditionAnswers)[] => {
  const fields = new Set<keyof ConditionAnswers>();
  group.options.forEach((option) => (Object.keys(option.sets) as (keyof ConditionAnswers)[]).forEach((key) => fields.add(key)));
  return [...fields];
};

/** The description the answers currently say for a group. The most specific one that matches wins. */
export function selectedOptionId(group: QuestionGroup, answers: ConditionAnswers): string {
  let best: QuestionOption | null = null;
  let bestSize = 0;
  for (const option of group.options) {
    const keys = Object.keys(option.sets) as (keyof ConditionAnswers)[];
    if (keys.length > bestSize && keys.every((key) => answers[key])) {
      best = option;
      bestSize = keys.length;
    }
  }
  return best ? best.id : 'none';
}

/** The answers with one group set to the picked description. Everything else is left as it was. */
export function applyChoice(group: QuestionGroup, optionId: string, answers: ConditionAnswers): ConditionAnswers {
  const option = group.options.find((o) => o.id === optionId) ?? group.options[0];
  const cleared = Object.fromEntries(groupFields(group).map((field) => [field, false]));
  return { ...answers, ...cleared, ...option.sets };
}
