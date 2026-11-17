/**
 * The update that adds a missing storage variant of a model when an admin saves a price for one storage.
 *
 * It must not name `created_at` or `updated_at`. The SellPriceConfig schema has timestamps, so mongoose adds
 * `$set: { updated_at }` (and `created_at` on insert) to every update itself. A `$setOnInsert.updated_at` next to that
 * `$set.updated_at` is a conflict, and MongoDB rejects the whole update with code 40 (ConflictingUpdateOperators).
 */

// The look multipliers every other price row has: flawless 1.00, good 0.85, fair 0.70.
export const STANDARD_LOOK_MULTIPLIERS = {
  excellent_multiplier: 1.0,
  good_multiplier: 0.85,
  fair_multiplier: 0.7,
};

/** The `findOneAndUpdate` update for a variant that does not exist yet: it only fills a row that is being inserted. */
export function buildSiblingVariantUpsert({ brand, model, storage, basePrice }) {
  return {
    $setOnInsert: {
      brand,
      model,
      storage,
      base_price: basePrice,
      ...STANDARD_LOOK_MULTIPLIERS,
      box_bonus: 400,
      charger_bonus: 400,
      is_active: true,
      is_locked: false,
      manual_override: false,
    },
  };
}
