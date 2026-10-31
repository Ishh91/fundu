import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import {
  BadgeIndianRupee,
  Truck,
  CheckCircle2,
  ArrowRight,
  Check,
  ShieldCheck,
  Lock,
  Zap,
  Search,
  Smartphone,
  Sparkles,
  Camera,
  Upload,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  UserCheck,
  Clock,
  MapPin,
  Battery,
  ChevronDown,
  ChevronUp,
  Star,
  RefreshCw,
  FileText,
  Award,
  User,
  Phone,
} from 'lucide-react';
import { computeDetailedResaleValuation, fetchSellPriceConfig, fetchPhoneModels, searchMobileApiDev, calculateMarketPriceComparison, getDynamicFallbackConfig, type SellPriceConfig } from '../lib/mobileApi';
import { getFunduPhoneQuote, calculatePhoneAgingFactor, type FunduQuoteResponse } from '../lib/quoteEngine';
import { db, formatINR, formatMaskedPrice, formatDisplayPrice } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { ALL_INDIAN_PHONES_CATALOG } from '../data/indianPhonesCatalog';
import { getCleanPhoneImage, getCleanBrandLogo, BRAND_FRONT_FALLBACKS, getGenericDevicePlaceholder, pullLiveModelImagesFromDb } from '../lib/phoneImages';
import { usePriceSync, applyPriceOverrides, isModelDeleted, savePriceOverride, getEffectivePrice } from '../lib/priceSync';
import { getModelHardwareSpecs, calculateHardwareVariantMultiplier, calculateRamPriceOffset, deviceIncludesStylus, getModelReleaseYear, isAmoledDisplay } from '../lib/deviceSpecs';
import {
  getPanIndiaLocation,
  searchPanIndiaLocations,
  verifyPanIndiaPincode,
  PAN_INDIA_POPULAR_CITIES,
  type PanIndiaLocation,
} from '../lib/locationService';
import { getModelDedupeKey, groupModelsBySeries } from '../data/brandSeriesCatalog';
import { notifyNewSellRequest } from '../lib/whatsappNotifyService';

import {
  DOORSTEP_LOCALITIES,
  BRAND_TILES,
  MASTER_MODEL_CATALOG,
  STORAGE_OPTIONS,
  ACCESSORIES_LIST,
  HARDWARE_DEFECTS,
  FAQS_LIST,
} from '../data/masterModelCatalog';

export {
  DOORSTEP_LOCALITIES,
  BRAND_TILES,
  MASTER_MODEL_CATALOG,
  STORAGE_OPTIONS,
  ACCESSORIES_LIST,
  HARDWARE_DEFECTS,
  FAQS_LIST,
};

import SellSuccessModal from '../components/sell/SellSuccessModal';
import SellStep1Device from '../components/sell/SellStep1Device';
import SellStep2Condition from '../components/sell/SellStep2Condition';
import SellStep3Quote from '../components/sell/SellStep3Quote';
import SellStep4Schedule from '../components/sell/SellStep4Schedule';

export default function SellPhone() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { brandSlug, modelSlug } = useParams<{ brandSlug?: string; modelSlug?: string }>();
  const [searchParams] = useSearchParams();
  const { version, getEffectivePrice } = usePriceSync();

  const stepParam = parseInt(searchParams.get('step') || '', 10);
  const initialStep = !isNaN(stepParam) && stepParam >= 1 && stepParam <= 4 ? stepParam : (modelSlug ? 2 : 1);
  const [step, setStep] = useState(initialStep);
  const [, setImageVersion] = useState<number>(0);

  // Sync custom images live from database on mount & listen for admin updates
  useEffect(() => {
    pullLiveModelImagesFromDb();
    const handleModelImageUpdate = () => {
      setImageVersion((v) => v + 1);
    };
    window.addEventListener('fundu_model_image_updated', handleModelImageUpdate);
    return () => window.removeEventListener('fundu_model_image_updated', handleModelImageUpdate);
  }, []);

  // When visiting /sell or /sell-old-mobile-phone with no brand/model params, ensure All Brands is shown
  useEffect(() => {
    const isRootSell = location.pathname === '/sell' || location.pathname === '/sell-old-mobile-phone';
    if (isRootSell && !searchParams.get('brand') && !searchParams.get('model') && !brandSlug && !modelSlug) {
      setForm((cur) => ({
        ...cur,
        brand: '',
        model: '',
        storage: '',
      }));
      setSelectedSeries('All');
      setStep(1);
    }
  }, [location.pathname, location.key, searchParams, brandSlug, modelSlug]);

  // Sync step with URL search params (e.g. browser back/forward buttons)
  useEffect(() => {
    const urlStep = parseInt(searchParams.get('step') || '', 10);
    if (!isNaN(urlStep) && urlStep >= 1 && urlStep <= 4) {
      if (urlStep !== step) {
        setStep(urlStep);
      }
    } else if (modelSlug) {
      if (step === 1) setStep(2);
    } else {
      if (step !== 1 && !searchParams.get('step')) setStep(1);
    }
  }, [searchParams, modelSlug]);

  const goToStep = (nextStep: number, replace = false) => {
    setStep(nextStep);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('step', String(nextStep));
    if (form.brand) newParams.set('brand', form.brand);
    if (form.model) newParams.set('model', form.model);
    if (form.storage) newParams.set('storage', form.storage);
    navigate({ pathname: window.location.pathname, search: newParams.toString() }, { replace });
  };

  const handleStep2Back = () => {
    if (brandSlug || form.brand) {
      const cleanBrandKey = (brandSlug || form.brand).replace(/^sell-/, '').toLowerCase();
      navigate(`/sell-old-mobile-phone/sell-${cleanBrandKey}`);
    } else {
      goToStep(1);
    }
  };

  const handleGoToLoginForExactPrice = (targetStep: number = 3) => {
    try {
      sessionStorage.setItem('fundu_sell_form', JSON.stringify(form));
    } catch {}
    const cleanBrand = (brandSlug || form.brand || '').replace(/^sell-/, '').toLowerCase();
    const cleanModel = (modelSlug || form.model || '').toLowerCase().replace(/\s+/g, '-');
    const targetPath = cleanBrand && cleanModel
      ? `/sell-old-mobile-phone/sell-${cleanBrand}/sell-${cleanModel}`
      : window.location.pathname;
    const targetUrl = `${targetPath}?step=${targetStep}&brand=${encodeURIComponent(form.brand)}&model=${encodeURIComponent(form.model)}&storage=${encodeURIComponent(form.storage)}`;
    navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
  };


  // Real Approved Database Reviews State
  const [dbReviews, setDbReviews] = useState<Array<{ id: string; reviewer_name: string; location: string; rating: number; comment: string }>>([]);
  useEffect(() => {
    db.from('reviews')
      .select('*')
      .eq('is_approved', true)
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setDbReviews(data as any);
        }
      });
  }, []);

  // Debounced Search State
  const [rawSearchQuery, setRawSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [apiSearchResults, setApiSearchResults] = useState<Array<{ brand: string; series: string; model: string; storage: string; price: number; image: string }>>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [focusedSearchIndex, setFocusedSearchIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Active FAQ Open Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Active Series Filter for Brand Page
  const [selectedSeries, setSelectedSeries] = useState<string>('All');

  const INITIAL_SELL_FORM = {
    brand: '',
    model: '',
    ram: '',
    storage: '',
    powersOn: true,
    activationLockCleared: true,
    ownershipVerified: true,
    liquidDamage: false,
    cosmeticCondition: 'flawless' as 'flawless' | 'good' | 'fair',
    screenCondition: 'flawless' as 'flawless' | 'scratched' | 'cracked' | 'touch_fault' | 'display_lines',
    bodyCondition: 'flawless' as 'flawless' | 'minor_scratches' | 'dents_bent',

    // Granular Phone Condition Filter Questions
    screenMinorScratches: false,
    screenMajorScratches: false,
    screenCracked: false,
    displayMinorSpotsWhite: false,
    displayMajorSpots: false,
    displayMinorLines: false,
    displayMajorLines: false,
    displayMinorDiscolouration: false,
    displayMajorDiscolouration: false,
    bodyMinorSideScratches: false,
    bodyMajorSideScratches: false,
    bodyMinorDents: false,
    bodyMajorDents: false,
    bodyCrackedOrBroken: false,

    batteryHealth: 'above_85' as 'above_85' | '75_to_85' | 'below_75' | 'healthy' | 'degraded_service' | 'unknown',
    canMakeCalls: true,
    agePeriod: 'above_9_months' as '0_to_3_months' | '3_to_6_months' | '6_to_9_months' | 'above_9_months' | 'below_3_months' | '3_to_10_months' | '10_to_12_months' | 'above_11_months',
    underWarranty: false,
    stylusAvailable: true,
    defects: [] as string[],
    imei: '',
    imeiPhoto: '',
    devicePhotos: {
      front: '',
      back: '',
      edges: '',
      bill_box: '',
    },
    diagnostics: {
      screen_touch: true,
      cameras: true,
      battery_health: '85%+',
      biometrics: true,
      speaker_mic: true,
      charging_port: true,
    },
    accessories: ['Original Box', 'Original Charger'] as string[],
    payoutMethod: 'UPI' as 'UPI' | 'Cash' | 'Bank',
    payoutDetails: '',
    customerName: '',
    customerPhone: '',
    pincode: '',
    locality: '',
    pickupAddress: '',
    pickupArea: getPanIndiaLocation().displayLabel || 'New Delhi (110001)',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupSlot: '10 AM - 12 PM',
    notes: '',
  };

  const [form, setForm] = useState(INITIAL_SELL_FORM);

  // Prefill customer contact details from profile when logged in
  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        customerName: prev.customerName || profile.full_name || '',
        customerPhone: prev.customerPhone || profile.phone || '',
        pickupAddress: prev.pickupAddress || profile.address || '',
      }));
    }
  }, [profile]);

  // Restore condition questionnaire answers from sessionStorage if customer logged in and redirected back
  useEffect(() => {
    const isRootSell = location.pathname === '/sell' || location.pathname === '/sell-old-mobile-phone';
    const hasExplicitTarget = Boolean(brandSlug || modelSlug || searchParams.get('brand') || searchParams.get('model'));

    // Do NOT restore cached brand/model on bare /sell route so All Brands grid displays
    if (isRootSell && !hasExplicitTarget) {
      return;
    }

    try {
      const saved = sessionStorage.getItem('fundu_sell_form');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setForm((prev) => ({
            ...prev,
            ...parsed,
            brand: prev.brand || parsed.brand || '',
            model: prev.model || parsed.model || '',
            storage: prev.storage || parsed.storage || '',
          }));
        }
      }
    } catch {}
  }, [brandSlug, modelSlug, searchParams, location.pathname]);

  // Sync condition questionnaire answers to sessionStorage
  useEffect(() => {
    if (form.brand || form.model) {
      try {
        sessionStorage.setItem('fundu_sell_form', JSON.stringify(form));
      } catch {}
    }
  }, [form]);


  const [pickupSearchQuery, setPickupSearchQuery] = useState('');
  const [pickupSearchResults, setPickupSearchResults] = useState<PanIndiaLocation[]>([]);
  const [isSearchingPickupLoc, setIsSearchingPickupLoc] = useState(false);

  useEffect(() => {
    let active = true;
    const q = pickupSearchQuery.trim();
    if (!q) {
      setPickupSearchResults([]);
      setIsSearchingPickupLoc(false);
      return;
    }

    setIsSearchingPickupLoc(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchPanIndiaLocations(q);
        if (active) setPickupSearchResults(results);
      } catch {
        // Fallback
      } finally {
        if (active) setIsSearchingPickupLoc(false);
      }
    }, 160);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [pickupSearchQuery]);

  const [funduQuote, setFunduQuote] = useState<FunduQuoteResponse | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  const [modelsList, setModelsList] = useState<Array<{ name: string; storages: string[] }>>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{
    id?: string;
    pickup_person_name?: string | null;
    pickup_person_phone?: string | null;
    estimated_arrival_time?: string | null;
  } | null>(null);

  // MobileAPI Live Search Fallback Effect when query is not found in local catalog
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setApiSearchResults([]);
      setIsSearchingApi(false);
      return;
    }

    const q = debouncedQuery.toLowerCase().trim();
    const cleanQ = q.replace(/[^a-z0-9]/g, '');
    const queryWords = q.split(/\s+/).filter(Boolean);

    // Calculate count of local catalog matches
    const localMatchesCount = MASTER_MODEL_CATALOG.filter((m) => {
      const fullText = `${m.brand} ${m.series || ''} ${m.model}`.toLowerCase();
      if (queryWords.every((word) => fullText.includes(word))) return true;
      if (cleanQ && fullText.replace(/[^a-z0-9]/g, '').includes(cleanQ)) return true;
      return false;
    }).length + (Array.isArray(ALL_INDIAN_PHONES_CATALOG) ? ALL_INDIAN_PHONES_CATALOG.filter((p) => {
      const fullText = `${p.brand} ${p.model}`.toLowerCase();
      if (queryWords.every((word) => fullText.includes(word))) return true;
      if (cleanQ && fullText.replace(/[^a-z0-9]/g, '').includes(cleanQ)) return true;
      return false;
    }).length : 0);

    // If local database has 0 matches, perform live MobileAPI lookup
    if (localMatchesCount === 0) {
      setIsSearchingApi(true);
      searchMobileApiDev(debouncedQuery)
        .then((devices) => {
          if (Array.isArray(devices) && devices.length > 0) {
            const mapped = devices.map((d: any) => ({
              brand: d.brand || 'Smartphone',
              series: d.brand || 'Mobile',
              model: d.model || d.phone_name || debouncedQuery,
              storage: d.storage_options?.[0] || '128 GB',
              price: d.base_resale_value || Math.round((d.default_mrp || 30000) * 0.55),
              image: d.image_url || d.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80',
            }));
            setApiSearchResults(mapped);
          } else {
            setApiSearchResults([]);
          }
        })
        .catch(() => setApiSearchResults([]))
        .finally(() => setIsSearchingApi(false));
    } else {
      setApiSearchResults([]);
      setIsSearchingApi(false);
    }
  }, [debouncedQuery]);
  const [error, setError] = useState<string | null>(null);

  const [pricingConfig, setPricingConfig] = useState<SellPriceConfig | null>(null);

  // 300ms Search Debounce Effect
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(rawSearchQuery.trim());
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [rawSearchQuery]);

  // Auto Scroll to Very Top on Step or Model/Brand Change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, form.brand, form.model]);

  // Injected Schema.org JSON-LD LocalBusiness & MobilePhoneStore Structured Data for Doorstep
  useEffect(() => {
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'MobilePhoneStore'],
      name: 'Fundu - Sell Old Mobile Phone',
      url: 'https://thefundu.com/sell',
      logo: 'https://thefundu.com/logo.png',
      telephone: '+91-9839122345',
      priceRange: '₹₹',
      description: 'Sell old used mobile phone online at your doorstep for instant spot cash. Free doorstep pickup across Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana, Chowk.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Hazratganj Main Market',
        addressLocality: 'Doorstep Service',
        addressRegion: 'Uttar Pradesh',
        postalCode: '226001',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 26.8467,
        longitude: 80.9462,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '09:00',
        closes: '21:00',
      },
      sameAs: ['https://thefundu.com'],
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'fundu-sell-schema-jsonld';
    script.innerHTML = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('fundu-sell-schema-jsonld');
      if (el) el.remove();
    };
  }, []);

  // Sync multi-layered URLs (/sell/apple, /sell/apple/iphone-13, /sell-old-mobile-phone/sell-apple)
  useEffect(() => {
    if (brandSlug) {
      const cleanBrandKey = brandSlug.replace(/^sell-/, '').toLowerCase();
      const foundBrand = BRAND_TILES.find((b) => b.name.toLowerCase() === cleanBrandKey)?.name ||
        (cleanBrandKey.charAt(0).toUpperCase() + cleanBrandKey.slice(1));
      
      setForm((cur) => ({ ...cur, brand: foundBrand }));

      if (modelSlug) {
        // Strip any repeated SEO prefixes: sell-, old-, used-, sell-old-, and brand prefixes
        let sanitizedSlug = modelSlug.toLowerCase();
        let prevSlug = '';
        while (sanitizedSlug !== prevSlug) {
          prevSlug = sanitizedSlug;
          sanitizedSlug = sanitizedSlug
            .replace(/^(sell-old-|old-sell-|sell-|old-|used-)/, '')
            .replace(new RegExp(`^${cleanBrandKey}-`), '');
        }

        const cleanModelKey = sanitizedSlug.replace(/-/g, ' ').trim();
        const stripped = cleanModelKey.replace(/[\s-]+/g, '');
        const strippedNoBrand = stripped.replace(new RegExp(`^${cleanBrandKey}`), '');

        const matchCandidate = (candidateModel: string, candidateBrand: string) => {
          if (candidateBrand.toLowerCase() !== cleanBrandKey) return false;
          const cNorm = candidateModel.toLowerCase().replace(/[\s-]+/g, '');
          const cNormNoBrand = cNorm.replace(new RegExp(`^${cleanBrandKey}`), '');
          return (
            cNorm === stripped ||
            cNormNoBrand === strippedNoBrand ||
            cNorm === strippedNoBrand ||
            cNormNoBrand === stripped
          );
        };

        let foundModel =
          ALL_INDIAN_PHONES_CATALOG.find((p) => matchCandidate(p.model, p.brand))?.model ||
          MASTER_MODEL_CATALOG.find((m) => matchCandidate(m.model, m.brand))?.model ||
          cleanModelKey.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        // Clean out any rogue 'Sell ' or duplicate brand prefixes
        foundModel = foundModel.replace(/^(sell\s+|old\s+|used\s+)+/i, '').trim();
        if (foundModel.toLowerCase().startsWith(foundBrand.toLowerCase())) {
          foundModel = foundModel.slice(foundBrand.length).trim();
        }

        const storageParam = searchParams.get('storage');
        const urlStep = parseInt(searchParams.get('step') || '', 10);

        setForm((cur) => ({
          ...cur,
          brand: foundBrand,
          model: foundModel,
          storage: storageParam || cur.storage || '128 GB',
        }));
        if (!isNaN(urlStep) && urlStep >= 1 && urlStep <= 4) {
          setStep(urlStep);
        } else {
          setStep(2);
        }
      }
    } else {
      const b = searchParams.get('brand');
      const m = searchParams.get('model');
      const s = searchParams.get('storage');
      if (b || m || s) {
        setForm((cur) => ({
          ...cur,
          brand: b ?? cur.brand,
          model: m ?? cur.model,
          storage: s ?? cur.storage,
        }));
      } else {
        setForm((cur) => ({
          ...cur,
          brand: '',
          model: '',
          storage: '',
        }));
        setSelectedSeries('All');
        setStep(1);
      }
    }
  }, [brandSlug, modelSlug, searchParams]);

  useEffect(() => {
    if (!form.brand) {
      setModelsList([]);
      return;
    }
    setLoadingModels(true);
    fetchPhoneModels(form.brand, debouncedQuery)
      .then((items) => setModelsList(items))
      .catch(() => setModelsList([]))
      .finally(() => setLoadingModels(false));
  }, [form.brand, debouncedQuery]);

  // Model-accurate hardware variant specifications (Storage & RAM options)
  const currentDeviceSpecs = useMemo(() => {
    return getModelHardwareSpecs(form.brand, form.model, MASTER_MODEL_CATALOG);
  }, [form.brand, form.model]);

  // Dynamic RAM options strictly dependent on the CURRENT selected storage
  const availableRams = useMemo(() => {
    return currentDeviceSpecs.getRamsForStorage(form.storage || currentDeviceSpecs.defaultStorage);
  }, [currentDeviceSpecs, form.storage]);

  // Synchronize form storage & RAM when device model or selected storage changes
  useEffect(() => {
    if (!form.model) return;
    setForm((cur) => {
      let changed = false;
      let nextStorage = cur.storage;
      let nextRam = cur.ram;
      let nextAgePeriod = cur.agePeriod;
      let nextUnderWarranty = cur.underWarranty;
      let nextBatteryHealth = cur.batteryHealth;

      // 1. Ensure storage is valid for this model
      if (!currentDeviceSpecs.storages.includes(cur.storage)) {
        nextStorage = currentDeviceSpecs.defaultStorage;
        changed = true;
      }

      // 2. Ensure RAM is strictly valid for THIS exact storage
      const validRams = currentDeviceSpecs.getRamsForStorage(nextStorage);
      if (validRams.length > 0) {
        if (!validRams.includes(cur.ram)) {
          nextRam = validRams[0];
          changed = true;
        }
      } else if (cur.ram) {
        // e.g. Apple or single-tier where RAM is not selectable
        nextRam = '';
        changed = true;
      }



      // 4. For non-Apple devices, Android has no battery health metric
      const isApple = String(cur.brand || '').toLowerCase() === 'apple' || String(cur.model || '').toLowerCase().includes('iphone');
      if (!isApple && cur.batteryHealth !== 'above_85' && cur.batteryHealth !== 'healthy') {
        nextBatteryHealth = 'above_85';
        changed = true;
      }

      if (changed) {
        return {
          ...cur,
          storage: nextStorage,
          ram: nextRam,
          agePeriod: nextAgePeriod,
          underWarranty: nextUnderWarranty,
          batteryHealth: nextBatteryHealth,
        };
      }
      return cur;
    });
  }, [form.model, form.storage, currentDeviceSpecs]);

  useEffect(() => {
    let active = true;

    if (!form.brand || !form.model) {
      setPricingConfig(null);
      return;
    }

    fetchSellPriceConfig(form.brand, form.model, form.storage)
      .then((config) => {
        if (active) {
          setPricingConfig(config);
          if (config?.base_price && config.base_price > 0) {
            savePriceOverride(form.brand, form.model, config.base_price, form.storage);
          }
        }
      })
      .catch(() => {
        if (active) setPricingConfig(null);
      });

    return () => {
      active = false;
    };
  }, [form.brand, form.model, form.storage, version]);

  useEffect(() => {
    let active = true;

    if (!form.brand || !form.model) {
      setFunduQuote(null);
      return;
    }

    setLoadingQuote(true);
    getFunduPhoneQuote({
      brand: form.brand,
      model: form.model,
      storage: form.storage || currentDeviceSpecs.defaultStorage,
      ram: form.ram,
      powers_on: form.powersOn,
      activation_lock_cleared: form.activationLockCleared,
      ownership_verified: form.ownershipVerified,
      liquid_damage: form.liquidDamage,
      cosmetic_condition: form.cosmeticCondition,
      screen_condition: form.screenCondition,
      body_condition: form.bodyCondition,
      battery_health: form.batteryHealth,
      defects: form.defects,
      accessories: form.accessories,
      under_warranty: form.underWarranty,
      age_period: form.agePeriod,
      stylus_available: form.stylusAvailable !== false,
    })
      .then((quote) => {
        if (active) setFunduQuote(quote);
      })
      .catch(() => {
        if (active) setFunduQuote(null);
      })
      .finally(() => {
        if (active) setLoadingQuote(false);
      });

    return () => {
      active = false;
    };
  }, [
    form.brand,
    form.model,
    form.storage,
    form.ram,
    form.powersOn,
    form.activationLockCleared,
    form.ownershipVerified,
    form.liquidDamage,
    form.cosmeticCondition,
    form.screenCondition,
    form.bodyCondition,
    form.batteryHealth,
    form.defects,
    form.accessories,
    form.underWarranty,
    form.agePeriod,
    form.stylusAvailable,
    version,
  ]);

  // Compute base resale value for any model using local master catalog, Indian phones catalog, or dynamic formula
  const baseModelPrice = useMemo(() => {
    if (!form.model) return 0;
    const modelNorm = form.model.toLowerCase().trim();
    const brandNorm = (form.brand || '').toLowerCase().trim();

    // 1. Authoritative Admin Pricing: Use live pricingConfig from database if available
    if (pricingConfig && pricingConfig.base_price > 0) {
      const normConfigStorage = (pricingConfig.storage || '').replace(/\s+/g, '').toUpperCase();
      const normFormStorage = (form.storage || '').replace(/\s+/g, '').toUpperCase();
      const ramOffset = calculateRamPriceOffset(form.ram, availableRams, form.brand);

      // If exact storage matches OR was explicitly locked by admin, preserve exact price + authentic RAM offset!
      if (!normConfigStorage || normConfigStorage === normFormStorage || pricingConfig.is_locked || pricingConfig.manual_override) {
        return pricingConfig.base_price + ramOffset;
      }

      // Only scale if the admin configured a different baseline storage and this variant has no explicit record
      const baseMult = calculateHardwareVariantMultiplier(pricingConfig.storage || '128 GB', '', form.brand);
      const targetMult = calculateHardwareVariantMultiplier(form.storage, '', form.brand);
      const ratio = baseMult > 0 ? targetMult / baseMult : 1.0;
      const scaled = Math.round((pricingConfig.base_price * ratio) / 50) * 50;
      return scaled + ramOffset;
    }

    // 2. Check dynamic database synced price from priceSync
    const directEffective = getEffectivePrice(form.brand, form.model, 0, form.storage);
    if (directEffective > 0) {
      const ramOffset = calculateRamPriceOffset(form.ram, availableRams, form.brand);
      return directEffective + ramOffset;
    }

    const master = MASTER_MODEL_CATALOG.find((m) =>
      m.model.toLowerCase() === modelNorm ||
      `${m.brand} ${m.model}`.toLowerCase() === `${brandNorm} ${modelNorm}` ||
      m.model.toLowerCase().includes(modelNorm)
    );

    let rawBase = 0;
    let catalogStorage = '128 GB';

    if (master?.price) {
      rawBase = master.price;
      catalogStorage = master.storage || '128 GB';
    } else {
      const indian = Array.isArray(ALL_INDIAN_PHONES_CATALOG)
        ? ALL_INDIAN_PHONES_CATALOG.find((p) =>
            p.model.toLowerCase() === modelNorm ||
            `${p.brand} ${p.model}`.toLowerCase() === `${brandNorm} ${modelNorm}`
          )
        : null;
      if (indian?.base_resale_value) {
        rawBase = indian.base_resale_value;
        catalogStorage = indian.storage_options?.[0] || '128 GB';
      } else if (indian?.default_mrp) {
        rawBase = Math.round(indian.default_mrp * 0.55);
        catalogStorage = indian.storage_options?.[0] || '128 GB';
      } else {
        const fallback = getDynamicFallbackConfig(form.brand, form.model, form.storage, form.ram);
        rawBase = fallback.base_price || 15000;
      }
    }

    // Apply dynamic admin overrides in real-time
    rawBase = getEffectivePrice(form.brand, form.model, rawBase, form.storage);

    // Dynamic variant multiplier based on storage + authentic guaranteed RAM tier offset:
    const catalogMult = calculateHardwareVariantMultiplier(catalogStorage, '', form.brand);
    const storageMult = calculateHardwareVariantMultiplier(form.storage, '', form.brand);
    const ratio = catalogMult > 0 ? storageMult / catalogMult : 1.0;
    const scaled = Math.round((rawBase * ratio) / 50) * 50;
    const ramOffset = calculateRamPriceOffset(form.ram, availableRams, form.brand);

    return Math.max(1000, scaled + ramOffset);
  }, [form.brand, form.model, form.storage, form.ram, availableRams, version, pricingConfig]);

  // Guaranteed non-zero smartphone valuation estimate
  const estimate = useMemo(() => {
    if (funduQuote?.offerAmount && funduQuote.offerAmount > 0) {
      return funduQuote.offerAmount;
    }

    if (baseModelPrice > 0) {
      let val = baseModelPrice;

      // 1. Natural Aging & Generation factor (waived if under active warranty or new purchase)
      const aging = calculatePhoneAgingFactor(form.brand, form.model, !!form.underWarranty, form.agePeriod);
      val *= aging;

      const isApple = (form.brand?.toLowerCase() === 'apple') || (brandSlug?.toLowerCase() === 'apple') || (form.model?.toLowerCase().includes('iphone'));
      const excMult = 1.00;
      const goodMult = 0.80;
      const fairMult = 0.60;

      // 1. Screen Deductions
      const isAmoled = isAmoledDisplay(form.brand, form.model);
      const brokenScreenRate = isAmoled ? 0.45 : 0.40;

      if (form.screenCracked) {
        val -= baseModelPrice * brokenScreenRate;
      } else if (form.screenMajorScratches) {
        val -= baseModelPrice * 0.12;
      } else if (form.screenMinorScratches) {
        val -= baseModelPrice * 0.05;
      } else if (form.screenCondition === 'scratched') {
        val *= 0.90;
      } else if (form.screenCondition === 'cracked') {
        val *= isAmoled ? 0.55 : 0.60;
      }

      // 2. Display Spots & Issues Deductions
      if (form.displayMajorLines || form.displayMajorSpots) {
        val -= baseModelPrice * 0.28;
      } else if (form.displayMinorLines || form.displayMinorSpotsWhite) {
        val -= baseModelPrice * 0.10;
      } else if (form.screenCondition === 'touch_fault' || form.screenCondition === 'display_lines') {
        val *= 0.60;
      }

      if (form.displayMajorDiscolouration) {
        val -= baseModelPrice * 0.15;
      } else if (form.displayMinorDiscolouration) {
        val -= baseModelPrice * 0.06;
      }

      // 3. Body / Frame Deductions
      if (form.bodyCrackedOrBroken) {
        val -= baseModelPrice * 0.20;
      } else if (form.bodyMajorDents) {
        val -= baseModelPrice * 0.12;
      } else if (form.bodyMinorDents) {
        val -= baseModelPrice * 0.05;
      } else if (form.bodyCondition === 'dents_bent') {
        val *= 0.85;
      }

      if (form.bodyMajorSideScratches) {
        val -= baseModelPrice * 0.08;
      } else if (form.bodyMinorSideScratches) {
        val -= baseModelPrice * 0.03;
      }

      if (isApple) {
        const bHealth = String(form.batteryHealth || '').toLowerCase().trim();
        const num = parseFloat(bHealth);
        if (!isNaN(num) && num > 0) {
          if (num < 75) val *= 0.98; // deduct 2%
          else if (num <= 85) val *= 0.99; // 1% reduction
        } else if (bHealth === '75_to_85') {
          val *= 0.99; // 1% reduction
        } else if (bHealth === 'below_75' || bHealth === 'degraded_service') {
          val *= 0.98; // deduct 2%
        }
      }
      if (form.powersOn === false) val *= 0.35;
      if (form.liquidDamage) val *= 0.50;
      if (form.canMakeCalls === false) val *= 0.85;
      if (Array.isArray(form.defects)) {
        val -= form.defects.length * (baseModelPrice * 0.08);
      }
      // Deduct missing accessories silently without exposing amounts to user (box: -300, charger: -300, bill: -200)
      const hasBox = Array.isArray(form.accessories) && form.accessories.some((a: string) => /box/i.test(a));
      const hasCharger = Array.isArray(form.accessories) && form.accessories.some((a: string) => /charger/i.test(a));
      const hasBill = Array.isArray(form.accessories) && form.accessories.some((a: string) => /bill/i.test(a));
      if (!hasBox) val -= 300;
      if (!hasCharger) val -= 300;
      if (!hasBill) val -= 200;

      if (deviceIncludesStylus(form.brand, form.model) && form.stylusAvailable === false) {
        val -= 1500;
      }
      if (baseModelPrice > 0 && Math.abs(val - baseModelPrice) < 1) {
        return baseModelPrice;
      }
      return Math.max(800, Math.round(val / 50) * 50);
    }

    return 5000;
  }, [
    funduQuote?.offerAmount,
    baseModelPrice,
    form.brand,
    form.model,
    form.stylusAvailable,
    form.cosmeticCondition,
    form.screenCondition,
    form.bodyCondition,
    form.screenMinorScratches,
    form.screenMajorScratches,
    form.screenCracked,
    form.displayMinorSpotsWhite,
    form.displayMajorSpots,
    form.displayMinorLines,
    form.displayMajorLines,
    form.displayMinorDiscolouration,
    form.displayMajorDiscolouration,
    form.bodyMinorSideScratches,
    form.bodyMajorSideScratches,
    form.bodyMinorDents,
    form.bodyMajorDents,
    form.bodyCrackedOrBroken,
    form.batteryHealth,
    form.powersOn,
    form.liquidDamage,
    form.canMakeCalls,
    form.underWarranty,
    form.defects,
    form.accessories,
  ]);

  // Complete diagnostic valuation breakdown
  const valuationBreakdown = useMemo(() => {
    return computeDetailedResaleValuation(
      pricingConfig,
      {
        screenCondition: form.screenCondition === 'cracked' ? 'cracked' : form.screenCondition === 'scratched' ? 'scratches' : 'flawless',
        bodyCondition: form.bodyCondition === 'dents_bent' ? 'dents_bent' : form.bodyCondition === 'minor_scratches' ? 'scratches' : 'flawless',
        canMakeCalls: form.canMakeCalls,
        underWarranty: form.underWarranty,
        defects: form.defects,
        accessories: form.accessories,
        stylusAvailable: form.stylusAvailable !== false,
      },
      form.brand,
      form.model,
      form.storage,
      form.ram
    );
  }, [pricingConfig, form.screenCondition, form.bodyCondition, form.canMakeCalls, form.underWarranty, form.defects, form.accessories, form.stylusAvailable, form.brand, form.model, form.storage, form.ram]);

  // Filtered Master Models for Search Autocomplete (Combines Master Catalog, Indian Phones Catalog, & MobileAPI Live Fallback)
  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase().trim();
    const queryWords = q.split(/\s+/).filter(Boolean);

    // Combine MASTER_MODEL_CATALOG and ALL_INDIAN_PHONES_CATALOG (strictly deduplicated)
    const modelMap = new Map<string, any>();

    MASTER_MODEL_CATALOG.forEach((m) => {
      if (isModelDeleted(m.brand, m.model)) return;
      const key = `${m.brand.toLowerCase()}-${getModelDedupeKey(m.brand, m.model)}`;
      if (!modelMap.has(key)) {
        modelMap.set(key, m);
      }
    });

    if (Array.isArray(ALL_INDIAN_PHONES_CATALOG)) {
      ALL_INDIAN_PHONES_CATALOG.forEach((p) => {
        if (isModelDeleted(p.brand, p.model)) return;
        const key = `${p.brand.toLowerCase()}-${getModelDedupeKey(p.brand, p.model)}`;
        if (!modelMap.has(key)) {
          modelMap.set(key, {
            brand: p.brand,
            series: p.brand,
            model: p.model,
            storage: p.storage_options?.[0] || '128 GB',
            price: p.base_resale_value || Math.round((p.default_mrp || 30000) * 0.55),
            image: p.image_url || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80',
          });
        }
      });
    }

    const allModels = Array.from(modelMap.values());

    const cleanQ = q.replace(/[^a-z0-9]/g, '');
    const localMatches = allModels.filter((m) => {
      const fullText = `${m.brand} ${m.series || ''} ${m.model}`.toLowerCase();
      if (queryWords.every((word) => fullText.includes(word))) return true;
      if (cleanQ && fullText.replace(/[^a-z0-9]/g, '').includes(cleanQ)) return true;
      return false;
    });

    if (localMatches.length > 0) {
      return applyPriceOverrides(localMatches);
    }

    // Fallback to MobileAPI search results if local database has 0 matches
    return applyPriceOverrides(apiSearchResults.filter((d) => !isModelDeleted(d.brand, d.model)));
  }, [debouncedQuery, apiSearchResults, version]);

  // Available Series List for Selected Brand (in exact defined chronological order)
  const brandSeriesList = useMemo(() => {
    if (!form.brand) return [];
    const isPoco = (form.brand || '').toLowerCase() === 'poco';
    const models = MASTER_MODEL_CATALOG.filter((m) => {
      if (isModelDeleted(m.brand, m.model)) return false;
      const bLower = (m.brand || '').toLowerCase();
      if (isPoco) {
        return bLower === 'poco' || (bLower === 'xiaomi' && /poco/i.test(m.model));
      }
      return bLower === form.brand.toLowerCase();
    });
    const groups = groupModelsBySeries(form.brand, models);
    const names = groups.filter((g) => g.models.length > 0).map((g) => g.name);
    return ['All', ...names];
  }, [form.brand, version]);

  // Keyboard Navigation for Search Dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchResults.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSearchIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSearchIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedSearchIndex >= 0 && focusedSearchIndex < searchResults.length) {
        handleQuickModelSelect(searchResults[focusedSearchIndex]);
        setRawSearchQuery('');
      } else if (searchResults.length > 0) {
        handleQuickModelSelect(searchResults[0]);
        setRawSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      setRawSearchQuery('');
    }
  };

  const handleBrandSelect = (brandName: string) => {
    const slug = brandName.toLowerCase();
    setForm((f) => ({ ...f, brand: brandName, model: '', storage: '' }));
    setSelectedSeries('All');
    navigate(`/sell/${slug}`);
  };

  const handleQuickModelSelect = (item?: { brand?: string; model?: string; storage?: string }) => {
    if (!item || !item.model) return;
    const targetBrand = item.brand || form.brand || 'Apple';
    const brandSlugClean = (targetBrand || 'smartphone').toLowerCase().replace(/\s+/g, '-');
    const modelSlugClean = (item.model || '').toLowerCase().replace(/\s+/g, '-');
    const targetStorage = item.storage || form.storage || '128 GB';

    setForm((f) => ({
      ...f,
      brand: targetBrand,
      model: item.model!,
      storage: targetStorage,
    }));
    setStep(2);
    navigate(`/sell/${brandSlugClean}/${modelSlugClean}?step=2`);
  };

  const toggleDefect = (d: string) => {
    setForm((f) => ({
      ...f,
      defects: f.defects.includes(d) ? f.defects.filter((x) => x !== d) : [...f.defects, d],
    }));
  };

  const toggleAccessory = (a: string) => {
    setForm((f) => ({
      ...f,
      accessories: f.accessories.includes(a) ? f.accessories.filter((x) => x !== a) : [...f.accessories, a],
    }));
  };

  const handleSubmit = async () => {
    if (profile && profile.role !== 'customer') {
      setError(`Access Restricted: You are logged in as ${profile.role.toUpperCase()}. Vendor, Delivery, and Admin accounts cannot place customer sell requests.`);
      return;
    }

    const customerFullName = form.customerName.trim() || profile?.full_name || '';
    if (!customerFullName) {
      setError('⚠️ Please enter your Full Name.');
      return;
    }

    const cleanPhone = (form.customerPhone || profile?.phone || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('⚠️ Please enter a valid 10-digit mobile number.');
      return;
    }

    const cleanPincode = (form.pincode || '').replace(/\D/g, '').slice(0, 6);
    if (cleanPincode.length !== 6) {
      setError('⚠️ Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (!form.locality.trim()) {
      setError('⚠️ Please enter your locality / sector / landmark.');
      return;
    }

    if (!form.pickupAddress.trim()) {
      setError('⚠️ Please provide full doorstep pickup address.');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Verify Pan-India Pincode with Postal Registry
    const verifiedLoc = await verifyPanIndiaPincode(cleanPincode);
    if (!verifiedLoc.valid) {
      setSubmitting(false);
      setError(verifiedLoc.error || '⚠️ PIN code not recognized in Indian postal database. Please check your 6-digit code.');
      return;
    }

    const resolvedPickupArea = [
      form.locality.trim(),
      verifiedLoc.displayLabel || `${verifiedLoc.city}, ${verifiedLoc.state} (${cleanPincode})`,
    ]
      .filter(Boolean)
      .join(', ');

    try {
      const payload = {
        user_id: user?.id || null,
        customer_name: customerFullName,
        customer_phone: cleanPhone,
        customer_email: user?.email || '',
        brand: form.brand,
        model: form.model,
        device_title: `${form.brand} ${form.model} (${form.storage || '128 GB'})`,
        device_image: getCleanPhoneImage(form.brand, form.model),
        ram: form.ram,
        storage: form.storage,
        condition: form.cosmeticCondition,
        screen_condition: form.screenCondition,
        body_condition: form.bodyCondition,
        can_make_calls: form.canMakeCalls,
        under_warranty: form.underWarranty,
        defects: form.defects,
        imei: form.imei || null,
        imei_photo: form.imeiPhoto || null,
        device_photos: form.devicePhotos,
        diagnostics: {
          ...form.diagnostics,
          powers_on: form.powersOn,
          activation_lock_cleared: form.activationLockCleared,
          ownership_verified: form.ownershipVerified,
          liquid_damage: form.liquidDamage,
          battery_health: form.batteryHealth,
        },
        accessories: form.accessories,
        estimated_price: estimate,
        valuation_price: estimate,
        quote_id: funduQuote?.quoteId || null,
        policy_version: funduQuote?.policyVersion || null,
        condition_summary: funduQuote?.conditionSummary || [],
        cashify_breakdown: valuationBreakdown,
        valuation_breakdown: valuationBreakdown,
        payout_method: form.payoutMethod,
        payout_details: form.payoutDetails,
        pickup_address: [
          form.pickupAddress,
          form.locality,
          `PIN: ${cleanPincode}`
        ].filter(Boolean).join(', '),
        pickup_area: resolvedPickupArea,
        pickup_date: form.pickupDate,
        pickup_slot: form.pickupSlot,
        notes: form.notes || (funduQuote?.status === 'requires_manual_review' ? `Manual Inspection: ${funduQuote.reviewReason || funduQuote.reason || 'Manual review required'}` : ''),
        status: funduQuote?.status === 'requires_manual_review' ? 'manual_review' : 'pending',
      };

      const { data, error: insertErr } = await db.from('sell_requests').insert([payload]).select().single();

      if (insertErr) throw insertErr;

      const bookingId = (data as any)?.id || `FND-LKO-${Math.floor(100000 + Math.random() * 900000)}`;

      // Dispatch WhatsApp Notification to Admins (9105783553 & 9839122345)
      try {
        notifyNewSellRequest({
          requestId: bookingId,
          customerName: form.customerName || 'Customer',
          customerPhone: form.customerPhone || '',
          brand: form.brand,
          model: form.model,
          storage: form.storage,
          condition: form.cosmeticCondition,
          offeredPrice: funduQuote?.offerAmount || 15000,
          pickupAddress: [form.pickupAddress, resolvedPickupArea].filter(Boolean).join(', '),
          pickupDate: form.pickupDate,
          pickupSlot: form.pickupSlot,
        });
      } catch (notifyErr) {
        console.warn('⚠️ [SellPhone] WhatsApp notification error:', notifyErr);
      }

      setSuccessData({
        id: bookingId,
        pickup_person_name: 'Rajesh Kumar (Fundu Rider)',
        pickup_person_phone: '+91-9839122345',
        estimated_arrival_time: `${form.pickupDate} (${form.pickupSlot})`,
      });
    } catch (err: any) {
      console.error('Submission error:', err);
      setSuccessData({
        id: `FND-LKO-${Math.floor(100000 + Math.random() * 900000)}`,
        pickup_person_name: 'Rajesh Kumar (Fundu Rider)',
        pickup_person_phone: '+91-9839122345',
        estimated_arrival_time: `${form.pickupDate} (${form.pickupSlot})`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to highlight matching search query in autocomplete
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-[#C0C8D8]/50 text-[#344257] font-black px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // SUCCESS CONFIRMATION SCREEN
  if (successData) {
    return (
      <SellSuccessModal
        successData={successData}
        form={form}
        estimate={estimate}
        onReset={() => {
          setSuccessData(null);
          setStep(1);
          setForm(INITIAL_SELL_FORM);
          navigate('/sell');
        }}
        onViewTracking={() => navigate('/profile')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7FA] pb-24 text-[#344257]">
      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-100 py-2.5 px-4 text-xs font-semibold text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-[#344257] transition">Home</Link>
          <span>&gt;</span>
          <Link to="/sell-old-mobile-phone" className="hover:text-[#344257] transition">Sell Old Mobile Phone</Link>
          {form.brand && (
            <>
              <span>&gt;</span>
              <Link to={`/sell-old-mobile-phone/sell-${form.brand.toLowerCase()}`} className="hover:text-[#344257] transition">
                Sell Old {form.brand}
              </Link>
            </>
          )}
          {form.model && (
            <>
              <span>&gt;</span>
              <span className="text-[#344257] font-extrabold">Sell Old {form.model}</span>
            </>
          )}
        </div>
      </div>

      {/* Hero Banner with Prominent Debounced Search (Hidden on Model Evaluation Page) */}
      {!modelSlug && !form.model && step === 1 && (
        <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto rounded-3xl bg-[#F0F0F5] border border-[#C0C8D8] p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative shadow-xs">
          <div className="flex-1 space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#344257] border border-[#C0C8D8]">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Instant Spot Cash · Doorstep Pickup At Your Doorstep
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#344257] leading-tight">
              {form.brand ? `Sell Old ${form.brand} Mobile Phone Online At Best Price` : 'Sell Old Mobile Phone for Instant Cash'}
            </h1>
            <p className="text-xs md:text-sm text-gray-600">
              Free doorstep pickup across all active service zones!
            </p>

            {/* Checkmark Feature Pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#344257]">
              <span className="flex items-center gap-1 text-[#344257]">
                <Check className="h-4 w-4 text-[#344257]" /> Maximum Value
              </span>
              <span className="flex items-center gap-1 text-[#344257]">
                <Check className="h-4 w-4 text-[#344257]" /> Safe & Hassle-free
              </span>
              <span className="flex items-center gap-1 text-[#344257]">
                <Check className="h-4 w-4 text-[#344257]" /> Free Doorstep Pickup
              </span>
            </div>

            {/* PROMINENT DEBOUNCED SEARCH BAR COMPONENT */}
            <div className="relative w-full pt-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={rawSearchQuery}
                  onChange={(e) => setRawSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search any mobile phone (e.g. iPhone 13, Galaxy S23, OnePlus 11)..."
                  className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-[#C0C8D8] text-sm font-medium shadow-sm focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15 outline-none transition text-[#344257] placeholder:text-gray-400"
                />
                {isSearching && (
                  <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6A859F] animate-spin" />
                )}
              </div>

              {/* Autocomplete Dropdown with Highlighted Text & Keyboard Nav */}
              {rawSearchQuery.trim() !== '' && (
                <div
                  ref={searchDropdownRef}
                  className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden max-h-80 overflow-y-auto animate-fade-in"
                >
                  {searchResults.length > 0 ? (
                    <>
                      <div className="p-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 px-4 py-2 flex items-center justify-between">
                        <span>Matching Models ({searchResults.length})</span>
                        <span className="text-[9px] text-gray-400 font-normal">Use ↑ ↓ arrows & Enter to select</span>
                      </div>
                      {searchResults.map((item, idx) => (
                        <button
                          key={`${item.brand}-${item.model}`}
                          type="button"
                          onClick={() => {
                            handleQuickModelSelect(item);
                            setRawSearchQuery('');
                          }}
                          className={`w-full flex items-center justify-between p-3 transition border-b border-gray-50 text-left cursor-pointer ${
                            focusedSearchIndex === idx ? 'bg-[#F0F0F5] border-l-4 border-l-[#344257]' : 'hover:bg-[#F7F7FA]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img src={getCleanPhoneImage(item.brand, item.model, item.image)} alt="" className="h-10 w-10 object-contain rounded-lg bg-gray-50 p-0.5" />
                            <div>
                              <p className="font-extrabold text-sm text-gray-900">
                                {highlightMatch(`${item.brand} ${item.model}`, debouncedQuery)}
                              </p>
                              <p className="text-xs text-gray-500">{item.storage}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 shrink-0">
                            <span className="badge bg-[#344257] text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
                              Evaluate Device →
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Instant Cash Quote
                            </span>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : isSearchingApi ? (
                    <div className="p-6 text-center space-y-2">
                      <RefreshCw className="h-6 w-6 text-[#6A859F] animate-spin mx-auto" />
                      <p className="font-bold text-sm text-gray-900">Searching MobileAPI live catalog for "{rawSearchQuery}"...</p>
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-2">
                      <AlertCircle className="h-6 w-6 text-rose-500 mx-auto" />
                      <p className="font-bold text-sm text-gray-900">No models found for "{rawSearchQuery}"</p>
                      <p className="text-xs text-gray-500">
                        Try searching for popular brands like <span className="font-bold text-[#344257]">Apple, Samsung, OnePlus</span> or call our helpline <span className="font-bold text-gray-800">+91-9839122345</span>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Brand Pills */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                <span className="h-px bg-gray-200 flex-1" />
                <span>Or select a brand</span>
                <span className="h-px bg-gray-200 flex-1" />
              </div>
              <div className="flex flex-wrap gap-2">
                {BRAND_TILES.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => handleBrandSelect(b.name)}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                      form.brand === b.name
                        ? 'border-[#344257] bg-[#F0F0F5] text-[#344257] ring-2 ring-[#344257]/20'
                        : 'border-gray-200 bg-white text-gray-800 hover:border-[#6A859F] hover:bg-[#F0F0F5]'
                    }`}
                  >
                    <img src={b.logo} alt="" className="h-4 w-4 object-contain rounded-full" />
                    <span>{b.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Visual Graphic */}
          <div className="shrink-0 hidden md:block">
            <div className="relative w-80 h-72 rounded-3xl overflow-hidden shadow-xl border border-[#C0C8D8] bg-gradient-to-br from-[#F0F0F5] to-[#E4E7F0] p-1 flex items-center justify-center group">
              <img
                src="/sell-hero-3d.jpg"
                alt="Instant Mobile Cash Best Deals"
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl px-4 py-2 border border-[#C0C8D8] flex items-center gap-2 whitespace-nowrap">
                <BadgeIndianRupee className="h-5 w-5 text-[#47576E]" />
                <span className="font-extrabold text-xs text-gray-900">Spot Cash at Doorstep</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* STICKY 4-STEP PROGRESS INDICATOR BAR */}
      <div className="sticky top-[64px] md:top-[116px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-md py-3 px-4 transition-all">
        <div className="flex items-center justify-center flex-wrap sm:flex-nowrap gap-1.5 sm:gap-3 max-w-5xl mx-auto overflow-x-auto scrollbar-hide py-1">
          {[
            { s: 1, label: 'Select Phone' },
            { s: 2, label: 'Condition & Diagnostics' },
            { s: 3, label: 'Instant Quote' },
            { s: 4, label: 'Schedule Pickup' },
          ].map(({ s, label }) => (
            <div key={s} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => step > s && setStep(s)}
                className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                  step === s
                    ? 'bg-gradient-to-r from-[#344257] to-[#47576E] text-white shadow-md'
                    : step > s
                    ? 'bg-[#F0F0F5] text-[#344257] hover:bg-[#E4E7F0] border border-[#C0C8D8] cursor-pointer'
                    : 'bg-[#F7F7FA] text-gray-400 cursor-not-allowed border border-transparent'
                }`}
              >
                <span className={`grid h-5 w-5 place-items-center rounded-full text-xs font-black ${step === s ? 'bg-white/20 text-white' : step > s ? 'bg-[#344257] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > s ? <Check className="h-3 w-3" /> : s}
                </span>
                <span className="whitespace-nowrap font-extrabold">{label}</span>
              </button>
              {s < 4 && <div className={`h-0.5 w-2 sm:w-5 rounded-full ${step > s ? 'bg-[#344257]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* STEP 1: Select Brand & Model (Zero Scroll Brand View / Main Page) */}
        {step === 1 && (
          <SellStep1Device
            form={form}
            setForm={setForm}
            brandSlug={brandSlug}
            modelSlug={modelSlug}
            handleBrandSelect={handleBrandSelect}
            handleQuickModelSelect={handleQuickModelSelect}
            selectedSeries={selectedSeries}
            setSelectedSeries={setSelectedSeries}
            brandSeriesList={brandSeriesList}
            user={user}
            dbReviews={dbReviews}
          />
        )}


        {/* STEP 2: Condition & Hardware Diagnostics */}
        {step === 2 && (
          <SellStep2Condition
            form={form}
            setForm={setForm}
            currentDeviceSpecs={currentDeviceSpecs}
            brandSlug={brandSlug}
            baseModelPrice={baseModelPrice}
            pricingConfig={pricingConfig}
            estimate={estimate}
            user={user}
            handleGoToLoginForExactPrice={handleGoToLoginForExactPrice}
            toggleDefect={toggleDefect}
            toggleAccessory={toggleAccessory}
            funduQuote={funduQuote}
            handleStep2Back={handleStep2Back}
            goToStep={goToStep}
          />
        )}


        {/* STEP 3: Fundu Buyback Quotation / Manual Review Path */}
        {step === 3 && (
          <SellStep3Quote
            form={form}
            setForm={setForm}
            estimate={estimate}
            funduQuote={funduQuote}
            user={user}
            handleGoToLoginForExactPrice={handleGoToLoginForExactPrice}
            goToStep={goToStep}
          />
        )}


        {/* STEP 4: Schedule Doorstep Pickup & Auto-Assign Agent */}
        {step === 4 && (
          <SellStep4Schedule
            form={form}
            setForm={setForm}
            estimate={estimate}
            submitting={submitting}
            error={error}
            pickupSearchQuery={pickupSearchQuery}
            setPickupSearchQuery={setPickupSearchQuery}
            pickupSearchResults={pickupSearchResults}
            isSearchingPickupLoc={isSearchingPickupLoc}
            handleSubmit={handleSubmit}
            onBack={() => goToStep(3)}
            profile={profile}
          />
        )}


      </div>
    </div>
  );
}
