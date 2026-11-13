/**
 * Returns only the fields of `next` whose value differs from `original`.
 *
 * Used when saving an edit, so a small change (a price, the stock count) does
 * not re-upload unchanged multi-MB fields such as photos or a video.
 * A missing value, `undefined` and `null` are treated as the same "empty".
 */
export function changedFields<T extends Record<string, unknown>>(
  original: Record<string, unknown> | null | undefined,
  next: T,
): Partial<T> {
  const normalize = (value: unknown): string => JSON.stringify(value ?? null);
  const base = original ?? {};

  return Object.fromEntries(
    Object.entries(next).filter(([key, value]) => normalize(value) !== normalize(base[key])),
  ) as Partial<T>;
}
