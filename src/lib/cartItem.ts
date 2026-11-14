import type { Product, SparePart } from '../types';

/** The variant details shown next to a cart line. Spare parts have none. */
export interface CartItemVariant {
  storage: string;
  ram: string;
  color: string;
  condition: string;
}

const NO_VARIANT: CartItemVariant = { storage: '', ram: '', color: '', condition: '' };

/** A phone or laptop listing, as opposed to a spare part. */
export const isProductItem = (item: Product | SparePart): item is Product => 'condition' in item || 'storage' in item;

export const getItemVariant = (item: Product | SparePart): CartItemVariant =>
  isProductItem(item)
    ? {
        storage: item.storage || '',
        ram: item.ram || '',
        color: item.color || '',
        condition: item.condition || '',
      }
    : NO_VARIANT;

/** "128 GB • Superb" style summary for a cart line; empty for spare parts. */
export const describeItemVariant = (item: Product | SparePart): string => {
  const { storage, condition } = getItemVariant(item);
  return [storage, condition].filter(Boolean).join(' • ');
};
