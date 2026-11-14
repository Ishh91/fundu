/**
 * What a customer may put in the cart.
 *
 * - One listing is one stock count. The same phone in two storage/colour lines still shares
 *   that count, so the cap is applied across all lines of the same listing.
 * - A listing that offers storage or colour options needs a choice before checkout.
 *
 * Pure functions only, so the rules are easy to test and the cart and checkout agree.
 */

/** Most units of one listing in a cart, even when the stock is larger. */
export const MAX_PER_LISTING = 10;

export interface CartLimitItem {
  id?: string;
  stock?: number | null;
  storage?: string | null;
  color?: string | null;
  available_storages?: string[] | null;
  available_colors?: string[] | null;
}

export interface CartLimitLine {
  id: string;
  type: string;
  quantity: number;
  item: CartLimitItem;
}

const listingKey = (line: Pick<CartLimitLine, 'type' | 'item'>): string => `${line.type}:${line.item?.id ?? ''}`;

/** How many units of this listing can be bought at most (stock, but never above MAX_PER_LISTING). */
export const stockCap = (item: CartLimitItem): number => {
  const stock = Number(item?.stock);
  if (item?.stock === undefined || item?.stock === null || !Number.isFinite(stock)) return MAX_PER_LISTING;
  return Math.max(0, Math.min(MAX_PER_LISTING, Math.floor(stock)));
};

const unitsInOtherLines = (lines: readonly CartLimitLine[], target: Pick<CartLimitLine, 'id' | 'type' | 'item'>): number =>
  lines
    .filter((line) => line.id !== target.id && listingKey(line) === listingKey(target))
    .reduce((sum, line) => sum + Math.max(0, Number(line.quantity) || 0), 0);

/** The most this line may hold: the listing's cap minus what its other lines already take. */
export const maxForLine = (lines: readonly CartLimitLine[], target: Pick<CartLimitLine, 'id' | 'type' | 'item'>): number =>
  Math.max(0, stockCap(target.item) - unitsInOtherLines(lines, target));

/** The quantity a line should have after the customer asks for `wanted`, and whether it was cut down. */
export const clampLineQuantity = (
  lines: readonly CartLimitLine[],
  target: Pick<CartLimitLine, 'id' | 'type' | 'item'>,
  wanted: number,
): { quantity: number; limited: boolean } => {
  const max = maxForLine(lines, target);
  const quantity = Math.min(Math.max(0, Math.floor(Number(wanted) || 0)), max);
  return { quantity, limited: quantity < wanted };
};

/** Units of `item` already in the cart across all its lines, ignoring `exceptLineId`. */
export const unitsInCart = (lines: readonly CartLimitLine[], type: string, item: CartLimitItem, exceptLineId?: string): number =>
  unitsInOtherLines(lines, { id: exceptLineId ?? '', type, item });

/** The text shown when a listing has fewer units left than the customer wants. */
export const stockNotice = (cap: number): string =>
  cap <= 0 ? 'Out of stock' : cap === 1 ? 'Only 1 left in stock' : `Only ${cap} left in stock`;

const clean = (value: string | null | undefined): string => String(value ?? '').trim().toLowerCase();

/** Which choices are still missing on a line whose listing offers storage or colour options. */
export const missingChoices = (item: CartLimitItem): Array<'storage' | 'colour'> => {
  const missing: Array<'storage' | 'colour'> = [];
  const storages = item?.available_storages ?? [];
  if (storages.length > 1 && !storages.some((option) => clean(option) === clean(item.storage))) missing.push('storage');
  const colours = item?.available_colors ?? [];
  if (colours.length > 1 && !clean(item.color)) missing.push('colour');
  return missing;
};

export interface FreshListing {
  /** The listing's current stock; null when it can no longer be bought. */
  stock: number | null;
}

/**
 * Brings cart lines in line with the shop's current stock: lines whose listing is gone or sold out
 * are dropped, and the rest are cut down so each listing stays within its stock. `fresh` is keyed by
 * listing id; a line with no entry is left alone. Returns the new lines and a message per change.
 */
export const reconcileLines = <L extends CartLimitLine & { item: CartLimitItem & { title?: string | null } }>(
  lines: readonly L[],
  fresh: Readonly<Record<string, FreshListing>>,
): { lines: L[]; messages: string[] } => {
  const messages: string[] = [];
  const used = new Map<string, number>();
  const result: L[] = [];

  for (const line of lines) {
    const news = fresh[String(line.item?.id ?? '')];
    const name = line.item?.title || 'An item';
    if (!news || line.type !== 'product') {
      result.push(line);
      continue;
    }
    if (news.stock === null) {
      messages.push(`${name} is no longer available and was removed from your cart.`);
      continue;
    }

    const item = { ...line.item, stock: news.stock };
    const key = listingKey({ type: line.type, item });
    const left = Math.max(0, stockCap(item) - (used.get(key) ?? 0));
    const quantity = Math.min(Math.max(0, Number(line.quantity) || 0), left);

    if (quantity <= 0) {
      messages.push(`${name} is out of stock and was removed from your cart.`);
      continue;
    }
    if (quantity < line.quantity) {
      messages.push(`${stockNotice(stockCap(item))} for ${name}. We reduced the quantity to ${quantity}.`);
    }
    used.set(key, (used.get(key) ?? 0) + quantity);
    result.push({ ...line, item, quantity });
  }

  return { lines: result, messages };
};
