/** A store or pickup hub shown in the "Our Stores" menu. */
export type StoreLocation = {
  id: string;
  name: string;
  locality: string;
  address: string;
  timing: string;
  phone: string;
  type: string;
};

export type StoreInput = Omit<StoreLocation, 'id'>;

/** Key of the site_content row that holds the store list. */
export const STORE_CONTENT_KEY = 'store_locations';

/** Shown until an admin saves their own list. */
export const DEFAULT_STORES: readonly StoreLocation[] = [
  { id: 'hazratganj', name: 'Hazratganj Flagship Store', locality: 'Hazratganj', address: 'Shop 12, Ground Floor, MG Marg, Near Cathedral', timing: '10:00 AM – 9:00 PM', phone: '+91 6390 616 616', type: 'Flagship Experience Center' },
  { id: 'gomti-nagar', name: 'Gomti Nagar Super Hub', locality: 'Gomti Nagar', address: 'Plot 4, Viram Khand 1, Near Patrakarpuram Crossing', timing: '10:00 AM – 9:00 PM', phone: '+91 98765 43211', type: 'Sales & Express Repair Hub' },
  { id: 'aliganj', name: 'Aliganj Tech Center', locality: 'Aliganj', address: 'B-14, Kapoorthala Shopping Complex', timing: '10:30 AM – 8:30 PM', phone: '+91 98765 43212', type: 'Diagnostic & Trade-In Store' },
  { id: 'indira-nagar', name: 'Indira Nagar Store', locality: 'Indira Nagar', address: 'Sector 14, Near Munshipulia Metro Station', timing: '10:00 AM – 9:00 PM', phone: '+91 98765 43213', type: 'Retail & Refurbished Hub' },
  { id: 'mahanagar', name: 'Mahanagar Store', locality: 'Mahanagar', address: 'Shop 8, Gole Market Commercial Centre', timing: '10:30 AM – 8:30 PM', phone: '+91 98765 43214', type: 'Experience & Pickup Point' },
  { id: 'ashiyana', name: 'Ashiyana Pickup Hub', locality: 'Ashiyana', address: 'Sector H, Power House Chauraha, LDA Colony', timing: '10:00 AM – 8:30 PM', phone: '+91 98765 43215', type: 'Express Drop & Instant Cash' },
  { id: 'chowk', name: 'Chowk Heritage Center', locality: 'Chowk', address: 'Shop 22, Phool Mandi Road, Opp. Clock Tower', timing: '11:00 AM – 9:00 PM', phone: '+91 98765 43216', type: 'Old City Trade & Service Hub' },
];

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/** Keeps only usable stores (they need a name) and gives each a unique id. */
export function normalizeStores(items: unknown): StoreLocation[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const stores: StoreLocation[] = [];
  items.forEach((raw, index) => {
    if (!raw || typeof raw !== 'object') return;
    const item = raw as Record<string, unknown>;
    const name = text(item.name);
    if (!name) return;
    let id = text(item.id) || String(item.id ?? '') || `store-${index + 1}`;
    while (seen.has(id)) id = `${id}-${index + 1}`;
    seen.add(id);
    stores.push({
      id,
      name,
      locality: text(item.locality),
      address: text(item.address),
      timing: text(item.timing),
      phone: text(item.phone),
      type: text(item.type),
    });
  });
  return stores;
}

/** Why a store form cannot be saved yet, or null when it is fine. */
export function validateStoreInput(input: StoreInput): string | null {
  if (!text(input.name)) return 'Store name is required.';
  if (!text(input.address)) return 'Store address is required.';
  return null;
}

/** The list with one more store at the end. Returns a new array. */
export function addStore(stores: readonly StoreLocation[], input: StoreInput, makeId: () => string): StoreLocation[] {
  const [added] = normalizeStores([{ ...input, id: makeId() }]);
  return added ? [...normalizeStores(stores), added] : [...stores];
}

/** The list without the given store. Returns a new array. */
export function removeStore(stores: readonly StoreLocation[], id: string): StoreLocation[] {
  return stores.filter((store) => store.id !== id);
}
