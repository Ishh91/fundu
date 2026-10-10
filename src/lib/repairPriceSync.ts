import { useState, useEffect } from 'react';
import type { RepairPriceConfig, RepairProductType, RepairServiceItem } from '../types';
import { db } from './db';
import { ALL_INDIAN_PHONES_CATALOG } from '../data/indianPhonesCatalog';

import { broadcastSync, subscribeToRealtimeSync } from './realtimeSync';

const REPAIR_OVERRIDES_STORAGE_KEY = 'fundu_repair_price_configs_v2';

/**
 * Standard Issue templates per product category
 */
export const SMARTPHONE_SERVICE_TEMPLATES: Array<{ id: string; name: string; defaultWarranty: string; defaultTime: string }> = [
  { id: 'screen', name: 'Screen & Display Replacement', defaultWarranty: '6 Months Warranty', defaultTime: '30 Mins Doorstep' },
  { id: 'battery', name: 'Battery Replacement & Health Check', defaultWarranty: '6 Months Warranty', defaultTime: '20 Mins Doorstep' },
  { id: 'charging', name: 'Charging Port & Sub-board IC', defaultWarranty: '3 Months Warranty', defaultTime: '25 Mins Doorstep' },
  { id: 'speaker', name: 'Mic, Receiver & Speaker Repair', defaultWarranty: '3 Months Warranty', defaultTime: '20 Mins Doorstep' },
  { id: 'camera', name: 'Front & Rear Camera Repair', defaultWarranty: '6 Months Warranty', defaultTime: '30 Mins Doorstep' },
  { id: 'backglass', name: 'Back Glass & Body Chassis Replacement', defaultWarranty: '3 Months Warranty', defaultTime: '40 Mins Doorstep' },
  { id: 'motherboard', name: 'Water Damage & Motherboard IC Repair', defaultWarranty: 'Lab Diagnostics', defaultTime: '24 Hr Lab Repair' },
  { id: 'software', name: 'Software Recovery & OS Flashing', defaultWarranty: 'Data Safe Protocol', defaultTime: '20 Mins Doorstep' },
  { id: 'buttons', name: 'Power, Volume & Fingerprint Sensor', defaultWarranty: '3 Months Warranty', defaultTime: '25 Mins Doorstep' },
  { id: 'faceid', name: 'Face ID & TrueDepth Sensor Repair', defaultWarranty: '6 Months Warranty', defaultTime: '45 Mins Doorstep' },
  { id: 'network', name: 'Network, SIM & Wi-Fi IC Repair', defaultWarranty: '3 Months Warranty', defaultTime: '45 Mins Doorstep' },
  { id: 'haptics', name: 'Vibration Motor & Taptic Engine', defaultWarranty: '3 Months Warranty', defaultTime: '20 Mins Doorstep' },
];

export const LAPTOP_SERVICE_TEMPLATES: Array<{ id: string; name: string; defaultWarranty: string; defaultTime: string }> = [
  { id: 'screen', name: 'Display / Screen Panel Replacement', defaultWarranty: '6 Months Warranty', defaultTime: 'Same Day Repair' },
  { id: 'battery', name: 'Laptop Battery Replacement', defaultWarranty: '6 Months Warranty', defaultTime: '45 Mins Doorstep' },
  { id: 'keyboard', name: 'Keyboard Replacement', defaultWarranty: '6 Months Warranty', defaultTime: '1 Hour Doorstep' },
  { id: 'trackpad', name: 'Trackpad / Touchpad Repair', defaultWarranty: '3 Months Warranty', defaultTime: '45 Mins Doorstep' },
  { id: 'charging', name: 'Charging Port / DC Power Jack', defaultWarranty: '3 Months Warranty', defaultTime: '45 Mins Doorstep' },
  { id: 'motherboard', name: 'Motherboard Chip-Level IC Repair', defaultWarranty: 'Lab Tested', defaultTime: '24 Hr Lab Diagnostics' },
  { id: 'fan_thermal', name: 'Cooling Fan & Thermal Paste Service', defaultWarranty: '3 Months Warranty', defaultTime: '30 Mins Doorstep' },
  { id: 'ssd_ram', name: 'SSD Storage & RAM Upgrade', defaultWarranty: '1 Year Warranty', defaultTime: '30 Mins Doorstep' },
  { id: 'software', name: 'OS Installation & Data Recovery', defaultWarranty: 'Data Safe Protocol', defaultTime: '45 Mins Doorstep' },
];

export const TABLET_SERVICE_TEMPLATES: Array<{ id: string; name: string; defaultWarranty: string; defaultTime: string }> = [
  { id: 'screen', name: 'Touch Glass / LCD Screen Replacement', defaultWarranty: '6 Months Warranty', defaultTime: 'Same Day Lab' },
  { id: 'battery', name: 'Tablet Battery Replacement', defaultWarranty: '6 Months Warranty', defaultTime: '45 Mins Doorstep' },
  { id: 'charging', name: 'Charging Port Repair', defaultWarranty: '3 Months Warranty', defaultTime: '30 Mins Doorstep' },
  { id: 'camera', name: 'Front & Rear Camera Repair', defaultWarranty: '6 Months Warranty', defaultTime: '30 Mins Doorstep' },
  { id: 'speaker', name: 'Loudspeaker / Audio Repair', defaultWarranty: '3 Months Warranty', defaultTime: '25 Mins Doorstep' },
  { id: 'motherboard', name: 'Water Damage & Logic Board IC', defaultWarranty: 'Lab Diagnostics', defaultTime: '24 Hr Lab Repair' },
];

export const SMARTWATCH_SERVICE_TEMPLATES: Array<{ id: string; name: string; defaultWarranty: string; defaultTime: string }> = [
  { id: 'screen', name: 'AMOLED Touch Screen Replacement', defaultWarranty: '6 Months Warranty', defaultTime: '24 Hr Lab Repair' },
  { id: 'battery', name: 'Watch Battery Replacement', defaultWarranty: '6 Months Warranty', defaultTime: '24 Hr Lab Repair' },
  { id: 'sensor', name: 'Health Sensor & Heart Rate Sensor', defaultWarranty: '3 Months Warranty', defaultTime: '24 Hr Lab Diagnostics' },
  { id: 'strap_body', name: 'Digital Crown & Housing Casing', defaultWarranty: '3 Months Warranty', defaultTime: '24 Hr Lab Repair' },
];

/**
 * Returns service template list by product type
 */
export function getServiceTemplatesForProduct(productType: RepairProductType = 'smartphone') {
  switch (productType) {
    case 'laptop':
      return LAPTOP_SERVICE_TEMPLATES;
    case 'tablet':
      return TABLET_SERVICE_TEMPLATES;
    case 'smartwatch':
      return SMARTWATCH_SERVICE_TEMPLATES;
    case 'smartphone':
    default:
      return SMARTPHONE_SERVICE_TEMPLATES;
  }
}

/**
 * Reads local cached configs
 */
export function getLocalRepairConfigs(): RepairPriceConfig[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REPAIR_OVERRIDES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves a list of configs to localStorage and notifies listeners
 */
export function saveLocalRepairConfigs(configs: RepairPriceConfig[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REPAIR_OVERRIDES_STORAGE_KEY, JSON.stringify(configs));
  broadcastSync('REPAIR_UPDATE', 'repair_price_configs', 'update', { configs });
  window.dispatchEvent(new CustomEvent('fundu_repair_price_updated', { detail: { configs } }));
}

/**
 * Strips brand prefix and normalizes model name for robust matching
 */
export function cleanModelString(brand: string, model: string): string {
  const b = (brand || '').trim().toLowerCase().replace(/[\s-]+/g, '');
  let m = (model || '').trim().toLowerCase().replace(/[\s-]+/g, '');
  if (b && m.startsWith(b)) {
    m = m.slice(b.length);
  }
  return m;
}

/**
 * Generate normalized lookup key with brand-prefix normalization
 */
export function makeCatalogLookupKey(brand: string, model: string, productType: string = 'smartphone'): string {
  const b = (brand || '').trim().toLowerCase();
  const m = cleanModelString(brand, model);
  const p = (productType || 'smartphone').toLowerCase();
  return `${p}:${b}:${m}`;
}

/**
 * Intelligent Market-Accurate Price Calculator for models not yet manually customized
 */
export function calculateSmartDefaultRepairServices(
  brand: string,
  model: string,
  productType: RepairProductType = 'smartphone',
  knownMrp?: number
): RepairServiceItem[] {
  const b = (brand || '').toLowerCase();
  const m = (model || '').toLowerCase();

  // 1. LAPTOP DYNAMIC TIERS
  if (productType === 'laptop') {
    const isMacBook = b.includes('apple') || m.includes('macbook');
    const isPremium = isMacBook || m.includes('xps') || m.includes('zenbook') || m.includes('thinkpad x1') || m.includes('rog');

    const screenPrice = isMacBook ? 16999 : isPremium ? 8999 : 4499;
    const batteryPrice = isMacBook ? 5999 : isPremium ? 3499 : 2499;
    const keyboardPrice = isMacBook ? 4999 : isPremium ? 2499 : 1499;

    return LAPTOP_SERVICE_TEMPLATES.map((tmpl) => {
      let price = 1499;
      if (tmpl.id === 'screen') price = screenPrice;
      else if (tmpl.id === 'battery') price = batteryPrice;
      else if (tmpl.id === 'keyboard') price = keyboardPrice;
      else if (tmpl.id === 'trackpad') price = isMacBook ? 4499 : 1999;
      else if (tmpl.id === 'charging') price = isMacBook ? 2499 : 1299;
      else if (tmpl.id === 'motherboard') price = isMacBook ? 4999 : 2999;
      else if (tmpl.id === 'fan_thermal') price = 899;
      else if (tmpl.id === 'ssd_ram') price = 1199;
      else if (tmpl.id === 'software') price = 499;

      return {
        service_id: tmpl.id,
        name: tmpl.name,
        price,
        original_price: Math.round(price * 1.25),
        warranty: tmpl.defaultWarranty,
        turnaround_time: tmpl.defaultTime,
        is_available: true,
      };
    });
  }

  // 2. TABLET / iPAD TIERS
  if (productType === 'tablet') {
    const isAppleTablet = b.includes('apple') || m.includes('ipad');
    const isPro = m.includes('pro');

    const screenPrice = isAppleTablet ? (isPro ? 14999 : 8499) : 4499;
    const batteryPrice = isAppleTablet ? 3499 : 1999;

    return TABLET_SERVICE_TEMPLATES.map((tmpl) => {
      let price = 1299;
      if (tmpl.id === 'screen') price = screenPrice;
      else if (tmpl.id === 'battery') price = batteryPrice;
      else if (tmpl.id === 'charging') price = 999;
      else if (tmpl.id === 'camera') price = 1499;
      else if (tmpl.id === 'speaker') price = 799;
      else if (tmpl.id === 'motherboard') price = 1999;

      return {
        service_id: tmpl.id,
        name: tmpl.name,
        price,
        original_price: Math.round(price * 1.25),
        warranty: tmpl.defaultWarranty,
        turnaround_time: tmpl.defaultTime,
        is_available: true,
      };
    });
  }

  // 3. SMARTWATCH TIERS
  if (productType === 'smartwatch') {
    const isAppleWatch = b.includes('apple') || m.includes('watch');
    const isUltra = m.includes('ultra');

    const screenPrice = isUltra ? 11999 : isAppleWatch ? 6999 : 2499;
    const batteryPrice = isUltra ? 3499 : isAppleWatch ? 2299 : 1299;

    return SMARTWATCH_SERVICE_TEMPLATES.map((tmpl) => {
      let price = 999;
      if (tmpl.id === 'screen') price = screenPrice;
      else if (tmpl.id === 'battery') price = batteryPrice;
      else if (tmpl.id === 'sensor') price = 1299;
      else if (tmpl.id === 'strap_body') price = 1499;

      return {
        service_id: tmpl.id,
        name: tmpl.name,
        price,
        original_price: Math.round(price * 1.3),
        warranty: tmpl.defaultWarranty,
        turnaround_time: tmpl.defaultTime,
        is_available: true,
      };
    });
  }

  // 4. SMARTPHONE TIERS (Lookup known MRP or brand heuristics)
  let mrp = knownMrp;
  if (!mrp) {
    const matched = ALL_INDIAN_PHONES_CATALOG.find(
      (p) => p.brand.toLowerCase() === b && p.model.toLowerCase().replace(/[\s-]+/g, '') === m.replace(/[\s-]+/g, '')
    );
    if (matched?.default_mrp) mrp = matched.default_mrp;
  }

  // Heuristic Flagship Detection
  const isSuperFlagship =
    (mrp && mrp >= 70000) ||
    m.includes('pro max') ||
    m.includes('15 pro') ||
    m.includes('16 pro') ||
    m.includes('14 pro') ||
    m.includes('s24 ultra') ||
    m.includes('s23 ultra') ||
    m.includes('s22 ultra') ||
    m.includes('fold') ||
    m.includes('pixel 8 pro') ||
    m.includes('pixel 9 pro');

  const isFlagship =
    isSuperFlagship ||
    (mrp && mrp >= 40000) ||
    b === 'apple' ||
    m.includes('galaxy s') ||
    m.includes('plus') ||
    m.includes('oneplus 12') ||
    m.includes('oneplus 11') ||
    m.includes('xiaomi 14') ||
    m.includes('vivo x100');

  const isMidRange =
    !isFlagship &&
    ((mrp && mrp >= 18000) ||
      m.includes('nord') ||
      m.includes('galaxy a') ||
      m.includes('redmi note') ||
      m.includes('pro') ||
      m.includes('gt') ||
      m.includes('edge'));

  // Calculate pricing based on tier
  let screenPrice = 2499;
  let batteryPrice = 1299;
  let chargingPrice = 699;
  let speakerPrice = 599;
  let cameraPrice = 1299;
  let backglassPrice = 1199;
  let faceIdPrice = 1499;

  if (isSuperFlagship) {
    screenPrice = b === 'apple' ? 17999 : 14999;
    batteryPrice = 3499;
    chargingPrice = 1299;
    speakerPrice = 999;
    cameraPrice = 5499;
    backglassPrice = 4999;
    faceIdPrice = 2999;
  } else if (isFlagship) {
    screenPrice = b === 'apple' ? 6999 : 5999;
    batteryPrice = 2299;
    chargingPrice = 899;
    speakerPrice = 799;
    cameraPrice = 2999;
    backglassPrice = 2499;
    faceIdPrice = 1999;
  } else if (isMidRange) {
    screenPrice = 3299;
    batteryPrice = 1399;
    chargingPrice = 699;
    speakerPrice = 599;
    cameraPrice = 1499;
    backglassPrice = 1299;
    faceIdPrice = 1299;
  } else {
    // Budget Phone Tier (e.g. Redmi 9A, Galaxy M14, Realme C-series)
    screenPrice = 1599;
    batteryPrice = 999;
    chargingPrice = 499;
    speakerPrice = 449;
    cameraPrice = 899;
    backglassPrice = 699;
    faceIdPrice = 999;
  }

  return SMARTPHONE_SERVICE_TEMPLATES.map((tmpl) => {
    let price = 699;
    if (tmpl.id === 'screen') price = screenPrice;
    else if (tmpl.id === 'battery') price = batteryPrice;
    else if (tmpl.id === 'charging') price = chargingPrice;
    else if (tmpl.id === 'speaker') price = speakerPrice;
    else if (tmpl.id === 'camera') price = cameraPrice;
    else if (tmpl.id === 'backglass') price = backglassPrice;
    else if (tmpl.id === 'motherboard') price = isSuperFlagship ? 999 : 499;
    else if (tmpl.id === 'software') price = 399;
    else if (tmpl.id === 'buttons') price = isSuperFlagship ? 999 : 499;
    else if (tmpl.id === 'faceid') price = faceIdPrice;
    else if (tmpl.id === 'network') price = isSuperFlagship ? 1999 : 999;
    else if (tmpl.id === 'haptics') price = isSuperFlagship ? 799 : 399;

    return {
      service_id: tmpl.id,
      name: tmpl.name,
      price,
      original_price: Math.round(price * 1.25),
      warranty: tmpl.defaultWarranty,
      turnaround_time: tmpl.defaultTime,
      is_available: true,
    };
  });
}

/**
 * Returns effective repair services & pricing for any model
 * Prioritizes custom database catalog overrides, with intelligent fallback
 */
export function getModelRepairPricing(
  brand: string,
  model: string,
  productType: RepairProductType = 'smartphone',
  configsList: RepairPriceConfig[] = getLocalRepairConfigs()
): { config: RepairPriceConfig | null; services: RepairServiceItem[]; basePrice: number } {
  if (!brand || !model) {
    const services = calculateSmartDefaultRepairServices('Generic', 'Phone', productType);
    return { config: null, services, basePrice: services[0]?.price || 1499 };
  }

  const targetKey = makeCatalogLookupKey(brand, model, productType);
  const targetClean = cleanModelString(brand, model);
  const targetBrandLower = (brand || '').trim().toLowerCase();
  const targetProd = (productType || 'smartphone').toLowerCase();

  // Filter candidate configs matching brand & product type (allowing is_active undefined/null or true)
  const activeConfigs = (configsList || []).filter((c) => {
    if (c.is_active === false) return false;
    const cBrand = (c.brand || '').trim().toLowerCase();
    const cProd = (c.product_type || 'smartphone').toLowerCase();
    return cBrand === targetBrandLower && cProd === targetProd;
  });

  // Pass 1: Exact normalized key match (brand prefix stripped)
  let matched = activeConfigs.find((c) => {
    const cKey = makeCatalogLookupKey(c.brand, c.model, c.product_type || 'smartphone');
    return cKey === targetKey;
  });

  // Pass 2: Clean model exact match
  if (!matched) {
    matched = activeConfigs.find((c) => {
      const cClean = cleanModelString(c.brand, c.model);
      return cClean === targetClean;
    });
  }

  // Pass 3: Raw normalized string match (ignoring whitespace and dashes)
  if (!matched) {
    const rawTarget = (model || '').trim().toLowerCase().replace(/[\s-]+/g, '');
    matched = activeConfigs.find((c) => {
      const rawC = (c.model || '').trim().toLowerCase().replace(/[\s-]+/g, '');
      return rawC === rawTarget;
    });
  }

  // Pass 4: Best candidate substring match (prefer closest length match to prevent false positives)
  if (!matched && targetClean.length >= 3) {
    const candidates = activeConfigs.filter((c) => {
      const cClean = cleanModelString(c.brand, c.model);
      return (
        cClean.length >= 3 &&
        (cClean === targetClean || cClean.includes(targetClean) || targetClean.includes(cClean))
      );
    });

    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        const aDiff = Math.abs(cleanModelString(a.brand, a.model).length - targetClean.length);
        const bDiff = Math.abs(cleanModelString(b.brand, b.model).length - targetClean.length);
        return aDiff - bDiff;
      });
      matched = candidates[0];
    }
  }

  if (matched && matched.services && matched.services.length > 0) {
    const validPrices = matched.services.map((s) => Number(s.price) || 0).filter((p) => p > 0);
    const minServicePrice = validPrices.length > 0 ? Math.min(...validPrices) : 499;
    return {
      config: matched,
      services: matched.services,
      basePrice: matched.base_repair_price || minServicePrice || 499,
    };
  }

  // Not in DB configs -> Generate realistic dynamic pricing based on model specs
  const dynamicServices = calculateSmartDefaultRepairServices(brand, model, productType);
  const minPrice = Math.min(...dynamicServices.map((s) => s.price));

  return {
    config: null,
    services: dynamicServices,
    basePrice: minPrice || 499,
  };
}

/**
 * Standard Seed Catalog for fast one-click population of top Indian models
 */
export const SEED_REPAIR_MODELS: Array<{
  product_type: RepairProductType;
  brand: string;
  model: string;
  device_series: string;
  screenPrice: number;
  batteryPrice: number;
  chargingPrice: number;
  cameraPrice: number;
  backglassPrice: number;
  motherboardPrice: number;
}> = [
  // --- APPLE iPHONES ---
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 15 Pro Max', device_series: 'iPhone 15 Series', screenPrice: 19999, batteryPrice: 3899, chargingPrice: 1499, cameraPrice: 5999, backglassPrice: 5499, motherboardPrice: 999 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 15 Pro', device_series: 'iPhone 15 Series', screenPrice: 17999, batteryPrice: 3699, chargingPrice: 1499, cameraPrice: 5499, backglassPrice: 4999, motherboardPrice: 999 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 15', device_series: 'iPhone 15 Series', screenPrice: 8999, batteryPrice: 2999, chargingPrice: 1199, cameraPrice: 3499, backglassPrice: 2999, motherboardPrice: 699 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 14 Pro Max', device_series: 'iPhone 14 Series', screenPrice: 16999, batteryPrice: 3499, chargingPrice: 1299, cameraPrice: 4999, backglassPrice: 4499, motherboardPrice: 899 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 14', device_series: 'iPhone 14 Series', screenPrice: 6999, batteryPrice: 2699, chargingPrice: 999, cameraPrice: 2999, backglassPrice: 2499, motherboardPrice: 599 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 13', device_series: 'iPhone 13 Series', screenPrice: 5499, batteryPrice: 2299, chargingPrice: 899, cameraPrice: 2499, backglassPrice: 1999, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 12', device_series: 'iPhone 12 Series', screenPrice: 4499, batteryPrice: 1999, chargingPrice: 799, cameraPrice: 1999, backglassPrice: 1699, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Apple', model: 'iPhone 11', device_series: 'iPhone 11 Series', screenPrice: 3299, batteryPrice: 1699, chargingPrice: 699, cameraPrice: 1699, backglassPrice: 1399, motherboardPrice: 399 },

  // --- SAMSUNG GALAXY ---
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy S24 Ultra', device_series: 'Galaxy S Series', screenPrice: 18999, batteryPrice: 3299, chargingPrice: 1299, cameraPrice: 4999, backglassPrice: 3999, motherboardPrice: 999 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy S24', device_series: 'Galaxy S Series', screenPrice: 11999, batteryPrice: 2799, chargingPrice: 999, cameraPrice: 3499, backglassPrice: 2699, motherboardPrice: 699 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy S23 Ultra', device_series: 'Galaxy S Series', screenPrice: 15999, batteryPrice: 2999, chargingPrice: 1099, cameraPrice: 4299, backglassPrice: 3299, motherboardPrice: 899 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy S23', device_series: 'Galaxy S Series', screenPrice: 9499, batteryPrice: 2499, chargingPrice: 899, cameraPrice: 2999, backglassPrice: 2199, motherboardPrice: 599 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy A55', device_series: 'Galaxy A Series', screenPrice: 4499, batteryPrice: 1599, chargingPrice: 699, cameraPrice: 1799, backglassPrice: 1299, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy A35', device_series: 'Galaxy A Series', screenPrice: 3499, batteryPrice: 1499, chargingPrice: 699, cameraPrice: 1499, backglassPrice: 1199, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy M34', device_series: 'Galaxy M Series', screenPrice: 2499, batteryPrice: 1299, chargingPrice: 599, cameraPrice: 1199, backglassPrice: 899, motherboardPrice: 399 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy Z Fold 5', device_series: 'Galaxy Z Series', screenPrice: 24999, batteryPrice: 3999, chargingPrice: 1499, cameraPrice: 5499, backglassPrice: 4999, motherboardPrice: 1299 },
  { product_type: 'smartphone', brand: 'Samsung', model: 'Galaxy Z Flip 5', device_series: 'Galaxy Z Series', screenPrice: 16999, batteryPrice: 3299, chargingPrice: 1199, cameraPrice: 3999, backglassPrice: 3499, motherboardPrice: 999 },

  // --- ONEPLUS ---
  { product_type: 'smartphone', brand: 'OnePlus', model: 'OnePlus 12', device_series: 'Number Series', screenPrice: 12999, batteryPrice: 2699, chargingPrice: 999, cameraPrice: 3499, backglassPrice: 2799, motherboardPrice: 799 },
  { product_type: 'smartphone', brand: 'OnePlus', model: 'OnePlus 12R', device_series: 'R Series', screenPrice: 7999, batteryPrice: 2299, chargingPrice: 899, cameraPrice: 2699, backglassPrice: 1999, motherboardPrice: 599 },
  { product_type: 'smartphone', brand: 'OnePlus', model: 'OnePlus 11', device_series: 'Number Series', screenPrice: 9999, batteryPrice: 2499, chargingPrice: 899, cameraPrice: 2999, backglassPrice: 2299, motherboardPrice: 699 },
  { product_type: 'smartphone', brand: 'OnePlus', model: 'OnePlus 11R', device_series: 'R Series', screenPrice: 6499, batteryPrice: 1999, chargingPrice: 799, cameraPrice: 2199, backglassPrice: 1699, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'OnePlus', model: 'OnePlus Nord CE 4', device_series: 'Nord Series', screenPrice: 3499, batteryPrice: 1499, chargingPrice: 649, cameraPrice: 1499, backglassPrice: 1099, motherboardPrice: 449 },
  { product_type: 'smartphone', brand: 'OnePlus', model: 'OnePlus Nord 3', device_series: 'Nord Series', screenPrice: 4199, batteryPrice: 1699, chargingPrice: 699, cameraPrice: 1699, backglassPrice: 1299, motherboardPrice: 499 },

  // --- XIAOMI / REDMI / POCO ---
  { product_type: 'smartphone', brand: 'Xiaomi', model: 'Xiaomi 14', device_series: 'Flagship Series', screenPrice: 11999, batteryPrice: 2499, chargingPrice: 999, cameraPrice: 3499, backglassPrice: 2499, motherboardPrice: 699 },
  { product_type: 'smartphone', brand: 'Xiaomi', model: 'Redmi Note 13 Pro+', device_series: 'Redmi Note Series', screenPrice: 4999, batteryPrice: 1599, chargingPrice: 699, cameraPrice: 1899, backglassPrice: 1299, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Xiaomi', model: 'Redmi Note 13 Pro', device_series: 'Redmi Note Series', screenPrice: 3899, batteryPrice: 1499, chargingPrice: 649, cameraPrice: 1699, backglassPrice: 1199, motherboardPrice: 449 },
  { product_type: 'smartphone', brand: 'Xiaomi', model: 'Redmi Note 13', device_series: 'Redmi Note Series', screenPrice: 2799, batteryPrice: 1299, chargingPrice: 599, cameraPrice: 1299, backglassPrice: 899, motherboardPrice: 399 },
  { product_type: 'smartphone', brand: 'Xiaomi', model: 'Poco X6 Pro', device_series: 'Poco Series', screenPrice: 3699, batteryPrice: 1499, chargingPrice: 649, cameraPrice: 1599, backglassPrice: 1099, motherboardPrice: 449 },
  { product_type: 'smartphone', brand: 'Xiaomi', model: 'Redmi 12', device_series: 'Redmi Number Series', screenPrice: 1799, batteryPrice: 999, chargingPrice: 499, cameraPrice: 899, backglassPrice: 699, motherboardPrice: 349 },

  // --- GOOGLE PIXEL ---
  { product_type: 'smartphone', brand: 'Google', model: 'Pixel 8 Pro', device_series: 'Pixel 8 Series', screenPrice: 15999, batteryPrice: 2999, chargingPrice: 1199, cameraPrice: 4499, backglassPrice: 3499, motherboardPrice: 899 },
  { product_type: 'smartphone', brand: 'Google', model: 'Pixel 8', device_series: 'Pixel 8 Series', screenPrice: 9999, batteryPrice: 2499, chargingPrice: 999, cameraPrice: 3299, backglassPrice: 2499, motherboardPrice: 699 },
  { product_type: 'smartphone', brand: 'Google', model: 'Pixel 7a', device_series: 'Pixel A Series', screenPrice: 5499, batteryPrice: 1999, chargingPrice: 799, cameraPrice: 2199, backglassPrice: 1499, motherboardPrice: 499 },

  // --- VIVO & REALME ---
  { product_type: 'smartphone', brand: 'Vivo', model: 'Vivo X100', device_series: 'X Series', screenPrice: 12999, batteryPrice: 2699, chargingPrice: 999, cameraPrice: 3899, backglassPrice: 2699, motherboardPrice: 799 },
  { product_type: 'smartphone', brand: 'Vivo', model: 'Vivo V30 Pro', device_series: 'V Series', screenPrice: 5499, batteryPrice: 1899, chargingPrice: 799, cameraPrice: 2499, backglassPrice: 1599, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Realme', model: 'Realme 12 Pro+', device_series: 'Number Pro Series', screenPrice: 4499, batteryPrice: 1699, chargingPrice: 699, cameraPrice: 1999, backglassPrice: 1399, motherboardPrice: 499 },
  { product_type: 'smartphone', brand: 'Realme', model: 'Realme GT 6', device_series: 'GT Series', screenPrice: 6999, batteryPrice: 2199, chargingPrice: 899, cameraPrice: 2799, backglassPrice: 1899, motherboardPrice: 599 },

  // --- NOTHING ---
  { product_type: 'smartphone', brand: 'Nothing', model: 'Nothing Phone (2)', device_series: 'Phone Series', screenPrice: 7999, batteryPrice: 2499, chargingPrice: 899, cameraPrice: 2999, backglassPrice: 2999, motherboardPrice: 699 },
  { product_type: 'smartphone', brand: 'Nothing', model: 'Nothing Phone (2a)', device_series: 'Phone Series', screenPrice: 4499, batteryPrice: 1699, chargingPrice: 699, cameraPrice: 1899, backglassPrice: 1699, motherboardPrice: 499 },

  // --- LAPTOPS ---
  { product_type: 'laptop', brand: 'Apple', model: 'MacBook Air M1', device_series: 'MacBook Air', screenPrice: 14999, batteryPrice: 5499, chargingPrice: 2299, cameraPrice: 2499, backglassPrice: 3499, motherboardPrice: 3999 },
  { product_type: 'laptop', brand: 'Apple', model: 'MacBook Air M2', device_series: 'MacBook Air', screenPrice: 18999, batteryPrice: 6499, chargingPrice: 2499, cameraPrice: 2999, backglassPrice: 3999, motherboardPrice: 4999 },
  { product_type: 'laptop', brand: 'Dell', model: 'Dell Inspiron 15', device_series: 'Inspiron Series', screenPrice: 4499, batteryPrice: 2499, chargingPrice: 1199, cameraPrice: 1299, backglassPrice: 1699, motherboardPrice: 1999 },
  { product_type: 'laptop', brand: 'Dell', model: 'Dell XPS 13', device_series: 'XPS Premium Series', screenPrice: 11999, batteryPrice: 3899, chargingPrice: 1899, cameraPrice: 1999, backglassPrice: 2499, motherboardPrice: 2999 },
  { product_type: 'laptop', brand: 'HP', model: 'HP Pavilion 15', device_series: 'Pavilion Series', screenPrice: 4699, batteryPrice: 2499, chargingPrice: 1199, cameraPrice: 1299, backglassPrice: 1699, motherboardPrice: 1999 },
  { product_type: 'laptop', brand: 'Lenovo', model: 'Lenovo ThinkPad E14', device_series: 'ThinkPad Series', screenPrice: 5499, batteryPrice: 2899, chargingPrice: 1299, cameraPrice: 1499, backglassPrice: 1899, motherboardPrice: 2299 },

  // --- TABLETS ---
  { product_type: 'tablet', brand: 'Apple', model: 'iPad 10th Gen', device_series: 'iPad Base Series', screenPrice: 6999, batteryPrice: 2999, chargingPrice: 1199, cameraPrice: 1899, backglassPrice: 2299, motherboardPrice: 1899 },
  { product_type: 'tablet', brand: 'Apple', model: 'iPad Air 5', device_series: 'iPad Air', screenPrice: 9999, batteryPrice: 3499, chargingPrice: 1299, cameraPrice: 2199, backglassPrice: 2699, motherboardPrice: 2299 },
  { product_type: 'tablet', brand: 'Samsung', model: 'Galaxy Tab S9 FE', device_series: 'Galaxy Tab', screenPrice: 6499, batteryPrice: 2699, chargingPrice: 999, cameraPrice: 1699, backglassPrice: 1999, motherboardPrice: 1699 },

  // --- SMARTWATCHES ---
  { product_type: 'smartwatch', brand: 'Apple', model: 'Apple Watch Series 9', device_series: 'Series 9', screenPrice: 7999, batteryPrice: 2499, chargingPrice: 999, cameraPrice: 999, backglassPrice: 1499, motherboardPrice: 1499 },
  { product_type: 'smartwatch', brand: 'Samsung', model: 'Galaxy Watch 6', device_series: 'Galaxy Watch', screenPrice: 4999, batteryPrice: 1899, chargingPrice: 799, cameraPrice: 799, backglassPrice: 1199, motherboardPrice: 1199 },
];

/**
 * Builds a full RepairPriceConfig object from seed item
 */
export function buildConfigFromSeedItem(seed: typeof SEED_REPAIR_MODELS[0]): Omit<RepairPriceConfig, 'id'> {
  const templates = getServiceTemplatesForProduct(seed.product_type);
  const services: RepairServiceItem[] = templates.map((tmpl) => {
    let price = 599;
    if (tmpl.id === 'screen') price = seed.screenPrice;
    else if (tmpl.id === 'battery') price = seed.batteryPrice;
    else if (tmpl.id === 'charging') price = seed.chargingPrice;
    else if (tmpl.id === 'camera') price = seed.cameraPrice;
    else if (tmpl.id === 'backglass') price = seed.backglassPrice;
    else if (tmpl.id === 'motherboard') price = seed.motherboardPrice;
    else if (tmpl.id === 'speaker') price = Math.round(seed.chargingPrice * 0.85);
    else if (tmpl.id === 'keyboard') price = Math.round(seed.batteryPrice * 0.9);
    else if (tmpl.id === 'trackpad') price = Math.round(seed.batteryPrice * 0.8);
    else if (tmpl.id === 'software') price = 399;
    else price = 499;

    return {
      service_id: tmpl.id,
      name: tmpl.name,
      price,
      original_price: Math.round(price * 1.25),
      warranty: tmpl.defaultWarranty,
      turnaround_time: tmpl.defaultTime,
      is_available: true,
    };
  });

  const minPrice = Math.min(...services.map((s) => s.price));

  return {
    product_type: seed.product_type,
    brand: seed.brand,
    model: seed.model,
    device_series: seed.device_series,
    release_year: 2024,
    base_repair_price: minPrice,
    services,
    is_active: true,
  };
}

/**
 * React Hook to keep UI synchronized with database & admin changes
 */
export function useRepairPriceSync() {
  const [configs, setConfigs] = useState<RepairPriceConfig[]>(getLocalRepairConfigs());
  const [loading, setLoading] = useState(false);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const { data } = await db.from<RepairPriceConfig>('repair_price_configs').select('*').limit(500);
      if (Array.isArray(data) && data.length > 0) {
        setConfigs(data);
        saveLocalRepairConfigs(data);
      }
    } catch (e) {
      console.warn('Notice loading repair price configs from database:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();

    const handleUpdate = () => {
      setConfigs(getLocalRepairConfigs());
    };

    const unsubscribeRealtime = subscribeToRealtimeSync((payload) => {
      if (
        payload.action === 'REPAIR_UPDATE' ||
        payload.table === 'repair_price_configs' ||
        payload.action === 'MODEL_DELETE' ||
        payload.action === 'MODEL_RESTORE'
      ) {
        fetchConfigs();
      }
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === REPAIR_OVERRIDES_STORAGE_KEY) {
        setConfigs(getLocalRepairConfigs());
      }
    };

    window.addEventListener('fundu_repair_price_updated', handleUpdate);
    window.addEventListener('storage', handleStorage);

    // Auto-polling every 10 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchConfigs();
      }
    }, 10000);

    const handleFocus = () => {
      fetchConfigs();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      unsubscribeRealtime();
      clearInterval(interval);
      window.removeEventListener('fundu_repair_price_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  return { configs, loading, refetch: fetchConfigs };
}
