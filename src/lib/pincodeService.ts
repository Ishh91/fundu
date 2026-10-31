import { API_BASE } from '../config/apiConfig';

export interface ServiceablePincodeItem {
  _id?: string;
  id?: string;
  pincode: string;
  city: string;
  state: string;
  locality?: string;
  services: ('sell' | 'repair' | string)[];
  is_active: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PincodeServiceabilityResult {
  serviceable: boolean;
  pincode: string;
  city?: string;
  state?: string;
  locality?: string;
  services?: string[];
  message: string;
}

// In-memory cache to prevent redundant network calls during typing
const PINCODE_SERVICE_CACHE = new Map<string, PincodeServiceabilityResult>();

// Standard fallback Lucknow pincodes (226001 - 226030) if server is cold or offline
const LUCKNOW_FALLBACK_PINS = new Set([
  '226001', '226002', '226003', '226004', '226005', '226006', '226007', '226008', '226009', '226010',
  '226011', '226012', '226013', '226014', '226015', '226016', '226017', '226018', '226019', '226020',
  '226021', '226022', '226023', '226024', '226025', '226026', '226027', '226028', '226029', '226030',
]);

/**
 * Validates whether a 6-digit postal pincode is active for doorstep sell or repair.
 * Clean, generic messaging without revealing geographic restriction to customer.
 */
export async function checkPincodeServiceability(
  inputPincode: string,
  service: 'sell' | 'repair' = 'sell'
): Promise<PincodeServiceabilityResult> {
  const pin = String(inputPincode || '').replace(/\D/g, '').slice(0, 6);

  if (pin.length !== 6) {
    return {
      serviceable: false,
      pincode: pin,
      message: 'Please enter a valid 6-digit PIN code.',
    };
  }

  const cacheKey = `${pin}:${service}`;
  if (PINCODE_SERVICE_CACHE.has(cacheKey)) {
    return PINCODE_SERVICE_CACHE.get(cacheKey)!;
  }

  try {
    const res = await fetch(`${API_BASE}/pincodes/check?pincode=${encodeURIComponent(pin)}&service=${encodeURIComponent(service)}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      const result: PincodeServiceabilityResult = {
        serviceable: Boolean(data.serviceable),
        pincode: data.pincode || pin,
        city: data.city,
        state: data.state,
        locality: data.locality,
        services: data.services || ['sell', 'repair'],
        message: data.serviceable
          ? (data.message || '✓ Doorstep service available in your area.')
          : 'Doorstep service is currently not available at this pincode. We are rapidly expanding to new areas!',
      };

      PINCODE_SERVICE_CACHE.set(cacheKey, result);
      return result;
    }
  } catch (_netErr) {
    // Network fallback
  }

  // Resilient fallback check using base postal circle lookup
  const isFallbackServiceable = LUCKNOW_FALLBACK_PINS.has(pin);
  const fallbackResult: PincodeServiceabilityResult = {
    serviceable: isFallbackServiceable,
    pincode: pin,
    city: isFallbackServiceable ? 'Service Area' : '',
    state: isFallbackServiceable ? 'Uttar Pradesh' : '',
    message: isFallbackServiceable
      ? '✓ Doorstep service available in your area.'
      : 'Doorstep service is currently not available at this pincode. We are rapidly expanding to new areas!',
  };

  PINCODE_SERVICE_CACHE.set(cacheKey, fallbackResult);
  return fallbackResult;
}

/**
 * Admin: Fetch all serviceable pincodes
 */
export async function fetchServiceablePincodes(
  search = '',
  service = 'all',
  status = 'all'
): Promise<{ data: ServiceablePincodeItem[]; stats: { total: number; active: number; inactive: number } }> {
  const q = new URLSearchParams();
  if (search) q.set('search', search);
  if (service && service !== 'all') q.set('service', service);
  if (status && status !== 'all') q.set('status', status);

  const res = await fetch(`${API_BASE}/pincodes?${q.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch serviceable pincodes.');
  }
  return await res.json();
}

/**
 * Admin: Add single or bulk pincodes
 */
export async function addServiceablePincodes(payload: {
  pincode?: string;
  pincodes?: string;
  city?: string;
  state?: string;
  locality?: string;
  services?: string[];
  is_active?: boolean;
  notes?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/pincodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to add pincode(s).');
  }
  return json;
}

/**
 * Admin: Update pincode item
 */
export async function updateServiceablePincode(
  id: string,
  updates: Partial<ServiceablePincodeItem>
): Promise<any> {
  const res = await fetch(`${API_BASE}/pincodes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to update pincode.');
  }
  return json;
}

/**
 * Admin: Delete pincode item
 */
export async function deleteServiceablePincode(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/pincodes/${id}`, {
    method: 'DELETE',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to delete pincode.');
  }
  return json;
}

/**
 * Admin: Reset / Seed Lucknow pincodes
 */
export async function seedLucknowPincodes(): Promise<any> {
  const res = await fetch(`${API_BASE}/pincodes/seed-lucknow`, {
    method: 'POST',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to seed Lucknow pincodes.');
  }
  return json;
}
