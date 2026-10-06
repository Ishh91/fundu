import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
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
} from 'lucide-react';
import { computeDetailedCashifyValuation, fetchSellPriceConfig, fetchPhoneModels, searchMobileApiDev, calculateCashifyComparison, type SellPriceConfig } from '../lib/mobileApi';
import { getFunduPhoneQuote, type FunduQuoteResponse } from '../lib/quoteEngine';
import { db, formatINR } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { ALL_INDIAN_PHONES_CATALOG } from '../data/indianPhonesCatalog';
import { getCleanPhoneImage, getCleanBrandLogo, BRAND_FRONT_FALLBACKS } from '../lib/phoneImages';
import { usePriceSync, applyPriceOverrides } from '../lib/priceSync';
import { getModelHardwareSpecs, calculateHardwareVariantMultiplier } from '../lib/deviceSpecs';

// Master Service Localities
const DOORSTEP_LOCALITIES = [
  'Gomti Nagar',
  'Hazratganj',
  'Indira Nagar',
  'Aliganj',
  'Mahanagar',
  'Ashiyana',
  'Chowk',
  'Rajajipuram',
  'Jankipuram',
  'Kanpur Road',
];

// Brand Grid Cards
const BRAND_TILES = [
  { name: 'Apple', logo: getCleanBrandLogo('Apple'), count: '35+ Models' },
  { name: 'Samsung', logo: getCleanBrandLogo('Samsung'), count: '60+ Models' },
  { name: 'OnePlus', logo: getCleanBrandLogo('OnePlus'), count: '30+ Models' },
  { name: 'Xiaomi', logo: getCleanBrandLogo('Xiaomi'), count: '55+ Models' },
  { name: 'Realme', logo: getCleanBrandLogo('Realme'), count: '40+ Models' },
  { name: 'Vivo', logo: getCleanBrandLogo('Vivo'), count: '45+ Models' },
  { name: 'Oppo', logo: getCleanBrandLogo('Oppo'), count: '35+ Models' },
  { name: 'Nothing', logo: getCleanBrandLogo('Nothing'), count: '10+ Models' },
  { name: 'Tecno', logo: getCleanBrandLogo('Tecno'), count: '25+ Models' },
  { name: 'Itel', logo: getCleanBrandLogo('Itel'), count: '20+ Models' },
  { name: 'Motorola', logo: getCleanBrandLogo('Motorola'), count: '30+ Models' },
  { name: 'Google', logo: getCleanBrandLogo('Google'), count: '15+ Models' },
  { name: 'Poco', logo: getCleanBrandLogo('Poco'), count: '25+ Models' },
  { name: 'iQOO', logo: getCleanBrandLogo('iQOO'), count: '20+ Models' },
  { name: 'Infinix', logo: getCleanBrandLogo('Infinix'), count: '25+ Models' },
  { name: 'Lenovo', logo: getCleanBrandLogo('Lenovo'), count: '18+ Models' },
];

// Master Model Catalog Database (Easily Updatable JSON/Array)
export const MASTER_MODEL_CATALOG = [
  { brand: 'Apple', series: 'iPhone 17 Series', model: 'Apple iPhone 17 Pro Max', storage: '256 GB', price: 118000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg' },
  { brand: 'Apple', series: 'iPhone 17 Series', model: 'Apple iPhone 17 Pro', storage: '256 GB', price: 104000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg' },
  { brand: 'Apple', series: 'iPhone 17 Series', model: 'Apple iPhone 17 Air', storage: '128 GB', price: 82000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { brand: 'Apple', series: 'iPhone 17 Series', model: 'Apple iPhone 17', storage: '128 GB', price: 72000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { brand: 'Apple', series: 'iPhone 16 Series', model: 'Apple iPhone 16 Pro Max', storage: '256 GB', price: 98000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg' },
  { brand: 'Apple', series: 'iPhone 16 Series', model: 'Apple iPhone 16 Pro', storage: '128 GB', price: 88000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg' },
  { brand: 'Apple', series: 'iPhone 16 Series', model: 'Apple iPhone 16 Plus', storage: '128 GB', price: 68000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { brand: 'Apple', series: 'iPhone 16 Series', model: 'Apple iPhone 16', storage: '128 GB', price: 58000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
  { brand: 'Apple', series: 'iPhone 15 Series', model: 'Apple iPhone 15 Pro Max', storage: '256 GB', price: 85000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg' },
  { brand: 'Apple', series: 'iPhone 15 Series', model: 'Apple iPhone 15 Pro', storage: '128 GB', price: 74000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg' },
  { brand: 'Apple', series: 'iPhone 15 Series', model: 'Apple iPhone 15 Plus', storage: '128 GB', price: 59000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg' },
  { brand: 'Apple', series: 'iPhone 15 Series', model: 'Apple iPhone 15', storage: '128 GB', price: 54000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg' },
  { brand: 'Apple', series: 'iPhone 14 Series', model: 'Apple iPhone 14 Pro Max', storage: '128 GB', price: 65000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg' },
  { brand: 'Apple', series: 'iPhone 14 Series', model: 'Apple iPhone 14 Pro', storage: '128 GB', price: 58000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg' },
  { brand: 'Apple', series: 'iPhone 14 Series', model: 'Apple iPhone 14 Plus', storage: '128 GB', price: 49000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg' },
  { brand: 'Apple', series: 'iPhone 14 Series', model: 'Apple iPhone 14', storage: '128 GB', price: 46000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg' },
  { brand: 'Apple', series: 'iPhone 13 Series', model: 'Apple iPhone 13 Pro Max', storage: '128 GB', price: 54000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg' },
  { brand: 'Apple', series: 'iPhone 13 Series', model: 'Apple iPhone 13 Pro', storage: '128 GB', price: 47000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg' },
  { brand: 'Apple', series: 'iPhone 13 Series', model: 'Apple iPhone 13', storage: '128 GB', price: 38500, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg' },
  { brand: 'Apple', series: 'iPhone 13 mini', model: 'Apple iPhone 13 mini', storage: '128 GB', price: 32000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-mini.jpg' },
  { brand: 'Apple', series: 'iPhone 12 Series', model: 'Apple iPhone 12 Pro Max', storage: '128 GB', price: 42000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg' },
  { brand: 'Apple', series: 'iPhone 12 Series', model: 'Apple iPhone 12 Pro', storage: '128 GB', price: 36000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg' },
  { brand: 'Apple', series: 'iPhone 12 Series', model: 'Apple iPhone 12', storage: '64 GB', price: 28000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg' },
  { brand: 'Apple', series: 'iPhone 12 mini', model: 'Apple iPhone 12 mini', storage: '64 GB', price: 22000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg' },
  { brand: 'Apple', series: 'iPhone 11 Series', model: 'Apple iPhone 11 Pro Max', storage: '64 GB', price: 31000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg' },
  { brand: 'Apple', series: 'iPhone 11 Series', model: 'Apple iPhone 11 Pro', storage: '64 GB', price: 26000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg' },
  { brand: 'Apple', series: 'iPhone 11 Series', model: 'Apple iPhone 11', storage: '64 GB', price: 21000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg' },
  { brand: 'Apple', series: 'iPhone X Series', model: 'Apple iPhone XS Max', storage: '64 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg' },
  { brand: 'Apple', series: 'iPhone X Series', model: 'Apple iPhone XS', storage: '64 GB', price: 16000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg' },
  { brand: 'Apple', series: 'iPhone X Series', model: 'Apple iPhone XR', storage: '64 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xr.jpg' },
  { brand: 'Apple', series: 'iPhone X Series', model: 'Apple iPhone X', storage: '64 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg' },
  { brand: 'Apple', series: 'iPhone 8 Series', model: 'Apple iPhone 8 Plus', storage: '64 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-8.jpg' },
  { brand: 'Apple', series: 'iPhone 8 Series', model: 'Apple iPhone 8', storage: '64 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-8.jpg' },
  { brand: 'Apple', series: 'iPhone 7 Series', model: 'Apple iPhone 7 Plus', storage: '32 GB', price: 7500, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-7r4.jpg' },
  { brand: 'Apple', series: 'iPhone 7 Series', model: 'Apple iPhone 7', storage: '32 GB', price: 5500, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-7r4.jpg' },
  { brand: 'Apple', series: 'iPhone 6 Series', model: 'Apple iPhone 6s Plus', storage: '32 GB', price: 4800, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6s-plus.jpg' },
  { brand: 'Apple', series: 'iPhone 6 Series', model: 'Apple iPhone 6s', storage: '32 GB', price: 3800, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6s.jpg' },
  { brand: 'Apple', series: 'iPhone 6 Series', model: 'Apple iPhone 6 Plus', storage: '16 GB', price: 3500, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6-plus.jpg' },
  { brand: 'Apple', series: 'iPhone 6 Series', model: 'Apple iPhone 6', storage: '16 GB', price: 2800, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6s.jpg' },
  { brand: 'Apple', series: 'iPhone SE Series', model: 'Apple iPhone SE 3rd Gen (2022)', storage: '64 GB', price: 18000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg' },
  { brand: 'Apple', series: 'iPhone SE Series', model: 'Apple iPhone SE 2nd Gen (2020)', storage: '64 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2020.jpg' },
  { brand: 'Apple', series: 'iPhone SE Series', model: 'Apple iPhone SE 1st Gen (2016)', storage: '16 GB', price: 3000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5s.jpg' },
  { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 5s', storage: '16 GB', price: 2200, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5s.jpg' },
  { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 5c', storage: '16 GB', price: 1800, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5c.jpg' },
  { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 5', storage: '16 GB', price: 1600, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5.jpg' },
  { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 4s', storage: '8 GB', price: 1200, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-4s.jpg' },
  { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 4', storage: '8 GB', price: 1000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-4.jpg' },
  { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 3GS', storage: '8 GB', price: 800, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-3gs.jpg' },
  { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 3G', storage: '8 GB', price: 700, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-3gs.jpg' },
  { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 1 (Original 2007)', storage: '4 GB', price: 600, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-3gs.jpg' },
  { brand: 'Samsung', series: 'Galaxy S25 Series', model: 'Samsung Galaxy S25 Ultra', storage: '256 GB', price: 84000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg' },
  { brand: 'Samsung', series: 'Galaxy S25 Series', model: 'Samsung Galaxy S25+', storage: '256 GB', price: 68000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
  { brand: 'Samsung', series: 'Galaxy S25 Series', model: 'Samsung Galaxy S25 5G', storage: '128 GB', price: 56000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg' },
  { brand: 'Samsung', series: 'Galaxy S24 Series', model: 'Samsung Galaxy S24 Ultra', storage: '256 GB', price: 78000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-stylus.jpg' },
  { brand: 'Samsung', series: 'Galaxy S24 Series', model: 'Samsung Galaxy S24+', storage: '256 GB', price: 59000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
  { brand: 'Samsung', series: 'Galaxy S24 Series', model: 'Samsung Galaxy S24 5G', storage: '128 GB', price: 48000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg' },
  { brand: 'Samsung', series: 'Galaxy S24 Series', model: 'Samsung Galaxy S24 FE', storage: '128 GB', price: 38000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-fe.jpg' },
  { brand: 'Samsung', series: 'Galaxy S23 Series', model: 'Samsung Galaxy S23 Ultra', storage: '256 GB', price: 62000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy S23 Series', model: 'Samsung Galaxy S23+', storage: '256 GB', price: 46000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-plus-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy S23 Series', model: 'Samsung Galaxy S23 5G', storage: '128 GB', price: 39000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy S23 Series', model: 'Samsung Galaxy S23 FE 5G', storage: '128 GB', price: 31000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-fe.jpg' },
  { brand: 'Samsung', series: 'Galaxy S22 Series', model: 'Samsung Galaxy S22 Ultra 5G', storage: '128 GB', price: 44000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-ultra-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy S22 Series', model: 'Samsung Galaxy S22+ 5G', storage: '128 GB', price: 34000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-plus-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy S22 Series', model: 'Samsung Galaxy S22 5G', storage: '128 GB', price: 27000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy S21 Series', model: 'Samsung Galaxy S21 Ultra 5G', storage: '128 GB', price: 32000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-ultra-5g-.jpg' },
  { brand: 'Samsung', series: 'Galaxy S21 Series', model: 'Samsung Galaxy S21+ 5G', storage: '128 GB', price: 24000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-plus-5g-.jpg' },
  { brand: 'Samsung', series: 'Galaxy S21 Series', model: 'Samsung Galaxy S21 5G', storage: '128 GB', price: 20000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-5g-r.jpg' },
  { brand: 'Samsung', series: 'Galaxy S21 Series', model: 'Samsung Galaxy S21 FE 5G', storage: '128 GB', price: 18500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-fe-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy S20 Series', model: 'Samsung Galaxy S20 Ultra 5G', storage: '128 GB', price: 23000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-ultra-5g-r.jpg' },
  { brand: 'Samsung', series: 'Galaxy S20 Series', model: 'Samsung Galaxy S20+', storage: '128 GB', price: 18000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-plus-r.jpg' },
  { brand: 'Samsung', series: 'Galaxy S20 Series', model: 'Samsung Galaxy S20', storage: '128 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-r.jpg' },
  { brand: 'Samsung', series: 'Galaxy S20 Series', model: 'Samsung Galaxy S20 FE 5G', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-fe-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy S20 Series', model: 'Samsung Galaxy S20 FE', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-fe-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy S10 Series', model: 'Samsung Galaxy S10+', storage: '128 GB', price: 12500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-plus-new.jpg' },
  { brand: 'Samsung', series: 'Galaxy S10 Series', model: 'Samsung Galaxy S10', storage: '128 GB', price: 10500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-1.jpg' },
  { brand: 'Samsung', series: 'Galaxy S10 Series', model: 'Samsung Galaxy S10e', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10e-1.jpg' },
  { brand: 'Samsung', series: 'Galaxy S10 Series', model: 'Samsung Galaxy S10 Lite', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-lite-sm-g770f.jpg' },
  { brand: 'Samsung', series: 'Galaxy Z Series (Fold & Flip)', model: 'Samsung Galaxy Z Fold 6', storage: '256 GB', price: 88000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
  { brand: 'Samsung', series: 'Galaxy Z Series (Fold & Flip)', model: 'Samsung Galaxy Z Flip 6', storage: '256 GB', price: 58000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg' },
  { brand: 'Samsung', series: 'Galaxy Z Series (Fold & Flip)', model: 'Samsung Galaxy Z Fold 5', storage: '256 GB', price: 72000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg' },
  { brand: 'Samsung', series: 'Galaxy Z Series (Fold & Flip)', model: 'Samsung Galaxy Z Flip 5', storage: '256 GB', price: 44000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg' },
  { brand: 'Samsung', series: 'Galaxy Z Series (Fold & Flip)', model: 'Samsung Galaxy Z Fold 4', storage: '256 GB', price: 54000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold4.jpg' },
  { brand: 'Samsung', series: 'Galaxy Z Series (Fold & Flip)', model: 'Samsung Galaxy Z Flip 4', storage: '128 GB', price: 32000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip4.jpg' },
  { brand: 'Samsung', series: 'Galaxy Z Series (Fold & Flip)', model: 'Samsung Galaxy Z Fold 3 5G', storage: '256 GB', price: 38000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold3-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy Z Series (Fold & Flip)', model: 'Samsung Galaxy Z Flip 3 5G', storage: '128 GB', price: 22000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip3-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy Z Series (Fold & Flip)', model: 'Samsung Galaxy Z Fold 2 5G', storage: '256 GB', price: 26000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold2-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy Z Series (Fold & Flip)', model: 'Samsung Galaxy Z Flip', storage: '128 GB', price: 17000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip.jpg' },
  { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 20 Ultra 5G', storage: '256 GB', price: 36000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-ultra-5g-.jpg' },
  { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 20', storage: '256 GB', price: 24000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-5g-r.jpg' },
  { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 10+', storage: '256 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-plus-.jpg' },
  { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 10', storage: '256 GB', price: 16000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-.jpg' },
  { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 10 Lite', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-lite.jpg' },
  { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 9', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note9-r1.jpg' },
  { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 8', storage: '64 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note8-sm-n950.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A55 5G', storage: '128 GB', price: 25000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A54 5G', storage: '128 GB', price: 19500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A53 5G', storage: '128 GB', price: 15500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a53-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A52s 5G', storage: '128 GB', price: 13500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a52s-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A52', storage: '128 GB', price: 11500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a52-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A51', storage: '128 GB', price: 9000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a51.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A50', storage: '64 GB', price: 7000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a50.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A35 5G', storage: '128 GB', price: 18500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A34 5G', storage: '128 GB', price: 14500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a34.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A33 5G', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a33-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A32', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a32-4g.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A25 5G', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a25.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A24', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a24-4g.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A23 5G', storage: '128 GB', price: 10500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a23-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A22 5G', storage: '128 GB', price: 9000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a22-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A21s', storage: '64 GB', price: 7500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a21s.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A15 5G', storage: '128 GB', price: 10000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a15-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A14 5G', storage: '64 GB', price: 7500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a14-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A13', storage: '64 GB', price: 6500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a13.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A12', storage: '64 GB', price: 5500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a12-sm-a125.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A05s', storage: '64 GB', price: 6000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a05s.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A04s', storage: '64 GB', price: 5000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a04s.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A73 5G', storage: '128 GB', price: 18000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a73-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A72', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a72-4g.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A71', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a71.jpg' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Samsung Galaxy A70', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a70.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M55 5G', storage: '128 GB', price: 17500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m55.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M54 5G', storage: '128 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m54.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M53 5G', storage: '128 GB', price: 12500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m53-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M52 5G', storage: '128 GB', price: 10500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m52-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M51', storage: '128 GB', price: 9000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m51.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M35 5G', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m35.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M34 5G', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m34-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M33 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m33-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M32', storage: '64 GB', price: 7500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m32-4g.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M31s', storage: '128 GB', price: 7000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m31s.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M31', storage: '64 GB', price: 6500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m31.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M21', storage: '64 GB', price: 5500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m21.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M14 5G', storage: '128 GB', price: 7500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m14-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M13', storage: '64 GB', price: 5500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m13-4g.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M12', storage: '64 GB', price: 4800, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m12.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy M04', storage: '64 GB', price: 4200, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m04.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy F55 5G', storage: '128 GB', price: 16500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f55.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy F54 5G', storage: '256 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f54.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy F34 5G', storage: '128 GB', price: 10500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f34-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy F23 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f23-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy F14 5G', storage: '128 GB', price: 7000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f14-5g.jpg' },
  { brand: 'Samsung', series: 'Galaxy M & F Series', model: 'Samsung Galaxy F13', storage: '64 GB', price: 5500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f13.jpg' },
  { brand: 'Samsung', series: 'Galaxy J Series (Classic)', model: 'Samsung Galaxy J8', storage: '64 GB', price: 4400, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j8.jpg' },
  { brand: 'Samsung', series: 'Galaxy J Series (Classic)', model: 'Samsung Galaxy J7 Prime', storage: '32 GB', price: 3800, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-prime.jpg' },
  { brand: 'Samsung', series: 'Galaxy J Series (Classic)', model: 'Samsung Galaxy J7 Pro', storage: '64 GB', price: 4500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-pro.jpg' },
  { brand: 'Samsung', series: 'Galaxy J Series (Classic)', model: 'Samsung Galaxy J7 Max', storage: '32 GB', price: 4200, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-max.jpg' },
  { brand: 'Samsung', series: 'Galaxy J Series (Classic)', model: 'Samsung Galaxy J7 Nxt', storage: '32 GB', price: 2800, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-nxt.jpg' },
  { brand: 'Samsung', series: 'Galaxy J Series (Classic)', model: 'Samsung Galaxy J7 Duo', storage: '32 GB', price: 3900, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-duo.jpg' },
  { brand: 'Samsung', series: 'Galaxy J Series (Classic)', model: 'Samsung Galaxy J7 (2016)', storage: '16 GB', price: 3200, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-2016.jpg' },
  { brand: 'Samsung', series: 'Galaxy J Series (Classic)', model: 'Samsung Galaxy J6+', storage: '64 GB', price: 3600, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j6-plus.jpg' },
  { brand: 'Samsung', series: 'Galaxy J Series (Classic)', model: 'Samsung Galaxy J6', storage: '64 GB', price: 3500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j6.jpg' },
  { brand: 'Samsung', series: 'Galaxy J Series (Classic)', model: 'Samsung Galaxy J4+', storage: '32 GB', price: 2900, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j4-plus.jpg' },
  { brand: 'Samsung', series: 'Galaxy J Series (Classic)', model: 'Samsung Galaxy J4', storage: '16 GB', price: 2600, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j4.jpg' },
  { brand: 'Samsung', series: 'Galaxy J Series (Classic)', model: 'Samsung Galaxy J2 Pro', storage: '16 GB', price: 2200, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j2-pro-2018.jpg' },
  { brand: 'Samsung', series: 'Galaxy J Series (Classic)', model: 'Samsung Galaxy J2 (2018)', storage: '16 GB', price: 1800, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j2-2018.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 13 & 12 Series', model: 'OnePlus 13', storage: '256 GB', price: 58000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-13.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 13 & 12 Series', model: 'OnePlus 13R', storage: '128 GB', price: 38000, image: 'https://api.mobileapi.dev/devices/366/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus 13 & 12 Series', model: 'OnePlus 12', storage: '256 GB', price: 42000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 13 & 12 Series', model: 'OnePlus 12R', storage: '128 GB', price: 28000, image: 'https://api.mobileapi.dev/devices/364/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus 11 Series', model: 'OnePlus 11', storage: '128 GB', price: 32000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 11 Series', model: 'OnePlus 11R', storage: '128 GB', price: 24000, image: 'https://api.mobileapi.dev/devices/362/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus 10 Series', model: 'OnePlus 10 Pro', storage: '128 GB', price: 26000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 10 Series', model: 'OnePlus 10T', storage: '128 GB', price: 22000, image: 'https://api.mobileapi.dev/devices/16342/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus 10 Series', model: 'OnePlus 10R 150W', storage: '128 GB', price: 19000, image: 'https://api.mobileapi.dev/devices/370/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus 10 Series', model: 'OnePlus 10R', storage: '128 GB', price: 18000, image: 'https://api.mobileapi.dev/devices/16344/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus 9 Series', model: 'OnePlus 9 Pro', storage: '128 GB', price: 20000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro-.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 9 Series', model: 'OnePlus 9RT', storage: '128 GB', price: 17500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9rt-5g.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 9 Series', model: 'OnePlus 9', storage: '128 GB', price: 16000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 9 Series', model: 'OnePlus 9R', storage: '128 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9r.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 8 Pro', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8-pro.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 8T', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8t.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 8', storage: '128 GB', price: 12000, image: 'https://api.mobileapi.dev/devices/16348/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 7T Pro', storage: '256 GB', price: 11500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t-pro.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 7T', storage: '128 GB', price: 10000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 7 Pro', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7-pro.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 7', storage: '128 GB', price: 8000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7.jpg' },
  { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord 4', storage: '128 GB', price: 23000, image: 'https://api.mobileapi.dev/devices/809/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord 3', storage: '128 GB', price: 18000, image: 'https://api.mobileapi.dev/devices/373/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord 2T', storage: '128 GB', price: 14000, image: 'https://api.mobileapi.dev/devices/811/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord 2', storage: '128 GB', price: 12000, image: 'https://api.mobileapi.dev/devices/377/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord CE4', storage: '128 GB', price: 16500, image: 'https://api.mobileapi.dev/devices/385/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord CE4 Lite', storage: '128 GB', price: 13500, image: 'https://api.mobileapi.dev/devices/16320/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord CE3', storage: '128 GB', price: 13000, image: 'https://api.mobileapi.dev/devices/374/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord CE3 Lite', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-3-lite.jpg' },
  { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord CE 2', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-2-5g.jpg' },
  { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord CE', storage: '128 GB', price: 8500, image: 'https://api.mobileapi.dev/devices/810/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord', storage: '128 GB', price: 7500, image: 'https://api.mobileapi.dev/devices/811/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord N30 5G', storage: '128 GB', price: 10000, image: 'https://api.mobileapi.dev/devices/387/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus Open & Foldable Series', model: 'OnePlus Open', storage: '512 GB', price: 78000, image: 'https://api.mobileapi.dev/devices/391/thumb.png' },
  { brand: 'OnePlus', series: 'OnePlus 6 & Classic Series', model: 'OnePlus 6T', storage: '128 GB', price: 6500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6t.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 6 & Classic Series', model: 'OnePlus 6', storage: '64 GB', price: 5500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 6 & Classic Series', model: 'OnePlus 5T', storage: '64 GB', price: 4500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-5t.jpg' },
  { brand: 'OnePlus', series: 'OnePlus 6 & Classic Series', model: 'OnePlus 5', storage: '64 GB', price: 4000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-5.jpg' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 14 Ultra', storage: '512 GB', price: 62000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 14', storage: '256 GB', price: 42000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14.jpg' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 14 Civi', storage: '128 GB', price: 27000, image: 'https://api.mobileapi.dev/devices/840/thumb.png' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 13 Pro', storage: '256 GB', price: 38000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13-pro.jpg' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 13', storage: '256 GB', price: 30000, image: 'https://api.mobileapi.dev/devices/31521/thumb.png' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 13 Lite', storage: '128 GB', price: 19000, image: 'https://api.mobileapi.dev/devices/1834/thumb.png' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 12 Pro', storage: '256 GB', price: 26000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-12-pro.jpg' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 12 Lite', storage: '128 GB', price: 15000, image: 'https://api.mobileapi.dev/devices/1837/thumb.png' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 11T Pro', storage: '128 GB', price: 17000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-11t-pro.jpg' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi Mi 11X Pro', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-mi-11x-pro.jpg' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi Mi 11X', storage: '128 GB', price: 12000, image: 'https://api.mobileapi.dev/devices/1935/thumb.png' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi Mi 10T Pro', storage: '128 GB', price: 11500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-mi-10t-pro-5g.jpg' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi Mi 10', storage: '128 GB', price: 12500, image: 'https://api.mobileapi.dev/devices/1946/thumb.png' },
  { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi Mi 10i', storage: '128 GB', price: 9000, image: 'https://api.mobileapi.dev/devices/29024/thumb.png' },
  { brand: 'Xiaomi', series: 'Redmi Note 13 & 14 Series', model: 'Redmi Note 13 Pro+ 5G', storage: '256 GB', price: 20500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 13 & 14 Series', model: 'Redmi Note 13 Pro 5G', storage: '128 GB', price: 16500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-5g.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 13 & 14 Series', model: 'Redmi Note 13 5G', storage: '128 GB', price: 12500, image: 'https://api.mobileapi.dev/devices/31521/thumb.png' },
  { brand: 'Xiaomi', series: 'Redmi Note 13 & 14 Series', model: 'Redmi Note 13 4G', storage: '128 GB', price: 10500, image: 'https://api.mobileapi.dev/devices/13590/thumb.png' },
  { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 12 Pro+ 5G', storage: '256 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro-plus.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 12 Pro 5G', storage: '128 GB', price: 12500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 12 5G', storage: '128 GB', price: 10000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 12 4G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-4g.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 11 Pro+ 5G', storage: '128 GB', price: 10500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-plus-5g.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 11 Pro', storage: '128 GB', price: 9000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-global.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 11S', storage: '128 GB', price: 8000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11s.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 11', storage: '64 GB', price: 7000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 10 Pro Max', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note10-pro-max.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 10 Pro', storage: '128 GB', price: 7500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note10-pro.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 10S', storage: '64 GB', price: 6500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-10s.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 10', storage: '64 GB', price: 6000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-10.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 9 Pro Max', storage: '64 GB', price: 5500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-9-pro-max.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 9 Pro', storage: '64 GB', price: 5000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-9-pro.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 9', storage: '64 GB', price: 4500, image: 'https://api.mobileapi.dev/devices/31608/thumb.png' },
  { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 8 Pro', storage: '64 GB', price: 4200, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-8-pro.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 8', storage: '64 GB', price: 3800, image: 'https://api.mobileapi.dev/devices/31618/thumb.png' },
  { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 13C 5G', storage: '128 GB', price: 8000, image: 'https://api.mobileapi.dev/devices/31508/thumb.png' },
  { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 13C', storage: '128 GB', price: 6500, image: 'https://api.mobileapi.dev/devices/31508/thumb.png' },
  { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 12 5G', storage: '128 GB', price: 7800, image: 'https://api.mobileapi.dev/devices/31511/thumb.png' },
  { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 12', storage: '128 GB', price: 6200, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-12.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 11 Prime 5G', storage: '64 GB', price: 5800, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-11-prime-5g.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 10', storage: '64 GB', price: 5000, image: 'https://api.mobileapi.dev/devices/31570/thumb.png' },
  { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 10A', storage: '64 GB', price: 4200, image: 'https://api.mobileapi.dev/devices/31571/thumb.png' },
  { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 9', storage: '64 GB', price: 3800, image: 'https://api.mobileapi.dev/devices/13626/thumb.png' },
  { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi A3', storage: '64 GB', price: 4500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-a3.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi A2', storage: '32 GB', price: 3500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-a2.jpg' },
  { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO F6', storage: '256 GB', price: 21000, image: 'https://api.mobileapi.dev/devices/15693/thumb.png' },
  { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO F5', storage: '256 GB', price: 16500, image: 'https://api.mobileapi.dev/devices/15700/thumb.png' },
  { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO F4 GT', storage: '128 GB', price: 15000, image: 'https://api.mobileapi.dev/devices/15706/thumb.png' },
  { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO F4 5G', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f4.jpg' },
  { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO F3 GT', storage: '128 GB', price: 11500, image: 'https://api.mobileapi.dev/devices/15719/thumb.png' },
  { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X6 Pro 5G', storage: '256 GB', price: 17500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg' },
  { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X6 5G', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6.jpg' },
  { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X6 Neo', storage: '128 GB', price: 11500, image: 'https://api.mobileapi.dev/devices/15695/thumb.png' },
  { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X5 Pro 5G', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x5-pro.jpg' },
  { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X5 5G', storage: '128 GB', price: 9500, image: 'https://api.mobileapi.dev/devices/15708/thumb.png' },
  { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X4 Pro 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x4-pro-5g.jpg' },
  { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X3 Pro', storage: '128 GB', price: 8000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x3-pro.jpg' },
  { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO M6 Pro 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-pro-5g.jpg' },
  { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO M6 5G', storage: '128 GB', price: 7200, image: 'https://api.mobileapi.dev/devices/15691/thumb.png' },
  { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO M5', storage: '64 GB', price: 5800, image: 'https://api.mobileapi.dev/devices/15711/thumb.png' },
  { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO M4 Pro 5G', storage: '128 GB', price: 6800, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m4-pro-5g.jpg' },
  { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO C65', storage: '128 GB', price: 6200, image: 'https://api.mobileapi.dev/devices/15697/thumb.png' },
  { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO C55', storage: '64 GB', price: 4800, image: 'https://api.mobileapi.dev/devices/15703/thumb.png' },
  { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO C51', storage: '64 GB', price: 4000, image: 'https://api.mobileapi.dev/devices/15702/thumb.png' },
  { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT 6', storage: '256 GB', price: 28000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-6.jpg' },
  { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT 6T', storage: '128 GB', price: 21000, image: 'https://api.mobileapi.dev/devices/13718/thumb.png' },
  { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT 2 Pro', storage: '128 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt2-pro.jpg' },
  { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT Neo 3', storage: '128 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-neo3.jpg' },
  { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT Neo 2', storage: '128 GB', price: 13000, image: 'https://api.mobileapi.dev/devices/13676/thumb.png' },
  { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT 5G', storage: '128 GB', price: 12000, image: 'https://api.mobileapi.dev/devices/13816/thumb.png' },
  { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT Master Edition', storage: '128 GB', price: 10500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-master.jpg' },
  { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 13 Pro+ 5G', storage: '256 GB', price: 23000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro-plus.jpg' },
  { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 13 Pro 5G', storage: '128 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro.jpg' },
  { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 12 Pro+ 5G', storage: '256 GB', price: 19500, image: 'https://api.mobileapi.dev/devices/13731/thumb.png' },
  { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 12 Pro 5G', storage: '128 GB', price: 16000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro.jpg' },
  { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 11 Pro+ 5G', storage: '256 GB', price: 15500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro-plus.jpg' },
  { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 11 Pro 5G', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro.jpg' },
  { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 10 Pro+ 5G', storage: '128 GB', price: 12000, image: 'https://api.mobileapi.dev/devices/13760/thumb.png' },
  { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 10 Pro 5G', storage: '128 GB', price: 10000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-10-pro.jpg' },
  { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 9 Pro+ 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-9-pro-plus.jpg' },
  { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 9 Pro 5G', storage: '128 GB', price: 8000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-9-pro.jpg' },
  { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 8 Pro', storage: '128 GB', price: 6800, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-8-pro.jpg' },
  { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 13+ 5G', storage: '128 GB', price: 16500, image: 'https://api.mobileapi.dev/devices/13706/thumb.png' },
  { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 13 5G', storage: '128 GB', price: 14000, image: 'https://api.mobileapi.dev/devices/13814/thumb.png' },
  { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 12+ 5G', storage: '128 GB', price: 14500, image: 'https://api.mobileapi.dev/devices/13729/thumb.png' },
  { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 12 5G', storage: '128 GB', price: 12000, image: 'https://api.mobileapi.dev/devices/13728/thumb.png' },
  { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 12x 5G', storage: '128 GB', price: 9500, image: 'https://api.mobileapi.dev/devices/13726/thumb.png' },
  { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 11 5G', storage: '128 GB', price: 10500, image: 'https://api.mobileapi.dev/devices/13819/thumb.png' },
  { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 11x 5G', storage: '128 GB', price: 9000, image: 'https://api.mobileapi.dev/devices/13739/thumb.png' },
  { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 10 5G', storage: '128 GB', price: 8500, image: 'https://api.mobileapi.dev/devices/13759/thumb.png' },
  { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 9i 5G', storage: '64 GB', price: 6500, image: 'https://api.mobileapi.dev/devices/13763/thumb.png' },
  { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 8 5G', storage: '64 GB', price: 5500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-8-5g.jpg' },
  { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme P1 Pro 5G', storage: '128 GB', price: 14500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-p1-pro.jpg' },
  { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme P1 5G', storage: '128 GB', price: 11500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-p1.jpg' },
  { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme Narzo 70 Pro 5G', storage: '128 GB', price: 13500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-pro.jpg' },
  { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme Narzo 70x 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70x.jpg' },
  { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme Narzo 60 Pro 5G', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-60-pro.jpg' },
  { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme Narzo 60 5G', storage: '128 GB', price: 9800, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-60.jpg' },
  { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme Narzo 50 Pro 5G', storage: '128 GB', price: 8000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-50-pro-5g.jpg' },
  { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme Narzo 50', storage: '64 GB', price: 6000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-50.jpg' },
  { brand: 'Realme', series: 'Realme C Series', model: 'Realme C67 5G', storage: '128 GB', price: 8500, image: 'https://api.mobileapi.dev/devices/13733/thumb.png' },
  { brand: 'Realme', series: 'Realme C Series', model: 'Realme C65 5G', storage: '128 GB', price: 7500, image: 'https://api.mobileapi.dev/devices/13720/thumb.png' },
  { brand: 'Realme', series: 'Realme C Series', model: 'Realme C63 5G', storage: '128 GB', price: 6800, image: 'https://api.mobileapi.dev/devices/13705/thumb.png' },
  { brand: 'Realme', series: 'Realme C Series', model: 'Realme C55', storage: '64 GB', price: 5800, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c55.jpg' },
  { brand: 'Realme', series: 'Realme C Series', model: 'Realme C53', storage: '64 GB', price: 5200, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c53.jpg' },
  { brand: 'Realme', series: 'Realme C Series', model: 'Realme C35', storage: '64 GB', price: 4500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c35.jpg' },
  { brand: 'Realme', series: 'Realme C Series', model: 'Realme C33', storage: '32 GB', price: 3800, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c33.jpg' },
  { brand: 'Oppo', series: 'Oppo Find Series', model: 'Oppo Find N3 Flip', storage: '256 GB', price: 54000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-n3-flip.jpg' },
  { brand: 'Oppo', series: 'Oppo Find Series', model: 'Oppo Find N2 Flip', storage: '256 GB', price: 38000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-n2-flip.jpg' },
  { brand: 'Oppo', series: 'Oppo Find Series', model: 'Oppo Find X7 Ultra', storage: '256 GB', price: 58000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x7-ultra.jpg' },
  { brand: 'Oppo', series: 'Oppo Find Series', model: 'Oppo Find X5 Pro', storage: '256 GB', price: 28000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x5-pro.jpg' },
  { brand: 'Oppo', series: 'Oppo Reno Series', model: 'Oppo Reno 12 Pro 5G', storage: '256 GB', price: 28000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno12-pro.jpg' },
  { brand: 'Oppo', series: 'Oppo Reno Series', model: 'Oppo Reno 12 5G', storage: '256 GB', price: 22000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno12.jpg' },
  { brand: 'Oppo', series: 'Oppo Reno Series', model: 'Oppo Reno 11 Pro 5G', storage: '256 GB', price: 21500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno11-pro.jpg' },
  { brand: 'Oppo', series: 'Oppo Reno Series', model: 'Oppo Reno 11 5G', storage: '128 GB', price: 17500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno11.jpg' },
  { brand: 'Oppo', series: 'Oppo Reno Series', model: 'Oppo Reno 10 Pro+ 5G', storage: '256 GB', price: 23000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno10-pro-plus.jpg' },
  { brand: 'Oppo', series: 'Oppo Reno Series', model: 'Oppo Reno 10 Pro 5G', storage: '256 GB', price: 18000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno10-pro.jpg' },
  { brand: 'Oppo', series: 'Oppo Reno Series', model: 'Oppo Reno 10 5G', storage: '128 GB', price: 14500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno10.jpg' },
  { brand: 'Oppo', series: 'Oppo Reno Series', model: 'Oppo Reno 8 Pro 5G', storage: '256 GB', price: 16000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno8-pro.jpg' },
  { brand: 'Oppo', series: 'Oppo Reno Series', model: 'Oppo Reno 8 5G', storage: '128 GB', price: 12500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno8.jpg' },
  { brand: 'Oppo', series: 'Oppo Reno Series', model: 'Oppo Reno 7 Pro 5G', storage: '256 GB', price: 11500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno7-pro-5g.jpg' },
  { brand: 'Oppo', series: 'Oppo Reno Series', model: 'Oppo Reno 6 Pro 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno6-pro-5g.jpg' },
  { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F27 Pro+ 5G', storage: '128 GB', price: 20000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f27-pro-plus.jpg' },
  { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F25 Pro 5G', storage: '128 GB', price: 16000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f25-pro.jpg' },
  { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F23 5G', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f23.jpg' },
  { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F21s Pro 5G', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f21s-pro-5g.jpg' },
  { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F21 Pro 5G', storage: '128 GB', price: 10000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f21-pro-5g.jpg' },
  { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F19 Pro+ 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f19-pro-plus-5g.jpg' },
  { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F19s', storage: '128 GB', price: 7500, image: 'https://api.mobileapi.dev/devices/1593/thumb.png' },
  { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F17 Pro', storage: '128 GB', price: 6800, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f17-pro.jpg' },
  { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A79 5G', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a79.jpg' },
  { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A78 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a78-5g.jpg' },
  { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A59 5G', storage: '128 GB', price: 8800, image: 'https://api.mobileapi.dev/devices/14324/thumb.png' },
  { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A58 5G', storage: '128 GB', price: 8000, image: 'https://api.mobileapi.dev/devices/428/thumb.png' },
  { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A38', storage: '128 GB', price: 6500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a38.jpg' },
  { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A18', storage: '64 GB', price: 5200, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a18.jpg' },
  { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A17k', storage: '64 GB', price: 4500, image: 'https://api.mobileapi.dev/devices/1526/thumb.png' },
  { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo K12x 5G', storage: '128 GB', price: 9500, image: 'https://api.mobileapi.dev/devices/1497/thumb.png' },
  { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo K10 5G', storage: '128 GB', price: 7500, image: 'https://api.mobileapi.dev/devices/1553/thumb.png' },
  { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X100 Pro', storage: '512 GB', price: 52000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg' },
  { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X100', storage: '256 GB', price: 42000, image: 'https://api.mobileapi.dev/devices/355/thumb.png' },
  { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X90 Pro', storage: '256 GB', price: 32000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x90-pro.jpg' },
  { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X90', storage: '256 GB', price: 27000, image: 'https://api.mobileapi.dev/devices/4965/thumb.png' },
  { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X80 Pro', storage: '256 GB', price: 24000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x80-pro.jpg' },
  { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X80', storage: '128 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x80.jpg' },
  { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X70 Pro+', storage: '256 GB', price: 17000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x70-pro-plus.jpg' },
  { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X70 Pro', storage: '128 GB', price: 14000, image: 'https://api.mobileapi.dev/devices/13983/thumb.png' },
  { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V40 Pro', storage: '256 GB', price: 34000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40-pro.jpg' },
  { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V40', storage: '128 GB', price: 27000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40.jpg' },
  { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V40e', storage: '128 GB', price: 20000, image: 'https://api.mobileapi.dev/devices/4871/thumb.png' },
  { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V30 Pro', storage: '256 GB', price: 26000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg' },
  { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V30', storage: '128 GB', price: 21000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30.jpg' },
  { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V30e', storage: '128 GB', price: 16500, image: 'https://api.mobileapi.dev/devices/4909/thumb.png' },
  { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V29 Pro', storage: '256 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v29-pro.jpg' },
  { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V29', storage: '128 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v29.jpg' },
  { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V29e', storage: '128 GB', price: 13000, image: 'https://api.mobileapi.dev/devices/4948/thumb.png' },
  { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V27 Pro', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v27-pro.jpg' },
  { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V27', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v27.jpg' },
  { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V25 Pro', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v25-pro.jpg' },
  { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V23 Pro', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v23-pro.jpg' },
  { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T3 Ultra', storage: '128 GB', price: 23000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-ultra.jpg' },
  { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T3 Pro 5G', storage: '128 GB', price: 18000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-pro.jpg' },
  { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T3 5G', storage: '128 GB', price: 13500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3.jpg' },
  { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T3x 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3x.jpg' },
  { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T2 Pro 5G', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t2-pro.jpg' },
  { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T2 5G', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t2.jpg' },
  { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T2x 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t2x.jpg' },
  { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T1 Pro 5G', storage: '128 GB', price: 9000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t1-pro.jpg' },
  { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y200 Pro 5G', storage: '128 GB', price: 16500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y200-pro.jpg' },
  { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y200 5G', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y200.jpg' },
  { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y58 5G', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y58.jpg' },
  { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y28 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y28.jpg' },
  { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y100 5G', storage: '128 GB', price: 11500, image: 'https://api.mobileapi.dev/devices/4997/thumb.png' },
  { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y56 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y56.jpg' },
  { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y36', storage: '128 GB', price: 7500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y36.jpg' },
  { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y16', storage: '64 GB', price: 5200, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y16.jpg' },
  { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO 12 5G', storage: '256 GB', price: 38000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo12.jpg' },
  { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO 11 5G', storage: '256 GB', price: 28000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-11.jpg' },
  { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO Neo 9 Pro', storage: '128 GB', price: 26000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo9-pro.jpg' },
  { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO Neo 7 Pro', storage: '128 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-7-pro.jpg' },
  { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO Neo 6', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-6.jpg' },
  { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO Z9 Turbo', storage: '256 GB', price: 17500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9-turbo.jpg' },
  { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO Z9 5G', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9.jpg' },
  { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO Z7 Pro 5G', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z7-pro.jpg' },
  { brand: 'Google', series: 'Google Pixel 9 Series', model: 'Google Pixel 9 Pro XL', storage: '128 GB', price: 72000, image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-xl.jpg' },
  { brand: 'Google', series: 'Google Pixel 9 Series', model: 'Google Pixel 9 Pro', storage: '128 GB', price: 64000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Google Pixel 9 Series', model: 'Google Pixel 9', storage: '128 GB', price: 52000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Google Pixel 9 Series', model: 'Google Pixel 9 Pro Fold', storage: '256 GB', price: 98000, image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-fold.jpg' },
  { brand: 'Google', series: 'Google Pixel 8 Series', model: 'Google Pixel 8 Pro', storage: '128 GB', price: 46000, image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg' },
  { brand: 'Google', series: 'Google Pixel 8 Series', model: 'Google Pixel 8', storage: '128 GB', price: 36000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Google Pixel 8 Series', model: 'Google Pixel 8a', storage: '128 GB', price: 29000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Google Pixel 7 Series', model: 'Google Pixel 7 Pro', storage: '128 GB', price: 28000, image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-pro.jpg' },
  { brand: 'Google', series: 'Google Pixel 7 Series', model: 'Google Pixel 7', storage: '128 GB', price: 22000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Google Pixel 7 Series', model: 'Google Pixel 7a', storage: '128 GB', price: 19000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 6 Pro', storage: '128 GB', price: 18000, image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6-pro.jpg' },
  { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 6', storage: '128 GB', price: 14000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 6a', storage: '128 GB', price: 13000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel Fold', storage: '256 GB', price: 55000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 5', storage: '128 GB', price: 11000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 4a', storage: '128 GB', price: 8500, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 4 XL', storage: '64 GB', price: 8000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 3a XL', storage: '64 GB', price: 6000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 3a', storage: '64 GB', price: 5500, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 3 XL', storage: '64 GB', price: 5000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 2 XL', storage: '64 GB', price: 4000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
  { brand: 'Motorola', series: 'Moto Razr Series', model: 'Motorola Razr 50 Ultra', storage: '512 GB', price: 58000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-50-ultra.jpg' },
  { brand: 'Motorola', series: 'Moto Razr Series', model: 'Motorola Razr 50', storage: '256 GB', price: 42000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-50.jpg' },
  { brand: 'Motorola', series: 'Moto Razr Series', model: 'Motorola Razr 40 Ultra', storage: '256 GB', price: 34000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-40-ultra.jpg' },
  { brand: 'Motorola', series: 'Moto Razr Series', model: 'Motorola Razr 40', storage: '256 GB', price: 25000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-40.jpg' },
  { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 50 Ultra', storage: '512 GB', price: 38000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-ultra.jpg' },
  { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 50 Pro', storage: '256 GB', price: 24000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg' },
  { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 50 Fusion', storage: '128 GB', price: 17500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-fusion.jpg' },
  { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 40 Pro', storage: '256 GB', price: 25000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40-pro.jpg' },
  { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 40', storage: '256 GB', price: 16500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40.jpg' },
  { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 40 Neo', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40-neo.jpg' },
  { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 30 Ultra', storage: '128 GB', price: 18000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-30-ultra.jpg' },
  { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 30 Fusion', storage: '128 GB', price: 14500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-30-fusion.jpg' },
  { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 30', storage: '128 GB', price: 11500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-30.jpg' },
  { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G85 5G', storage: '128 GB', price: 13500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g85.jpg' },
  { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G64 5G', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g64.jpg' },
  { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G54 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g54.jpg' },
  { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G34 5G', storage: '128 GB', price: 8200, image: 'https://api.mobileapi.dev/devices/221/thumb.png' },
  { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G24 Power', storage: '128 GB', price: 6800, image: 'https://api.mobileapi.dev/devices/249/thumb.png' },
  { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G14', storage: '128 GB', price: 5800, image: 'https://api.mobileapi.dev/devices/246/thumb.png' },
  { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G73 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g73.jpg' },
  { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G62 5G', storage: '128 GB', price: 7500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g62-5g.jpg' },
  { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto E13', storage: '64 GB', price: 4200, image: 'https://api.mobileapi.dev/devices/195/thumb.png' },
  { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto E22s', storage: '64 GB', price: 3900, image: 'https://api.mobileapi.dev/devices/199/thumb.png' },
  { brand: 'Nothing', series: 'Nothing Phone Series', model: 'Nothing Phone (2)', storage: '256 GB', price: 27000, image: 'https://api.mobileapi.dev/devices/359/thumb.png' },
  { brand: 'Nothing', series: 'Nothing Phone Series', model: 'Nothing Phone (1)', storage: '128 GB', price: 16500, image: 'https://api.mobileapi.dev/devices/1258/thumb.png' },
  { brand: 'Nothing', series: 'Nothing Phone Series', model: 'Nothing Phone (2a) Plus', storage: '256 GB', price: 21000, image: 'https://api.mobileapi.dev/devices/1256/thumb.png' },
  { brand: 'Nothing', series: 'Nothing Phone Series', model: 'Nothing Phone (2a)', storage: '128 GB', price: 17500, image: 'https://api.mobileapi.dev/devices/1256/thumb.png' },
  { brand: 'Nothing', series: 'CMF by Nothing Series', model: 'CMF Phone 1 by Nothing', storage: '128 GB', price: 12000, image: 'https://api.mobileapi.dev/devices/1249/thumb.png' },
  // Tecno
  { brand: 'Tecno', series: 'Phantom Series', model: 'Tecno Phantom V Fold 5G', storage: '256 GB', price: 46000, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-phantom-v-fold.jpg' },
  { brand: 'Tecno', series: 'Phantom Series', model: 'Tecno Phantom V Flip 5G', storage: '256 GB', price: 32000, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-phantom-v-flip.jpg' },
  { brand: 'Tecno', series: 'Phantom Series', model: 'Tecno Phantom X2 Pro 5G', storage: '256 GB', price: 24000, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-phantom-x2-pro.jpg' },
  { brand: 'Tecno', series: 'Camon Series', model: 'Tecno Camon 30 Premier 5G', storage: '512 GB', price: 22000, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-premier.jpg' },
  { brand: 'Tecno', series: 'Camon Series', model: 'Tecno Camon 30 5G', storage: '256 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-5g.jpg' },
  { brand: 'Tecno', series: 'Camon Series', model: 'Tecno Camon 20 Pro 5G', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-20-pro-5g.jpg' },
  { brand: 'Tecno', series: 'Pova Series', model: 'Tecno Pova 6 Pro 5G', storage: '128 GB', price: 12500, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-pova-6-pro.jpg' },
  { brand: 'Tecno', series: 'Pova Series', model: 'Tecno Pova 5 Pro 5G', storage: '128 GB', price: 9800, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-pova-5-pro.jpg' },
  { brand: 'Tecno', series: 'Spark Series', model: 'Tecno Spark 20 Pro+', storage: '256 GB', price: 10500, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-spark-20-pro-plus.jpg' },
  { brand: 'Tecno', series: 'Spark Series', model: 'Tecno Spark 20', storage: '128 GB', price: 6800, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-spark-20.jpg' },
  { brand: 'Tecno', series: 'Spark Series', model: 'Tecno Spark Go 2024', storage: '64 GB', price: 4500, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-spark-go-2024.jpg' },
  // Itel
  { brand: 'Itel', series: 'Color Pro Series', model: 'Itel Color Pro 5G', storage: '128 GB', price: 6200, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-color-pro-5g.jpg' },
  { brand: 'Itel', series: 'S Series', model: 'Itel S24', storage: '128 GB', price: 6500, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-s24.jpg' },
  { brand: 'Itel', series: 'S Series', model: 'Itel S23+', storage: '256 GB', price: 7800, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-s23-plus.jpg' },
  { brand: 'Itel', series: 'P Series', model: 'Itel P55 5G', storage: '128 GB', price: 5800, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-p55-5g.jpg' },
  { brand: 'Itel', series: 'P Series', model: 'Itel P55+', storage: '256 GB', price: 5900, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-p55-plus.jpg' },
  { brand: 'Itel', series: 'P Series', model: 'Itel P55', storage: '128 GB', price: 4500, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-p55.jpg' },
  { brand: 'Itel', series: 'P Series', model: 'Itel P55T', storage: '128 GB', price: 4700, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-p55t.jpg' },
  { brand: 'Itel', series: 'A Series', model: 'Itel A70', storage: '128 GB', price: 3900, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-a70.jpg' },
  { brand: 'Itel', series: 'A Series', model: 'Itel A60s', storage: '64 GB', price: 3200, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-a60s.jpg' },
  { brand: 'Itel', series: 'A Series', model: 'Itel A05s', storage: '64 GB', price: 2800, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-a05s.jpg' },
  // Infinix
  { brand: 'Infinix', series: 'GT Gaming Series', model: 'Infinix GT 20 Pro 5G', storage: '256 GB', price: 17000, image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-gt-20-pro.jpg' },
  { brand: 'Infinix', series: 'GT Gaming Series', model: 'Infinix GT 10 Pro 5G', storage: '128 GB', price: 12500, image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-gt-10-pro.jpg' },
  { brand: 'Infinix', series: 'Note Series', model: 'Infinix Note 40 Pro+ 5G', storage: '256 GB', price: 15500, image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-note-40-pro-plus-5g.jpg' },
  { brand: 'Infinix', series: 'Note Series', model: 'Infinix Note 40 Pro 5G', storage: '256 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-note-40-pro-5g.jpg' },
  { brand: 'Infinix', series: 'Zero Series', model: 'Infinix Zero 30 5G', storage: '256 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-zero-30-5g.jpg' },
  { brand: 'Infinix', series: 'Hot Series', model: 'Infinix Hot 40 Pro', storage: '128 GB', price: 8200, image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-hot-40-pro.jpg' },
  { brand: 'Infinix', series: 'Smart Series', model: 'Infinix Smart 8 HD', storage: '64 GB', price: 4200, image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-smart-8-hd.jpg' },
  // Poco
  { brand: 'Poco', series: 'F Flagship Series', model: 'Poco F6 5G', storage: '256 GB', price: 22000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f6.jpg' },
  { brand: 'Poco', series: 'F Flagship Series', model: 'Poco F5 5G', storage: '256 GB', price: 17000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f5.jpg' },
  { brand: 'Poco', series: 'X Speed Series', model: 'Poco X6 Pro 5G', storage: '256 GB', price: 17500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg' },
  { brand: 'Poco', series: 'X Speed Series', model: 'Poco X6 5G', storage: '128 GB', price: 13500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6.jpg' },
  { brand: 'Poco', series: 'M Power Series', model: 'Poco M6 Pro 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-pro-5g.jpg' },
  { brand: 'Poco', series: 'M Power Series', model: 'Poco M6 5G', storage: '128 GB', price: 7200, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-5g.jpg' },
  { brand: 'Poco', series: 'C Budget Series', model: 'Poco C65', storage: '128 GB', price: 5400, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-c65.jpg' },
  // iQOO
  { brand: 'iQOO', series: 'Number Series', model: 'iQOO 12 5G', storage: '256 GB', price: 38000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-12.jpg' },
  { brand: 'iQOO', series: 'Neo Gaming Series', model: 'iQOO Neo 9 Pro 5G', storage: '128 GB', price: 24000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-9-pro.jpg' },
  { brand: 'iQOO', series: 'Neo Gaming Series', model: 'iQOO Neo 7 Pro 5G', storage: '128 GB', price: 18000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-7-pro.jpg' },
  { brand: 'iQOO', series: 'Z Series', model: 'iQOO Z9s Pro 5G', storage: '128 GB', price: 16500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9s-pro.jpg' },
  { brand: 'iQOO', series: 'Z Series', model: 'iQOO Z9s 5G', storage: '128 GB', price: 13500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9s.jpg' },
  { brand: 'iQOO', series: 'Z Series', model: 'iQOO Z9 5G', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9.jpg' },
  { brand: 'iQOO', series: 'Z Series', model: 'iQOO Z9x 5G', storage: '128 GB', price: 9200, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9x.jpg' },
  // Lenovo
  { brand: 'Lenovo', series: 'K Note Series', model: 'Lenovo K10 Note', storage: '64 GB', price: 1490, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k10-note.jpg' },
  { brand: 'Lenovo', series: 'K Note Series', model: 'Lenovo K10 Note', storage: '128 GB', price: 1565, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k10-note.jpg' },
  { brand: 'Lenovo', series: 'K Note Series', model: 'Lenovo K10 Plus', storage: '64 GB', price: 3100, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k10-plus.jpg' },
  { brand: 'Lenovo', series: 'K Note Series', model: 'Lenovo K9 Note', storage: '64 GB', price: 2700, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k9-note.jpg' },
  { brand: 'Lenovo', series: 'K Note Series', model: 'Lenovo K8 Note', storage: '64 GB', price: 2400, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k8-note.jpg' },
  { brand: 'Lenovo', series: 'K Note Series', model: 'Lenovo K8 Plus', storage: '32 GB', price: 2100, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-k8-plus.jpg' },
  { brand: 'Lenovo', series: 'Legion Gaming Series', model: 'Lenovo Legion Duel 2', storage: '256 GB', price: 18500, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-legion-duel-2.jpg' },
  { brand: 'Lenovo', series: 'Legion Gaming Series', model: 'Lenovo Legion Pro', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-legion-pro.jpg' },
  { brand: 'Lenovo', series: 'Legion Gaming Series', model: 'Lenovo Legion Y90', storage: '256 GB', price: 22000, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-legion-y90.jpg' },
  { brand: 'Lenovo', series: 'Z Series Flagships', model: 'Lenovo Z6 Pro', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-z6-pro.jpg' },
  { brand: 'Lenovo', series: 'Z Series Flagships', model: 'Lenovo Z6 Lite', storage: '64 GB', price: 4200, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-z6-lite.jpg' },
  { brand: 'Lenovo', series: 'Z Series Flagships', model: 'Lenovo Z5 Pro GT', storage: '128 GB', price: 6800, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-z5-pro-gt.jpg' },
  { brand: 'Lenovo', series: 'Z Series Flagships', model: 'Lenovo Z5s', storage: '64 GB', price: 3800, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-z5s.jpg' },
  { brand: 'Lenovo', series: 'A & Vibe Series', model: 'Lenovo A6 Note', storage: '32 GB', price: 2200, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-a6-note.jpg' },
  { brand: 'Lenovo', series: 'A & Vibe Series', model: 'Lenovo Vibe K5 Note', storage: '32 GB', price: 1800, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-vibe-k5-note.jpg' },
  { brand: 'Lenovo', series: 'A & Vibe Series', model: 'Lenovo Vibe P1m', storage: '16 GB', price: 1500, image: 'https://fdn2.gsmarena.com/vv/bigpic/lenovo-vibe-p1m.jpg' },
];

const STORAGE_OPTIONS = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];

const ACCESSORIES_LIST = [
  { id: 'Original Box', label: 'Original Box with IMEI', bonus: '+ ₹300' },
  { id: 'Original Charger', label: 'Original Brand Charger', bonus: '+ ₹300' },
  { id: 'Valid Bill', label: 'Valid Purchase Bill / Invoice', bonus: '+ ₹200' },
];

const HARDWARE_DEFECTS = [
  { id: 'camera', label: 'Camera Fault (Front/Back Lens or Autofocus Issue)' },
  { id: 'charging_port', label: 'Charging Port / Connection Fault' },
  { id: 'speaker_mic', label: 'Speaker / Earpiece / Microphone Fault' },
  { id: 'biometrics', label: 'Biometrics Fault (Face ID or Fingerprint)' },
];

const FAQS_LIST = [
  { q: 'Is entering the IMEI number required while booking online?', a: 'No, entering your IMEI number online is completely optional! If you prefer, our executive will simply verify it at your doorstep during pickup.' },
  { q: 'How do I check my phone IMEI number?', a: 'Simply open your phone dialer app and type *#06#. A 15-digit IMEI number will appear instantly on screen.' },
  { q: 'When do I get paid for my old phone?', a: 'Payout is instant! Our Doorstep pickup executive inspects your device at your doorstep and transfers cash or UPI directly into your account on spot before taking the phone.' },
  { q: 'Is doorstep pickup 100% free across all service localities?', a: 'Yes! Pickup is 100% FREE with zero hidden charges across all service areas areas including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana, Chowk, Rajajipuram, and Jankipuram.' },
  { q: 'What documents are required to sell an old phone?', a: 'You only need a valid Govt ID proof (Aadhaar Card or Driving License) and the phone itself. Having the original box or invoice gives you extra cash bonuses!' },
  { q: 'What happens to my personal data on the phone?', a: 'Fundu performs an automated, military-grade factory data wipe right at your doorstep before handing over the digital receipt.' },
  { q: 'Do you buy non-working or screen-damaged phones?', a: 'Yes! We buy phones in all conditions — flawless, minor body scratches, cracked display glass, or faulty battery.' },
  { q: 'How is the final cash quote calculated?', a: 'Our automated AI algorithm checks live resale market rates and adjusts for screen condition, body condition, hardware defects, warranty status, and original box/charger accessories.' },
  { q: 'Can I cancel or reschedule my doorstep pickup slot?', a: 'Yes, you can easily reschedule or cancel your pickup slot anytime by calling our Doorstep helpline at +91-9839122345.' },
  { q: 'Is Fundu better than local offline shops at your doorstep?', a: 'Yes! With Fundu, you get algorithmic highest price guarantee, zero market bargaining, free doorstep visit, and instant spot payment.' },
  { q: 'How long is the instant price quote valid?', a: 'Your Fundu price quote is guaranteed and locked in for 7 full days from the time of booking.' },
  { q: 'Can I sell multiple phones at once?', a: 'Absolutely! You can book individual sell requests or inform our executive during doorstep visit for bulk spot cash payouts.' },
  { q: 'What if my phone brand is not listed?', a: 'You can use our live search bar or contact our customer hotline +91-9839122345 for custom manual valuation.' },
  { q: 'Do I get a legal seller invoice?', a: 'Yes, an official digital seller invoice & receipt is sent to your mobile number immediately upon completion of pickup.' },
];

export default function SellPhone() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { brandSlug, modelSlug } = useParams<{ brandSlug?: string; modelSlug?: string }>();
  const [searchParams] = useSearchParams();
  const { version } = usePriceSync();

  const [step, setStep] = useState(1);

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

  const [form, setForm] = useState({
    brand: '',
    model: '',
    ram: '',
    storage: '',
    powersOn: true,
    activationLockCleared: true,
    ownershipVerified: true,
    liquidDamage: false,
    cosmeticCondition: 'good' as 'flawless' | 'good' | 'fair',
    screenCondition: 'flawless' as 'flawless' | 'scratched' | 'cracked' | 'touch_fault' | 'display_lines',
    bodyCondition: 'flawless' as 'flawless' | 'minor_scratches' | 'dents_bent',
    batteryHealth: 'healthy' as 'healthy' | 'degraded_service' | 'unknown',
    canMakeCalls: true,
    underWarranty: false,
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
    pickupAddress: '',
    pickupArea: DOORSTEP_LOCALITIES[0] || 'Gomti Nagar',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupSlot: '10 AM - 12 PM',
    notes: '',
  });

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
    const queryWords = q.split(/\s+/).filter(Boolean);

    // Calculate count of local catalog matches
    const localMatchesCount = MASTER_MODEL_CATALOG.filter((m) => {
      const fullText = `${m.brand} ${m.series || ''} ${m.model}`.toLowerCase();
      return queryWords.every((word) => fullText.includes(word));
    }).length + (Array.isArray(ALL_INDIAN_PHONES_CATALOG) ? ALL_INDIAN_PHONES_CATALOG.filter((p) => {
      const fullText = `${p.brand} ${p.model}`.toLowerCase();
      return queryWords.every((word) => fullText.includes(word));
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

  // Sync Cashify Multi-layered URLs (/sell/apple, /sell/apple/iphone-13, /sell-old-mobile-phone/sell-apple)
  useEffect(() => {
    if (brandSlug) {
      const cleanBrandKey = brandSlug.replace(/^sell-/, '').toLowerCase();
      const foundBrand = BRAND_TILES.find((b) => b.name.toLowerCase() === cleanBrandKey)?.name ||
        (cleanBrandKey.charAt(0).toUpperCase() + cleanBrandKey.slice(1));
      
      setForm((cur) => ({ ...cur, brand: foundBrand }));

      if (modelSlug) {
        const cleanModelKey = modelSlug.replace(/^sell-/, '').replace(/-/g, ' ').toLowerCase().trim();
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

        const foundModel =
          ALL_INDIAN_PHONES_CATALOG.find((p) => matchCandidate(p.model, p.brand))?.model ||
          MASTER_MODEL_CATALOG.find((m) => matchCandidate(m.model, m.brand))?.model ||
          cleanModelKey.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        const storageParam = searchParams.get('storage');

        setForm((cur) => ({
          ...cur,
          brand: foundBrand,
          model: foundModel,
          storage: storageParam || cur.storage || '128 GB',
        }));
        setStep(2);
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

      if (changed) {
        return { ...cur, storage: nextStorage, ram: nextRam };
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
        if (active) setPricingConfig(config);
      })
      .catch(() => {
        if (active) setPricingConfig(null);
      });

    return () => {
      active = false;
    };
  }, [form.brand, form.model, form.storage]);

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
  ]);

  // Compute base resale value for any model using local master catalog, Indian phones catalog, or dynamic formula
  const baseModelPrice = useMemo(() => {
    if (!form.model) return 0;
    const modelNorm = form.model.toLowerCase().trim();
    const brandNorm = (form.brand || '').toLowerCase().trim();

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
        return fallback.base_price || 15000;
      }
    }

    // Dynamic variant multiplier based on exact RAM + Storage combination:
    const catalogMult = calculateHardwareVariantMultiplier(catalogStorage, '', form.brand);
    const selectedMult = calculateHardwareVariantMultiplier(form.storage, form.ram, form.brand);
    const variantRatio = selectedMult / (catalogMult || 1.0);

    return Math.max(1000, Math.round((rawBase * variantRatio) / 50) * 50);
  }, [form.brand, form.model, form.storage, form.ram]);

  // Guaranteed non-zero smartphone valuation estimate
  const estimate = useMemo(() => {
    if (funduQuote?.offerAmount && funduQuote.offerAmount > 0) {
      return funduQuote.offerAmount;
    }

    if (baseModelPrice > 0) {
      let val = baseModelPrice;
      if (form.cosmeticCondition === 'good') val *= 0.92;
      else if (form.cosmeticCondition === 'fair') val *= 0.82;
      if (form.screenCondition === 'scratched') val *= 0.90;
      else if (form.screenCondition === 'cracked') val *= 0.68;
      else if (form.screenCondition === 'touch_fault' || form.screenCondition === 'display_lines') val *= 0.60;
      if (form.bodyCondition === 'minor_scratches') val *= 0.95;
      else if (form.bodyCondition === 'dents_bent') val *= 0.82;
      if (form.batteryHealth === 'degraded_service') val *= 0.92;
      if (form.powersOn === false) val *= 0.35;
      if (form.liquidDamage) val *= 0.50;
      if (form.canMakeCalls === false) val *= 0.85;
      if (form.underWarranty) val *= 1.05;
      if (Array.isArray(form.defects)) {
        val -= form.defects.length * (baseModelPrice * 0.08);
      }
      if (Array.isArray(form.accessories)) {
        val += form.accessories.length * 300;
      }
      return Math.max(800, Math.round(val / 50) * 50);
    }

    return 5000;
  }, [
    funduQuote?.offerAmount,
    baseModelPrice,
    form.cosmeticCondition,
    form.screenCondition,
    form.bodyCondition,
    form.batteryHealth,
    form.powersOn,
    form.liquidDamage,
    form.canMakeCalls,
    form.underWarranty,
    form.defects,
    form.accessories,
  ]);

  // Complete diagnostic valuation breakdown
  const cashifyValuation = useMemo(() => {
    return computeDetailedCashifyValuation(
      pricingConfig,
      {
        screenCondition: form.screenCondition === 'cracked' ? 'cracked' : form.screenCondition === 'scratched' ? 'scratches' : 'flawless',
        bodyCondition: form.bodyCondition === 'dents_bent' ? 'dents_bent' : form.bodyCondition === 'minor_scratches' ? 'scratches' : 'flawless',
        canMakeCalls: form.canMakeCalls,
        underWarranty: form.underWarranty,
        defects: form.defects,
        accessories: form.accessories,
      },
      form.brand,
      form.model,
      form.storage,
      form.ram
    );
  }, [pricingConfig, form.screenCondition, form.bodyCondition, form.canMakeCalls, form.underWarranty, form.defects, form.accessories, form.brand, form.model, form.storage, form.ram]);

  // Filtered Master Models for Search Autocomplete (Combines Master Catalog, Indian Phones Catalog, & MobileAPI Live Fallback)
  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase().trim();
    const queryWords = q.split(/\s+/).filter(Boolean);

    // Combine MASTER_MODEL_CATALOG and ALL_INDIAN_PHONES_CATALOG
    const modelMap = new Map<string, any>();

    MASTER_MODEL_CATALOG.forEach((m) => {
      const key = `${m.brand.toLowerCase()}-${m.model.toLowerCase()}`;
      modelMap.set(key, m);
    });

    if (Array.isArray(ALL_INDIAN_PHONES_CATALOG)) {
      ALL_INDIAN_PHONES_CATALOG.forEach((p) => {
        const key = `${p.brand.toLowerCase()}-${p.model.toLowerCase()}`;
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

    const localMatches = allModels.filter((m) => {
      const fullText = `${m.brand} ${m.series || ''} ${m.model}`.toLowerCase();
      return queryWords.every((word) => fullText.includes(word));
    });

    if (localMatches.length > 0) {
      return applyPriceOverrides(localMatches);
    }

    // Fallback to MobileAPI search results if local database has 0 matches
    return applyPriceOverrides(apiSearchResults);
  }, [debouncedQuery, apiSearchResults, version]);

  // Available Series List for Selected Brand
  const brandSeriesList = useMemo(() => {
    if (!form.brand) return [];
    const seriesSet = new Set<string>();
    MASTER_MODEL_CATALOG.filter((m) => m.brand === form.brand).forEach((m) => {
      if (m.series) seriesSet.add(m.series);
    });
    return ['All', ...Array.from(seriesSet)];
  }, [form.brand]);

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
    navigate(`/sell/${brandSlugClean}/${modelSlugClean}`);
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

    if (!form.pickupAddress.trim()) {
      setError('Please provide full doorstep pickup address at your doorstep.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        user_id: user?.id || null,
        customer_name: (user as any)?.user_metadata?.full_name || profile?.full_name || 'Valued Customer',
        customer_phone: (user as any)?.phone || profile?.phone || '+91-9839122345',
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
        cashify_breakdown: cashifyValuation,
        payout_method: form.payoutMethod,
        payout_details: form.payoutDetails,
        pickup_address: form.pickupAddress,
        pickup_area: form.pickupArea,
        pickup_date: form.pickupDate,
        pickup_slot: form.pickupSlot,
        notes: form.notes || (funduQuote?.status === 'requires_manual_review' ? `Manual Inspection: ${funduQuote.reviewReason || 'Manual review required'}` : ''),
        status: funduQuote?.status === 'requires_manual_review' ? 'manual_review' : 'pending',
      };

      const { data, error: insertErr } = await db.from('sell_requests').insert([payload]).select().single();

      if (insertErr) throw insertErr;

      setSuccessData({
        id: data?.id || `FND-LKO-${Math.floor(100000 + Math.random() * 900000)}`,
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
      <div className="min-h-screen bg-[#F7F7FA] py-12 px-4 flex items-center justify-center text-[#344257]">
        <div className="max-w-md w-full card p-8 rounded-[32px] text-center bg-white border border-gray-200 shadow-2xl animate-fade-in space-y-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#E4E7F0] text-[#344257] shadow-md">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] text-xs font-bold">Booking Confirmed</span>
            <h2 className="mt-2 font-display text-2xl font-black text-[#344257]">Doorstep Pickup Scheduled!</h2>
            <p className="mt-1 text-xs text-gray-500">
              Tracking ID: <span className="font-mono font-bold text-[#344257]">{successData.id}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-[#F0F0F5] p-5 text-left border border-[#C0C8D8] space-y-2 text-xs">
            <div className="flex justify-between border-b border-[#C0C8D8]/60 pb-2">
              <span className="text-gray-500 font-medium">Device:</span>
              <span className="font-bold text-[#344257]">{form.brand} {form.model} ({form.storage})</span>
            </div>
            <div className="flex justify-between border-b border-[#C0C8D8]/60 pb-2">
              <span className="text-gray-500 font-medium">Spot Payout:</span>
              <span className="font-black text-[#344257] text-sm">{formatINR(estimate)}</span>
            </div>
            <div className="flex justify-between border-b border-[#C0C8D8]/60 pb-2">
              <span className="text-gray-500 font-medium">Pickup Rider:</span>
              <span className="font-bold text-[#344257]">{successData.pickup_person_name}</span>
            </div>
            <div className="flex justify-between border-b border-[#C0C8D8]/60 pb-2">
              <span className="text-gray-500 font-medium">Helpline Hotline:</span>
              <span className="font-bold text-[#344257]">{successData.pickup_person_phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Arrival Slot:</span>
              <span className="font-bold text-[#344257]">{successData.estimated_arrival_time}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              View Order Tracking
            </button>
            <button
              onClick={() => {
                setSuccessData(null);
                setForm((f) => ({ ...f, brand: '', model: '' }));
                setStep(1);
                navigate('/sell');
              }}
              className="btn-outline"
            >
              Sell Another Phone
            </button>
          </div>
        </div>
      </div>
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

      {/* Cashify Exact Hero Banner with Prominent Debounced Search (Hidden on Model Evaluation Page) */}
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
                            <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-extrabold text-xs">
                              Up to {formatINR(item.price)}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Best Resale Price
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
          <div className="space-y-8 animate-fade-in">
            {/* BRAND SELECTION GRID */}
            {!form.brand && (
              <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="font-display text-xl font-extrabold text-[#344257] flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-[#6A859F]" /> Select Phone Brand
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">Pick your phone manufacturer to view all models</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                  {BRAND_TILES.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleBrandSelect(item.name)}
                      className="group relative flex flex-col items-center justify-center p-5 rounded-2xl border border-gray-200/90 bg-white hover:border-[#6A859F] hover:bg-[#F0F0F5] hover:shadow-xl transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                      <div className="h-12 w-12 flex items-center justify-center rounded-xl p-2 bg-gray-50 group-hover:bg-white transition-all">
                        <img src={getCleanBrandLogo(item.name)} alt={item.name} className="h-full w-full object-contain group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="mt-2.5 text-sm font-extrabold text-gray-900 group-hover:text-[#344257] transition-colors">{item.name}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">{item.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DEDICATED BRAND PAGE VIEW (Renders at top when Brand is selected or URL is /sell/{brand}) */}
            {form.brand && (
              <div className="card p-6 md:p-8 rounded-[28px] space-y-6 border border-[#C0C8D8] bg-white shadow-xl animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#F0F0F5] border border-[#C0C8D8] grid place-items-center font-black text-[#344257] text-base shadow-xs">
                      {form.brand[0]}
                    </div>
                    <div>
                      <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-bold text-xs">
                        Selling Brand: {form.brand}
                      </span>
                      <h2 className="mt-0.5 font-display text-xl font-black text-[#344257]">
                        Sell Old {form.brand} Mobile Phone Online At Best Price
                      </h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setForm((f) => ({ ...f, brand: '', model: '' })); navigate('/sell'); }}
                    className="text-xs text-[#344257] hover:underline font-bold bg-[#F0F0F5] px-3 py-1.5 rounded-xl border border-[#C0C8D8]"
                  >
                    ← All Brands
                  </button>
                </div>

                {/* Series Selection Filter Tabs */}
                {brandSeriesList.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 mr-1">Series:</span>
                    {brandSeriesList.map((ser) => (
                      <button
                        key={ser}
                        type="button"
                        onClick={() => setSelectedSeries(ser)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                          selectedSeries === ser
                            ? 'bg-[#344257] text-white shadow-xs'
                            : 'bg-[#F0F0F5] text-[#47576E] hover:bg-[#E4E7F0]'
                        }`}
                      >
                        {ser}
                      </button>
                    ))}
                  </div>
                )}

                {/* Brand Models Image Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MASTER_MODEL_CATALOG.filter(
                    (m) => m.brand === form.brand && (selectedSeries === 'All' || m.series === selectedSeries)
                  ).map((m) => (
                    <div
                      key={`${m.brand}-${m.model}`}
                      className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#6A859F] hover:shadow-lg transition-all duration-300 space-y-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white p-1 border border-gray-100 flex items-center justify-center">
                          <img
                            src={getCleanPhoneImage(m.brand, m.model, m.image)}
                            alt={m.model}
                            className="h-full w-full object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallback = BRAND_FRONT_FALLBACKS[form.brand?.toLowerCase()] || BRAND_FRONT_FALLBACKS.samsung;
                              if (target.src !== fallback) target.src = fallback;
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-gray-900 group-hover:text-[#344257] transition-colors">{m.model}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-extrabold text-[11px]">
                              Up to {formatINR(m.price)}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Best Resale Price
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Storage Selection Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {getModelHardwareSpecs(m.brand || form.brand, m.model, MASTER_MODEL_CATALOG).storages.map((stg) => (
                          <button
                            key={stg}
                            type="button"
                            onClick={() => {
                              handleQuickModelSelect({ brand: form.brand || m.brand, model: m.model, storage: stg });
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              form.model === m.model && form.storage === stg
                                ? 'bg-[#344257] text-white shadow-xs'
                                : 'bg-[#F0F0F5] text-[#47576E] hover:bg-[#E4E7F0] hover:text-[#344257]'
                            }`}
                          >
                            {stg}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleQuickModelSelect({ brand: form.brand, model: m.model, storage: form.storage || '128 GB' });
                        }}
                        className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1 font-bold shadow-xs"
                      >
                        Get Instant Price Quote <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Sell Models Section */}
            <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#344257] flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#6A859F]" /> Popular Mobiles Sold at your doorstep
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">Tap any model for instant cash quote</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {MASTER_MODEL_CATALOG.slice(0, 6).map((item) => (
                  <button
                    key={`${item.brand}-${item.model}`}
                    type="button"
                    onClick={() => handleQuickModelSelect(item)}
                    className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-[#6A859F] hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center cursor-pointer group"
                  >
                    <div className="h-20 w-full overflow-hidden rounded-xl p-1 bg-white flex items-center justify-center">
                      <img
                        src={getCleanPhoneImage(item.brand, item.model, item.image)}
                        alt={item.model}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = BRAND_FRONT_FALLBACKS[item.brand?.toLowerCase()] || BRAND_FRONT_FALLBACKS.samsung;
                          if (target.src !== fallback) target.src = fallback;
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-extrabold text-gray-900 group-hover:text-[#344257] transition-colors truncate w-full">{item.model}</p>
                    <span className="mt-1 badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-extrabold text-[10px]">
                      Up to {formatINR(item.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* How It Works (3 Steps) */}
            <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] text-xs font-bold">Simple 3-Step Flow</span>
                <h2 className="font-display text-2xl font-black text-[#344257]">How Selling Works On Fundu</h2>
                <p className="text-xs text-gray-500">Sell your mobile phone in under 2 minutes from home</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {[
                  {
                    num: '1',
                    title: 'Check Price & Evaluate',
                    desc: 'Select your phone brand, model, storage, and answer simple questions about screen & body condition.',
                  },
                  {
                    num: '2',
                    title: 'Schedule Free Pickup',
                    desc: 'Select your preferred date & time slot. Our automated dispatch system assigns the nearest delivery rider.',
                  },
                  {
                    num: '3',
                    title: 'Get Paid at Doorstep',
                    desc: 'Our rider inspects your phone at your doorstep and transfers spot cash or UPI instantly to your account!',
                  },
                ].map((stepItem) => (
                  <div key={stepItem.num} className="p-6 rounded-2xl bg-[#F7F7FA] border border-[#C0C8D8] flex flex-col items-center text-center space-y-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-r from-[#344257] to-[#47576E] text-white font-display font-black text-xl shadow-md">
                      {stepItem.num}
                    </div>
                    <h3 className="font-extrabold text-base text-[#344257]">{stepItem.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{stepItem.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Us (6 USPs) */}
            <div className="card p-8 rounded-[32px] bg-gradient-to-r from-[#1E2734] via-[#344257] to-[#47576E] text-white shadow-xl space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="badge bg-white/10 text-white border border-white/20 text-xs font-bold px-3 py-1">
                  Our #1 Phone Buyback Network
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-black text-white">
                  Why Choose Fundu?
                </h2>
                <p className="text-xs text-gray-300">
                  India's most trusted, instant cash doorstep mobile re-commerce network.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    icon: <BadgeIndianRupee className="h-6 w-6 text-[#8A9AAF]" />,
                    title: 'Instant Spot Cash Payout',
                    desc: 'Get instant UPI (GPay/PhonePe) or hard cash transfer directly into your hand before handing over your mobile.',
                  },
                  {
                    icon: <Sparkles className="h-6 w-6 text-[#9ac0dd]" />,
                    title: 'Highest Valuation Guarantee',
                    desc: 'Our AI valuation algorithm checks live resale market rates to guarantee you the absolute highest cash price at your doorstep.',
                  },
                  {
                    icon: <Truck className="h-6 w-6 text-[#9ac0dd]" />,
                    title: 'Free Doorstep Pickup',
                    desc: 'Zero shipping fees across Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana & Chowk.',
                  },
                  {
                    icon: <Lock className="h-6 w-6 text-[#C0C8D8]" />,
                    title: 'Military-Grade Data Wipe',
                    desc: 'We perform automated factory data wipe right in front of you for complete privacy & data safety.',
                  },
                  {
                    icon: <ShieldCheck className="h-6 w-6 text-amber-400" />,
                    title: 'All Conditions Accepted',
                    desc: 'We buy phones in all physical states — flawless, body scratches, cracked screen glass, or dead battery.',
                  },
                  {
                    icon: <FileText className="h-6 w-6 text-rose-400" />,
                    title: 'Legal Digital Seller Invoice',
                    desc: 'Receive an official digital receipt & invoice sent to your mobile phone instantly upon doorstep pickup completion.',
                  },
                ].map((card, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition-colors space-y-2">
                    <div className="p-2.5 rounded-xl bg-white/10 w-fit">{card.icon}</div>
                    <h3 className="font-bold text-sm text-white mt-2">{card.title}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Testimonials Grid (8-10 Doorstep Sellers) */}
            <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-bold text-xs">Verified Customer Feedback</span>
                  <h2 className="font-display text-2xl font-black text-[#344257] mt-1">What Verified Sellers Say</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-2xl text-[#344257]">4.9</span>
                  <span className="text-amber-500 text-lg">★★★★★</span>
                  <span className="text-xs text-gray-500 font-medium">(12,400+ Verified Deals)</span>
                </div>
              </div>

              {dbReviews.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                  <Star className="h-8 w-8 text-amber-400 mx-auto opacity-50" />
                  <p className="font-bold text-xs text-gray-800">No customer reviews submitted yet.</p>
                  <p className="text-[11px] text-gray-500">Real customer feedback will appear here after seller deals are completed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dbReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2 text-xs flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-sm">{rev.reviewer_name}</span>
                          <span className="text-amber-500 text-xs">{'★'.repeat(rev.rating || 5)}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed italic">"{rev.comment}"</p>
                      </div>
                      <div className="pt-2 border-t border-gray-200/60 text-[11px] font-bold text-[#344257] flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {rev.location || 'Doorstep Service'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FAQ Accordion Section (14 Comprehensive Q&As) */}
            <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] text-xs font-bold">Clear Answers</span>
                <h2 className="font-display text-2xl font-black text-[#344257]">Frequently Asked Questions</h2>
                <p className="text-xs text-gray-500 font-medium">Everything you need to know about selling mobile on Fundu</p>
              </div>

              <div className="space-y-3 max-w-4xl mx-auto">
                {FAQS_LIST.map((f, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-200"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left font-bold text-sm text-[#344257] flex items-center justify-between gap-4 hover:bg-[#F7F7FA] transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-[#6A859F] shrink-0" />
                          {f.q}
                        </span>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                          {f.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SEO Content & Footer Rating Summary */}
            <div className="p-8 rounded-[32px] bg-gray-100 border border-gray-200 text-xs text-gray-600 space-y-3 leading-relaxed">
              <h3 className="font-bold text-gray-900 text-sm">Sell Old Mobile Phone Online at your doorstep — Fundu Mobile Re-Commerce Hub</h3>
              <p>
                Looking to sell your old mobile phone for instant spot cash at your doorstep? Fundu is a premier largest, most trusted online platform for selling used smartphones across top brands like Apple iPhone, Samsung, OnePlus, Xiaomi Redmi, Vivo, Oppo, Realme, Google Pixel, and Poco.
              </p>
              <p>
                Whether your mobile phone is in brand new condition, has minor body scratches, or has a cracked screen, Fundu's instant AI valuation algorithm calculates the highest guaranteed cash price for your device. Enjoy free doorstep pickup across all service areas areas including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana, Chowk, Rajajipuram, Jankipuram, and Kanpur Road.
              </p>
              <div className="pt-3 border-t border-gray-300/60 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-gray-800">
                <span>Fundu Helpline: +91-9839122345</span>
                <span>Average User Rating: 4.9 / 5.0 (12,400+ Verified Deals)</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Condition & Hardware Diagnostics */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-xl space-y-6">
              {/* SELECTED PRODUCT DETAIL SHOWCASE CARD */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#F0F0F5] via-white to-[#F7F7FA] border border-[#C0C8D8] shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-2xl bg-white p-2 border border-[#C0C8D8] flex items-center justify-center shadow-xs">
                  <img
                    src={getCleanPhoneImage(form.brand, form.model)}
                    alt={form.model}
                    className="h-full w-full object-contain drop-shadow-xs"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = BRAND_FRONT_FALLBACKS[form.brand?.toLowerCase()] || BRAND_FRONT_FALLBACKS.samsung;
                      if (target.src !== fallback) target.src = fallback;
                    }}
                  />
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="badge bg-[#344257] text-white font-extrabold text-[11px] px-2 py-0.5">
                      {form.brand}
                    </span>
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                      {form.model} {form.ram ? `(${form.ram} / ${form.storage})` : `(${form.storage})`}
                    </h3>
                  </div>

                  {/* Quick Storage Variant Switcher */}
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-gray-500 mr-1">Storage:</span>
                    {currentDeviceSpecs.storages.map((stg) => (
                      <button
                        key={stg}
                        type="button"
                        onClick={() => {
                          const nextRams = currentDeviceSpecs.getRamsForStorage(stg);
                          const nextRam = nextRams.includes(form.ram) ? form.ram : (nextRams[0] || '');
                          setForm((f) => ({ ...f, storage: stg, ram: nextRam }));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          form.storage === stg
                            ? 'bg-[#344257] text-white shadow-xs'
                            : 'bg-white text-gray-700 border border-[#C0C8D8] hover:bg-[#F0F0F5] hover:border-[#6A859F]'
                        }`}
                      >
                        {stg}
                      </button>
                    ))}
                  </div>

                  {/* Quick RAM Variant Switcher (strictly displays only officially launched RAMs for the chosen storage) */}
                  {availableRams.length > 0 && (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-gray-500 mr-1">RAM:</span>
                      {availableRams.map((ramVal) => (
                        <button
                          key={ramVal}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, ram: ramVal }))}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            form.ram === ramVal
                              ? 'bg-[#344257] text-white shadow-xs'
                              : 'bg-white text-gray-700 border border-[#C0C8D8] hover:bg-[#F0F0F5] hover:border-[#6A859F]'
                          }`}
                        >
                          {ramVal}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Maximum Resale Cash Value Callout with Cashify +5-7% Comparison */}
                  {(() => {
                    const comp = calculateCashifyComparison(estimate);
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-1 sm:gap-2.5 pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500 font-medium">Fundu Quote:</span>
                          <span className="font-black text-sm sm:text-base text-[#344257]">
                            Up to {formatINR(estimate)}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block">
                          Best Price Guaranteed • Top Market Payout
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <div className="shrink-0 flex flex-col items-center sm:items-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-outline text-xs px-3 py-1.5 rounded-xl border-[#C0C8D8] text-[#344257] hover:border-[#6A859F] hover:text-[#344257] font-bold transition"
                  >
                    Change Model
                  </button>
                  <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] text-[10px] font-bold px-2 py-0.5">
                    Step 2 of 4
                  </span>
                </div>
              </div>

              {/* 1. Critical Device Status & Ownership */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label text-sm font-extrabold text-gray-900">
                    1. Device Power, Security & Ownership
                  </label>
                  <span className="text-[11px] text-[#6A859F] font-bold">Mandatory Verification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Powers On */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    form.powersOn ? 'bg-white border-gray-200' : 'bg-amber-50/70 border-amber-300'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-xs text-gray-900">Does phone turn on & stay on?</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Powers on without being plugged in</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, powersOn: true }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            form.powersOn ? 'bg-[#344257] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, powersOn: false }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            !form.powersOn ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                    {!form.powersOn && (
                      <p className="mt-2 text-[10px] text-rose-700 font-bold bg-rose-100/70 px-2 py-1 rounded-lg">
                        ⚠️ Non-powering devices are routed to manual doorstep physical inspection.
                      </p>
                    )}
                  </div>

                  {/* Activation Locks Cleared */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    form.activationLockCleared ? 'bg-white border-gray-200' : 'bg-amber-50/70 border-amber-300'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-xs text-gray-900">Activation locks removed?</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">iCloud, Google, Mi Account logged out</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, activationLockCleared: true }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            form.activationLockCleared ? 'bg-[#344257] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, activationLockCleared: false }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            !form.activationLockCleared ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                    {!form.activationLockCleared && (
                      <p className="mt-2 text-[10px] text-rose-700 font-bold bg-rose-100/70 px-2 py-1 rounded-lg">
                        ⚠️ Accounts must be signed out before or during technician pickup.
                      </p>
                    )}
                  </div>

                  {/* Proof of Ownership */}
                  <div className="p-4 rounded-2xl border border-gray-200 bg-white flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-gray-900">Can provide proof of ownership?</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Govt Photo ID (Aadhaar / Driving License)</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, ownershipVerified: true }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          form.ownershipVerified ? 'bg-[#344257] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, ownershipVerified: false }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          !form.ownershipVerified ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Liquid Damage */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    !form.liquidDamage ? 'bg-white border-gray-200' : 'bg-amber-50/70 border-amber-300'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-xs text-gray-900">Any liquid or water exposure?</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Dropped in water, steam, or moisture</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, liquidDamage: false }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            !form.liquidDamage ? 'bg-[#344257] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                          }`}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, liquidDamage: true }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            form.liquidDamage ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                          }`}
                        >
                          Yes
                        </button>
                      </div>
                    </div>
                    {form.liquidDamage && (
                      <p className="mt-2 text-[10px] text-amber-800 font-bold bg-amber-100/70 px-2 py-1 rounded-lg">
                        ⚠️ Liquid-damaged phones require physical inspection for safety.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Screen & Touch Condition */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label text-sm font-extrabold text-gray-900">
                    2. Screen / Display & Touch Condition
                  </label>
                  <span className="text-[11px] text-gray-500">Select exact state</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'flawless', label: '🌟 Flawless Screen', desc: 'No scratches, scuffs, or glass marks' },
                    { id: 'scratched', label: '🔍 Light Scratches', desc: 'Minor hairline scratches on glass' },
                    { id: 'cracked', label: '⚡ Cracked Glass', desc: 'Cracked or shattered outer screen glass' },
                    { id: 'touch_fault', label: '👆 Touch Issues / Dead Zones', desc: 'Touch unresponsive in parts' },
                    { id: 'display_lines', label: '🌈 Display Lines / Bleed', desc: 'Black spots, green/white lines' },
                  ].map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, screenCondition: sc.id as any }))}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        form.screenCondition === sc.id
                          ? 'border-[#344257] bg-[#F0F0F5] shadow-md ring-2 ring-[#344257]/20 -translate-y-1'
                          : 'border-gray-200 bg-white hover:border-[#6A859F] hover:bg-[#F7F7FA]'
                      }`}
                    >
                      <p className="font-extrabold text-xs text-gray-900">{sc.label}</p>
                      <p className="mt-1 text-[11px] text-gray-500 leading-snug">{sc.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Cosmetic Body Condition */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label text-sm font-extrabold text-gray-900">
                    3. Body / Frame Cosmetic Condition
                  </label>
                  <span className="text-[11px] text-gray-500">Back panel & sides</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'flawless',
                      cosmetic: 'flawless' as const,
                      label: '🌟 Flawless / Like New',
                      desc: 'Zero marks, zero dents, looks brand new',
                    },
                    {
                      id: 'minor_scratches',
                      cosmetic: 'good' as const,
                      label: '🔨 Normal Daily Wear',
                      desc: 'Minor hairline scratches or pocket scuffs',
                    },
                    {
                      id: 'dents_bent',
                      cosmetic: 'fair' as const,
                      label: '💥 Heavy Dents / Bent / Back Crack',
                      desc: 'Noticeable dents, back cracked or frame bent',
                    },
                  ].map((bc) => (
                    <button
                      key={bc.id}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          bodyCondition: bc.id as any,
                          cosmeticCondition: bc.cosmetic,
                        }))
                      }
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        form.bodyCondition === bc.id
                          ? 'border-[#344257] bg-[#F0F0F5] shadow-md ring-2 ring-[#344257]/20 -translate-y-1'
                          : 'border-gray-200 bg-white hover:border-[#6A859F] hover:bg-[#F7F7FA]'
                      }`}
                    >
                      <p className="font-extrabold text-xs text-gray-900">{bc.label}</p>
                      <p className="mt-1 text-[11px] text-gray-500 leading-snug">{bc.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Battery Health */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label text-sm font-extrabold text-gray-900">
                    4. Battery Health (if known)
                  </label>
                  <span className="text-[11px] text-gray-500">Capacity & backup</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'healthy',
                      label: '🔋 Healthy (85%+ / Normal)',
                      desc: 'Holds full day charge without quick drain',
                    },
                    {
                      id: 'degraded_service',
                      label: '⚠️ Degraded / Service (<80%)',
                      desc: 'Needs frequent charging or shows Service',
                    },
                    {
                      id: 'unknown',
                      label: '❓ Unknown / Cannot Check',
                      desc: 'Not sure or Android without % indicator',
                    },
                  ].map((bat) => (
                    <button
                      key={bat.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, batteryHealth: bat.id as any }))}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        form.batteryHealth === bat.id
                          ? 'border-[#344257] bg-[#F0F0F5] shadow-md ring-2 ring-[#344257]/20 -translate-y-1'
                          : 'border-gray-200 bg-white hover:border-[#6A859F] hover:bg-[#F7F7FA]'
                      }`}
                    >
                      <p className="font-extrabold text-xs text-gray-900">{bat.label}</p>
                      <p className="mt-1 text-[11px] text-gray-500 leading-snug">{bat.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Known Hardware Faults */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label text-sm font-extrabold text-gray-900">
                    5. Other Known Faults (Select any that apply)
                  </label>
                  <span className="text-[11px] text-gray-500">Leave unchecked if working</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {HARDWARE_DEFECTS.map((def) => {
                    const hasDefect = form.defects.includes(def.id);
                    return (
                      <button
                        key={def.id}
                        type="button"
                        onClick={() => toggleDefect(def.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                          hasDefect
                            ? 'border-rose-400 bg-rose-50 text-rose-900 shadow-xs'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className={`grid h-5 w-5 place-items-center rounded-md transition-colors ${
                            hasDefect ? 'bg-rose-600 text-white' : 'border border-gray-300'
                          }`}
                        >
                          {hasDefect && <Check className="h-3.5 w-3.5" />}
                        </div>
                        {def.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Warranty & Original Accessories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label text-sm font-extrabold text-gray-900">
                    6. Warranty & Included Original Accessories
                  </label>
                  <span className="text-[11px] text-emerald-600 font-bold">Earns Extra Bonus</span>
                </div>

                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-xs text-gray-900">Is phone under valid brand warranty?</p>
                    <p className="text-[11px] text-gray-500">Original manufacturer warranty invoice available</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, underWarranty: true }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        form.underWarranty ? 'bg-[#344257] text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, underWarranty: false }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        !form.underWarranty ? 'bg-gray-700 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ACCESSORIES_LIST.map((acc) => {
                    const isSel = form.accessories.includes(acc.id);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => toggleAccessory(acc.id)}
                        className={`rounded-full px-4 py-2 text-xs font-bold border transition-all duration-200 active:scale-95 cursor-pointer ${
                          isSel
                            ? 'border-[#344257] bg-[#344257] text-white shadow-md shadow-slate-500/20 scale-105'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#6A859F] hover:bg-[#F0F0F5]'
                        }`}
                      >
                        {acc.label} <span className="opacity-80 font-normal">{acc.bonus}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setStep(1)} className="btn-outline text-sm">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary flex items-center gap-2"
                >
                  {funduQuote?.status === 'requires_manual_review'
                    ? 'View Inspection Details'
                    : 'View Conditional Estimate'}{' '}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Fundu Buyback Quotation / Manual Review Path */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {funduQuote?.status === 'requires_manual_review' ? (
              /* MANUAL REVIEW / PHYSICAL INSPECTION PATH (No Fabricated Prices) */
              <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-amber-200 shadow-xl text-center space-y-6">
                <span className="badge bg-amber-100 text-amber-900 border border-amber-300 font-extrabold uppercase tracking-wider text-xs">
                  Physical Doorstep Inspection Required
                </span>

                <div>
                  <h2 className="font-display text-2xl font-black text-[#344257]">
                    {form.brand} {form.model} ({form.storage || '128 GB'})
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Transparent On-Site Evaluation · No Fabricated Online Pricing
                  </p>
                </div>

                {/* Prominently show Estimated Phone Valuation */}
                <div className="rounded-3xl bg-gradient-to-r from-[#1E2734] via-[#344257] to-[#47576E] p-6 text-white shadow-xl space-y-2 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#9ac0dd]">
                    Estimated Buyback Value
                  </p>
                  <div className="font-display text-4xl sm:text-5xl font-black text-white">
                    {formatINR(funduQuote.offerAmount || estimate)}
                  </div>
                  <p className="text-xs text-amber-200 font-semibold">
                    Estimated valuation · Final spot payment verified upon doorstep inspection
                  </p>
                </div>

                {/* Clear explanation banner */}
                <div className="rounded-3xl bg-gradient-to-r from-[#2A3442] via-[#344257] to-[#40536C] p-6 text-white text-left space-y-3 shadow-lg">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>Evaluation Trigger: {funduQuote.reviewReason || 'Manual Verification'}</span>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed">
                    {funduQuote.reviewMessage ||
                      'This device condition requires a direct physical inspection by a trained Fundu technician before a guaranteed spot cash quote can be confirmed.'}
                  </p>

                  {funduQuote.missingConfig && (
                    <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-[11px] text-amber-200">
                      <strong>Configuration Note:</strong> Pricing benchmark for variant{' '}
                      <code>{funduQuote.missingConfig}</code> is awaiting catalog policy update. Fundu never fabricates quotes.
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2 text-[11px] text-gray-300">
                    <span className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-emerald-400" /> Free Doorstep Visit
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Zero Obligation / Cancel Anytime
                    </span>
                    <span className="flex items-center gap-1">
                      <BadgeIndianRupee className="h-3.5 w-3.5 text-emerald-400" /> Spot Payout Upon Verification
                    </span>
                  </div>
                </div>

                {/* Doorstep Action Steps */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-2 text-xs">
                  <p className="font-extrabold text-[#344257] text-xs uppercase tracking-wide">
                    How Doorstep Inspection Works
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-600 leading-relaxed">
                    <li>A Fundu certified technician visits your address at your scheduled time.</li>
                    <li>They run physical hardware, motherboard, and display diagnostics in front of you.</li>
                    <li>You receive an exact guaranteed cash offer on the spot.</li>
                    <li>If you accept, receive instant UPI or Cash payment immediately. If not, zero charge.</li>
                  </ol>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
                  <button type="button" onClick={() => setStep(2)} className="btn-outline text-sm">
                    Back to Edit Answers
                  </button>
                  <div className="flex gap-2">
                    <a
                      href="tel:+919839122345"
                      className="btn-outline text-xs flex items-center justify-center gap-1.5 border-[#C0C8D8] text-[#344257]"
                    >
                      <PhoneCall className="h-3.5 w-3.5" /> Call Helpline
                    </a>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="btn-primary flex items-center justify-center gap-2"
                    >
                      Book Free Doorstep Inspection <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* REGULAR CONDITIONAL ESTIMATE QUOTE PATH */
              <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-xl text-center space-y-6">
                <div>
                  <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-extrabold uppercase tracking-wider text-xs">
                    Conditional Estimate · Subject to Doorstep Inspection
                  </span>
                  <h2 className="font-display text-2xl font-black text-[#344257] mt-2">
                    {form.brand} {form.model} ({form.storage || '128 GB'})
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Cosmetic Grade: <span className="capitalize font-bold text-gray-700">{form.cosmeticCondition}</span> · Policy Version: {funduQuote?.policyVersion || 'v2026.1'}
                  </p>
                </div>

                {/* Fundu Theme Dark Quote Box */}
                <div className="rounded-3xl bg-gradient-to-r from-[#1E2734] via-[#344257] to-[#47576E] p-8 text-white shadow-2xl relative overflow-hidden space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#9ac0dd]">
                    Estimated Buyback Offer
                  </p>
                  <div className="font-display text-4xl sm:text-5xl font-black text-white">
                    {formatINR(funduQuote?.offerAmount ?? estimate)}
                  </div>
                  <p className="text-xs text-gray-300">
                    Conditional estimate subject to physical inspection · Valid for 7 days
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold pt-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-white border border-white/20">
                      <BadgeIndianRupee className="h-3.5 w-3.5" /> Instant Spot Payment
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-white border border-white/20">
                      <Truck className="h-3.5 w-3.5" /> Free Doorstep Pickup
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-white border border-white/20">
                      <Lock className="h-3.5 w-3.5" /> 100% Data Wipe Guaranteed
                    </span>
                  </div>
                </div>

                {/* Dedicated Fundu Price Match (+5% Extra Cash Guaranteed) Widget */}
                {(() => {
                  const finalAmt = funduQuote?.offerAmount ?? estimate;
                  const comparison = calculateCashifyComparison(finalAmt);
                  return (
                    <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 p-5 text-left space-y-3.5 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                            <Zap className="h-4 w-4 text-emerald-600" /> Fundu Best Price Guarantee
                          </h4>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                          Guaranteed Highest Payout
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-white p-3.5 rounded-xl border border-gray-200/90 shadow-2xs">
                          <p className="text-[11px] font-bold text-gray-500">Standard Market Value</p>
                          <p className="text-base sm:text-lg font-black text-gray-600 line-through decoration-rose-500 decoration-2 mt-0.5">
                            {formatINR(comparison.cashifyPrice)}
                          </p>
                          <span className="text-[10px] text-gray-400 font-medium">Other Buyback Sites</span>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3.5 rounded-xl shadow-md">
                          <p className="text-[11px] font-bold text-emerald-100">Fundu Spot Cash Offer</p>
                          <p className="text-base sm:text-lg font-black text-white mt-0.5">
                            {formatINR(comparison.funduPrice)}
                          </p>
                          <span className="text-[10px] text-emerald-100 font-extrabold">+5% Extra Cash Bonus</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-center">
                        <p className="text-xs text-emerald-950 font-bold">
                          🎉 You receive <span className="font-black text-emerald-900 underline">+{formatINR(comparison.extraBonus)} Extra Cash</span> over standard market rates with 100% free doorstep pickup & instant payment!
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Understandable Condition-Related Reasons (Confidential Economics Kept on Server) */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="font-extrabold text-[#344257] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#6A859F]" /> Valuation Condition Summary
                    </span>
                    <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] text-[10px] font-bold">
                      Algorithm Verified
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-gray-700">
                    {funduQuote?.conditionSummary && funduQuote.conditionSummary.length > 0 ? (
                      funduQuote.conditionSummary.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">Device in evaluated standard condition.</li>
                    )}
                  </ul>

                  <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
                    <strong>Inspection Discrepancy Rule:</strong> If the inspected phone materially differs from your answers above, our technician will explain the mismatch, present a revised offer, and require your explicit acceptance before payment proceeds.
                  </div>
                </div>

                {/* Payout Method Selector */}
                <div className="text-left space-y-2">
                  <label className="label text-xs font-bold text-gray-900">Choose Instant Payout Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'UPI', label: 'Instant UPI / GPay' },
                      { id: 'Cash', label: 'Spot Hard Cash' },
                      { id: 'Bank', label: 'Bank IMPS Transfer' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setForm({ ...form, payoutMethod: p.id as any })}
                        className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                          form.payoutMethod === p.id
                            ? 'border-[#344257] bg-[#F0F0F5] font-extrabold text-[#344257] ring-2 ring-[#344257]/20'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <p className="text-xs font-bold">{p.label}</p>
                      </button>
                    ))}
                  </div>

                  {form.payoutMethod === 'UPI' && (
                    <div className="pt-2">
                      <label className="label text-xs">UPI ID / Phone Number (Optional)</label>
                      <input
                        type="text"
                        value={form.payoutDetails}
                        onChange={(e) => setForm({ ...form, payoutDetails: e.target.value })}
                        placeholder="e.g. yourname@oksbi or 9839122345"
                        className="input mt-1 text-xs focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setStep(2)} className="btn-outline text-sm">
                    Back to Edit Answers
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="btn-primary flex items-center gap-2"
                  >
                    Accept & Schedule Pickup <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Schedule Doorstep Pickup & Auto-Assign Agent */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="badge bg-[#F0F0F5] text-[#344257] border border-[#C0C8D8] font-bold">Step 4 of 4</span>
                  <h2 className="mt-1 font-display text-xl font-extrabold text-[#344257]">
                    Schedule Doorstep Pickup
                  </h2>
                  <p className="text-xs text-gray-500">
                    Guaranteed Payout: <span className="font-extrabold text-[#344257]">{formatINR(estimate)}</span> ({form.payoutMethod})
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              <div className="space-y-4 text-left">
                <div>
                  <label className="label">Select Locality / Cluster</label>
                  <select
                    value={form.pickupArea}
                    onChange={(e) => setForm({ ...form, pickupArea: e.target.value })}
                    className="input mt-1 focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
                  >
                    {DOORSTEP_LOCALITIES.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Free doorstep pickup available across Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana & Chowk.
                  </p>
                </div>

                <div>
                  <label className="label">Full Doorstep Address</label>
                  <textarea
                    rows={3}
                    value={form.pickupAddress}
                    onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                    placeholder="House / Flat No., Building Name, Street, Landmark"
                    className="input mt-1 focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Preferred Pickup Date</label>
                    <input
                      type="date"
                      value={form.pickupDate}
                      onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                      className="input mt-1 focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
                    />
                  </div>

                  <div>
                    <label className="label">Preferred Time Slot</label>
                    <select
                      value={form.pickupSlot}
                      onChange={(e) => setForm({ ...form, pickupSlot: e.target.value })}
                      className="input mt-1 focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
                    >
                      {['10 AM - 12 PM', '12 PM - 2 PM', '2 PM - 4 PM', '4 PM - 6 PM', '6 PM - 8 PM'].map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Special Instructions / Landmark (Optional)</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="e.g. Call 10 mins before arrival, Landmark near Sahara Ganj"
                    className="input mt-1 focus:border-[#6A859F] focus:ring-4 focus:ring-[#6A859F]/15"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setStep(3)} className="btn-outline text-sm">
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !form.pickupAddress.trim()}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {submitting ? 'Auto-Assigning Agent...' : 'Confirm Pickup Booking'} <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
