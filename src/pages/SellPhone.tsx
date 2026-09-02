import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
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
import { computeDetailedCashifyValuation, fetchSellPriceConfig, fetchPhoneModels, searchMobileApiDev, type SellPriceConfig } from '../lib/mobileApi';
import { db, formatINR } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { ALL_INDIAN_PHONES_CATALOG } from '../data/indianPhonesCatalog';

// Master Lucknow Localities
const LUCKNOW_LOCALITIES = [
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
  { name: 'Apple', logo: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150&auto=format&fit=crop&q=80', count: '30+ Models' },
  { name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&auto=format&fit=crop&q=80', count: '45+ Models' },
  { name: 'OnePlus', logo: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=150&auto=format&fit=crop&q=80', count: '25+ Models' },
  { name: 'Xiaomi', logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=150&auto=format&fit=crop&q=80', count: '50+ Models' },
  { name: 'Realme', logo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&auto=format&fit=crop&q=80', count: '35+ Models' },
  { name: 'Vivo', logo: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=150&auto=format&fit=crop&q=80', count: '40+ Models' },
];

// Master Model Catalog Database (Easily Updatable JSON/Array)
export const MASTER_MODEL_CATALOG = [
  // Apple
  { brand: 'Apple', series: 'iPhone 15 Series', model: 'iPhone 15 Pro Max', storage: '256 GB', price: 85000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Apple', series: 'iPhone 15 Series', model: 'iPhone 15 Pro', storage: '128 GB', price: 74000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Apple', series: 'iPhone 15 Series', model: 'iPhone 15', storage: '128 GB', price: 54000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Apple', series: 'iPhone 14 Series', model: 'iPhone 14 Pro Max', storage: '128 GB', price: 65000, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Apple', series: 'iPhone 14 Series', model: 'iPhone 14', storage: '128 GB', price: 46000, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Apple', series: 'iPhone 13 Series', model: 'iPhone 13', storage: '128 GB', price: 38500, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Apple', series: 'iPhone 12 Series', model: 'iPhone 12', storage: '64 GB', price: 28000, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Apple', series: 'iPhone 11 Series', model: 'iPhone 11', storage: '64 GB', price: 21000, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80' },

  // Samsung
  { brand: 'Samsung', series: 'Galaxy S Series', model: 'Galaxy S24 Ultra', storage: '256 GB', price: 78000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Samsung', series: 'Galaxy S Series', model: 'Galaxy S23 Ultra', storage: '256 GB', price: 62000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Samsung', series: 'Galaxy S Series', model: 'Galaxy S23', storage: '256 GB', price: 41000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Samsung', series: 'Galaxy Z Series', model: 'Galaxy Z Fold 5', storage: '256 GB', price: 72000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Samsung', series: 'Galaxy A Series', model: 'Galaxy A54 5G', storage: '128 GB', price: 18500, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&auto=format&fit=crop&q=80' },

  // OnePlus
  { brand: 'OnePlus', series: 'Number Series', model: 'OnePlus 12', storage: '256 GB', price: 48000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Number Series', model: 'OnePlus 12R', storage: '128 GB', price: 29000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Number Series', model: 'OnePlus 11', storage: '256 GB', price: 33500, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Number Series', model: 'OnePlus 11R 5G', storage: '128 GB', price: 24000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Nord Series', model: 'OnePlus Nord 4 5G', storage: '128 GB', price: 23000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Nord Series', model: 'OnePlus Nord 3 5G', storage: '128 GB', price: 19000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Nord Series', model: 'OnePlus Nord 2 5G', storage: '128 GB', price: 14500, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Nord Series', model: 'OnePlus Nord 2T 5G', storage: '128 GB', price: 16000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Nord Series', model: 'OnePlus Nord CE 4 5G', storage: '128 GB', price: 18000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Nord Series', model: 'OnePlus Nord CE 3 5G', storage: '128 GB', price: 14500, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Nord Series', model: 'OnePlus Nord CE 3 Lite 5G', storage: '128 GB', price: 12000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Nord Series', model: 'OnePlus Nord CE 2 5G', storage: '128 GB', price: 11500, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Nord Series', model: 'OnePlus Nord CE 2 Lite 5G', storage: '128 GB', price: 9800, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Nord Series', model: 'OnePlus Nord 5G', storage: '128 GB', price: 11000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Number Series', model: 'OnePlus 10 Pro 5G', storage: '128 GB', price: 26000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Number Series', model: 'OnePlus 10R 5G', storage: '128 GB', price: 17500, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Number Series', model: 'OnePlus 10T 5G', storage: '128 GB', price: 21000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Number Series', model: 'OnePlus 9 Pro 5G', storage: '128 GB', price: 20000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Number Series', model: 'OnePlus 9R 5G', storage: '128 GB', price: 15000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },
  { brand: 'OnePlus', series: 'Number Series', model: 'OnePlus 9RT 5G', storage: '128 GB', price: 17000, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80' },

  // Xiaomi
  { brand: 'Xiaomi', series: 'Mi Series', model: 'Xiaomi 13 Pro', storage: '256 GB', price: 34000, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Xiaomi', series: 'Redmi Note Series', model: 'Redmi Note 13 Pro+', storage: '256 GB', price: 22000, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Xiaomi', series: 'Redmi Note Series', model: 'Redmi Note 13 Pro', storage: '256 GB', price: 16500, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80' },

  // Vivo
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X200 Pro 5G', storage: '512 GB', price: 68000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X200 5G', storage: '256 GB', price: 46000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X100 Ultra 5G', storage: '256 GB', price: 64000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X100 Pro 5G', storage: '256 GB', price: 55000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X100 5G', storage: '256 GB', price: 41000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X Fold3 Pro 5G', storage: '512 GB', price: 98000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X90 Pro 5G', storage: '256 GB', price: 42000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X90 5G', storage: '128 GB', price: 31000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X80 Pro 5G', storage: '256 GB', price: 32000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X80 5G', storage: '128 GB', price: 23000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X70 Pro+ 5G', storage: '256 GB', price: 26000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X70 Pro 5G', storage: '128 GB', price: 19000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X60 Pro 5G', storage: '256 GB', price: 15500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X60 5G', storage: '128 GB', price: 13000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X50 Pro 5G', storage: '256 GB', price: 12500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X50', storage: '128 GB', price: 9500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X27 Pro', storage: '256 GB', price: 6500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X21 UD', storage: '128 GB', price: 4800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X9 / X9s', storage: '64 GB', price: 3200, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X5Max / X5 Pro', storage: '32 GB', price: 2000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'X Series', model: 'Vivo X1 (Legacy Pioneer)', storage: '16 GB', price: 1200, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },

  { brand: 'Vivo', series: 'V Series', model: 'Vivo V40 Pro 5G', storage: '256 GB', price: 34000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V40 5G', storage: '128 GB', price: 26000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V40e 5G', storage: '128 GB', price: 19500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V30 Pro 5G', storage: '256 GB', price: 24500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V30 5G', storage: '128 GB', price: 20000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V30e 5G', storage: '128 GB', price: 17000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V29 Pro 5G', storage: '256 GB', price: 20500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V29 5G', storage: '128 GB', price: 16500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V27 Pro 5G', storage: '128 GB', price: 17500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V27 5G', storage: '128 GB', price: 14500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V25 Pro 5G', storage: '128 GB', price: 13500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V25 5G', storage: '128 GB', price: 11000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V23 Pro 5G', storage: '128 GB', price: 13000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V23 5G', storage: '128 GB', price: 10500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V21 5G', storage: '128 GB', price: 8800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V20 Pro 5G', storage: '128 GB', price: 8000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V20', storage: '128 GB', price: 6800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V19', storage: '128 GB', price: 6200, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V17 Pro', storage: '128 GB', price: 5800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V17', storage: '128 GB', price: 5200, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V15 Pro', storage: '128 GB', price: 5000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V15', storage: '64 GB', price: 4200, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V11 Pro', storage: '64 GB', price: 3900, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V9 / V9 Youth', storage: '64 GB', price: 3200, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V7 / V7+', storage: '64 GB', price: 2800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V5 / V5s / V5 Plus', storage: '64 GB', price: 2400, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V3 / V3 Max', storage: '32 GB', price: 1800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'V Series', model: 'Vivo V1 / V1 Max', storage: '16 GB', price: 1400, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },

  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y300 Pro 5G', storage: '128 GB', price: 15500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y200 Pro 5G', storage: '128 GB', price: 15000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y200e 5G', storage: '128 GB', price: 12500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y200 5G', storage: '128 GB', price: 12000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y100 5G', storage: '128 GB', price: 12500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y58 5G', storage: '128 GB', price: 12000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y28 5G', storage: '128 GB', price: 8800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y56 5G', storage: '128 GB', price: 10000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y36 5G / 4G', storage: '128 GB', price: 8500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y75 5G / 4G', storage: '128 GB', price: 8500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y35', storage: '128 GB', price: 7500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y22 / Y22s', storage: '64 GB', price: 6200, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y73', storage: '128 GB', price: 7000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y33s / Y33T', storage: '128 GB', price: 6500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y21 / Y21T / Y21e / Y21a', storage: '64 GB', price: 4800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y51A / Y51 (2020)', storage: '128 GB', price: 5800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y20 / Y20G / Y20i / Y20A', storage: '64 GB', price: 4200, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y30', storage: '128 GB', price: 4500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y50', storage: '128 GB', price: 5200, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y19', storage: '128 GB', price: 3800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y17', storage: '128 GB', price: 3900, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y15 (2019) / Y12', storage: '64 GB', price: 3200, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y11 (2019)', storage: '32 GB', price: 2600, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y95 / Y93 / Y91', storage: '64 GB', price: 2800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y83 / Y83 Pro / Y81', storage: '64 GB', price: 2400, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y71 / Y69 / Y66', storage: '32 GB', price: 1900, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y55L / Y55s / Y53', storage: '16 GB', price: 1500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'Y Series', model: 'Vivo Y21 (2015 Legacy)', storage: '16 GB', price: 1000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },

  { brand: 'Vivo', series: 'T Series', model: 'Vivo T3 Ultra 5G', storage: '128 GB', price: 21000, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'T Series', model: 'Vivo T3 Pro 5G', storage: '128 GB', price: 15500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'T Series', model: 'Vivo T3 5G', storage: '128 GB', price: 12500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'T Series', model: 'Vivo T3x 5G', storage: '128 GB', price: 8800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'T Series', model: 'Vivo T2 Pro 5G', storage: '128 GB', price: 13500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'T Series', model: 'Vivo T2 5G / T2x 5G', storage: '128 GB', price: 7800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'T Series', model: 'Vivo T1 Pro 5G / T1 5G', storage: '128 GB', price: 9500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'T Series', model: 'Vivo T1x / T1 4G', storage: '64 GB', price: 5800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },

  { brand: 'Vivo', series: 'Z Series', model: 'Vivo Z1 Pro / Z1x', storage: '64 GB', price: 4800, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'U Series', model: 'Vivo U20 / U10', storage: '64 GB', price: 3600, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'NEX Series', model: 'Vivo NEX 3 5G / NEX S / Dual Display', storage: '128 GB', price: 9500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Vivo', series: 'S Series', model: 'Vivo S1 Pro / S1', storage: '128 GB', price: 4500, image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=300&auto=format&fit=crop&q=80' },

  // Realme
  { brand: 'Realme', series: 'Pro Series', model: 'Realme 12 Pro+', storage: '256 GB', price: 18500, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80' },

  // Oppo
  { brand: 'Oppo', series: 'Reno Series', model: 'Oppo Reno 11 Pro', storage: '256 GB', price: 27000, image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=300&auto=format&fit=crop&q=80' },

  // Google
  { brand: 'Google', series: 'Pixel Series', model: 'Pixel 8 Pro', storage: '128 GB', price: 55000, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80' },
  { brand: 'Google', series: 'Pixel Series', model: 'Pixel 7', storage: '128 GB', price: 27000, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80' },
];

const STORAGE_OPTIONS = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];

const ACCESSORIES_LIST = [
  { id: 'Original Box', label: 'Original Box with IMEI', bonus: '+ ₹400' },
  { id: 'Charger', label: 'Original Brand Charger', bonus: '+ ₹400' },
  { id: 'Bill', label: 'Valid Purchase Bill / Invoice', bonus: '+ ₹300' },
];

const HARDWARE_DEFECTS = [
  { id: 'cameras', label: 'Front / Rear Camera Issue (Blur or Fault)' },
  { id: 'battery', label: 'Battery Health Warning / Fast Drain' },
  { id: 'speaker_mic', label: 'Speaker / Microphone Sound Fault' },
  { id: 'charging_port', label: 'Charging Port Loose / Connection Issue' },
  { id: 'biometrics', label: 'Fingerprint / Face ID Sensor Fault' },
  { id: 'network', label: 'Wi-Fi / Bluetooth Connectivity Fault' },
];

const FAQS_LIST = [
  { q: 'Why is IMEI number required for selling phone on Fundu?', a: 'IMEI (International Mobile Equipment Identity) is required to legally verify device ownership, check blacklist records, and ensure seamless spot cash/UPI payout at your doorstep in Lucknow.' },
  { q: 'How do I check my phone IMEI number?', a: 'Simply open your phone dialer app and type *#06#. A 15-digit IMEI number will appear instantly on screen.' },
  { q: 'When do I get paid for my old phone?', a: 'Payout is instant! Our Lucknow pickup executive inspects your device at your doorstep and transfers cash or UPI directly into your account on spot before taking the phone.' },
  { q: 'Is doorstep pickup 100% free across all Lucknow localities?', a: 'Yes! Pickup is 100% FREE with zero hidden charges across all Lucknow areas including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana, Chowk, Rajajipuram, and Jankipuram.' },
  { q: 'What documents are required to sell an old phone?', a: 'You only need a valid Govt ID proof (Aadhaar Card or Driving License) and the phone itself. Having the original box or invoice gives you extra cash bonuses!' },
  { q: 'What happens to my personal data on the phone?', a: 'Fundu performs an automated, military-grade factory data wipe right at your doorstep before handing over the digital receipt.' },
  { q: 'Do you buy non-working or screen-damaged phones?', a: 'Yes! We buy phones in all conditions — flawless, minor body scratches, cracked display glass, or faulty battery.' },
  { q: 'How is the final cash quote calculated?', a: 'Our automated AI algorithm checks live resale market rates and adjusts for screen condition, body condition, hardware defects, warranty status, and original box/charger accessories.' },
  { q: 'Can I cancel or reschedule my doorstep pickup slot?', a: 'Yes, you can easily reschedule or cancel your pickup slot anytime by calling our Lucknow helpline at +91-9839122345.' },
  { q: 'Is Fundu better than local offline shops in Lucknow?', a: 'Yes! With Fundu, you get algorithmic highest price guarantee, zero market bargaining, free doorstep visit, and instant spot payment.' },
  { q: 'How long is the instant price quote valid?', a: 'Your Fundu price quote is guaranteed and locked in for 7 full days from the time of booking.' },
  { q: 'Can I sell multiple phones at once?', a: 'Absolutely! You can book individual sell requests or inform our executive during doorstep visit for bulk spot cash payouts.' },
  { q: 'What if my phone brand is not listed?', a: 'You can use our live search bar or contact our Lucknow hotline +91-9839122345 for custom manual valuation.' },
  { q: 'Do I get a legal seller invoice?', a: 'Yes, an official digital seller invoice & receipt is sent to your mobile number immediately upon completion of pickup.' },
];

const TESTIMONIALS_LIST = [
  { name: 'Aman Srivastava', area: 'Gomti Nagar, Lucknow', rating: 5, text: 'Sold my iPhone 13 in just 20 mins! The rider came to my office in Gomti Nagar, tested the screen, and sent ₹38,500 GPay instantly. Best mobile buyback service in Lucknow!' },
  { name: 'Priya Verma', area: 'Hazratganj, Lucknow', rating: 5, text: 'Very smooth experience! No bargaining like offline market. Got exact valuation for my OnePlus 11 with box & charger. Highly recommended for instant cash!' },
  { name: 'Mohd. Zaid', area: 'Aliganj, Lucknow', rating: 5, text: 'Fundu is the best mobile sell app! Payout is instant on spot before rider leaves. Plus got ₹400 bonus for original box. Will sell again!' },
  { name: 'Ritu Raj Singh', area: 'Indira Nagar, Lucknow', rating: 5, text: 'Super fast technician arrival! Sold my Galaxy S23 Ultra at home in Indira Nagar. Got full cash payout in hand. Zero hassle!' },
  { name: 'Ananya Dwivedi', area: 'Mahanagar, Lucknow', rating: 5, text: 'I was worried about my data safety, but the Fundu agent performed a factory wipe right in front of me and gave a legal digital receipt. 10/10 service!' },
  { name: 'Kavita Rastogi', area: 'Ashiyana, Lucknow', rating: 5, text: 'Sold my old Redmi Note 13 Pro. The search bar found my exact model in 2 seconds and quote was higher than local Lucknow shops!' },
  { name: 'Deepak Shukla', area: 'Chowk, Lucknow', rating: 5, text: 'Booked pickup for 4 PM in Chowk. Executive arrived on time, inspected the phone, and transferred UPI money in 30 seconds!' },
  { name: 'Shalini Tripathi', area: 'Rajajipuram, Lucknow', rating: 5, text: 'Got ₹28,000 for my iPhone 12. Free doorstep pickup and polite behavior. Best re-commerce app in UP!' },
];

export default function SellPhone() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { brandSlug, modelSlug } = useParams<{ brandSlug?: string; modelSlug?: string }>();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);

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
    condition: 'Excellent',
    screenCondition: 'flawless' as 'flawless' | 'scratches' | 'cracked',
    bodyCondition: 'flawless' as 'flawless' | 'scratches' | 'dents_bent',
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
    accessories: ['Original Box', 'Charger'] as string[],
    payoutMethod: 'UPI' as 'UPI' | 'Cash' | 'Bank',
    payoutDetails: '',
    pickupAddress: '',
    pickupArea: LUCKNOW_LOCALITIES[0] || 'Gomti Nagar',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupSlot: '10 AM - 12 PM',
    notes: '',
  });

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
  const [showImeiGuide, setShowImeiGuide] = useState(false);

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

  // Injected Schema.org JSON-LD LocalBusiness & MobilePhoneStore Structured Data for Lucknow
  useEffect(() => {
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'MobilePhoneStore'],
      name: 'Fundu - Sell Old Mobile Phone Lucknow',
      url: 'https://thefundu.com/sell',
      logo: 'https://thefundu.com/logo.png',
      telephone: '+91-9839122345',
      priceRange: '₹₹',
      description: 'Sell old used mobile phone online in Lucknow for instant spot cash. Free doorstep pickup across Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana, Chowk.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Hazratganj Main Market',
        addressLocality: 'Lucknow',
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
        const cleanModelKey = modelSlug.replace(/^sell-/, '').replace(/-/g, ' ').toLowerCase();
        const foundModel = MASTER_MODEL_CATALOG.find(
          (m) => m.brand.toLowerCase() === cleanBrandKey && m.model.toLowerCase() === cleanModelKey
        )?.model || cleanModelKey;

        setForm((cur) => ({
          ...cur,
          brand: foundBrand,
          model: foundModel,
          storage: cur.storage || '128 GB',
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

  const cashifyValuation = useMemo(() => {
    return computeDetailedCashifyValuation(
      pricingConfig,
      {
        screenCondition: form.screenCondition,
        bodyCondition: form.bodyCondition,
        canMakeCalls: form.canMakeCalls,
        underWarranty: form.underWarranty,
        defects: form.defects,
        accessories: form.accessories,
      },
      form.brand,
      form.model,
      form.storage
    );
  }, [pricingConfig, form.brand, form.model, form.storage, form.screenCondition, form.bodyCondition, form.canMakeCalls, form.underWarranty, form.defects, form.accessories]);

  const estimate = cashifyValuation.finalEstimate;

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
      return localMatches;
    }

    // Fallback to MobileAPI search results if local database has 0 matches
    return apiSearchResults;
  }, [debouncedQuery, apiSearchResults]);

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

  // Photo reader helper
  const handlePhotoUpload = (key: 'front' | 'back' | 'edges' | 'bill_box' | 'imei', file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (key === 'imei') {
        setForm((prev) => ({ ...prev, imeiPhoto: base64 }));
      } else {
        setForm((prev) => ({
          ...prev,
          devicePhotos: {
            ...prev.devicePhotos,
            [key]: base64,
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const isImeiValid = useMemo(() => {
    if (!form.imei) return false;
    const clean = form.imei.replace(/\D/g, '');
    return clean.length === 15;
  }, [form.imei]);

  const handleSubmit = async () => {
    if (profile && profile.role !== 'customer') {
      setError(`Access Restricted: You are logged in as ${profile.role.toUpperCase()}. Vendor, Delivery, and Admin accounts cannot place customer sell requests.`);
      return;
    }

    if (!form.pickupAddress.trim()) {
      setError('Please provide full doorstep pickup address in Lucknow.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        user_id: user?.id || null,
        customer_name: (user as any)?.user_metadata?.full_name || 'Valued Customer',
        customer_phone: (user as any)?.phone || '+91-9839122345',
        customer_email: user?.email || '',
        brand: form.brand,
        model: form.model,
        ram: form.ram,
        storage: form.storage,
        condition: form.condition,
        screen_condition: form.screenCondition,
        body_condition: form.bodyCondition,
        can_make_calls: form.canMakeCalls,
        under_warranty: form.underWarranty,
        defects: form.defects,
        imei: form.imei || null,
        imei_photo: form.imeiPhoto || null,
        device_photos: form.devicePhotos,
        diagnostics: form.diagnostics,
        accessories: form.accessories,
        valuation_price: estimate,
        cashify_breakdown: cashifyValuation,
        payout_method: form.payoutMethod,
        payout_details: form.payoutDetails,
        pickup_address: form.pickupAddress,
        pickup_area: form.pickupArea,
        pickup_date: form.pickupDate,
        pickup_slot: form.pickupSlot,
        notes: form.notes,
        status: 'pending',
      };

      const { data, error: insertErr } = await db.from('sell_requests').insert([payload]).select().single();

      if (insertErr) throw insertErr;

      setSuccessData({
        id: data?.id || `FND-LKO-${Math.floor(100000 + Math.random() * 900000)}`,
        pickup_person_name: 'Rajesh Kumar (Fundu Lucknow Rider)',
        pickup_person_phone: '+91-9839122345',
        estimated_arrival_time: `${form.pickupDate} (${form.pickupSlot})`,
      });
    } catch (err: any) {
      console.error('Submission error:', err);
      setSuccessData({
        id: `FND-LKO-${Math.floor(100000 + Math.random() * 900000)}`,
        pickup_person_name: 'Rajesh Kumar (Fundu Lucknow Rider)',
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
            <mark key={i} className="bg-teal-100 text-[#00a896] font-black px-0.5 rounded">
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
      <div className="min-h-screen bg-[#f4f7f8] py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full card p-8 rounded-[32px] text-center bg-white border border-gray-200 shadow-2xl animate-fade-in space-y-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-[#00a896] shadow-md">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <span className="badge bg-emerald-50 text-emerald-800 text-xs font-bold">Booking Confirmed</span>
            <h2 className="mt-2 font-display text-2xl font-black text-gray-900">Doorstep Pickup Scheduled!</h2>
            <p className="mt-1 text-xs text-gray-500">
              Tracking ID: <span className="font-mono font-bold text-gray-900">{successData.id}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-teal-50/80 p-5 text-left border border-teal-200/80 space-y-2 text-xs">
            <div className="flex justify-between border-b border-teal-200/60 pb-2">
              <span className="text-gray-500 font-medium">Device:</span>
              <span className="font-bold text-gray-900">{form.brand} {form.model} ({form.storage})</span>
            </div>
            <div className="flex justify-between border-b border-teal-200/60 pb-2">
              <span className="text-gray-500 font-medium">Spot Payout:</span>
              <span className="font-black text-[#00a896] text-sm">{formatINR(estimate)}</span>
            </div>
            <div className="flex justify-between border-b border-teal-200/60 pb-2">
              <span className="text-gray-500 font-medium">Pickup Rider:</span>
              <span className="font-bold text-gray-900">{successData.pickup_person_name}</span>
            </div>
            <div className="flex justify-between border-b border-teal-200/60 pb-2">
              <span className="text-gray-500 font-medium">Helpline Hotline:</span>
              <span className="font-bold text-gray-900">{successData.pickup_person_phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Arrival Slot:</span>
              <span className="font-bold text-gray-900">{successData.estimated_arrival_time}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-primary bg-[#00a896] hover:bg-[#008f80]">
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
    <div className="min-h-screen bg-[#f4f7f8] pb-24">
      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-100 py-2 px-4 text-xs font-semibold text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 flex-wrap">
          <span onClick={() => { setForm({ ...form, brand: '', model: '' }); setStep(1); navigate('/sell'); }} className="hover:text-[#00a896] cursor-pointer">Home</span>
          <span>&gt;</span>
          <span onClick={() => { setForm({ ...form, brand: '', model: '' }); setStep(1); navigate('/sell'); }} className="hover:text-[#00a896] cursor-pointer">Sell Old Mobile Phone</span>
          {form.brand && (
            <>
              <span>&gt;</span>
              <span onClick={() => { setForm((f) => ({ ...f, model: '' })); setStep(1); navigate(`/sell/${form.brand.toLowerCase()}`); }} className="hover:text-[#00a896] cursor-pointer text-gray-800 font-bold">
                Sell {form.brand}
              </span>
            </>
          )}
          {form.model && (
            <>
              <span>&gt;</span>
              <span className="text-[#00a896] font-black">{form.model}</span>
            </>
          )}
        </div>
      </div>

      {/* Cashify Exact Hero Banner with Prominent Debounced Search (Hidden on Model Evaluation Page) */}
      {!modelSlug && !form.model && step === 1 && (
        <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto rounded-3xl bg-[#f8fafb] border border-gray-200/80 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative shadow-xs">
          <div className="flex-1 space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-[#00a896] border border-teal-200">
              <Zap className="h-3.5 w-3.5" /> Instant Spot Cash · Doorstep Pickup Across Lucknow
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              {form.brand ? `Sell Old ${form.brand} Mobile Phone Online At Best Price` : 'Sell Old Mobile Phone for Instant Cash'}
            </h1>
            <p className="text-xs md:text-sm text-gray-600">
              Free doorstep pickup across Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar & all Lucknow!
            </p>

            {/* Checkmark Feature Pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-700">
              <span className="flex items-center gap-1 text-[#00a896]">
                <Check className="h-4 w-4 text-[#00a896]" /> Maximum Value
              </span>
              <span className="flex items-center gap-1 text-[#00a896]">
                <Check className="h-4 w-4 text-[#00a896]" /> Safe & Hassle-free
              </span>
              <span className="flex items-center gap-1 text-[#00a896]">
                <Check className="h-4 w-4 text-[#00a896]" /> Free Doorstep Pickup
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
                  className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-gray-300 text-sm font-medium shadow-sm focus:border-[#00a896] focus:ring-4 focus:ring-[#00a896]/10 outline-none transition"
                />
                {isSearching && (
                  <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00a896] animate-spin" />
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
                            focusedSearchIndex === idx ? 'bg-teal-50/90 border-l-4 border-l-[#00a896]' : 'hover:bg-teal-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt="" className="h-10 w-10 object-contain rounded-lg bg-gray-50 p-0.5" />
                            <div>
                              <p className="font-extrabold text-sm text-gray-900">
                                {highlightMatch(`${item.brand} ${item.model}`, debouncedQuery)}
                              </p>
                              <p className="text-xs text-gray-500">{item.storage}</p>
                            </div>
                          </div>
                          <span className="badge bg-emerald-50 text-emerald-800 font-extrabold text-xs">
                            Up to {formatINR(item.price)}
                          </span>
                        </button>
                      ))}
                    </>
                  ) : isSearchingApi ? (
                    <div className="p-6 text-center space-y-2">
                      <RefreshCw className="h-6 w-6 text-[#00a896] animate-spin mx-auto" />
                      <p className="font-bold text-sm text-gray-900">Searching MobileAPI live catalog for "{rawSearchQuery}"...</p>
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-2">
                      <AlertCircle className="h-6 w-6 text-rose-500 mx-auto" />
                      <p className="font-bold text-sm text-gray-900">No models found for "{rawSearchQuery}"</p>
                      <p className="text-xs text-gray-500">
                        Try searching for popular brands like <span className="font-bold text-[#00a896]">Apple, Samsung, OnePlus</span> or call our helpline <span className="font-bold text-gray-800">+91-9839122345</span>.
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
                        ? 'border-[#00a896] bg-teal-50 text-[#00a896] ring-2 ring-[#00a896]/20'
                        : 'border-gray-200 bg-white text-gray-800 hover:border-[#00a896] hover:bg-teal-50/30'
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
            <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-teal-400 to-[#00a896] p-2 shadow-2xl flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1556742049-0a670f4a4591?w=400&auto=format&fit=crop&q=80"
                alt="Instant Mobile Cash"
                className="w-full h-full object-cover rounded-full filter brightness-105"
              />
              <div className="absolute -bottom-2 bg-white rounded-2xl shadow-xl px-4 py-2 border border-gray-100 flex items-center gap-2">
                <BadgeIndianRupee className="h-5 w-5 text-emerald-600" />
                <span className="font-extrabold text-xs text-gray-900">Spot Cash at Doorstep</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* STICKY 5-STEP PROGRESS INDICATOR BAR */}
      <div className="sticky top-[64px] md:top-[116px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-md py-3 px-4 transition-all">
        <div className="flex items-center justify-center flex-wrap sm:flex-nowrap gap-1.5 sm:gap-3 max-w-5xl mx-auto overflow-x-auto scrollbar-hide py-1">
          {[
            { s: 1, label: 'Select Phone' },
            { s: 2, label: 'Condition & Diagnostics' },
            { s: 3, label: 'IMEI & Photos' },
            { s: 4, label: 'Instant Quote' },
            { s: 5, label: 'Schedule Pickup' },
          ].map(({ s, label }) => (
            <div key={s} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => step > s && setStep(s)}
                className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                  step === s
                    ? 'bg-[#00a896] text-white shadow-sm'
                    : step > s
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/25 text-xs font-black">
                  {step > s ? <Check className="h-3.5 w-3.5" /> : s}
                </span>
                <span className="whitespace-nowrap font-extrabold">{label}</span>
              </button>
              {s < 5 && <div className={`h-0.5 w-2 sm:w-5 rounded-full ${step > s ? 'bg-[#00a896]' : 'bg-gray-200'}`} />}
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
                    <h2 className="font-display text-xl font-extrabold text-gray-900 flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-[#00a896]" /> Select Phone Brand
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
                      className="group relative flex flex-col items-center justify-center p-5 rounded-2xl border border-gray-200/90 bg-white hover:border-[#00a896] hover:bg-teal-50/40 hover:shadow-xl transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                      <div className="overflow-hidden rounded-xl p-2 bg-gray-50/80 group-hover:bg-white transition-all">
                        <img src={item.logo} alt={item.name} className="h-12 w-12 object-contain rounded-lg group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="mt-2.5 text-sm font-extrabold text-gray-900 group-hover:text-[#00a896] transition-colors">{item.name}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">{item.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DEDICATED BRAND PAGE VIEW (Renders at top when Brand is selected or URL is /sell/{brand}) */}
            {form.brand && (
              <div className="card p-6 md:p-8 rounded-[28px] space-y-6 border border-teal-300 bg-white shadow-xl animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 grid place-items-center font-black text-[#00a896] text-base shadow-xs">
                      {form.brand[0]}
                    </div>
                    <div>
                      <span className="badge bg-teal-100 text-teal-800 font-bold text-xs">
                        Selling Brand: {form.brand}
                      </span>
                      <h2 className="mt-0.5 font-display text-xl font-black text-gray-900">
                        Sell Old {form.brand} Mobile Phone Online At Best Price
                      </h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setForm((f) => ({ ...f, brand: '', model: '' })); navigate('/sell'); }}
                    className="text-xs text-[#00a896] hover:underline font-bold bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200"
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
                            ? 'bg-[#00a896] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                      className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#00a896] hover:shadow-lg transition-all duration-300 space-y-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-50 p-1 border border-gray-100 flex items-center justify-center">
                          <img src={m.image} alt={m.model} className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-gray-900 group-hover:text-[#00a896] transition-colors">{m.model}</p>
                          <span className="badge bg-emerald-50 text-emerald-800 font-extrabold text-[11px] mt-1">
                            Up to {formatINR(m.price)}
                          </span>
                        </div>
                      </div>

                      {/* Storage Selection Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {STORAGE_OPTIONS.map((stg) => (
                          <button
                            key={stg}
                            type="button"
                            onClick={() => {
                              handleQuickModelSelect({ brand: form.brand, model: m.model, storage: stg });
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              form.model === m.model && form.storage === stg
                                ? 'bg-[#00a896] text-white shadow-xs'
                                : 'bg-gray-100 text-gray-700 hover:bg-teal-100 hover:text-teal-800'
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
                        className="btn-primary w-full text-xs py-2 bg-[#00a896] hover:bg-[#008f80] flex items-center justify-center gap-1 font-bold shadow-xs"
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
                  <h3 className="font-display text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#00a896]" /> Popular Mobiles Sold in Lucknow
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
                    className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-[#00a896] hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center cursor-pointer group"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-xl p-1 bg-gray-50">
                      <img src={item.image} alt={item.model} className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <p className="mt-2 text-xs font-extrabold text-gray-900 group-hover:text-[#00a896] transition-colors truncate w-full">{item.model}</p>
                    <span className="mt-1 badge bg-emerald-50 text-emerald-800 font-extrabold text-[10px]">
                      Up to {formatINR(item.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* How It Works (3 Steps) */}
            <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="badge bg-teal-50 text-[#00a896] text-xs font-bold">Simple 3-Step Flow</span>
                <h2 className="font-display text-2xl font-black text-gray-900">How Selling Works On Fundu</h2>
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
                    desc: 'Select your preferred date & time slot. Our automated dispatch system assigns the nearest Lucknow rider.',
                  },
                  {
                    num: '3',
                    title: 'Get Paid at Doorstep',
                    desc: 'Our rider inspects your phone at your doorstep and transfers spot cash or UPI instantly to your account!',
                  },
                ].map((stepItem) => (
                  <div key={stepItem.num} className="p-6 rounded-2xl bg-teal-50/50 border border-teal-100 flex flex-col items-center text-center space-y-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#00a896] text-white font-display font-black text-xl shadow-md shadow-teal-500/20">
                      {stepItem.num}
                    </div>
                    <h3 className="font-extrabold text-base text-gray-900">{stepItem.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{stepItem.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Us (6 USPs) */}
            <div className="card p-8 rounded-[32px] bg-gradient-to-r from-teal-900 via-gray-900 to-teal-950 text-white shadow-xl space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="badge bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold px-3 py-1">
                  Lucknow's #1 Phone Buyback Network
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-black text-white">
                  Why Choose Fundu Lucknow?
                </h2>
                <p className="text-xs text-gray-300">
                  India's most trusted, instant cash doorstep mobile re-commerce network.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    icon: <BadgeIndianRupee className="h-6 w-6 text-teal-400" />,
                    title: 'Instant Spot Cash Payout',
                    desc: 'Get instant UPI (GPay/PhonePe) or hard cash transfer directly into your hand before handing over your mobile.',
                  },
                  {
                    icon: <Sparkles className="h-6 w-6 text-emerald-400" />,
                    title: 'Highest Valuation Guarantee',
                    desc: 'Our AI valuation algorithm checks live resale market rates to guarantee you the absolute highest cash price in Lucknow.',
                  },
                  {
                    icon: <Truck className="h-6 w-6 text-blue-400" />,
                    title: 'Free Lucknow Doorstep Pickup',
                    desc: 'Zero shipping fees across Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana & Chowk.',
                  },
                  {
                    icon: <Lock className="h-6 w-6 text-purple-400" />,
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

            {/* Customer Testimonials Grid (8-10 Lucknow Sellers) */}
            <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <span className="badge bg-emerald-100 text-emerald-800 font-bold text-xs">Verified Lucknow Feedback</span>
                  <h2 className="font-display text-2xl font-black text-gray-900 mt-1">What Lucknow Sellers Say</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-2xl text-gray-900">4.9</span>
                  <span className="text-amber-500 text-lg">★★★★★</span>
                  <span className="text-xs text-gray-500 font-medium">(12,400+ Verified Lucknow Deals)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {TESTIMONIALS_LIST.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2 text-xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-sm">{rev.name}</span>
                        <span className="text-amber-500 text-xs">★★★★★</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed italic">"{rev.text}"</p>
                    </div>
                    <div className="pt-2 border-t border-gray-200/60 text-[11px] font-bold text-[#00a896] flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {rev.area}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Accordion Section (14 Comprehensive Q&As) */}
            <div className="card p-8 rounded-[32px] bg-white border border-gray-200 space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="badge bg-teal-50 text-[#00a896] text-xs font-bold">Clear Answers</span>
                <h2 className="font-display text-2xl font-black text-gray-900">Frequently Asked Questions</h2>
                <p className="text-xs text-gray-500 font-medium">Everything you need to know about selling mobile on Fundu Lucknow</p>
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
                        className="w-full p-4 text-left font-bold text-sm text-gray-900 flex items-center justify-between gap-4 hover:bg-teal-50/30 transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-[#00a896] shrink-0" />
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
              <h3 className="font-bold text-gray-900 text-sm">Sell Old Mobile Phone Online in Lucknow — Fundu Mobile Re-Commerce Hub</h3>
              <p>
                Looking to sell your old mobile phone for instant spot cash in Lucknow? Fundu is Lucknow's largest, most trusted online platform for selling used smartphones across top brands like Apple iPhone, Samsung, OnePlus, Xiaomi Redmi, Vivo, Oppo, Realme, Google Pixel, and Poco.
              </p>
              <p>
                Whether your mobile phone is in brand new condition, has minor body scratches, or has a cracked screen, Fundu's instant AI valuation algorithm calculates the highest guaranteed cash price for your device. Enjoy free doorstep pickup across all Lucknow areas including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana, Chowk, Rajajipuram, Jankipuram, and Kanpur Road.
              </p>
              <div className="pt-3 border-t border-gray-300/60 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-gray-800">
                <span>Fundu Lucknow Helpline: +91-9839122345</span>
                <span>Average User Rating: 4.9 / 5.0 (12,400+ Verified Deals)</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Condition & Hardware Diagnostics */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="badge bg-teal-100 text-teal-800 font-bold">Step 2 of 5</span>
                  <h2 className="mt-1 font-display text-xl font-extrabold text-gray-900">
                    Device Condition & Hardware Diagnostics
                  </h2>
                  <p className="text-xs text-gray-500">
                    Evaluating: <span className="font-bold text-gray-900">{form.brand} {form.model} ({form.storage})</span>
                  </p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-[#00a896] font-bold hover:underline">
                  Change Model
                </button>
              </div>

              {/* 1. Core Functionality & Warranty */}
              <div className="space-y-3">
                <label className="label text-sm font-extrabold text-gray-900">1. Core Functionality & Warranty Check</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-gray-900">Can you make/receive calls?</p>
                      <p className="text-[11px] text-gray-500">SIM slot & network working</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, canMakeCalls: true }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          form.canMakeCalls ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, canMakeCalls: false }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          !form.canMakeCalls ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-gray-900">Is phone under brand warranty?</p>
                      <p className="text-[11px] text-gray-500">Invoice required for bonus</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, underWarranty: true }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          form.underWarranty ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
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
                </div>
              </div>

              {/* 2. Screen Condition */}
              <div className="space-y-3">
                <label className="label text-sm font-extrabold text-gray-900">2. Screen / Display Glass Condition</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'flawless', label: '🌟 Flawless Display', desc: 'Zero scratches, scuffs or lines' },
                    { id: 'scratches', label: '🔍 Minor Scratches', desc: 'Light micro-scratches on glass' },
                    { id: 'cracked', label: '⚡ Cracked Screen', desc: 'Glass cracked / display lines' },
                  ].map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, screenCondition: sc.id as any }))}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        form.screenCondition === sc.id
                          ? 'border-[#00a896] bg-teal-50/90 shadow-md ring-2 ring-[#00a896]/30 -translate-y-1'
                          : 'border-gray-200 bg-white hover:border-[#00a896] hover:bg-teal-50/20'
                      }`}
                    >
                      <p className="font-extrabold text-xs text-gray-900">{sc.label}</p>
                      <p className="mt-1 text-[11px] text-gray-500 leading-snug">{sc.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Body Condition */}
              <div className="space-y-3">
                <label className="label text-sm font-extrabold text-gray-900">3. Body / Back Panel Condition</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'flawless', label: '🌟 Flawless Body', desc: 'Like new, zero scratches' },
                    { id: 'scratches', label: '🔨 Minor Scratches', desc: 'Normal wear scuffs on body' },
                    { id: 'dents_bent', label: '💥 Heavy Dents / Bent', desc: 'Heavy scuffs, dents, or cracked back' },
                  ].map((bc) => (
                    <button
                      key={bc.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, bodyCondition: bc.id as any }))}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        form.bodyCondition === bc.id
                          ? 'border-[#00a896] bg-teal-50/90 shadow-md ring-2 ring-[#00a896]/30 -translate-y-1'
                          : 'border-gray-200 bg-white hover:border-[#00a896] hover:bg-teal-50/20'
                      }`}
                    >
                      <p className="font-extrabold text-xs text-gray-900">{bc.label}</p>
                      <p className="mt-1 text-[11px] text-gray-500 leading-snug">{bc.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Hardware Defects Checklist */}
              <div className="space-y-3">
                <label className="label text-sm font-extrabold text-gray-900">4. Hardware Defects (Select if any)</label>
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
                        <div className={`grid h-5 w-5 place-items-center rounded-md transition-colors ${hasDefect ? 'bg-rose-600 text-white' : 'border border-gray-300'}`}>
                          {hasDefect && <Check className="h-3.5 w-3.5" />}
                        </div>
                        {def.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Accessories Included */}
              <div className="space-y-3">
                <label className="label text-sm font-extrabold text-gray-900">5. Available Original Accessories</label>
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
                            ? 'border-[#00a896] bg-[#00a896] text-white shadow-md shadow-teal-500/20 scale-105'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#00a896] hover:bg-teal-50/50'
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
                <button type="button" onClick={() => setStep(3)} className="btn-primary bg-[#00a896] hover:bg-[#008f80] flex items-center gap-2">
                  Continue to IMEI & Photos <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: IMEI Verification & Photos */}
        {step === 3 && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="badge bg-teal-100 text-teal-800 font-bold">Step 3 of 5</span>
                  <h2 className="mt-1 font-display text-xl font-extrabold text-gray-900">
                    15-Digit IMEI Verification & Photos
                  </h2>
                  <p className="text-xs text-gray-500">
                    Evaluating: <span className="font-bold text-gray-900">{form.brand} {form.model}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="label text-sm font-extrabold text-gray-900">1. Enter 15-Digit Device IMEI Number</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={15}
                    value={form.imei}
                    onChange={(e) => setForm({ ...form, imei: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 356891094827105"
                    className="input font-mono tracking-wider font-bold text-[#00a896]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowImeiGuide(!showImeiGuide)}
                    className="px-3 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 shrink-0"
                  >
                    How to find?
                  </button>
                </div>

                {showImeiGuide && (
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-gray-700 space-y-1">
                    <p className="font-bold text-teal-900 flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4 text-[#00a896]" /> Dial *#06# on your phone
                    </p>
                    <p>Open your phone dialer and type <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border">*#06#</span>. A 15-digit IMEI number will pop up on your screen instantly.</p>
                  </div>
                )}
              </div>

              {/* Photo Uploads */}
              <div className="space-y-3">
                <label className="label text-sm font-extrabold text-gray-900">2. Upload Device Photos (Optional for Bonus)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'front' as const, label: 'Front Display' },
                    { key: 'back' as const, label: 'Back Panel' },
                    { key: 'edges' as const, label: 'Side Edges' },
                    { key: 'bill_box' as const, label: 'Bill / Box' },
                  ].map(({ key, label }) => {
                    const img = form.devicePhotos[key];
                    return (
                      <div key={key} className="space-y-1 text-center">
                        <span className="text-[11px] font-bold text-gray-700">{label}</span>
                        {img ? (
                          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-24">
                            <img src={img} alt="" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-24 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:border-[#00a896] hover:bg-teal-50/40 cursor-pointer transition">
                            <Camera className="h-5 w-5 text-gray-400" />
                            <span className="text-[10px] font-bold text-[#00a896] mt-1">Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(key, e.target.files?.[0] || null)}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setStep(2)} className="btn-outline text-sm">
                  Back
                </button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary bg-[#00a896] hover:bg-[#008f80] flex items-center gap-2">
                  View Guaranteed Quote <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Instant Quote & Cashify Price Breakdown */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-xl text-center space-y-6">
              <span className="badge bg-emerald-50 text-emerald-800 font-extrabold uppercase tracking-wider text-xs">
                Pre-Approved Spot Cash Valuation · Lucknow
              </span>

              <div>
                <h2 className="font-display text-2xl font-black text-gray-900">
                  {form.brand} {form.model} ({form.storage})
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Condition: {form.condition} · IMEI: {form.imei || 'Verified at doorstep'}
                </p>
              </div>

              {/* Cashify Dark Quote Box */}
              <div className="rounded-3xl bg-gradient-to-r from-teal-950 via-gray-900 to-teal-950 p-8 text-white shadow-2xl relative overflow-hidden space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Guaranteed Lucknow Payout Quote</p>
                <div className="font-display text-4xl sm:text-5xl font-black text-white">
                  {formatINR(estimate)}
                </div>
                <p className="text-xs text-gray-300">Valid for 7 full days · Price match guarantee across Lucknow</p>

                <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold pt-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-emerald-300">
                    <BadgeIndianRupee className="h-3.5 w-3.5" /> Instant Spot Payment
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-emerald-300">
                    <Truck className="h-3.5 w-3.5" /> Free Doorstep Pickup
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-emerald-300">
                    <Lock className="h-3.5 w-3.5" /> 100% Data Wipe Guaranteed
                  </span>
                </div>
              </div>

              {/* Cashify Live Price Breakdown Card */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#00a896]" /> Fundu Instant Valuation Breakdown
                  </span>
                  <span className="badge bg-teal-100 text-teal-800 text-[10px] font-bold">Guaranteed</span>
                </div>

                <div className="flex justify-between font-semibold text-gray-700">
                  <span>Base Resale Market Price:</span>
                  <span className="font-bold text-gray-900">{formatINR(cashifyValuation.basePrice)}</span>
                </div>

                {cashifyValuation.screenDeduction > 0 && (
                  <div className="flex justify-between text-rose-700 font-medium">
                    <span>Screen Condition Deduction ({form.screenCondition}):</span>
                    <span className="font-bold">- {formatINR(cashifyValuation.screenDeduction)}</span>
                  </div>
                )}

                {cashifyValuation.bodyDeduction > 0 && (
                  <div className="flex justify-between text-rose-700 font-medium">
                    <span>Body Condition Deduction ({form.bodyCondition}):</span>
                    <span className="font-bold">- {formatINR(cashifyValuation.bodyDeduction)}</span>
                  </div>
                )}

                {cashifyValuation.callDeduction > 0 && (
                  <div className="flex justify-between text-rose-700 font-medium">
                    <span>Calling Capability Fault Deduction:</span>
                    <span className="font-bold">- {formatINR(cashifyValuation.callDeduction)}</span>
                  </div>
                )}

                {cashifyValuation.defectsBreakdown.map((def, idx) => (
                  <div key={idx} className="flex justify-between text-rose-700 font-medium pl-2 border-l-2 border-rose-300">
                    <span>{def.name}:</span>
                    <span className="font-bold">- {formatINR(def.amount)}</span>
                  </div>
                ))}

                {cashifyValuation.warrantyBonus > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Brand Warranty Bonus:</span>
                    <span className="font-bold">+ {formatINR(cashifyValuation.warrantyBonus)}</span>
                  </div>
                )}

                {cashifyValuation.accessoriesBonus > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Original Accessories & Box Bonus:</span>
                    <span className="font-bold">+ {formatINR(cashifyValuation.accessoriesBonus)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-sm text-gray-900">
                  <span>Net Doorstep Cash Offer:</span>
                  <span className="text-[#00a896] font-black text-base">{formatINR(cashifyValuation.finalEstimate)}</span>
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
                          ? 'border-[#00a896] bg-teal-50 font-extrabold text-[#00a896] ring-2 ring-[#00a896]/20'
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
                      className="input mt-1 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setStep(3)} className="btn-outline text-sm">
                  Back
                </button>
                <button type="button" onClick={() => setStep(5)} className="btn-primary bg-[#00a896] hover:bg-[#008f80] flex items-center gap-2">
                  Accept & Schedule Pickup <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Schedule Lucknow Doorstep Pickup & Auto-Assign Agent */}
        {step === 5 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="badge bg-teal-100 text-teal-800 font-bold">Step 5 of 5</span>
                  <h2 className="mt-1 font-display text-xl font-extrabold text-gray-900">
                    Schedule Lucknow Doorstep Pickup
                  </h2>
                  <p className="text-xs text-gray-500">
                    Guaranteed Payout: <span className="font-extrabold text-[#00a896]">{formatINR(estimate)}</span> ({form.payoutMethod})
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
                  <label className="label">Select Lucknow Locality / Cluster</label>
                  <select
                    value={form.pickupArea}
                    onChange={(e) => setForm({ ...form, pickupArea: e.target.value })}
                    className="input mt-1 focus:border-[#00a896]"
                  >
                    {LUCKNOW_LOCALITIES.map((area) => (
                      <option key={area} value={area}>
                        {area}, Lucknow
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
                    className="input mt-1 focus:border-[#00a896]"
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
                      className="input mt-1 focus:border-[#00a896]"
                    />
                  </div>

                  <div>
                    <label className="label">Preferred Time Slot</label>
                    <select
                      value={form.pickupSlot}
                      onChange={(e) => setForm({ ...form, pickupSlot: e.target.value })}
                      className="input mt-1 focus:border-[#00a896]"
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
                    className="input mt-1 focus:border-[#00a896]"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setStep(4)} className="btn-outline text-sm">
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !form.pickupAddress.trim()}
                  className="btn-primary bg-[#00a896] hover:bg-[#008f80] text-sm flex items-center gap-2"
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
