/**
 * Loading long admin lists in pages: the first page renders at once, and the
 * rest arrive in the background so nothing older is silently left out.
 */

export type PageFetcher<T> = (offset: number, limit: number) => Promise<T[] | null>;

export type RemainingPagesOptions<T> = {
  pageSize: number;
  /** Rows already loaded (the first page). */
  startOffset: number;
  /** Safety cap on the total number of rows to load. */
  maxRows: number;
  onPage: (rows: T[]) => void;
  /** Return true to stop, e.g. when a newer reload has started. */
  isCancelled?: () => boolean;
};

/**
 * Fetches page after page until a short page shows the end, the cap is
 * reached, the fetch fails, or the caller cancels. Returns the rows loaded.
 */
export async function loadRemainingPages<T>(fetchPage: PageFetcher<T>, options: RemainingPagesOptions<T>): Promise<number> {
  const { pageSize, startOffset, maxRows, onPage, isCancelled = () => false } = options;
  let offset = startOffset;
  let loaded = 0;

  while (offset < maxRows && !isCancelled()) {
    const rows = await fetchPage(offset, pageSize);
    if (isCancelled() || !rows || rows.length === 0) break;

    onPage(rows);
    loaded += rows.length;
    offset += rows.length;
    if (rows.length < pageSize) break;
  }

  return loaded;
}

/** Adds `incoming` rows to `existing`, keeping the first copy of each id and the existing order. */
export function appendUniqueById<T extends { id: string }>(existing: readonly T[], incoming: readonly T[]): T[] {
  const seen = new Set(existing.map((row) => row.id));
  const fresh = incoming.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
  return fresh.length === 0 ? [...existing] : [...existing, ...fresh];
}

/** Puts the newest rows first and keeps every older row already loaded, updating rows that changed. */
export function mergeLatestById<T extends { id: string }>(existing: readonly T[], latest: readonly T[]): T[] {
  const latestIds = new Set(latest.map((row) => row.id));
  return [...latest, ...existing.filter((row) => !latestIds.has(row.id))];
}
