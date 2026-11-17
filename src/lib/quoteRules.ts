import { API_BASE } from '../config/apiConfig';
import { authHeaders } from './db';
import type { BrandModels } from './phoneChoice';
import {
  DEFAULT_PRICING_RULES,
  RULE_LIMITS,
  SCREEN_STATE_KEYS,
  androidModelKey,
  diffPricingRules,
  normalizeModelKey,
  resolvePricingRules,
  validatePricingRules,
  cloneRules,
} from '../../fundu_pricing_rules.mjs';

/** The editable quote rules (see fundu_pricing_rules.mjs). */
export interface PricingRules {
  age: {
    under3: number;
    m3to6: number;
    m6to11: number;
    over11: number;
    oldIphone: number;
    samsungOver11: number;
    androidOver11: number;
    oldAndroid: Record<string, number>;
    recentIphone: Record<string, number>;
  };
  appleScreen: {
    crackRupees: Record<string, number>;
    touchRupees: Record<string, number>;
    multiples: Record<string, number>;
    maxShare: number;
  };
  samsungMidFactor: number;
  screenTables: Record<'low' | 'mid' | 'high', Record<string, number>>;
  bodyDamage: Record<'standard' | 'premiumApple' | 'premiumAndroid', Record<string, number>>;
  faults: {
    share: Record<string, number>;
    min: Record<string, number>;
    flatAndroid: Record<string, number>;
    repairFactor: Record<string, number>;
    screenNotOriginalShare: number;
    unknownShare: number;
    callsSalvageApple: number;
    callsSalvageOther: number;
  };
  accessories: { box: number; charger: number; bill: number; lowEndMaxShare: number };
}

export interface RulesVersion {
  version: number;
  status: 'published' | 'archived';
  note: string;
  published_by: string;
  published_at: string | null;
  based_on_version: number | null;
  rules: PricingRules;
}

export interface RulesDraft {
  note: string;
  based_on_version: number | null;
  updated_by: string;
  updated_at: string | null;
  rules: PricingRules;
}

export interface RulesAdminState {
  published: { version: number; rules: PricingRules; source: 'database' | 'defaults' };
  draft: RulesDraft | null;
  versions: RulesVersion[];
  defaults: PricingRules;
  limits: typeof RULE_LIMITS;
}

export interface PreviewQuote {
  status: string;
  offerAmount: number | null;
  reason: string | null;
  conditionSummary: string[];
}

export interface RuleChange {
  path: string;
  from: number | undefined;
  to: number | undefined;
}

export const defaultRules = (): PricingRules => cloneRules(DEFAULT_PRICING_RULES) as unknown as PricingRules;
export const resolveRules = (saved: unknown): PricingRules => resolvePricingRules(saved) as unknown as PricingRules;
export const validateRules = (rules: unknown) => validatePricingRules(rules) as { valid: boolean; errors: string[] };
export const diffRules = (before: unknown, after: unknown): RuleChange[] => diffPricingRules(before, after);
export const copyRules = (rules: PricingRules): PricingRules => cloneRules(rules);
export const modelKey = (model: string): string => normalizeModelKey(model);
export const phoneKey = (brand: string, model: string): string => androidModelKey(brand, model);
export const ruleLimits = RULE_LIMITS as {
  age: Record<string, [number, number]>;
  crackRupees: [number, number];
  touchRupees: [number, number];
  multiple: [number, number];
  maxShare: [number, number];
  samsungMidFactor: [number, number];
  screenShare: [number, number];
  bodyShare: [number, number];
  faultShare: [number, number];
  faultRupees: [number, number];
  repairFactor: [number, number];
  screenNotOriginalShare: [number, number];
  unknownShare: [number, number];
  salvage: [number, number];
  accessoryRupees: [number, number];
  accessoryMaxShare: [number, number];
  maxEntries: number;
};
export const screenStateKeys = SCREEN_STATE_KEYS as readonly string[];

export const AGE_FIELDS: { key: 'under3' | 'm3to6' | 'm6to11' | 'over11'; label: string; hint: string }[] = [
  { key: 'under3', label: 'Below 3 months', hint: 'Almost new: usually 1.00, the full admin price.' },
  { key: 'm3to6', label: '3 to 6 months', hint: 'Cashify takes about 0.85 of the market price here.' },
  { key: 'm6to11', label: '6 to 11 months', hint: 'Cashify takes about 0.84 of the market price here.' },
  { key: 'over11', label: 'Older than 11 months', hint: 'An iPhone 15 or 16 or newer that has no rule of its own below. Android phones have their own factors.' },
];

export const SCREEN_STATE_LABELS: Record<string, string> = {
  scratches_minor: '1-2 scratches',
  scratches_major: 'More than 2 scratches',
  spots_few: '1-2 minor spots',
  tint_minor: 'Minor discolouration',
  faded_edges: 'Display faded along the edges',
  spots_many: '3 or more minor spots',
  chipped: 'Chipped or cracked outside the display',
  cracked: 'Screen cracked or glass broken',
  tint_major: 'Major discolouration',
  spots_heavy: 'Large or heavy spots',
  lines_visible: 'Visible lines on the display',
  touch_fault: 'Touch not working',
  display_lines: 'Display problem (older sell forms)',
};

export const FAULT_LABELS: Record<string, string> = {
  wifi: 'WiFi not working',
  bluetooth: 'Bluetooth not working',
  biometrics: 'Face ID / fingerprint sensor',
  speaker: 'Speaker faulty',
  audio_receiver: 'Audio receiver (earpiece)',
  proximity_sensor: 'Proximity sensor',
  silent_button: 'Silent button',
  microphone: 'Microphone',
  volume_button: 'Volume button',
  power_button: 'Power button',
  vibrator: 'Vibrator',
  buttons: 'Buttons (older sell forms)',
  sensors: 'Sensors (older sell forms)',
  camera_back: 'Back camera',
  camera_front: 'Front camera',
  camera_glass: 'Camera glass',
  battery_fault: 'Battery fault',
};

export const BODY_KIND_LABELS: Record<string, string> = {
  standard: 'Phones under ₹60,000',
  premiumApple: 'iPhones from ₹60,000',
  premiumAndroid: 'Android phones from ₹60,000',
};

export const BODY_CONDITION_LABELS: Record<string, string> = {
  minor_scratches: '1-2 minor dents, or more than 2 scratches',
  dents_bent: 'Major dent(s)',
  panel_broken: 'Cracked, missing or bent panel, or a loose screen',
};

export const TIER_LABELS: Record<string, string> = {
  low: 'Under ₹20,000',
  mid: '₹20,000 to ₹60,000',
  high: '₹60,000 and up',
};

/** "iphone14plus" -> "iPhone 14 Plus", "iphone16e" -> "iPhone 16e", "iphonese2022" -> "iPhone SE 2022". */
export function modelLabelFromKey(key: string): string {
  if (!key.startsWith('iphone')) return key;
  const rest = key.slice('iphone'.length);
  const tokens = rest.match(/3rdgen|\d+e|\d+|promax|pro|max|plus|mini|xsmax|xs|xr|se|air|x|e/g);
  if (!tokens || tokens.join('') !== rest) return `iPhone ${rest}`;
  const words = tokens.map((t) => {
    if (t === 'promax') return 'Pro Max';
    if (t === 'xsmax') return 'XS Max';
    if (t === 'xs' || t === 'xr' || t === 'se') return t.toUpperCase();
    if (t === '3rdgen') return '3rd Gen';
    if (/^\d+e$/.test(t)) return t;
    return t.charAt(0).toUpperCase() + t.slice(1);
  });
  return `iPhone ${words.join(' ')}`;
}

export class QuoteRulesError extends Error {
  errors: string[];
  status: number;
  constructor(message: string, status: number, errors: string[] = []) {
    super(message);
    this.errors = errors;
    this.status = status;
  }
}

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/pricing-rules${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json: { success?: boolean; data?: T; error?: string; errors?: string[] } = {};
  try {
    json = await res.json();
  } catch {
    // an empty or non-JSON answer is handled below
  }
  if (!res.ok || json.success === false) {
    throw new QuoteRulesError(json.error || `The server answered ${res.status}.`, res.status, json.errors || []);
  }
  return json.data as T;
}

export const fetchRulesAdminState = () => request<RulesAdminState>('/admin', 'GET');
export const saveRulesDraft = (rules: PricingRules, note: string) => request<{ draft: RulesDraft }>('/admin/draft', 'PUT', { rules, note });
export const discardRulesDraft = () => request<null>('/admin/draft', 'DELETE');
export const publishRulesDraft = (note: string) => request<{ version: number }>('/admin/publish', 'POST', { note });
export const rollbackRules = (version: number) => request<{ version: number }>('/admin/rollback', 'POST', { version });
export const previewRulesQuote = (input: Record<string, unknown>, rules?: PricingRules) =>
  request<{ live: PreviewQuote; draft: PreviewQuote }>('/admin/preview', 'POST', { input, rules });

const AGE_LABELS: Record<string, string> = {
  under3: 'Age factor: below 3 months',
  m3to6: 'Age factor: 3 to 6 months',
  m6to11: 'Age factor: 6 to 11 months',
  over11: 'Age factor: older than 11 months',
  oldIphone: 'Age factor: old iPhone (older than 11 months)',
  samsungOver11: 'Age factor: Samsung older than 11 months',
  androidOver11: 'Age factor: other Android older than 11 months',
};

/** A change in plain words for the "what did I change" list, e.g. "iPhone crack amount: iPhone 14". */
export function describeRuleChange(path: string): string {
  const parts = path.split('.');
  if (parts[0] === 'screenTables' && parts[1] && parts[2]) return `Screen share (${TIER_LABELS[parts[1]] ?? parts[1]}): ${SCREEN_STATE_LABELS[parts[2]] ?? parts[2]}`;
  if (parts[0] === 'bodyDamage' && parts[1] && parts[2]) return `Body damage (${BODY_KIND_LABELS[parts[1]] ?? parts[1]}): ${BODY_CONDITION_LABELS[parts[2]] ?? parts[2]}`;
  if (parts[0] === 'faults' && parts[1] === 'share' && parts[2]) return `Fault share: ${FAULT_LABELS[parts[2]] ?? parts[2]}`;
  if (parts[0] === 'faults' && parts[1] === 'min' && parts[2]) return `Fault minimum ₹: ${FAULT_LABELS[parts[2]] ?? parts[2]}`;
  if (parts[0] === 'faults' && parts[1] === 'flatAndroid' && parts[2]) return `Android flat fault ₹: ${FAULT_LABELS[parts[2]] ?? parts[2]}`;
  if (parts[0] === 'faults' && parts[1] === 'repairFactor' && parts[2]) return `Repair part factor: ${FAULT_LABELS[parts[2]] ?? parts[2]}`;
  if (path === 'faults.screenNotOriginalShare') return 'Replaced (non-original) screen, share of a crack';
  if (path === 'faults.unknownShare') return 'Fault the engine does not know, share of the price';
  if (path === 'faults.callsSalvageApple') return 'Calls not working: iPhone or phone from ₹20,000 (₹)';
  if (path === 'faults.callsSalvageOther') return 'Calls not working: cheaper Android (₹)';
  if (path === 'accessories.box') return 'Missing original box (₹)';
  if (path === 'accessories.charger') return 'Missing original charger (₹)';
  if (path === 'accessories.bill') return 'Missing valid bill (₹)';
  if (path === 'accessories.lowEndMaxShare') return 'Most missing accessories take off a phone under ₹20,000';
  if (parts[0] === 'age' && parts[1] === 'oldAndroid' && parts[2]) return `Old Android age factor: ${parts[2]}`;
  if (parts[0] === 'age' && parts[1] === 'recentIphone' && parts[2]) return `Newest iPhone age factor: ${modelLabelFromKey(parts[2])}`;
  if (parts[0] === 'age') return AGE_LABELS[parts[1]] ?? path;
  if (parts[0] === 'appleScreen' && parts[1] === 'crackRupees' && parts[2]) return `iPhone crack amount: ${modelLabelFromKey(parts[2])}`;
  if (parts[0] === 'appleScreen' && parts[1] === 'touchRupees' && parts[2]) return `iPhone touch amount: ${modelLabelFromKey(parts[2])}`;
  if (parts[0] === 'appleScreen' && parts[1] === 'multiples' && parts[2]) return `Screen multiple: ${SCREEN_STATE_LABELS[parts[2]] ?? parts[2]}`;
  if (path === 'appleScreen.maxShare') return 'Most a screen can take off';
  if (path === 'samsungMidFactor') return 'Samsung screen factor';
  return path;
}

/** Every brand with its models and storages, from the active sell price rows, for the preview's dropdowns. */
export const fetchPreviewModels = async (): Promise<BrandModels[]> => (await request<{ brands: BrandModels[] }>('/admin/models', 'GET')).brands;
