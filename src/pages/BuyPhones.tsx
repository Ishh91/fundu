import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Search,
  Smartphone,
  ShieldCheck,
  ShoppingCart,
  CheckCircle2,
  Truck,
  X,
  Filter,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  MessageSquare,
  Tag,
  Award,
  Zap,
  BatteryCharging,
  Camera,
  Cpu,
  Wifi,
  SlidersHorizontal,
} from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { db, formatINR } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getCleanPhoneImage, getCleanBrandLogo } from '../lib/phoneImages';
import type { Product } from '../types';

// Cashify-style circular brand filters with brand logos
const BRAND_PILLS = [
  { name: 'All', label: 'All Brands' },
  { name: 'Apple', label: 'Apple' },
  { name: 'Samsung', label: 'Samsung' },
  { name: 'OnePlus', label: 'OnePlus' },
  { name: 'Xiaomi', label: 'Xiaomi' },
  { name: 'Vivo', label: 'Vivo' },
  { name: 'Oppo', label: 'Oppo' },
  { name: 'Realme', label: 'Realme' },
  { name: 'Nothing', label: 'Nothing' },
  { name: 'Google', label: 'Pixel' },
  { name: 'Motorola', label: 'Motorola' },
  { name: 'Tecno', label: 'Tecno' },
  { name: 'Itel', label: 'Itel' },
  { name: 'Poco', label: 'POCO' },
  { name: 'iQOO', label: 'iQOO' },
];

const PRICE_PRESETS = [
  { label: 'All Prices', min: 0, max: 250000 },
  { label: 'Under ₹10,000', min: 0, max: 10000 },
  { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
  { label: '₹20,000 - ₹35,000', min: 20000, max: 35000 },
  { label: '₹35,000 - ₹50,000', min: 35000, max: 50000 },
  { label: 'Above ₹50,000', min: 50000, max: 250000 },
];

// Comprehensive 24+ certified refurbished inventory representing all Indian brands & models
const SAMPLE_BEST_SELLING_PHONES: Product[] = [
  {
    id: 'sample-apple-15pro',
    title: 'Apple iPhone 15 Pro (128 GB) - Natural Titanium',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    ram: '8 GB',
    storage: '128 GB',
    color: 'Natural Titanium',
    condition: 'Excellent',
    price: 84999,
    original_price: 134900,
    discount_percent: 37,
    warranty_months: 6,
    description: 'Refurbished Superb grade. Grade A+ Natural Titanium chassis, flawless OLED 120Hz display, 94% battery health. 32-point inspection verified.',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 4,
    sold_count: 58,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-apple-14',
    title: 'Apple iPhone 14 (128 GB) - Midnight Blue',
    brand: 'Apple',
    model: 'iPhone 14',
    ram: '6 GB',
    storage: '128 GB',
    color: 'Midnight Blue',
    condition: 'Excellent',
    price: 46999,
    original_price: 69900,
    discount_percent: 33,
    warranty_months: 6,
    description: 'Flawless condition, verified screen & camera. Includes charging cable and Fundu 6-month warranty card.',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 6,
    sold_count: 82,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-apple-13',
    title: 'Apple iPhone 13 (128 GB) - Starlight',
    brand: 'Apple',
    model: 'iPhone 13',
    ram: '4 GB',
    storage: '128 GB',
    color: 'Starlight',
    condition: 'Excellent',
    price: 37999,
    original_price: 59900,
    discount_percent: 37,
    warranty_months: 6,
    description: 'Refurbished Superb condition. 32-Point inspection passed. Battery health above 89%. Free doorstep delivery in Lucknow.',
    images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 8,
    sold_count: 120,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-sam-s24u',
    title: 'Samsung Galaxy S24 Ultra 5G (256 GB) - Titanium Gray',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    ram: '12 GB',
    storage: '256 GB',
    color: 'Titanium Gray',
    condition: 'Excellent',
    price: 89999,
    original_price: 129999,
    discount_percent: 31,
    warranty_months: 6,
    description: 'Superb condition, Galaxy AI enabled, S-Pen included, 200MP Quad Telephoto camera, flawless display.',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 3,
    sold_count: 34,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-sam-s23',
    title: 'Samsung Galaxy S23 5G (128 GB) - Phantom Black',
    brand: 'Samsung',
    model: 'Galaxy S23',
    ram: '8 GB',
    storage: '128 GB',
    color: 'Phantom Black',
    condition: 'Excellent',
    price: 39999,
    original_price: 74999,
    discount_percent: 47,
    warranty_months: 6,
    description: 'Flagship Snapdragon 8 Gen 2 performance. Thoroughly sanitized and tested. Free express delivery in Lucknow.',
    images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 5,
    sold_count: 73,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-oneplus-12',
    title: 'OnePlus 12 5G (256 GB) - Silky Black',
    brand: 'OnePlus',
    model: 'OnePlus 12',
    ram: '12 GB',
    storage: '256 GB',
    color: 'Silky Black',
    condition: 'Excellent',
    price: 45999,
    original_price: 64999,
    discount_percent: 29,
    warranty_months: 6,
    description: 'Snapdragon 8 Gen 3 flagship, 4th Gen Hasselblad camera, 5400mAh battery, 100W SuperVOOC tested.',
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 5,
    sold_count: 48,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-oneplus-11r',
    title: 'OnePlus 11R 5G (128 GB) - Sonic Black',
    brand: 'OnePlus',
    model: 'OnePlus 11R',
    ram: '8 GB',
    storage: '128 GB',
    color: 'Sonic Black',
    condition: 'Good',
    price: 24999,
    original_price: 39999,
    discount_percent: 38,
    warranty_months: 6,
    description: 'Fast Snapdragon 8+ Gen 1 chip, 120Hz Super Fluid AMOLED, certified battery health and charging.',
    images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 7,
    sold_count: 65,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-pixel-8',
    title: 'Google Pixel 8 5G (128 GB) - Hazel Gray',
    brand: 'Google',
    model: 'Pixel 8',
    ram: '8 GB',
    storage: '128 GB',
    color: 'Hazel Gray',
    condition: 'Excellent',
    price: 43999,
    original_price: 75999,
    discount_percent: 42,
    warranty_months: 6,
    description: 'Google Tensor G3 chip with state-of-the-art AI photography, 120Hz Actua display, clean Android 14+.',
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 4,
    sold_count: 38,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-nothing-2a',
    title: 'Nothing Phone (2a) 5G (128 GB) - White',
    brand: 'Nothing',
    model: 'Phone (2a)',
    ram: '8 GB',
    storage: '128 GB',
    color: 'White',
    condition: 'Excellent',
    price: 18999,
    original_price: 25999,
    discount_percent: 27,
    warranty_months: 6,
    description: 'Distinctive transparent Glyph interface, Dimensity 7200 Pro processor, dual 50MP cameras. Like new.',
    images: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 8,
    sold_count: 51,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-nothing-2',
    title: 'Nothing Phone (2) 5G (256 GB) - Dark Grey',
    brand: 'Nothing',
    model: 'Phone (2)',
    ram: '12 GB',
    storage: '256 GB',
    color: 'Dark Grey',
    condition: 'Excellent',
    price: 28999,
    original_price: 44999,
    discount_percent: 36,
    warranty_months: 6,
    description: 'Glyph Interface, premium glass and aluminum build, Snapdragon 8+ Gen 1, dual 50MP Sony sensors.',
    images: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 4,
    sold_count: 29,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-cmf-1',
    title: 'CMF Phone 1 by Nothing (128 GB) - Black',
    brand: 'Nothing',
    model: 'CMF Phone 1',
    ram: '6 GB',
    storage: '128 GB',
    color: 'Black',
    condition: 'Excellent',
    price: 13499,
    original_price: 17999,
    discount_percent: 25,
    warranty_months: 6,
    description: 'Modular interchangeable back cover, Super AMOLED 120Hz screen, Dimensity 7300 5G power.',
    images: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 6,
    sold_count: 40,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-xiaomi-13pro',
    title: 'Xiaomi Redmi Note 13 Pro 5G (256 GB) - Coral Purple',
    brand: 'Xiaomi',
    model: 'Redmi Note 13 Pro',
    ram: '8 GB',
    storage: '256 GB',
    color: 'Coral Purple',
    condition: 'Good',
    price: 17499,
    original_price: 25999,
    discount_percent: 33,
    warranty_months: 6,
    description: '200MP OIS camera with 4x in-sensor zoom, 1.5K 120Hz curved AMOLED, certified charging speed.',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 9,
    sold_count: 88,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-vivo-v30',
    title: 'Vivo V30 Pro 5G (256 GB) - Classic Black',
    brand: 'Vivo',
    model: 'Vivo V30 Pro',
    ram: '8 GB',
    storage: '256 GB',
    color: 'Classic Black',
    condition: 'Excellent',
    price: 28999,
    original_price: 41999,
    discount_percent: 31,
    warranty_months: 6,
    description: 'ZEISS Professional Portrait Camera, Studio-Quality Smart Aura Light, 3D Curved 120Hz display.',
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 5,
    sold_count: 42,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-oppo-reno11',
    title: 'Oppo Reno 11 5G (128 GB) - Wave Green',
    brand: 'Oppo',
    model: 'Oppo Reno 11',
    ram: '8 GB',
    storage: '128 GB',
    color: 'Wave Green',
    condition: 'Good',
    price: 21999,
    original_price: 32999,
    discount_percent: 33,
    warranty_months: 6,
    description: '32MP Telephoto Portrait Camera, 67W SUPERVOOC Flash Charge, 120Hz 3D curved OLED screen.',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 4,
    sold_count: 36,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-realme-12pro',
    title: 'Realme 12 Pro+ 5G (256 GB) - Submarine Blue',
    brand: 'Realme',
    model: 'Realme 12 Pro+',
    ram: '8 GB',
    storage: '256 GB',
    color: 'Submarine Blue',
    condition: 'Excellent',
    price: 21499,
    original_price: 31999,
    discount_percent: 33,
    warranty_months: 6,
    description: 'Periscope Telephoto Portrait Lens, luxury watch design leather back, 120Hz curved AMOLED.',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 6,
    sold_count: 55,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-moto-edge50',
    title: 'Motorola Edge 50 Pro 5G (256 GB) - Moonlight Pearl',
    brand: 'Motorola',
    model: 'Motorola Edge 50 Pro',
    ram: '8 GB',
    storage: '256 GB',
    color: 'Moonlight Pearl',
    condition: 'Excellent',
    price: 25499,
    original_price: 36999,
    discount_percent: 31,
    warranty_months: 6,
    description: 'Pantone-validated camera & display, 125W TurboPower charging, IP68 water protection.',
    images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 4,
    sold_count: 31,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-tecno-camon30',
    title: 'Tecno Camon 30 Premier 5G (512 GB) - Alps Snowy Silver',
    brand: 'Tecno',
    model: 'Tecno Camon 30 Premier',
    ram: '12 GB',
    storage: '512 GB',
    color: 'Alps Snowy Silver',
    condition: 'Excellent',
    price: 27999,
    original_price: 43999,
    discount_percent: 36,
    warranty_months: 6,
    description: 'PolarAce imaging chip, Quad 50MP Sony imaging system, 1.5K 144Hz LTPO AMOLED, 70W fast charging.',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: true,
    stock: 3,
    sold_count: 22,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-tecno-pova6',
    title: 'Tecno Pova 6 Pro 5G (256 GB) - Meteorite Grey',
    brand: 'Tecno',
    model: 'Tecno Pova 6 Pro',
    ram: '8 GB',
    storage: '256 GB',
    color: 'Meteorite Grey',
    condition: 'Good',
    price: 15499,
    original_price: 21999,
    discount_percent: 30,
    warranty_months: 6,
    description: 'Dynamic Mini-LED light interface, massive 6000mAh battery, 70W Ultra Charge, 120Hz FHD+ AMOLED.',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 5,
    sold_count: 39,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-itel-colorpro',
    title: 'Itel Color Pro 5G (128 GB) - River Blue',
    brand: 'Itel',
    model: 'Itel Color Pro 5G',
    ram: '6 GB',
    storage: '128 GB',
    color: 'River Blue',
    condition: 'Excellent',
    price: 8499,
    original_price: 12999,
    discount_percent: 35,
    warranty_months: 6,
    description: 'IVCO Photochromic color-changing back, Dimensity 6080 5G processor, 50MP AI Dual camera.',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 10,
    sold_count: 67,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-itel-s23plus',
    title: 'Itel S23+ 3D Curved AMOLED (256 GB) - Elemental Blue',
    brand: 'Itel',
    model: 'Itel S23+',
    ram: '8 GB',
    storage: '256 GB',
    color: 'Elemental Blue',
    condition: 'Good',
    price: 9999,
    original_price: 14999,
    discount_percent: 33,
    warranty_months: 6,
    description: 'First in segment 3D Curved FHD+ AMOLED display, in-display fingerprint sensor, 50MP portrait camera.',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 7,
    sold_count: 45,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-poco-x6pro',
    title: 'POCO X6 Pro 5G (256 GB) - Racing Yellow',
    brand: 'Poco',
    model: 'POCO X6 Pro',
    ram: '8 GB',
    storage: '256 GB',
    color: 'Racing Yellow',
    condition: 'Excellent',
    price: 21999,
    original_price: 30999,
    discount_percent: 29,
    warranty_months: 6,
    description: 'Dimensity 8300-Ultra powerhouse, 1.5K 120Hz Flow AMOLED, 64MP OIS triple camera setup.',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 5,
    sold_count: 63,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-iqoo-neo9pro',
    title: 'iQOO Neo 9 Pro 5G (128 GB) - Fiery Red',
    brand: 'iQOO',
    model: 'iQOO Neo 9 Pro',
    ram: '8 GB',
    storage: '128 GB',
    color: 'Fiery Red',
    condition: 'Excellent',
    price: 29999,
    original_price: 39999,
    discount_percent: 25,
    warranty_months: 6,
    description: 'Snapdragon 8 Gen 2 processor, dedicated Q1 Supercomputing chip, Sony IMX920 flagship sensor.',
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'],
    is_approved: true,
    is_featured: false,
    stock: 4,
    sold_count: 37,
    seller_id: null,
    created_at: new Date().toISOString(),
  },
];

const QUALITY_CHECK_POINTS = [
  {
    category: 'Display & Touchscreen',
    icon: Smartphone,
    points: ['TrueColor original OLED/LCD', '100% Touch responsiveness across screen', 'Zero dead pixels or burn-ins', 'Multi-touch gesture calibration'],
  },
  {
    category: 'Battery & Power Health',
    icon: BatteryCharging,
    points: ['Guaranteed >85% battery health retention', 'Original fast charging voltage tested', 'Thermal stability under load', 'Safe standby drain rate check'],
  },
  {
    category: 'Camera & Optics',
    icon: Camera,
    points: ['Primary & telephoto optical alignment', 'Optical Image Stabilization (OIS) pass', 'Front portrait selfie clarity', '4K video & microphone sync test'],
  },
  {
    category: 'Processor & Motherboard',
    icon: Cpu,
    points: ['Motherboard component diagnostic', 'RAM / storage read-write speed check', 'No water damage / moisture check', 'Zero performance throttling'],
  },
  {
    category: 'Connectivity & Sensors',
    icon: Wifi,
    points: ['5G / 4G LTE signal reception check', 'Dual-band Wi-Fi 6 & Bluetooth 5.3', 'GPS & Compass positioning accuracy', 'Biometrics (Face ID & Fingerprint)'],
  },
];

const BUYER_FAQS = [
  {
    q: 'What is a Fundu Certified Refurbished Phone?',
    a: 'A Fundu Certified Refurbished phone is a gently used or pre-owned smartphone that has undergone rigorous 32-point diagnostic inspection by certified engineers in Lucknow. Every component — including display, battery health, cameras, motherboard, and sensors — is verified 100% functional. Devices are professionally sanitized, graded honestly, and backed by a free 6-month Fundu warranty.',
  },
  {
    q: 'What are the Refurbished Condition Grades (Superb vs Good vs Fair)?',
    a: '• Superb (Like New): Flawless screen and body with near-zero signs of usage. 100% original parts and >88% battery health.\n• Good: Light cosmetic scuffs or faint scratches on the frame/back, but 100% pristine original screen and fully functional hardware.\n• Fair (Budget): Visible signs of wear on the body, but screen and internal components are completely functional and pass all 32 quality points.',
  },
  {
    q: 'How does the 6-Month Warranty work?',
    a: 'Every refurbished phone includes a 6-month warranty covering manufacturing defects, display glitches, motherboard issues, and technical hardware failures. If an issue occurs, our Lucknow technician repairs or replaces it free of charge.',
  },
  {
    q: 'Do I get free doorstep delivery in Lucknow?',
    a: 'Yes! We offer 100% free doorstep delivery across all Lucknow locations including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Sushant Golf City, Jankipuram, and surrounding areas. Delivery is typically completed within 2 to 24 hours.',
  },
  {
    q: 'Can I inspect the phone before accepting delivery?',
    a: 'Yes! Our doorstep delivery executive in Lucknow allows you an Open Box Inspection. You can verify the cosmetic condition, camera, display, and charging before making payment or signing the receipt.',
  },
  {
    q: 'What is the 7-Day Replacement Guarantee?',
    a: 'If you discover any technical defect within 7 days of delivery that was not described, we will replace the device with an identical certified model or provide a 100% refund, no questions asked.',
  },
];

export default function BuyPhones() {
  const { user, profile } = useAuth();
  const { setCartItem } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [pricePreset, setPricePreset] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(120000);
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [sortBy, setSortBy] = useState('featured');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const brandScrollRef = useRef<HTMLDivElement>(null);

  const scrollBrands = (direction: 'left' | 'right') => {
    if (brandScrollRef.current) {
      const scrollAmount = 260;
      brandScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    db
      .from('products')
      .select('*')
      .eq('is_approved', true)
      .order('is_featured', { ascending: false })
      .then(({ data }) => {
        const fetched = (data as Product[]) ?? [];
        if (fetched.length > 0) {
          const combined = [...fetched];
          SAMPLE_BEST_SELLING_PHONES.forEach((sp) => {
            if (!combined.some((p) => p.title.toLowerCase() === sp.title.toLowerCase())) {
              combined.push(sp);
            }
          });
          setProducts(combined);
        } else {
          setProducts(SAMPLE_BEST_SELLING_PHONES);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const q = searchParams.get('search') ?? searchParams.get('product') ?? '';
    const b = searchParams.get('brand') ?? '';
    if (q) setSearch(q);
    if (b) setSelectedBrand(b);
  }, [searchParams]);

  const handleResetFilters = () => {
    setSelectedBrand('All');
    setGradeFilter('All');
    setPricePreset(0);
    setMaxPrice(120000);
    setSelectedStorage('');
    setSearch('');
  };

  const filteredProducts = useMemo(() => {
    const preset = PRICE_PRESETS[pricePreset];
    let list = products.filter((p) => {
      // 1. Search text input match
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase());

      // 2. Brand match
      const matchBrand =
        selectedBrand === 'All' ||
        !selectedBrand ||
        p.brand.toLowerCase() === selectedBrand.toLowerCase() ||
        (selectedBrand.toLowerCase() === 'xiaomi' && (p.brand.toLowerCase() === 'redmi' || p.brand.toLowerCase() === 'poco'));

      // 3. Grade condition match
      const matchGrade =
        gradeFilter === 'All' ||
        (gradeFilter === 'Superb' && p.condition === 'Excellent') ||
        (gradeFilter === 'Good' && p.condition === 'Good') ||
        (gradeFilter === 'Fair' && p.condition === 'Fair');

      // 4. Storage match
      const matchStorage =
        !selectedStorage || p.storage?.toLowerCase().includes(selectedStorage.toLowerCase());

      // 5. Price range match
      const matchPreset = p.price >= preset.min && p.price <= preset.max;
      const matchMaxPrice = p.price <= maxPrice;

      return matchSearch && matchBrand && matchGrade && matchStorage && matchPreset && matchMaxPrice;
    });

    if (sortBy === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'discount') list = [...list].sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));

    return list;
  }, [products, search, selectedBrand, gradeFilter, selectedStorage, pricePreset, maxPrice, sortBy]);

  const handleAddToCart = (product: Product) => {
    if (profile && profile.role !== 'customer') {
      alert(`Access Restricted: You are logged in as ${profile.role.toUpperCase()}. Vendor, Delivery, and Admin accounts cannot place orders.`);
      return;
    }
    setCartItem({ type: 'product', item: product, quantity: 1 });
  };

  const handleBuyNow = (product: Product) => {
    if (profile && profile.role !== 'customer') {
      alert(`Access Restricted: You are logged in as ${profile.role.toUpperCase()}. Vendor, Delivery, and Admin accounts cannot place orders.`);
      return;
    }
    setCartItem({ type: 'product', item: product, quantity: 1 });
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7FA] pb-24 text-[#344257]">
      {/* CASHIFY-STYLE HERO & TOP BAR WITH FUNDU PALETTE */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1E2734 0%, #344257 55%, #47576E 100%)',
        }}
        className="text-white py-10 md:py-14 border-b border-[#344257]/30 shadow-md relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C0C8D8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="container-page relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-[#C0C8D8] border border-white/15">
                <Sparkles className="h-3.5 w-3.5 text-[#C0C8D8]" />
                <span>Certified Refurbished Marketplace · Lucknow</span>
              </div>
              <h1 className="mt-3 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Buy Refurbished Mobile Phones
              </h1>
              <p className="mt-2 text-xs md:text-sm text-[#C0C8D8] leading-relaxed">
                Save up to 50% on top smartphones. 32-Point inspection certified, 6-Month warranty, & free doorstep delivery across Lucknow.
              </p>

              {/* Cashify Feature Badges */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/90">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#C0C8D8]" /> 6 Months Warranty
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  <Award className="h-3.5 w-3.5 text-[#C0C8D8]" /> 32-Point Quality Passed
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  <Truck className="h-3.5 w-3.5 text-[#C0C8D8]" /> Free Lucknow Delivery
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  <RotateCcw className="h-3.5 w-3.5 text-[#C0C8D8]" /> 7-Day Replacement
                </div>
              </div>
            </div>

            {/* Prominent Search Bar */}
            <div className="w-full md:w-[460px] bg-white rounded-2xl p-2 shadow-xl border border-white/20">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-5 w-5 text-[#47576E]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search model — iPhone 15, S24, OnePlus 12..."
                  className="w-full bg-transparent pl-11 pr-10 py-2.5 text-sm font-semibold text-[#344257] outline-none placeholder:text-gray-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 text-gray-400 hover:text-[#344257] bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Popular Search Pills */}
              <div className="pt-2 px-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-bold text-gray-400 text-[10px] uppercase tracking-wider">Trending:</span>
                {['iPhone 15', 'Galaxy S24', 'Nothing 2a', 'OnePlus 12', 'Pixel 8', 'Tecno Camon'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearch(term)}
                    className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-[#47576E] hover:bg-[#344257] hover:text-white transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CASHIFY-STYLE HORIZONTAL CIRCULAR BRAND LOGO CAROUSEL */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="container-page py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#47576E]">
              Shop By Brand
            </span>
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">
              Select a brand to filter certified phones
            </span>
          </div>

          <div className="relative group/carousel">
            {/* Desktop Left Scroll Arrow */}
            <button
              type="button"
              onClick={() => scrollBrands('left')}
              className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-300 shadow-md text-[#344257] hover:bg-[#344257] hover:text-white transition cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Scrollable Brands Strip */}
            <div
              ref={brandScrollRef}
              className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-2 px-1 scrollbar-hide no-scrollbar scrollbar-none scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {BRAND_PILLS.map((b) => {
                const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
                return (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => setSelectedBrand(b.name)}
                    className="flex flex-col items-center gap-1.5 px-1.5 py-1 min-w-[70px] sm:min-w-[78px] transition-all duration-200 shrink-0 group focus:outline-none cursor-pointer"
                  >
                    <div
                      className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center p-2.5 transition-all duration-200 bg-white ${
                        isSelected
                          ? 'border-2 border-[#344257] ring-4 ring-[#344257]/15 shadow-sm scale-105 bg-slate-50'
                          : 'border border-gray-200 hover:border-[#6A859F] hover:shadow-xs hover:scale-105'
                      }`}
                    >
                      {b.name === 'All' ? (
                        <div className="h-full w-full rounded-full bg-[#344257] text-white flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-white" />
                        </div>
                      ) : (
                        <img
                          src={getCleanBrandLogo(b.name)}
                          alt={b.name}
                          className="h-full w-full object-contain pointer-events-none"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs tracking-tight text-center whitespace-nowrap transition-colors ${
                        isSelected
                          ? 'font-extrabold text-[#344257]'
                          : 'font-semibold text-gray-600 group-hover:text-[#344257]'
                      }`}
                    >
                      {b.label}
                    </span>
                    {isSelected && (
                      <span className="h-1 w-5 rounded-full bg-[#344257] -mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Desktop Right Scroll Arrow */}
            <button
              type="button"
              onClick={() => scrollBrands('right')}
              className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-300 shadow-md text-[#344257] hover:bg-[#344257] hover:text-white transition cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* QUICK PRICE PRESET FILTER PILLS */}
      <section className="bg-[#F0F2F5] border-b border-gray-200/80 py-2.5">
        <div
          className="container-page flex items-center justify-between gap-3 overflow-x-auto scrollbar-hide no-scrollbar scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[#47576E] uppercase tracking-wider hidden sm:inline">
              Budget:
            </span>
            {PRICE_PRESETS.map((p, idx) => {
              const active = pricePreset === idx;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPricePreset(idx)}
                  className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition ${
                    active
                      ? 'bg-[#344257] text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-bold text-[#344257] shrink-0 shadow-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </button>
        </div>
      </section>

      {/* MAIN CONTAINER: SIDEBAR + CASHIFY PRODUCT GRID */}
      <div className="container-page mt-6">
        {/* Grade Tabs & Sort Bar */}
        <div className="bg-white p-3 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-3 border border-gray-200 shadow-xs">
          <div
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide no-scrollbar scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <span className="text-xs font-bold text-gray-500 px-2 uppercase tracking-wider">Grade:</span>
            {[
              { id: 'All', label: 'All Grades' },
              { id: 'Superb', label: 'Superb (Like New)' },
              { id: 'Good', label: 'Good Value' },
              { id: 'Fair', label: 'Fair / Budget' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGradeFilter(g.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  gradeFilter === g.id
                    ? 'bg-[#344257] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-gray-500">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1 px-3 text-xs font-bold rounded-xl border border-gray-200 bg-white text-[#344257] outline-none focus:ring-1 focus:ring-[#344257]"
            >
              <option value="featured">Featured Deals</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="discount">Highest Savings / Discount</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className={`space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-display text-sm font-extrabold text-[#344257] flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#47576E]" /> Refine Results
                </h3>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#47576E] hover:underline font-bold"
                >
                  Reset
                </button>
              </div>

              {/* Storage Filter */}
              <div>
                <label className="text-xs font-bold text-[#344257] uppercase tracking-wider block mb-2">
                  Storage Capacity
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['64 GB', '128 GB', '256 GB', '512 GB'].map((stg) => (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => setSelectedStorage(selectedStorage === stg ? '' : stg)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        selectedStorage === stg
                          ? 'bg-[#344257] text-white'
                          : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {stg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Max Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-[#344257] mb-1">
                  <span>Max Budget:</span>
                  <span className="text-[#344257] font-black">{formatINR(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="8000"
                  max="150000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#344257] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>₹8,000</span>
                  <span>₹1,50,000</span>
                </div>
              </div>

              {/* Certified Refurbished Assurances Box */}
              <div className="rounded-xl bg-[#F7F7FA] p-3.5 border border-gray-200/80 space-y-2.5 text-xs text-[#47576E]">
                <div className="font-extrabold text-[#344257] flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="h-4 w-4 text-[#344257]" /> Fundu Assured
                </div>
                <div className="space-y-1.5 text-[11px] text-gray-600">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    32-Point diagnostic tested
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    6 Months Free Warranty
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    7 Days Replacement Policy
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Free Doorstep Delivery in Lucknow
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* CASHIFY PRODUCT GRID */}
          <main className="space-y-6">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <p>
                Showing <span className="text-[#344257] font-extrabold">{filteredProducts.length}</span> certified refurbished devices in Lucknow
              </p>
              {selectedBrand !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedBrand('All')}
                  className="text-[#47576E] hover:underline flex items-center gap-1"
                >
                  Clear Brand Filter <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl p-4 h-80 animate-pulse border border-gray-200" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 shadow-xs space-y-4">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gray-100 text-[#47576E]">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#344257]">
                  No Refurbished Phones Found
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  We currently do not have matching inventory for your filters. Our stock refreshes daily across Lucknow!
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="btn bg-[#344257] text-white hover:bg-[#47576E] text-xs px-4 py-2 rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> View All Phones
                  </button>
                  <a
                    href={`https://wa.me/919839122345?text=${encodeURIComponent(
                      `Hi Fundu Lucknow, I am searching for ${search || selectedBrand || 'a refurbished phone'}. Please notify me when it's available!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn bg-[#25D366] text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Notify on WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => {
                  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80';
                  const isSuperb = product.condition === 'Excellent';
                  const savings = product.original_price && product.original_price > product.price
                    ? product.original_price - product.price
                    : null;
                  const emiAmount = Math.round(product.price / 6);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-gray-200/90 hover:border-[#6A859F] hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Top Card Section: Badges, Image & Details */}
                      <div>
                        {/* Image Showcase Container */}
                        <div className="relative bg-[#F8F9FA] p-4 flex items-center justify-center overflow-hidden border-b border-gray-100">
                          {/* Grade Pill (Cashify style) */}
                          <span
                            className={`absolute top-3 left-3 z-10 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs ${
                              isSuperb
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#47576E] text-white'
                            }`}
                          >
                            {isSuperb ? 'Superb (Like New)' : 'Good Value'}
                          </span>

                          {/* Discount / Offer Tag */}
                          {product.discount_percent ? (
                            <span className="absolute top-3 right-3 z-10 text-[10px] font-extrabold bg-[#E65100] text-white px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <Tag className="h-3 w-3" /> {product.discount_percent}% OFF
                            </span>
                          ) : null}

                          <Link to={`/product/${product.id}`} className="block my-2">
                            <img
                              src={getCleanPhoneImage(product.brand, product.title, image)}
                              alt={product.title}
                              className="h-44 w-auto max-h-44 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = getCleanPhoneImage(product.brand, product.title, '');
                              }}
                            />
                          </Link>

                          {/* 32-Point Quality Badge Bottom Overlay */}
                          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-center gap-1 bg-white/90 backdrop-blur-xs py-1 px-2 rounded-lg text-[10px] font-bold text-[#344257] border border-gray-200/60 shadow-xs">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>32-Point Certified Refurbished</span>
                          </div>
                        </div>

                        {/* Title & Specs */}
                        <div className="p-4 pb-2">
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-display font-bold text-sm text-[#344257] group-hover:text-[#47576E] transition line-clamp-1">
                              {product.title}
                            </h3>
                          </Link>

                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 font-semibold">
                            {product.storage && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                                {product.storage}
                              </span>
                            )}
                            {product.ram && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                                {product.ram} RAM
                              </span>
                            )}
                            {product.color && (
                              <span className="text-gray-400">· {product.color}</span>
                            )}
                          </div>

                          {/* 6 Months Warranty Pill */}
                          <div className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded w-max">
                            <ShieldCheck className="h-3 w-3 text-emerald-600" />
                            <span>6 Months Warranty in Lucknow</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Pricing & Action Section */}
                      <div className="p-4 pt-2 border-t border-gray-100 bg-[#FAFAFC]">
                        <div className="flex items-baseline justify-between mb-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-display text-lg font-black text-[#344257]">
                              {formatINR(product.price)}
                            </span>
                            {product.original_price && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatINR(product.original_price)}
                              </span>
                            )}
                          </div>
                          {savings && (
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                              Save {formatINR(savings)}
                            </span>
                          )}
                        </div>

                        {/* Cashify EMI line */}
                        <p className="text-[10px] text-gray-500 mb-3 font-medium flex items-center gap-1">
                          <Zap className="h-2.5 w-2.5 text-amber-500" />
                          <span>Or EMI starting at <strong>{formatINR(emiAmount)}/mo</strong></span>
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleBuyNow(product)}
                            style={{
                              background: 'linear-gradient(135deg, #344257 0%, #47576E 100%)',
                            }}
                            className="flex-1 text-white text-xs py-2 rounded-xl font-bold shadow-xs hover:opacity-95 transition text-center"
                          >
                            Buy Now
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="grid h-8 w-8 place-items-center rounded-xl border border-gray-300 bg-white text-[#344257] hover:bg-gray-50 transition shrink-0 shadow-xs"
                            title="Add to cart"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {/* CASHIFY-STYLE 32-POINT INSPECTION CHECKLIST SECTION */}
        <section className="mt-16 bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xs">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#344257]/10 px-3 py-1 text-xs font-bold text-[#344257]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#344257]" /> Cashify-Grade Standards
            </div>
            <h2 className="mt-2 font-display text-2xl md:text-3xl font-extrabold text-[#344257]">
              The 32-Point Quality Inspection
            </h2>
            <p className="mt-1.5 text-xs md:text-sm text-gray-500">
              Every refurbished phone undergoes strict mechanical, electronic, and software inspection before arriving at your doorstep in Lucknow.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {QUALITY_CHECK_POINTS.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.category}
                  className="rounded-2xl border border-gray-200 bg-[#F8F9FB] p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="h-9 w-9 rounded-xl bg-[#344257] text-white flex items-center justify-center shadow-xs">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="mt-3 font-display text-xs font-bold text-[#344257]">
                      {cat.category}
                    </h4>
                    <ul className="mt-2.5 space-y-1.5">
                      {cat.points.map((pt) => (
                        <li key={pt} className="text-[11px] text-gray-600 flex items-start gap-1.5 leading-tight">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CASHIFY-STYLE REFURBISHED GRADING GUIDE */}
        <section className="mt-8 bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xs">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-extrabold text-[#344257]">
              Refurbished Condition Grading Guide
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Transparent assessment — zero surprises when you open your box in Lucknow
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border-2 border-emerald-500/80 bg-emerald-50/20 p-5 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-full">
                Superb (Like New)
              </div>
              <h4 className="font-bold text-sm text-[#344257]">Almost Indistinguishable From New</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Zero scratches on screen, flawless body or near-invisible handling marks. Battery health guaranteed &gt;88%. 100% original OEM display and camera modules.
              </p>
              <div className="text-[11px] font-bold text-emerald-700 pt-2 border-t border-emerald-200">
                ✓ Best for buyers wanting a showroom feel at up to 40% off
              </div>
            </div>

            <div className="rounded-2xl border-2 border-[#47576E]/60 bg-[#F4F5F8] p-5 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-[#47576E] text-white text-xs font-extrabold px-3 py-1 rounded-full">
                Good Value
              </div>
              <h4 className="font-bold text-sm text-[#344257]">Perfect Functionality with Minor Signs</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Clean pristine display with zero cracks. Body or bezel may show light faint cosmetic scratches from pocket wear. 100% internal hardware performance.
              </p>
              <div className="text-[11px] font-bold text-[#344257] pt-2 border-t border-gray-300">
                ✓ Best value for money — saves up to 50% on flagship models
              </div>
            </div>

            <div className="rounded-2xl border-2 border-gray-300 bg-white p-5 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-gray-600 text-white text-xs font-extrabold px-3 py-1 rounded-full">
                Fair / Budget
              </div>
              <h4 className="font-bold text-sm text-[#344257]">Maximum Savings, 100% Working</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Visible cosmetic scuffs, paint chips, or scratches on body or back panel. Screen has no cracks. All 32 diagnostic tests pass 100%.
              </p>
              <div className="text-[11px] font-bold text-gray-700 pt-2 border-t border-gray-200">
                ✓ Ideal for high performance on a strict budget
              </div>
            </div>
          </div>
        </section>

        {/* BUYER FAQS ACCORDION */}
        <section className="mt-8 bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-[#344257]" />
            <h2 className="font-display text-xl md:text-2xl font-extrabold text-[#344257]">
              Refurbished Mobile Phone FAQs
            </h2>
          </div>

          <div className="space-y-3">
            {BUYER_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.q} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs md:text-sm text-[#344257] hover:bg-gray-50 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-gray-600 border-t border-gray-100 leading-relaxed whitespace-pre-line">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
