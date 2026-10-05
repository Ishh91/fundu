import { API_BASE } from '../config/apiConfig';
import {
  quotePhone,
  recalculateInspectedQuote,
  FUNDU_POLICY,
  FUNDU_SERVICE_LOCALITIES,
} from '../../fundu_phone_quote.mjs';

export interface FunduQuoteRequest {
  brand: string;
  model: string;
  storage: string;
  powers_on: boolean;
  activation_lock_cleared?: boolean;
  ownership_verified?: boolean;
  liquid_damage?: boolean;
  cosmetic_condition?: 'flawless' | 'good' | 'fair';
  screen_condition?: 'flawless' | 'scratched' | 'cracked' | 'touch_fault' | 'display_lines';
  body_condition?: 'flawless' | 'minor_scratches' | 'dents_bent';
  battery_health?: 'healthy' | 'degraded_service' | 'unknown';
  defects?: string[];
  accessories?: string[];
  under_warranty?: boolean;
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
  };
  policyVersion?: string;
  validForDays?: number;
  createdAt?: string;
  nextSteps?: string[];
  reason?: string;
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
 * Request an official Fundu smartphone buyback quote from the server.
 * Gracefully falls back to local deterministic calculation if server is offline.
 */
export async function getFunduPhoneQuote(params: FunduQuoteRequest): Promise<FunduQuoteResponse> {
  try {
    const res = await fetch(`${API_BASE}/phones/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        return json.data as FunduQuoteResponse;
      }
    }
  } catch (_err) {
    // Server connection fallback: run deterministic quote algorithm locally
  }

  // Local fallback execution using the exact same formula
  const localResult = quotePhone(params);
  const { _internalAudit, ...publicQuote } = localResult as any;
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

export { FUNDU_POLICY, FUNDU_SERVICE_LOCALITIES };
