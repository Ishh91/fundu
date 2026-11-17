/** The yes/no answers on the "condition" step of the sell form that describe how the phone looks and feels. */
export interface ConditionAnswers {
  screenMinorScratches?: boolean;
  screenMajorScratches?: boolean;
  screenCracked?: boolean;
  /** The touch screen has dead areas, ghost touches or does not respond properly. */
  touchFault?: boolean;
  displayMinorSpotsWhite?: boolean;
  displayMajorSpots?: boolean;
  displayMinorLines?: boolean;
  displayMajorLines?: boolean;
  displayMinorDiscolouration?: boolean;
  displayMajorDiscolouration?: boolean;
  bodyMinorSideScratches?: boolean;
  bodyMajorSideScratches?: boolean;
  bodyMinorDents?: boolean;
  bodyMajorDents?: boolean;
  bodyCrackedOrBroken?: boolean;
  // Extra detail the Cashify-style questions ask for. Each always goes with one of the answers above, which is
  // what the quote is priced on; these only remember which description the customer picked.
  /** The glass is chipped or cracked outside the display area (priced as a cracked screen). */
  screenChipped?: boolean;
  /** Three or more minor spots (priced as minor spots). */
  displayManyMinorSpots?: boolean;
  /** The display is faded along the edges (priced as minor lines). */
  displayFadedEdges?: boolean;
  /** A side or back panel is missing (priced as a broken body). */
  bodyMissingPanel?: boolean;
  /** The phone is bent (priced as a major dent). */
  bodyBent?: boolean;
  /** The screen is loose, with a gap between screen and body (priced as a major dent). */
  bodyLooseScreen?: boolean;
  // bodyBent and bodyLooseScreen are priced like bodyMajorDents, but are kept apart so that picking one of them
  // does not also show the "major dents" description as picked.
}

/**
 * How the screen is. 'flawless', 'scratched', 'cracked', 'touch_fault' and 'display_lines' are the old two-level values; the rest
 * are the graded states Cashify prices separately. The quote engine prices a cheap phone on the graded state and any other
 * phone on the old two-level value it maps to (legacyScreenCondition in fundu_phone_quote.mjs).
 */
export type ScreenCondition =
  | 'flawless' | 'scratched' | 'cracked' | 'touch_fault' | 'display_lines'
  | 'scratches_minor' | 'scratches_major' | 'spots_few' | 'spots_many' | 'tint_minor' | 'faded_edges'
  | 'chipped' | 'tint_major' | 'spots_heavy' | 'lines_visible';
export type BodyCondition = 'flawless' | 'minor_scratches' | 'dents_bent' | 'panel_broken';
export type CosmeticCondition = 'flawless' | 'good' | 'fair';

export interface DerivedCondition {
  screenCondition: ScreenCondition;
  bodyCondition: BodyCondition;
  cosmeticCondition: CosmeticCondition;
}

/** True when the answers say the screen needs a repair: cracked, touch not working, or major spots, lines or discolouration. */
export const needsScreenRepair = (a: ConditionAnswers): boolean =>
  Boolean(a.screenCracked || a.touchFault || a.displayMajorLines || a.displayMajorSpots || a.displayMajorDiscolouration);

/** The screen states that need a repair, worst first (by what Cashify takes off a cheap phone). */
const REPAIR_SCREEN_STATES: ScreenCondition[] = ['touch_fault', 'lines_visible', 'spots_heavy', 'cracked', 'tint_major', 'chipped'];
/** The screen states that only wear the screen, worst first. A body dent still counts next to these. */
const WEAR_SCREEN_STATES: ScreenCondition[] = ['spots_many', 'faded_edges', 'scratches_major', 'spots_few', 'tint_minor', 'scratches_minor'];

/** True for a screen state that needs a repair, so the body and the battery are not deducted on top of it. */
export const isScreenRepairState = (state: string): boolean =>
  (REPAIR_SCREEN_STATES as string[]).includes(state) || state === 'display_lines';

/** The one worst screen state the answers describe: any repair beats any wear, and the worse of two wears wins. */
export function worstScreenState(a: ConditionAnswers): ScreenCondition {
  const present: Record<string, boolean> = {
    touch_fault: Boolean(a.touchFault),
    lines_visible: Boolean(a.displayMajorLines),
    spots_heavy: Boolean(a.displayMajorSpots),
    cracked: Boolean(a.screenCracked && !a.screenChipped),
    tint_major: Boolean(a.displayMajorDiscolouration),
    chipped: Boolean(a.screenChipped),
    spots_many: Boolean(a.displayManyMinorSpots),
    faded_edges: Boolean(a.displayFadedEdges || a.displayMinorLines),
    scratches_major: Boolean(a.screenMajorScratches),
    spots_few: Boolean(a.displayMinorSpotsWhite && !a.displayManyMinorSpots),
    tint_minor: Boolean(a.displayMinorDiscolouration),
    scratches_minor: Boolean(a.screenMinorScratches),
  };
  const worst = [...REPAIR_SCREEN_STATES, ...WEAR_SCREEN_STATES].find((state) => present[state]);
  return worst ?? 'flawless';
}

/** True when the answers report anything wrong with the screen, display or touch. */
export const hasDisplayOrTouchIssue = (a: ConditionAnswers): boolean =>
  Boolean(
    a.screenMinorScratches || a.screenMajorScratches || a.screenCracked || a.touchFault ||
      a.displayMinorSpotsWhite || a.displayMajorSpots || a.displayMinorLines || a.displayMajorLines ||
      a.displayMinorDiscolouration || a.displayMajorDiscolouration,
  );

/**
 * Turns the individual answers into the three conditions the quote engine prices.
 * Every screen, display and body question counts. The overall look comes from the screen alone; the body is
 * priced on its own as a share of the value (minor wear 6%, a major dent 10%, a broken or bent panel 18%, as
 * measured against Cashify), so body damage is not also counted as a worn look. Business rule: once the screen
 * needs a repair (cracked, touch fault, major display problems) the body is not deducted on top; it is still
 * recorded as answered. With only scratches on the screen, the body still counts.
 */
export function deriveCondition(a: ConditionAnswers): DerivedCondition {
  const screenCondition = worstScreenState(a);

  let bodyCondition: BodyCondition = 'flawless';
  if (a.bodyCrackedOrBroken || a.bodyBent || a.bodyLooseScreen) bodyCondition = 'panel_broken';
  else if (a.bodyMajorDents) bodyCondition = 'dents_bent';
  else if (a.bodyMinorDents || a.bodyMajorSideScratches || a.bodyMinorSideScratches) bodyCondition = 'minor_scratches';

  // A screen that needs repair is paid for by its repair cost, so it does not also lower the look. A screen that is only worn
  // gets the "good" look, which is what a phone that is not cheap is priced on; a cheap phone is priced on the graded state.
  const screenLook: CosmeticCondition = screenCondition === 'flawless' || isScreenRepairState(screenCondition) ? 'flawless' : 'good';

  return { screenCondition, bodyCondition, cosmeticCondition: screenLook };
}
