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
}

export type ScreenCondition = 'flawless' | 'scratched' | 'cracked' | 'touch_fault' | 'display_lines';
export type BodyCondition = 'flawless' | 'minor_scratches' | 'dents_bent';
export type CosmeticCondition = 'flawless' | 'good' | 'fair';

export interface DerivedCondition {
  screenCondition: ScreenCondition;
  bodyCondition: BodyCondition;
  cosmeticCondition: CosmeticCondition;
}

const COSMETIC_RANK: Record<CosmeticCondition, number> = { flawless: 0, good: 1, fair: 2 };

/** The worse of two overall looks. */
const worseOf = (a: CosmeticCondition, b: CosmeticCondition): CosmeticCondition =>
  COSMETIC_RANK[a] >= COSMETIC_RANK[b] ? a : b;

/** True when the answers report anything wrong with the screen, display or touch. */
export const hasDisplayOrTouchIssue = (a: ConditionAnswers): boolean =>
  Boolean(
    a.screenMinorScratches || a.screenMajorScratches || a.screenCracked || a.touchFault ||
      a.displayMinorSpotsWhite || a.displayMajorSpots || a.displayMinorLines || a.displayMajorLines ||
      a.displayMinorDiscolouration || a.displayMajorDiscolouration,
  );

/**
 * Turns the individual answers into the three conditions the quote engine prices.
 * Every screen, display and body question counts: a worse answer never gets a better look back.
 */
export function deriveCondition(a: ConditionAnswers): DerivedCondition {
  let screenCondition: ScreenCondition = 'flawless';
  if (a.screenCracked) screenCondition = 'cracked';
  else if (a.touchFault) screenCondition = 'touch_fault';
  else if (a.displayMajorLines || a.displayMajorSpots || a.displayMajorDiscolouration) screenCondition = 'display_lines';
  else if (
    a.screenMajorScratches || a.screenMinorScratches || a.displayMinorSpotsWhite || a.displayMinorLines || a.displayMinorDiscolouration
  ) screenCondition = 'scratched';

  let bodyCondition: BodyCondition = 'flawless';
  let bodyLook: CosmeticCondition = 'flawless';
  if (a.bodyCrackedOrBroken || a.bodyMajorDents) {
    bodyCondition = 'dents_bent';
    bodyLook = 'fair';
  } else if (a.bodyMinorDents || a.bodyMajorSideScratches || a.bodyMinorSideScratches) {
    bodyCondition = 'minor_scratches';
    bodyLook = 'good';
  }

  const screenLook: CosmeticCondition = screenCondition === 'cracked' ? 'fair' : screenCondition === 'scratched' ? 'good' : 'flawless';

  return { screenCondition, bodyCondition, cosmeticCondition: worseOf(bodyLook, screenLook) };
}
