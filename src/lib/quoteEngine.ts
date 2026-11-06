import { API_BASE } from '../config/apiConfig';
import {
  quotePhone,
  calculatePhoneAgingFactor,
  recalculateInspectedQuote,
  FUNDU_POLICY,
  FUNDU_SERVICE_LOCALITIES,
} from '../../fundu_phone_quote.mjs';

export {
  calculatePhoneAgingFactor,
  quotePhone,
  recalculateInspectedQuote,
  FUNDU_POLICY,
  FUNDU_SERVICE_LOCALITIES,
};
import { getEffectivePrice } from './priceSync';
import { MASTER_MODEL_CATALOG } from '../data/masterModelCatalog';
import { ALL_INDIAN_PHONES_CATALOG } from '../data/indianPhonesCatalog';

export interface FunduQuoteRequest {
  brand: string;
  model: string;
  storage: string;
  ram?: string;
  powers_on: boolean;
  activation_lock_cleared?: boolean;
  ownership_verified?: boolean;
  liquid_damage?: boolean;
  cosmetic_condition?: 'flawless' | 'good' | 'fair';
  screen_condition?: 'flawless' | 'scratched' | 'cracked' | 'touch_fault' | 'display_lines';
  body_condition?: 'flawless' | 'minor_scratches' | 'dents_bent';
  battery_health?: 'above_85' | '75_to_85' | 'below_75' | 'healthy' | 'degraded_service' | 'unknown' | string;
  defects?: string[];
  accessories?: string[];
  under_warranty?: boolean;
  age_period?: '0_to_3_months' | '3_to_6_months' | '6_to_9_months' | 'above_9_months' | 'below_3_months' | '3_to_10_months' | '10_to_12_months' | 'above_11_months' | string;
  stylus_available?: boolean;
}

export interface FunduQuoteResponse {
  status: 'quoted' | 'requires_manual_review' | 'invalid_input';
  quoteId?: string;
  offerAmount?: number;
  currency?: string;
  isConditionalEstimate?: boolean;
  disclaimer?: string;
  conditionSummary?: string[];
  deviceSummary?: {
    brand: string;
    model: string;
    storage: string;
    ram?: string;
  };
  policyVersion?: string;
  validForDays?: number;
  createdAt?: string;
  nextSteps?: string[];
  reason?: string;
  reviewReason?: string;
  reviewMessage?: string;
  missingConfig?: string[];
  message?: string;
  reviewAction?: string;
  contactPath?: {
    phone: string;
    email: string;
    doorstepHub?: string;
  };
  error?: string;
}

export interface InspectionRecalculateResponse {
  hasMismatch: boolean;
  previousOffer: number;
  revisedOffer: number;
  difference: number;
  mismatchExplanations: string[];
  requiresSellerAcceptance: boolean;
  sellerActionPrompt: string;
  inspectedQuote?: FunduQuoteResponse;
}

/**
 * Synchronously computes an instant, authoritative Fundu buyback quote (0.01 ms).
 * Used to immediately update UI on variant or condition changes before network request resolves.
 */
export function getInstantFunduQuote(params: FunduQuoteRequest): FunduQuoteResponse {
  let dbPrice = getEffectivePrice(params.brand, params.model, 0, params.storage);
  let catalogStorage = params.storage || '128 GB';

  if (!dbPrice || dbPrice <= 0) {
    const mNorm = (params.model || '').toLowerCase().trim();
    const bNorm = (params.brand || '').toLowerCase().trim();
    const cleanStr = (s: string) => (s || '')
      .toLowerCase()
      .replace(/^(apple|samsung|oneplus|xiaomi|poco|vivo|iqoo|oppo|realme|motorola|moto|google|pixel|nothing|cmf|tecno|techno|itel|infinix|lava|honor)\s+/i, '')
      .replace(/[\s-]+/g, ' ')
      .trim();

    const cleanMNorm = cleanStr(mNorm);
    const normStorage = (params.storage || '').trim().toLowerCase();

    const exactMasterWithStorage = MASTER_MODEL_CATALOG.find((m) => {
      const cleanTarget = cleanStr(m.model);
      const mBrandNorm = (m.brand || '').toLowerCase().trim();
      const isBrandEq = !bNorm || mBrandNorm === bNorm || (bNorm === 'techno' && mBrandNorm === 'tecno');
      const isModelEq = cleanTarget === cleanMNorm || m.model.toLowerCase() === mNorm;
      const isStorageEq = (m.storage || '').trim().toLowerCase() === normStorage;
      return isBrandEq && isModelEq && isStorageEq;
    });

    const exactMaster = exactMasterWithStorage || MASTER_MODEL_CATALOG.find((m) => {
      const cleanTarget = cleanStr(m.model);
      const mBrandNorm = (m.brand || '').toLowerCase().trim();
      const isBrandEq = !bNorm || mBrandNorm === bNorm || (bNorm === 'techno' && mBrandNorm === 'tecno');
      return isBrandEq && (cleanTarget === cleanMNorm || m.model.toLowerCase() === mNorm);
    });

    const master = exactMaster || MASTER_MODEL_CATALOG.find((m) => {
      const cleanTarget = cleanStr(m.model);
      const mBrandNorm = (m.brand || '').toLowerCase().trim();
      const isBrandEq = !bNorm || mBrandNorm === bNorm || (bNorm === 'techno' && mBrandNorm === 'tecno');
      if (!isBrandEq) return false;
      return (
        cleanTarget.includes(cleanMNorm) ||
        cleanMNorm.includes(cleanTarget) ||
        m.model.toLowerCase().includes(mNorm) ||
        mNorm.includes(m.model.toLowerCase())
      );
    });
    if (master?.price) {
      dbPrice = master.price;
      catalogStorage = master.storage || '128 GB';
    } else {
      const indian = ALL_INDIAN_PHONES_CATALOG.find((p) =>
        p.model.toLowerCase() === mNorm ||
        `${p.brand} ${p.model}`.toLowerCase() === `${bNorm} ${mNorm}`
      );
      if (indian?.base_resale_value) {
        dbPrice = indian.base_resale_value;
        catalogStorage = indian.storage_options?.[0] || '128 GB';
      }
    }
  }

  const quoteOptions = dbPrice > 0 ? {
    catalogPrice: dbPrice,
    catalogStorage,
    isDirectBuybackPrice: true,
    ram: params.ram || '',
  } : {
    ram: params.ram || '',
  };
  const localResult = quotePhone(params, quoteOptions);
  const { _internalAudit, ...publicQuote } = localResult as any;
  return publicQuote as FunduQuoteResponse;
}

/**
 * Request an official Fundu smartphone buyback quote from the server.
 * Gracefully falls back to local deterministic calculation if server is offline.
 */
export async function getFunduPhoneQuote(params: FunduQuoteRequest): Promise<FunduQuoteResponse> {
  // Precompute authoritative local calculation grounded in database/catalog prices (0.01 ms instant)
  const publicQuote = getInstantFunduQuote(params);

  // Race server valuation with a tight 1200ms abort controller timeout (never block the user for 5-10s)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${API_BASE}/phones/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        return json.data as FunduQuoteResponse;
      }
    }
  } catch (_err) {
    // Server timeout or offline: use instant local quote computed above
  }

  return publicQuote as FunduQuoteResponse;
}

/**
 * Recalculate quote upon physical doorstep inspection
 */
export async function recalculateInspectedDevice(
  quoteId: string,
  inspectedAnswers: Partial<FunduQuoteRequest>,
  sellRequestId?: string
): Promise<InspectionRecalculateResponse> {
  try {
    const res = await fetch(`${API_BASE}/phones/quote/inspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteId,
        sellRequestId,
        inspectedAnswers,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        return json.data as InspectionRecalculateResponse;
      }
    }
  } catch (_err) {
    // Continue to local fallback
  }

  // Local fallback
  return recalculateInspectedQuote(
    {
      variant: { brand: inspectedAnswers.brand, model: inspectedAnswers.model, storage: inspectedAnswers.storage },
      conditionAnswers: {},
      economics: { finalOfferAmount: 0 },
    },
    inspectedAnswers
  ) as InspectionRecalculateResponse;
}

/**
 * Accept or decline revised offer
 */
export async function respondToRevisedOffer(
  sellRequestId: string,
  accept: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/phones/quote/accept-revised`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sellRequestId,
        accept,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      return { success: true, message: json.message || 'Decision recorded successfully.' };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error updating offer.' };
  }

  return { success: false, message: 'Could not communicate with Fundu server.' };
}
