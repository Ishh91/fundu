import { getCleanBrandLogo } from '../lib/phoneImages';
import { PAN_INDIA_POPULAR_CITIES } from '../lib/locationService';

// Master Service Localities (Pan-India Doorstep Coverage)
export const DOORSTEP_LOCALITIES = PAN_INDIA_POPULAR_CITIES.map((c) => c.displayLabel);

// Brand Grid Cards
export const BRAND_TILES = [
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
];

// Master Model Catalog Database (Easily Updatable JSON/Array)
export const MASTER_MODEL_CATALOG = [
  {
    "brand": "Apple",
    "series": "iPhone 11 Series",
    "model": "Apple iPhone 11",
    "storage": "64 GB",
    "price": 12490,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 11 Series",
    "model": "Apple iPhone 11 Pro",
    "storage": "64 GB",
    "price": 18500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 11 Series",
    "model": "Apple iPhone 11 Pro Max",
    "storage": "64 GB",
    "price": 22000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 12 Series",
    "model": "Apple iPhone 12",
    "storage": "64 GB",
    "price": 16490,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 12 mini",
    "model": "Apple iPhone 12 mini",
    "storage": "64 GB",
    "price": 13500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 12 Series",
    "model": "Apple iPhone 12 Pro",
    "storage": "128 GB",
    "price": 25500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 12 Series",
    "model": "Apple iPhone 12 Pro Max",
    "storage": "128 GB",
    "price": 30000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 13 Series",
    "model": "Apple iPhone 13",
    "storage": "128 GB",
    "price": 24260,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 13 mini",
    "model": "Apple iPhone 13 mini",
    "storage": "128 GB",
    "price": 20500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-mini.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 13 Series",
    "model": "Apple iPhone 13 Pro",
    "storage": "128 GB",
    "price": 35000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 13 Series",
    "model": "Apple iPhone 13 Pro Max",
    "storage": "128 GB",
    "price": 40000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 14 Series",
    "model": "Apple iPhone 14",
    "storage": "128 GB",
    "price": 28030,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 14 Series",
    "model": "Apple iPhone 14 Plus",
    "storage": "128 GB",
    "price": 33500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 14 Series",
    "model": "Apple iPhone 14 Pro",
    "storage": "128 GB",
    "price": 42690,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 14 Series",
    "model": "Apple iPhone 14 Pro Max",
    "storage": "128 GB",
    "price": 51000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 15 Series",
    "model": "Apple iPhone 15",
    "storage": "128 GB",
    "price": 42220,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 15 Series",
    "model": "Apple iPhone 15 Plus",
    "storage": "128 GB",
    "price": 48000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 15 Series",
    "model": "Apple iPhone 15 Pro",
    "storage": "128 GB",
    "price": 62000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 15 Series",
    "model": "Apple iPhone 15 Pro Max",
    "storage": "256 GB",
    "price": 70000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 16 Series",
    "model": "Apple iPhone 16",
    "storage": "128 GB",
    "price": 52800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 16 Series",
    "model": "Apple iPhone 16 Plus",
    "storage": "128 GB",
    "price": 61000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 16 Series",
    "model": "Apple iPhone 16 Pro",
    "storage": "128 GB",
    "price": 74910,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 16 Series",
    "model": "Apple iPhone 16 Pro Max",
    "storage": "256 GB",
    "price": 88000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 16 Series",
    "model": "Apple iPhone 16e",
    "storage": "128 GB",
    "price": 48000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16e.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 8 Series",
    "model": "Apple iPhone 8",
    "storage": "64 GB",
    "price": 5800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-8.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 8 Series",
    "model": "Apple iPhone 8 Plus",
    "storage": "64 GB",
    "price": 7800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-8.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 17 Series",
    "model": "Apple iPhone Air",
    "storage": "256 GB",
    "price": 82000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-air.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone SE Series",
    "model": "Apple iPhone SE 2020",
    "storage": "64 GB",
    "price": 8200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2020.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone SE Series",
    "model": "Apple iPhone SE 2022",
    "storage": "64 GB",
    "price": 13500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone SE Series",
    "model": "Apple iPhone SE 2nd Gen (2020)",
    "storage": "64 GB",
    "price": 8200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2020.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone SE Series",
    "model": "Apple iPhone SE 3rd Gen (2022)",
    "storage": "64 GB",
    "price": 13500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone X Series",
    "model": "Apple iPhone X",
    "storage": "64 GB",
    "price": 9500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone X Series",
    "model": "Apple iPhone XR",
    "storage": "64 GB",
    "price": 10200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xr.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone X Series",
    "model": "Apple iPhone XS",
    "storage": "64 GB",
    "price": 11000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone X Series",
    "model": "Apple iPhone XS Max",
    "storage": "64 GB",
    "price": 13500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg"
  },
  {
    "brand": "Google",
    "series": "Pixel 6 & Older Generation Series",
    "model": "Google Pixel 2 XL",
    "storage": "64 GB",
    "price": 4950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-xl2.jpg"
  },
  {
    "brand": "Google",
    "series": "Pixel 6 & Older Generation Series",
    "model": "Google Pixel 3 XL",
    "storage": "64 GB",
    "price": 1950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3-xl.jpg"
  },
  {
    "brand": "Google",
    "series": "Pixel 6 & Older Generation Series",
    "model": "Google Pixel 3a",
    "storage": "64 GB",
    "price": 1850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3a.jpg"
  },
  {
    "brand": "Google",
    "series": "Pixel 6 & Older Generation Series",
    "model": "Google Pixel 3a XL",
    "storage": "64 GB",
    "price": 2150,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3a-xl.jpg"
  },
  {
    "brand": "Google",
    "series": "Pixel 6 & Older Generation Series",
    "model": "Google Pixel 4 XL",
    "storage": "64 GB",
    "price": 3100,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-4-xl.jpg"
  },
  {
    "brand": "Google",
    "series": "Pixel 6 & Older Generation Series",
    "model": "Google Pixel 4a",
    "storage": "128 GB",
    "price": 4240,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-4a.jpg"
  },
  {
    "brand": "Google",
    "series": "Pixel 6 & Older Generation Series",
    "model": "Google Pixel 5",
    "storage": "128 GB",
    "price": 6400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-5-5g.jpg"
  },
  {
    "brand": "Google",
    "series": "Pixel 6 & Older Generation Series",
    "model": "Google Pixel 6",
    "storage": "128 GB",
    "price": 11400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6.jpg"
  },
  {
    "brand": "Google",
    "series": "Pixel 6 & Older Generation Series",
    "model": "Google Pixel 6 Pro",
    "storage": "128 GB",
    "price": 11500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6-pro.jpg"
  },
  {
    "brand": "Google",
    "series": "Pixel 6 & Older Generation Series",
    "model": "Google Pixel 6a",
    "storage": "128 GB",
    "price": 9810,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6a.jpg"
  },
  {
    "brand": "Google",
    "series": "Google Pixel 7 Series",
    "model": "Google Pixel 7",
    "storage": "128 GB",
    "price": 15400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-.jpg"
  },
  {
    "brand": "Google",
    "series": "Google Pixel 7 Series",
    "model": "Google Pixel 7 Pro",
    "storage": "128 GB",
    "price": 19800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-pro-.jpg"
  },
  {
    "brand": "Google",
    "series": "Google Pixel 7 Series",
    "model": "Google Pixel 7a",
    "storage": "128 GB",
    "price": 11850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg"
  },
  {
    "brand": "Google",
    "series": "Google Pixel 8 Series",
    "model": "Google Pixel 8",
    "storage": "128 GB",
    "price": 18500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg"
  },
  {
    "brand": "Google",
    "series": "Google Pixel 8 Series",
    "model": "Google Pixel 8 Pro",
    "storage": "128 GB",
    "price": 32880,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg"
  },
  {
    "brand": "Google",
    "series": "Google Pixel 8 Series",
    "model": "Google Pixel 8a",
    "storage": "128 GB",
    "price": 15800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8a.jpg"
  },
  {
    "brand": "Google",
    "series": "Google Pixel 9 Series",
    "model": "Google Pixel 9",
    "storage": "128 GB",
    "price": 37440,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9.jpg"
  },
  {
    "brand": "Google",
    "series": "Google Pixel 9 Series",
    "model": "Google Pixel 9 Pro",
    "storage": "128 GB",
    "price": 52800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-.jpg"
  },
  {
    "brand": "Google",
    "series": "Google Pixel 9 Series",
    "model": "Google Pixel 9 Pro Fold",
    "storage": "256 GB",
    "price": 72500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-fold.jpg"
  },
  {
    "brand": "Google",
    "series": "Google Pixel 9 Series",
    "model": "Google Pixel 9 Pro XL",
    "storage": "128 GB",
    "price": 68500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-xl.jpg"
  },
  {
    "brand": "Google",
    "series": "Pixel 6 & Older Generation Series",
    "model": "Google Pixel Fold",
    "storage": "256 GB",
    "price": 42000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-fold.jpg"
  },
  {
    "brand": "Infinix",
    "series": "Note Pro Series",
    "model": "Infinix Note 30 5G",
    "storage": "256 GB",
    "price": 8400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-note-30-5g.jpg"
  },
  {
    "brand": "Infinix",
    "series": "Hot Performance Series",
    "model": "Infinix Hot 30 5G",
    "storage": "128 GB",
    "price": 6800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-hot-30-5g.jpg"
  },
  {
    "brand": "Infinix",
    "series": "GT Gaming Series",
    "model": "Infinix GT 10 Pro 5G",
    "storage": "256 GB",
    "price": 11800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-gt-10-pro.jpg"
  },
  {
    "brand": "Infinix",
    "series": "GT Gaming Series",
    "model": "Infinix GT 20 Pro 5G",
    "storage": "256 GB",
    "price": 15200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-gt-20-pro.jpg"
  },
  {
    "brand": "Infinix",
    "series": "Hot Series",
    "model": "Infinix Hot 40 Pro",
    "storage": "128 GB",
    "price": 7200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-hot-40-pro.jpg"
  },
  {
    "brand": "Infinix",
    "series": "Note Series",
    "model": "Infinix Note 40 Pro 5G",
    "storage": "256 GB",
    "price": 11800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-note-40-pro-5g.jpg"
  },
  {
    "brand": "Infinix",
    "series": "Note Series",
    "model": "Infinix Note 40 Pro+ 5G",
    "storage": "256 GB",
    "price": 13500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-note-40-pro-plus-5g.jpg"
  },
  {
    "brand": "Infinix",
    "series": "Zero Series",
    "model": "Infinix Zero 30 5G",
    "storage": "256 GB",
    "price": 12400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-zero-30-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO 11 5G",
    "storage": "256 GB",
    "price": 19490,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-11.jpg"
  },
  {
    "brand": "iQOO",
    "series": "Number Series",
    "model": "iQOO 12 5G",
    "storage": "256 GB",
    "price": 31950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo12.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO 13 5G",
    "storage": "256 GB",
    "price": 31130,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-13.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO 3 5G",
    "storage": "128 GB",
    "price": 7920,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-3-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO 7 5G",
    "storage": "128 GB",
    "price": 11380,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-7-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO 7 Legend 5G",
    "storage": "128 GB",
    "price": 12910,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-7-legend-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO 9 5G",
    "storage": "128 GB",
    "price": 12910,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-9-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO 9 Pro 5G",
    "storage": "256 GB",
    "price": 17200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-9-pro-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO 9 SE 5G",
    "storage": "128 GB",
    "price": 13110,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-9-se-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO 9T 5G",
    "storage": "128 GB",
    "price": 16100,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-9t-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO Neo 6 5G",
    "storage": "128 GB",
    "price": 12690,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-6-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO Neo 7 5G",
    "storage": "128 GB",
    "price": 16450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-7-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "Neo Gaming Series",
    "model": "iQOO Neo 7 Pro 5G",
    "storage": "128 GB",
    "price": 16500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-7-pro.jpg"
  },
  {
    "brand": "iQOO",
    "series": "Neo Gaming Series",
    "model": "iQOO Neo 9 Pro 5G",
    "storage": "128 GB",
    "price": 21450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-9-pro.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO Z3 5G",
    "storage": "128 GB",
    "price": 9500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z3-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO Z5 5G",
    "storage": "128 GB",
    "price": 10070,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z5-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO Z6 5G",
    "storage": "128 GB",
    "price": 7290,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z6-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO Z6 Lite 5G",
    "storage": "64 GB",
    "price": 7820,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z6-lite-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO Z6 Pro 5G",
    "storage": "128 GB",
    "price": 9650,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z6-pro-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO Z7 5G",
    "storage": "128 GB",
    "price": 10640,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z7-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO Z7 Pro 5G",
    "storage": "128 GB",
    "price": 14800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z7-pro-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO Z7s 5G",
    "storage": "128 GB",
    "price": 9920,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z7s-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "Z Series",
    "model": "iQOO Z9 5G",
    "storage": "128 GB",
    "price": 9760,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9.jpg"
  },
  {
    "brand": "iQOO",
    "series": "iQOO Series",
    "model": "iQOO Z9 Lite 5G",
    "storage": "128 GB",
    "price": 9150,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9-lite-5g.jpg"
  },
  {
    "brand": "iQOO",
    "series": "Z Series",
    "model": "iQOO Z9s 5G",
    "storage": "128 GB",
    "price": 14810,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9s.jpg"
  },
  {
    "brand": "iQOO",
    "series": "Z Series",
    "model": "iQOO Z9s Pro 5G",
    "storage": "128 GB",
    "price": 14950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9s-pro.jpg"
  },
  {
    "brand": "iQOO",
    "series": "Z Series",
    "model": "iQOO Z9x 5G",
    "storage": "128 GB",
    "price": 9590,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9x.jpg"
  },
  {
    "brand": "Itel",
    "series": "A Series",
    "model": "Itel A05s",
    "storage": "64 GB",
    "price": 3800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/itel-a05s.jpg"
  },
  {
    "brand": "Itel",
    "series": "A Series",
    "model": "Itel A60s",
    "storage": "64 GB",
    "price": 4050,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/itel-a60s.jpg"
  },
  {
    "brand": "Itel",
    "series": "A Series",
    "model": "Itel A70",
    "storage": "128 GB",
    "price": 4700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/itel-a70.jpg"
  },
  {
    "brand": "Itel",
    "series": "Color Pro Series",
    "model": "Itel Color Pro 5G",
    "storage": "128 GB",
    "price": 7050,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/itel-color-pro-5g.jpg"
  },
  {
    "brand": "Itel",
    "series": "P Series",
    "model": "Itel P55+",
    "storage": "256 GB",
    "price": 6800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/itel-p55-plus.jpg"
  },
  {
    "brand": "Itel",
    "series": "P Series",
    "model": "Itel P55T",
    "storage": "128 GB",
    "price": 5600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/itel-p55t.jpg"
  },
  {
    "brand": "Itel",
    "series": "S Series",
    "model": "Itel S23+",
    "storage": "256 GB",
    "price": 8750,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/itel-s23-plus.jpg"
  },
  {
    "brand": "Itel",
    "series": "S Series",
    "model": "Itel S24",
    "storage": "128 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/itel-s24.jpg"
  },
  {
    "brand": "Itel",
    "series": "S Series",
    "model": "Itel S23",
    "storage": "128 GB",
    "price": 5800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/itel-s23.jpg"
  },
  {
    "brand": "Itel",
    "series": "P Series",
    "model": "Itel P55 5G",
    "storage": "128 GB",
    "price": 6800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/itel-p55.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto Edge Series",
    "model": "Motorola Edge 30",
    "storage": "128 GB",
    "price": 9600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-30.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto Edge Series",
    "model": "Motorola Edge 30 Fusion",
    "storage": "128 GB",
    "price": 11800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-30-fusion.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto Edge Series",
    "model": "Motorola Edge 30 Ultra",
    "storage": "128 GB",
    "price": 15800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-30-ultra.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto Edge Series",
    "model": "Motorola Edge 40",
    "storage": "256 GB",
    "price": 13200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto Edge Series",
    "model": "Motorola Edge 40 Neo",
    "storage": "128 GB",
    "price": 11600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40-neo.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto Edge Series",
    "model": "Motorola Edge 40 Pro",
    "storage": "256 GB",
    "price": 25950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40-pro.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto Edge Series",
    "model": "Motorola Edge 50 Fusion",
    "storage": "128 GB",
    "price": 15500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-fusion.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto Edge Series",
    "model": "Motorola Edge 50 Pro",
    "storage": "256 GB",
    "price": 18900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto Edge Series",
    "model": "Motorola Edge 50 Ultra",
    "storage": "512 GB",
    "price": 28640,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-ultra.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto G & E Series",
    "model": "Motorola Moto E13",
    "storage": "64 GB",
    "price": 5760,
    "image": "https://api.mobileapi.dev/devices/195/thumb.png"
  },
  {
    "brand": "Motorola",
    "series": "Moto G & E Series",
    "model": "Motorola Moto E22s",
    "storage": "64 GB",
    "price": 4930,
    "image": "https://api.mobileapi.dev/devices/199/thumb.png"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto e32",
    "storage": "64 GB",
    "price": 5020,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-e32.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto E40",
    "storage": "64 GB",
    "price": 5540,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-e40.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto E6s",
    "storage": "64 GB",
    "price": 3890,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-e6s.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto E7 Plus",
    "storage": "64 GB",
    "price": 4360,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-e7-plus.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 20",
    "storage": "128 GB",
    "price": 8810,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-20.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 20 Fusion",
    "storage": "128 GB",
    "price": 8490,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-20-fusion.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 20 Pro",
    "storage": "128 GB",
    "price": 9610,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-20-pro.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 30",
    "storage": "128 GB",
    "price": 10280,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-30.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 30 Fusion",
    "storage": "128 GB",
    "price": 11920,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-30-fusion.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 30 Pro",
    "storage": "128 GB",
    "price": 10700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-30-pro.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 30 Ultra",
    "storage": "128 GB",
    "price": 14270,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-30-ultra.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 40",
    "storage": "256 GB",
    "price": 17070,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-40.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 40 Neo",
    "storage": "128 GB",
    "price": 15780,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-40-neo.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 50",
    "storage": "256 GB",
    "price": 17310,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-50.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 50 Fusion",
    "storage": "128 GB",
    "price": 15880,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-50-fusion.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 50 Neo",
    "storage": "256 GB",
    "price": 17540,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-50-neo.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 50 Pro",
    "storage": "256 GB",
    "price": 19150,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-50-pro.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 50 Ultra",
    "storage": "512 GB",
    "price": 27410,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-50-ultra.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 60",
    "storage": "256 GB",
    "price": 19750,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-60.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 60 Fusion",
    "storage": "128 GB",
    "price": 17180,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-60-fusion.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 60 Pro",
    "storage": "256 GB",
    "price": 21050,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-60-pro.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 60 Stylus",
    "storage": "256 GB",
    "price": 17430,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-60-stylus.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 70",
    "storage": "256 GB",
    "price": 20500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-70.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 70 Fusion",
    "storage": "128 GB",
    "price": 19950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-70-fusion.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 70 Pro 5G",
    "storage": "256 GB",
    "price": 27900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-70-pro-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge 70 Pro Plus 5G",
    "storage": "256 GB",
    "price": 33650,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-70-pro-plus-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Edge Plus",
    "storage": "256 GB",
    "price": 9810,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-edge-plus.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G 5G",
    "storage": "128 GB",
    "price": 11450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G04",
    "storage": "64 GB",
    "price": 5510,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g04.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G04s",
    "storage": "64 GB",
    "price": 5760,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g04s.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G05",
    "storage": "64 GB",
    "price": 6920,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g05.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G06 Power",
    "storage": "64 GB",
    "price": 7130,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g06-power.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G10 Power",
    "storage": "64 GB",
    "price": 5050,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g10-power.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G13",
    "storage": "64 GB",
    "price": 4240,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g13.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto G & E Series",
    "model": "Motorola Moto G14",
    "storage": "128 GB",
    "price": 6630,
    "image": "https://api.mobileapi.dev/devices/246/thumb.png"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G22",
    "storage": "64 GB",
    "price": 5680,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g22.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto G & E Series",
    "model": "Motorola Moto G24 Power",
    "storage": "128 GB",
    "price": 4970,
    "image": "https://api.mobileapi.dev/devices/249/thumb.png"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G30",
    "storage": "64 GB",
    "price": 5110,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g30.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G31",
    "storage": "64 GB",
    "price": 5710,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g31.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G32",
    "storage": "64 GB",
    "price": 6070,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g32.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto G & E Series",
    "model": "Motorola Moto G34 5G",
    "storage": "128 GB",
    "price": 9010,
    "image": "https://api.mobileapi.dev/devices/221/thumb.png"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G35 5G",
    "storage": "128 GB",
    "price": 10700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g35-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G37 5G",
    "storage": "64 GB",
    "price": 11550,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g37-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G37 Power 5G",
    "storage": "128 GB",
    "price": 13360,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g37-power-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G40 Fusion",
    "storage": "64 GB",
    "price": 5970,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g40-fusion.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G42",
    "storage": "64 GB",
    "price": 5370,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g42.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G45 5G",
    "storage": "128 GB",
    "price": 8870,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g45-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G51 5G",
    "storage": "64 GB",
    "price": 7160,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g51-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G52",
    "storage": "64 GB",
    "price": 5730,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g52.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto G & E Series",
    "model": "Motorola Moto G54 5G",
    "storage": "128 GB",
    "price": 12340,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g54.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G57 Power 5G",
    "storage": "128 GB",
    "price": 11240,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g57-power-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G6 Plus",
    "storage": "64 GB",
    "price": 3830,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g6-plus.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G60",
    "storage": "128 GB",
    "price": 7370,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g60.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto G & E Series",
    "model": "Motorola Moto G62 5G",
    "storage": "128 GB",
    "price": 8700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g62-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto G & E Series",
    "model": "Motorola Moto G64 5G",
    "storage": "128 GB",
    "price": 11190,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g64.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G67 Power 5G",
    "storage": "128 GB",
    "price": 12500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g67-power-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G7",
    "storage": "64 GB",
    "price": 3530,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g7.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G7 Power",
    "storage": "64 GB",
    "price": 3850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g7-power.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G71 5G",
    "storage": "128 GB",
    "price": 9010,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g71-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G72",
    "storage": "128 GB",
    "price": 6740,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g72.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto G & E Series",
    "model": "Motorola Moto G73 5G",
    "storage": "128 GB",
    "price": 9880,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g73.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G8 Plus",
    "storage": "64 GB",
    "price": 4570,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g8-plus.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G8 Power Lite",
    "storage": "64 GB",
    "price": 4570,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g8-power-lite.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G82 5G",
    "storage": "128 GB",
    "price": 9060,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g82-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G84 5G",
    "storage": "256 GB",
    "price": 13800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g84-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto G & E Series",
    "model": "Motorola Moto G85 5G",
    "storage": "128 GB",
    "price": 11500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g85.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G86 Power 5G",
    "storage": "128 GB",
    "price": 14320,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g86-power-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G9",
    "storage": "64 GB",
    "price": 4700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g9.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G9 Power",
    "storage": "64 GB",
    "price": 4670,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g9-power.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto G96 5G",
    "storage": "128 GB",
    "price": 14370,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-g96-5g.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto One",
    "storage": "64 GB",
    "price": 3900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-one.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Razr",
    "storage": "128 GB",
    "price": 11400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-razr.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Razr 40",
    "storage": "256 GB",
    "price": 20460,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-razr-40.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Razr 40 Ultra",
    "storage": "256 GB",
    "price": 24580,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-razr-40-ultra.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Razr 50",
    "storage": "256 GB",
    "price": 25280,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-razr-50.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Razr 50 Ultra",
    "storage": "512 GB",
    "price": 33300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-razr-50-ultra.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Razr 60",
    "storage": "256 GB",
    "price": 28480,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-razr-60.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Razr 60 Ultra",
    "storage": "512 GB",
    "price": 47710,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-razr-60-ultra.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Signature",
    "storage": "256 GB",
    "price": 37570,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-signature.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola Moto Z2 Force",
    "storage": "64 GB",
    "price": 3560,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-moto-z2-force.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola One Action",
    "storage": "128 GB",
    "price": 3600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-one-action.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola One Fusion Plus",
    "storage": "128 GB",
    "price": 4890,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-one-fusion-plus.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola One Macro",
    "storage": "64 GB",
    "price": 3850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-one-macro.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola One Power",
    "storage": "64 GB",
    "price": 2800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-one-power.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Motorola Series",
    "model": "Motorola One Vision",
    "storage": "128 GB",
    "price": 3700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-motorola-one-vision.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto Razr Series",
    "model": "Motorola Razr 40",
    "storage": "256 GB",
    "price": 18200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-40.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto Razr Series",
    "model": "Motorola Razr 40 Ultra",
    "storage": "256 GB",
    "price": 24500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-40-ultra.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto Razr Series",
    "model": "Motorola Razr 50",
    "storage": "256 GB",
    "price": 29500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-50.jpg"
  },
  {
    "brand": "Motorola",
    "series": "Moto Razr Series",
    "model": "Motorola Razr 50 Ultra",
    "storage": "512 GB",
    "price": 39800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-50-ultra.jpg"
  },
  {
    "brand": "Nothing",
    "series": "Nothing Series",
    "model": "CMF by Nothing Phone 1",
    "storage": "128 GB",
    "price": 12950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/nothing-cmf-by-nothing-phone-1.jpg"
  },
  {
    "brand": "Nothing",
    "series": "Nothing Series",
    "model": "CMF by Nothing Phone 2 Pro 5G",
    "storage": "128 GB",
    "price": 20350,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/nothing-cmf-by-nothing-phone-2-pro-5g.jpg"
  },
  {
    "brand": "Nothing",
    "series": "CMF by Nothing Series",
    "model": "CMF Phone 1 by Nothing",
    "storage": "128 GB",
    "price": 9350,
    "image": "https://api.mobileapi.dev/devices/1249/thumb.png"
  },
  {
    "brand": "Nothing",
    "series": "Nothing Phone Series",
    "model": "Nothing Phone (1)",
    "storage": "128 GB",
    "price": 17300,
    "image": "https://api.mobileapi.dev/devices/1258/thumb.png"
  },
  {
    "brand": "Nothing",
    "series": "Nothing Phone Series",
    "model": "Nothing Phone (2)",
    "storage": "256 GB",
    "price": 27950,
    "image": "https://api.mobileapi.dev/devices/359/thumb.png"
  },
  {
    "brand": "Nothing",
    "series": "Nothing Phone Series",
    "model": "Nothing Phone (2a)",
    "storage": "128 GB",
    "price": 18400,
    "image": "https://api.mobileapi.dev/devices/1256/thumb.png"
  },
  {
    "brand": "Nothing",
    "series": "Nothing Phone Series",
    "model": "Nothing Phone (2a) Plus",
    "storage": "256 GB",
    "price": 21800,
    "image": "https://api.mobileapi.dev/devices/1256/thumb.png"
  },
  {
    "brand": "Nothing",
    "series": "Nothing Series",
    "model": "Nothing Phone 3",
    "storage": "256 GB",
    "price": 33600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/nothing-nothing-phone-3.jpg"
  },
  {
    "brand": "Nothing",
    "series": "Nothing Series",
    "model": "Nothing Phone 3a",
    "storage": "128 GB",
    "price": 21850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/nothing-nothing-phone-3a.jpg"
  },
  {
    "brand": "Nothing",
    "series": "Nothing Series",
    "model": "Nothing Phone 3a Lite",
    "storage": "128 GB",
    "price": 16800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/nothing-nothing-phone-3a-lite.jpg"
  },
  {
    "brand": "Nothing",
    "series": "Nothing Series",
    "model": "Nothing Phone 3a Pro",
    "storage": "128 GB",
    "price": 22560,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/nothing-nothing-phone-3a-pro.jpg"
  },
  {
    "brand": "Nothing",
    "series": "Nothing Series",
    "model": "Nothing Phone 4a",
    "storage": "128 GB",
    "price": 26950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/nothing-nothing-phone-4a.jpg"
  },
  {
    "brand": "Nothing",
    "series": "Nothing Series",
    "model": "Nothing Phone 4a Pro",
    "storage": "128 GB",
    "price": 31650,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/nothing-nothing-phone-4a-pro.jpg"
  },
  {
    "brand": "Nothing",
    "series": "Nothing Series",
    "model": "Nothing Phone 4b",
    "storage": "128 GB",
    "price": 24900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/nothing-nothing-phone-4b.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 13 & 12 Series",
    "model": "OnePlus 13",
    "storage": "256 GB",
    "price": 52000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-13.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 13 & 12 Series",
    "model": "OnePlus 13s",
    "storage": "256 GB",
    "price": 38000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-13.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 13 & 12 Series",
    "model": "OnePlus 13R",
    "storage": "128 GB",
    "price": 32000,
    "image": "https://api.mobileapi.dev/devices/366/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 13 & 12 Series",
    "model": "OnePlus 12",
    "storage": "256 GB",
    "price": 44000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 13 & 12 Series",
    "model": "OnePlus 12R",
    "storage": "128 GB",
    "price": 27000,
    "image": "https://api.mobileapi.dev/devices/364/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 11 Series",
    "model": "OnePlus 11 5G",
    "storage": "128 GB",
    "price": 30000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 11 Series",
    "model": "OnePlus 11R 5G",
    "storage": "128 GB",
    "price": 22000,
    "image": "https://api.mobileapi.dev/devices/362/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 10 Series",
    "model": "OnePlus 10 Pro",
    "storage": "128 GB",
    "price": 24000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 10 Series",
    "model": "OnePlus 10T",
    "storage": "128 GB",
    "price": 18000,
    "image": "https://api.mobileapi.dev/devices/16342/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 9 Series",
    "model": "OnePlus 9 Pro",
    "storage": "128 GB",
    "price": 18000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro-.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 9 Series",
    "model": "OnePlus 9RT",
    "storage": "128 GB",
    "price": 14000,
    "image": "https://api.mobileapi.dev/devices/369/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 9 Series",
    "model": "OnePlus 9",
    "storage": "128 GB",
    "price": 15000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 9 Series",
    "model": "OnePlus 9R",
    "storage": "128 GB",
    "price": 13000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-9r.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 8 & 7 Series",
    "model": "OnePlus 8 Pro",
    "storage": "128 GB",
    "price": 12500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-8-pro.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 8 & 7 Series",
    "model": "OnePlus 8T",
    "storage": "128 GB",
    "price": 10500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-8t.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 8 & 7 Series",
    "model": "OnePlus 8",
    "storage": "128 GB",
    "price": 9800,
    "image": "https://api.mobileapi.dev/devices/16348/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 8 & 7 Series",
    "model": "OnePlus 7T Pro McLaren Edition",
    "storage": "256 GB",
    "price": 10000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t-pro-mclaren.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 8 & 7 Series",
    "model": "OnePlus 7T Pro",
    "storage": "256 GB",
    "price": 9200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t-pro.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 8 & 7 Series",
    "model": "OnePlus 7T",
    "storage": "128 GB",
    "price": 7800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t-.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 8 & 7 Series",
    "model": "OnePlus 7 Pro",
    "storage": "128 GB",
    "price": 8800,
    "image": "https://api.mobileapi.dev/devices/16351/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 8 & 7 Series",
    "model": "OnePlus 7",
    "storage": "128 GB",
    "price": 6800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-7-.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord 4 5G",
    "storage": "128 GB",
    "price": 19000,
    "image": "https://api.mobileapi.dev/devices/809/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord 3 5G",
    "storage": "128 GB",
    "price": 15500,
    "image": "https://api.mobileapi.dev/devices/373/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord 2T 5G",
    "storage": "128 GB",
    "price": 12500,
    "image": "https://api.mobileapi.dev/devices/811/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord 2 5G",
    "storage": "128 GB",
    "price": 11000,
    "image": "https://api.mobileapi.dev/devices/377/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord CE4",
    "storage": "128 GB",
    "price": 16000,
    "image": "https://api.mobileapi.dev/devices/385/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord CE4 Lite",
    "storage": "128 GB",
    "price": 12500,
    "image": "https://api.mobileapi.dev/devices/16320/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord CE 3 5G",
    "storage": "128 GB",
    "price": 14000,
    "image": "https://api.mobileapi.dev/devices/374/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord CE 3 Lite 5G",
    "storage": "128 GB",
    "price": 10500,
    "image": "https://api.mobileapi.dev/devices/16320/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord CE 2 5G",
    "storage": "128 GB",
    "price": 10000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-2-5g.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord CE 2 Lite 5G",
    "storage": "128 GB",
    "price": 9000,
    "image": "https://api.mobileapi.dev/devices/815/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord CE",
    "storage": "128 GB",
    "price": 8000,
    "image": "https://api.mobileapi.dev/devices/810/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord",
    "storage": "128 GB",
    "price": 7500,
    "image": "https://api.mobileapi.dev/devices/811/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord N30 5G",
    "storage": "128 GB",
    "price": 8500,
    "image": "https://api.mobileapi.dev/devices/387/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Open & Foldable Series",
    "model": "OnePlus Open",
    "storage": "512 GB",
    "price": 68000,
    "image": "https://api.mobileapi.dev/devices/391/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 6 & Classic Series",
    "model": "OnePlus 6T McLaren",
    "storage": "256 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-6t-mclaren.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 6 & Classic Series",
    "model": "OnePlus 6T",
    "storage": "128 GB",
    "price": 5800,
    "image": "https://api.mobileapi.dev/devices/16352/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 6 & Classic Series",
    "model": "OnePlus 6",
    "storage": "64 GB",
    "price": 4800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-6-.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 6 & Classic Series",
    "model": "OnePlus 5T",
    "storage": "64 GB",
    "price": 3800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-5t.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 6 & Classic Series",
    "model": "OnePlus 5",
    "storage": "64 GB",
    "price": 3200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-5.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 6 & Classic Series",
    "model": "OnePlus 3T",
    "storage": "64 GB",
    "price": 2600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-3t-.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 6 & Classic Series",
    "model": "OnePlus 3",
    "storage": "64 GB",
    "price": 2200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-3.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A16",
    "storage": "64 GB",
    "price": 4500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a16.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A17",
    "storage": "64 GB",
    "price": 7130,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a17.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo A & K Series",
    "model": "Oppo A18",
    "storage": "64 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a18.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A3 5G",
    "storage": "128 GB",
    "price": 12190,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a3-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A3 Pro 5G",
    "storage": "128 GB",
    "price": 11020,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a3-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A31",
    "storage": "64 GB",
    "price": 7260,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a31.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo A & K Series",
    "model": "Oppo A38",
    "storage": "128 GB",
    "price": 8000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a38.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A3x",
    "storage": "64 GB",
    "price": 9570,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a3x.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A5 2020",
    "storage": "64 GB",
    "price": 7180,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a5-2020.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A5 Pro 5G",
    "storage": "128 GB",
    "price": 14830,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a5-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A52",
    "storage": "128 GB",
    "price": 7910,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a52.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A53",
    "storage": "64 GB",
    "price": 7940,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a53.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A53s 5G",
    "storage": "128 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a53s-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A54",
    "storage": "64 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a54.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A55",
    "storage": "64 GB",
    "price": 6800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a55.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A57 2022",
    "storage": "64 GB",
    "price": 6360,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a57-2022.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo A & K Series",
    "model": "Oppo A58 5G",
    "storage": "128 GB",
    "price": 9800,
    "image": "https://api.mobileapi.dev/devices/428/thumb.png"
  },
  {
    "brand": "Oppo",
    "series": "Oppo A & K Series",
    "model": "Oppo A59 5G",
    "storage": "128 GB",
    "price": 10500,
    "image": "https://api.mobileapi.dev/devices/14324/thumb.png"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A5x 5G",
    "storage": "64 GB",
    "price": 7860,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a5x-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A6 5G",
    "storage": "128 GB",
    "price": 15890,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a6-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A6 Pro 5G",
    "storage": "128 GB",
    "price": 16950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a6-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A6c",
    "storage": "64 GB",
    "price": 11440,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a6c.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A6s 5G",
    "storage": "128 GB",
    "price": 14220,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a6s-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A6x 5G",
    "storage": "64 GB",
    "price": 11090,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a6x-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A74 5G",
    "storage": "128 GB",
    "price": 8500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a74-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "Oppo A76",
    "storage": "128 GB",
    "price": 7870,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a76.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A77",
    "storage": "64 GB",
    "price": 7740,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a77.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A77 2022",
    "storage": "64 GB",
    "price": 5070,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a77-2022.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A77s",
    "storage": "128 GB",
    "price": 8780,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a77s.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo A & K Series",
    "model": "Oppo A78 5G",
    "storage": "128 GB",
    "price": 11000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a78-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo A & K Series",
    "model": "Oppo A79 5G",
    "storage": "128 GB",
    "price": 12000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a79.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A9",
    "storage": "128 GB",
    "price": 6730,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a9.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A9 2020",
    "storage": "128 GB",
    "price": 7620,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a9-2020.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO A96",
    "storage": "128 GB",
    "price": 8690,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a96.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F11",
    "storage": "128 GB",
    "price": 4800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f11.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F11 Pro",
    "storage": "64 GB",
    "price": 5500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f11-pro.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F11 Pro Avenger Edition",
    "storage": "128 GB",
    "price": 6200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f11-pro-avenger-edition.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F15",
    "storage": "128 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f15.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F17",
    "storage": "128 GB",
    "price": 7000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f17.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo F Series",
    "model": "Oppo F17 Pro",
    "storage": "128 GB",
    "price": 7800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f17-pro.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F19",
    "storage": "128 GB",
    "price": 8000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f19.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F19 Pro",
    "storage": "128 GB",
    "price": 8800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f19-pro.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo F Series",
    "model": "Oppo F19 Pro+ 5G",
    "storage": "128 GB",
    "price": 9500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f19-pro-plus-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo F Series",
    "model": "Oppo F19s",
    "storage": "128 GB",
    "price": 8000,
    "image": "https://api.mobileapi.dev/devices/1593/thumb.png"
  },
  {
    "brand": "Oppo",
    "series": "Oppo F Series",
    "model": "Oppo F21 Pro 5G",
    "storage": "128 GB",
    "price": 10500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f21-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo F Series",
    "model": "Oppo F21s Pro 5G",
    "storage": "128 GB",
    "price": 11000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f21s-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo F Series",
    "model": "Oppo F23 5G",
    "storage": "128 GB",
    "price": 12000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f23.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo F Series",
    "model": "Oppo F25 Pro 5G",
    "storage": "128 GB",
    "price": 15000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f25-pro.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F27 5G",
    "storage": "128 GB",
    "price": 14000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f27-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo F Series",
    "model": "Oppo F27 Pro+ 5G",
    "storage": "128 GB",
    "price": 16500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f27-pro-plus.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F29 5G",
    "storage": "128 GB",
    "price": 17450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f29-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F29 Pro 5G",
    "storage": "128 GB",
    "price": 17860,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f29-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F31 5G",
    "storage": "128 GB",
    "price": 19120,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f31-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F31 Pro 5G",
    "storage": "128 GB",
    "price": 20590,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f31-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F31 Pro Plus 5G",
    "storage": "256 GB",
    "price": 23770,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f31-pro-plus-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F33 5G",
    "storage": "128 GB",
    "price": 21850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f33-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F33 Pro 5G",
    "storage": "128 GB",
    "price": 24220,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f33-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F7",
    "storage": "64 GB",
    "price": 3200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f7.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F9",
    "storage": "64 GB",
    "price": 3500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f9.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO F9 Pro",
    "storage": "64 GB",
    "price": 4000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-f9-pro.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Find Series",
    "model": "Oppo Find N2 Flip",
    "storage": "256 GB",
    "price": 32000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-find-n2-flip.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Find Series",
    "model": "Oppo Find N3 Flip",
    "storage": "256 GB",
    "price": 42000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-find-n3-flip.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Find X",
    "storage": "256 GB",
    "price": 10540,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Find X2",
    "storage": "256 GB",
    "price": 13000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x2.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Find Series",
    "model": "Oppo Find X5 Pro",
    "storage": "256 GB",
    "price": 28000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x5-pro.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Find Series",
    "model": "Oppo Find X7 Ultra",
    "storage": "256 GB",
    "price": 59000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x7-ultra.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Find X9 5G",
    "storage": "256 GB",
    "price": 44510,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x9-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Find X9 Pro",
    "storage": "512 GB",
    "price": 62650,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x9-pro.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Find X9 Ultra",
    "storage": "512 GB",
    "price": 79250,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x9-ultra.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Find X9s",
    "storage": "256 GB",
    "price": 42550,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x9s.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO K1",
    "storage": "64 GB",
    "price": 7030,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-k1.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo A & K Series",
    "model": "Oppo K10 5G",
    "storage": "128 GB",
    "price": 10000,
    "image": "https://api.mobileapi.dev/devices/1553/thumb.png"
  },
  {
    "brand": "Oppo",
    "series": "Oppo A & K Series",
    "model": "Oppo K12x 5G",
    "storage": "128 GB",
    "price": 11000,
    "image": "https://api.mobileapi.dev/devices/1497/thumb.png"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO K13 5G",
    "storage": "128 GB",
    "price": 14930,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-k13-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO K13 Turbo 5G",
    "storage": "128 GB",
    "price": 18500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-k13-turbo-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO K13 Turbo Pro 5G",
    "storage": "256 GB",
    "price": 22080,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-k13-turbo-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO K13x 5G",
    "storage": "128 GB",
    "price": 9980,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-k13x-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO K14 5G",
    "storage": "128 GB",
    "price": 13870,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-k14-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO K14x 5G",
    "storage": "64 GB",
    "price": 11550,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-k14x-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO K3",
    "storage": "64 GB",
    "price": 8000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-k3.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO R17",
    "storage": "128 GB",
    "price": 6940,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-r17.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno",
    "storage": "128 GB",
    "price": 8600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Reno Series",
    "model": "Oppo Reno 10 5G",
    "storage": "128 GB",
    "price": 17000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno10.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Reno Series",
    "model": "Oppo Reno 10 Pro 5G",
    "storage": "256 GB",
    "price": 20000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno10-pro.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Reno Series",
    "model": "Oppo Reno 10 Pro+ 5G",
    "storage": "256 GB",
    "price": 26000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno10-pro-plus.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno 10x Zoom",
    "storage": "128 GB",
    "price": 8500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno-10x-zoom.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Reno Series",
    "model": "Oppo Reno 11 5G",
    "storage": "128 GB",
    "price": 18000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno11.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Reno Series",
    "model": "Oppo Reno 11 Pro 5G",
    "storage": "256 GB",
    "price": 22000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno11-pro.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Reno Series",
    "model": "Oppo Reno 12 5G",
    "storage": "256 GB",
    "price": 21000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno12.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Reno Series",
    "model": "Oppo Reno 12 Pro 5G",
    "storage": "256 GB",
    "price": 26000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno12-pro.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno 15c 5G",
    "storage": "256 GB",
    "price": 24680,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno-15c-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno 2",
    "storage": "256 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno-2.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno 2Z",
    "storage": "256 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno-2z.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Reno Series",
    "model": "Oppo Reno 6 Pro 5G",
    "storage": "128 GB",
    "price": 12000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno6-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Reno Series",
    "model": "Oppo Reno 7 Pro 5G",
    "storage": "256 GB",
    "price": 13000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno7-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Reno Series",
    "model": "Oppo Reno 8 5G",
    "storage": "128 GB",
    "price": 12500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno8.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Reno Series",
    "model": "Oppo Reno 8 Pro 5G",
    "storage": "256 GB",
    "price": 15000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno8-pro.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno13 5G",
    "storage": "128 GB",
    "price": 21900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno13-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno13 Pro 5G",
    "storage": "256 GB",
    "price": 25030,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno13-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno14 5G",
    "storage": "256 GB",
    "price": 25380,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno14-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno14 Pro 5G",
    "storage": "256 GB",
    "price": 31500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno14-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno15 5G",
    "storage": "256 GB",
    "price": 31050,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno15-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno15 Pro 5G",
    "storage": "256 GB",
    "price": 43150,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno15-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno15 Pro Mini 5G",
    "storage": "256 GB",
    "price": 36550,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno15-pro-mini-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno16 5G",
    "storage": "256 GB",
    "price": 39200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno16-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno16c 5G",
    "storage": "128 GB",
    "price": 31200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno16c-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno2 F",
    "storage": "256 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno2-f.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno3 Pro",
    "storage": "128 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno3-pro.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno4 Pro",
    "storage": "128 GB",
    "price": 8500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno4-pro.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno5 Pro 5G",
    "storage": "128 GB",
    "price": 10000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno5-pro-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno6 5G",
    "storage": "128 GB",
    "price": 10000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno6-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno7 5G",
    "storage": "256 GB",
    "price": 11000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno7-5g.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Series",
    "model": "OPPO Reno8T 5G",
    "storage": "128 GB",
    "price": 13290,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno8t-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO C Series",
    "model": "POCO C51",
    "storage": "64 GB",
    "price": 6480,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-c51.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO C Series",
    "model": "POCO C55",
    "storage": "64 GB",
    "price": 6830,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-c55.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO C Series",
    "model": "POCO C61",
    "storage": "64 GB",
    "price": 6900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-c61.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO C Series",
    "model": "Poco C65",
    "storage": "128 GB",
    "price": 7050,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-c65.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO C Series",
    "model": "POCO C71",
    "storage": "64 GB",
    "price": 6090,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-c71.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO C Series",
    "model": "POCO C75 5G",
    "storage": "64 GB",
    "price": 7810,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-c75-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO C Series",
    "model": "POCO C81",
    "storage": "64 GB",
    "price": 9530,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-c81.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO C Series",
    "model": "POCO C81X",
    "storage": "64 GB",
    "price": 8620,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-c81x.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO C Series",
    "model": "POCO C85 5G",
    "storage": "128 GB",
    "price": 10030,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-c85-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO C Series",
    "model": "POCO C85x",
    "storage": "64 GB",
    "price": 10080,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-c85x.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO F Series",
    "model": "POCO F3 GT",
    "storage": "128 GB",
    "price": 9900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-f3-gt.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO F Series",
    "model": "POCO F4 5G",
    "storage": "128 GB",
    "price": 8960,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-f4-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO F Series",
    "model": "Poco F5 5G",
    "storage": "256 GB",
    "price": 14450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f5.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO F Series",
    "model": "Poco F6 5G",
    "storage": "256 GB",
    "price": 18450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f6.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO F Series",
    "model": "POCO F7 5G",
    "storage": "256 GB",
    "price": 22520,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-f7-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M2",
    "storage": "64 GB",
    "price": 5670,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-m2.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M2 Pro",
    "storage": "64 GB",
    "price": 6250,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-m2-pro.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M2 Reloaded",
    "storage": "64 GB",
    "price": 4960,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-m2-reloaded.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M3",
    "storage": "64 GB",
    "price": 6150,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-m3.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M3 Pro 5G",
    "storage": "64 GB",
    "price": 7880,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-m3-pro-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M4 5G",
    "storage": "64 GB",
    "price": 7860,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-m4-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M4 Pro 5G",
    "storage": "64 GB",
    "price": 6700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-m4-pro-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M5",
    "storage": "64 GB",
    "price": 5800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-m5.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "Poco M6 5G",
    "storage": "128 GB",
    "price": 7690,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M6 Plus 5G",
    "storage": "128 GB",
    "price": 8410,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-m6-plus-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "Poco M6 Pro 5G",
    "storage": "128 GB",
    "price": 8580,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-pro-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M7 5G",
    "storage": "128 GB",
    "price": 8010,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-m7-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M7 Plus 5G",
    "storage": "128 GB",
    "price": 9640,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-m7-plus-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M7 Pro 5G",
    "storage": "128 GB",
    "price": 11040,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-m7-pro-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M8 5G",
    "storage": "128 GB",
    "price": 15890,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-m8-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X3",
    "storage": "64 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-x3.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X3 Pro",
    "storage": "128 GB",
    "price": 7150,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-x3-pro.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X4 Pro 5G",
    "storage": "64 GB",
    "price": 8490,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-x4-pro-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X5 5G",
    "storage": "128 GB",
    "price": 11950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-x5-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X5 Pro 5G",
    "storage": "128 GB",
    "price": 12790,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-x5-pro-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "Poco X6 5G",
    "storage": "128 GB",
    "price": 16450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X6 Neo 5G",
    "storage": "128 GB",
    "price": 10710,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-x6-neo-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "Poco X6 Pro 5G",
    "storage": "256 GB",
    "price": 16450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X7 5G",
    "storage": "128 GB",
    "price": 13130,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-x7-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X7 Pro 5G",
    "storage": "256 GB",
    "price": 16150,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-x7-pro-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X8 Pro",
    "storage": "256 GB",
    "price": 23670,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-x8-pro.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X8 Pro Max 5G",
    "storage": "256 GB",
    "price": 30200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/poco-poco-x8-pro-max-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Number & Plus Series",
    "model": "Realme 10 5G",
    "storage": "128 GB",
    "price": 9000,
    "image": "https://api.mobileapi.dev/devices/13759/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme Number Pro Series",
    "model": "Realme 10 Pro 5G",
    "storage": "128 GB",
    "price": 10500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-10-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Number Pro Series",
    "model": "Realme 10 Pro+ 5G",
    "storage": "128 GB",
    "price": 12500,
    "image": "https://api.mobileapi.dev/devices/13760/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme Number & Plus Series",
    "model": "Realme 11 5G",
    "storage": "128 GB",
    "price": 11000,
    "image": "https://api.mobileapi.dev/devices/13819/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme Number Pro Series",
    "model": "Realme 11 Pro 5G",
    "storage": "128 GB",
    "price": 13500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Number Pro Series",
    "model": "Realme 11 Pro+ 5G",
    "storage": "256 GB",
    "price": 15000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro-plus.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Number & Plus Series",
    "model": "Realme 11x 5G",
    "storage": "128 GB",
    "price": 9800,
    "image": "https://api.mobileapi.dev/devices/13739/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme Number & Plus Series",
    "model": "Realme 12 5G",
    "storage": "128 GB",
    "price": 12000,
    "image": "https://api.mobileapi.dev/devices/13728/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme Number Pro Series",
    "model": "Realme 12 Pro 5G",
    "storage": "128 GB",
    "price": 15500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Number Pro Series",
    "model": "Realme 12 Pro+ 5G",
    "storage": "256 GB",
    "price": 18000,
    "image": "https://api.mobileapi.dev/devices/13731/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme Number & Plus Series",
    "model": "Realme 12+ 5G",
    "storage": "128 GB",
    "price": 14000,
    "image": "https://api.mobileapi.dev/devices/13729/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme Number & Plus Series",
    "model": "Realme 12x 5G",
    "storage": "128 GB",
    "price": 10500,
    "image": "https://api.mobileapi.dev/devices/13726/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme Number & Plus Series",
    "model": "Realme 13 5G",
    "storage": "128 GB",
    "price": 14000,
    "image": "https://api.mobileapi.dev/devices/13814/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme Number Pro Series",
    "model": "Realme 13 Pro 5G",
    "storage": "128 GB",
    "price": 19000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Number Pro Series",
    "model": "Realme 13 Pro+ 5G",
    "storage": "256 GB",
    "price": 22000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro-plus.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Number & Plus Series",
    "model": "Realme 13+ 5G",
    "storage": "128 GB",
    "price": 16000,
    "image": "https://api.mobileapi.dev/devices/13706/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 14 Pro 5G",
    "storage": "128 GB",
    "price": 48500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-14-pro-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 14 Pro Lite 5G",
    "storage": "128 GB",
    "price": 15130,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-14-pro-lite-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 14 Pro Plus 5G",
    "storage": "128 GB",
    "price": 19830,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-14-pro-plus-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 14T 5G",
    "storage": "128 GB",
    "price": 13570,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-14t-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 15 5G",
    "storage": "128 GB",
    "price": 62450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-15-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 15 Pro 5G",
    "storage": "128 GB",
    "price": 62450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-15-pro-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 15X 5G",
    "storage": "128 GB",
    "price": 14020,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-15x-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 16 5G",
    "storage": "128 GB",
    "price": 77450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-16-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 16 Pro 5G",
    "storage": "128 GB",
    "price": 77300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-16-pro-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 16 Pro Plus 5G",
    "storage": "128 GB",
    "price": 29200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-16-pro-plus-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 16T 5G",
    "storage": "128 GB",
    "price": 21040,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-16t-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 16x 5G",
    "storage": "128 GB",
    "price": 18400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-16x-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 2 Pro",
    "storage": "64 GB",
    "price": 2500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-2-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 3 Pro",
    "storage": "64 GB",
    "price": 2800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-3-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 5 Pro",
    "storage": "64 GB",
    "price": 3500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-5-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 5i",
    "storage": "64 GB",
    "price": 2800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-5i.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 5s",
    "storage": "64 GB",
    "price": 3000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-5s.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 6",
    "storage": "64 GB",
    "price": 3800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-6.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 6 Pro",
    "storage": "64 GB",
    "price": 4500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-6-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 6i",
    "storage": "64 GB",
    "price": 3500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-6i.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 7",
    "storage": "64 GB",
    "price": 4500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-7.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 7 Pro",
    "storage": "128 GB",
    "price": 5800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-7-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 7i",
    "storage": "64 GB",
    "price": 4000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-7i.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Number & Plus Series",
    "model": "Realme 8 5G",
    "storage": "64 GB",
    "price": 6200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-8-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Number Pro Series",
    "model": "Realme 8 Pro",
    "storage": "128 GB",
    "price": 7200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-8-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 8i",
    "storage": "64 GB",
    "price": 5800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-8i.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 8s 5G",
    "storage": "128 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-8s-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 9",
    "storage": "128 GB",
    "price": 7200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-9.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme 9 5G Speed Edition",
    "storage": "128 GB",
    "price": 9500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-9-5g-speed-edition.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Number Pro Series",
    "model": "Realme 9 Pro 5G",
    "storage": "128 GB",
    "price": 9500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-9-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Number Pro Series",
    "model": "Realme 9 Pro+ 5G",
    "storage": "128 GB",
    "price": 11000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-9-pro-plus.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Number & Plus Series",
    "model": "Realme 9i 5G",
    "storage": "64 GB",
    "price": 8000,
    "image": "https://api.mobileapi.dev/devices/13763/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme C100i",
    "storage": "64 GB",
    "price": 11350,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c100i.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme C100x",
    "storage": "64 GB",
    "price": 11590,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c100x.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme C33 2023",
    "storage": "64 GB",
    "price": 5500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c33-2023.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme C Series",
    "model": "Realme C35",
    "storage": "64 GB",
    "price": 5500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c35.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme C51",
    "storage": "64 GB",
    "price": 5800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c51.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme C Series",
    "model": "Realme C53",
    "storage": "64 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c53.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme C Series",
    "model": "Realme C55",
    "storage": "64 GB",
    "price": 7000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c55.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme C61",
    "storage": "64 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c61.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme C Series",
    "model": "Realme C63 5G",
    "storage": "128 GB",
    "price": 7500,
    "image": "https://api.mobileapi.dev/devices/13705/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme C Series",
    "model": "Realme C65 5G",
    "storage": "128 GB",
    "price": 8500,
    "image": "https://api.mobileapi.dev/devices/13720/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme C Series",
    "model": "Realme C67 5G",
    "storage": "128 GB",
    "price": 9500,
    "image": "https://api.mobileapi.dev/devices/13733/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme C71",
    "storage": "128 GB",
    "price": 7120,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c71.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme C73 5G",
    "storage": "64 GB",
    "price": 9630,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c73-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme C75 5G",
    "storage": "128 GB",
    "price": 10640,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c75-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme C83 5G",
    "storage": "64 GB",
    "price": 11650,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c83-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme C85 5G",
    "storage": "128 GB",
    "price": 12000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c85-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme GT 2",
    "storage": "128 GB",
    "price": 14000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-gt-2.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme GT Series",
    "model": "Realme GT 2 Pro",
    "storage": "128 GB",
    "price": 18000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-gt2-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme GT Series",
    "model": "Realme GT 5G",
    "storage": "128 GB",
    "price": 13500,
    "image": "https://api.mobileapi.dev/devices/13816/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme GT Series",
    "model": "Realme GT 6 5G",
    "storage": "256 GB",
    "price": 28000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-gt-6.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme GT Series",
    "model": "Realme GT 6T 5G",
    "storage": "128 GB",
    "price": 21000,
    "image": "https://api.mobileapi.dev/devices/13718/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme GT 7",
    "storage": "256 GB",
    "price": 25460,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-gt-7.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme GT 7 Pro 5G",
    "storage": "256 GB",
    "price": 31870,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-gt-7-pro-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme GT 7T",
    "storage": "256 GB",
    "price": 21080,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-gt-7t.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme GT 8 Pro",
    "storage": "256 GB",
    "price": 41240,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-gt-8-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme GT Series",
    "model": "Realme GT Master Edition",
    "storage": "128 GB",
    "price": 9500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-gt-master.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme GT Series",
    "model": "Realme GT Neo 2",
    "storage": "128 GB",
    "price": 12000,
    "image": "https://api.mobileapi.dev/devices/13676/thumb.png"
  },
  {
    "brand": "Realme",
    "series": "Realme GT Series",
    "model": "Realme GT Neo 3",
    "storage": "128 GB",
    "price": 15000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-gt-neo3.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme GT NEO 3T",
    "storage": "128 GB",
    "price": 14000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-gt-neo-3t.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo 10",
    "storage": "128 GB",
    "price": 4500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-10.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo 100 Lite 5G",
    "storage": "64 GB",
    "price": 11090,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-100-lite-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo 20",
    "storage": "64 GB",
    "price": 4500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-20.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo 20 Pro",
    "storage": "64 GB",
    "price": 5500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-20-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo 30",
    "storage": "64 GB",
    "price": 6000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-30.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo 30 Pro 5G",
    "storage": "64 GB",
    "price": 7000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-30-pro-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Narzo & P Series",
    "model": "Realme Narzo 50",
    "storage": "64 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-50.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Narzo & P Series",
    "model": "Realme Narzo 50 Pro 5G",
    "storage": "128 GB",
    "price": 9000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-50-pro-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Narzo & P Series",
    "model": "Realme Narzo 60 5G",
    "storage": "128 GB",
    "price": 10000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-60.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Narzo & P Series",
    "model": "Realme Narzo 60 Pro 5G",
    "storage": "128 GB",
    "price": 13000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-60-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo 60X 5G",
    "storage": "128 GB",
    "price": 8800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-60x-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo 70 5G",
    "storage": "128 GB",
    "price": 10500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Narzo & P Series",
    "model": "Realme Narzo 70 Pro 5G",
    "storage": "128 GB",
    "price": 14000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo 70 Turbo 5G",
    "storage": "128 GB",
    "price": 12500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-turbo-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Narzo & P Series",
    "model": "Realme Narzo 70x 5G",
    "storage": "128 GB",
    "price": 9000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70x.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo 90 5G",
    "storage": "128 GB",
    "price": 13770,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-90-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo 90x 5G",
    "storage": "128 GB",
    "price": 11600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-90x-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo N53",
    "storage": "64 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-n53.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo N55",
    "storage": "64 GB",
    "price": 7000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-n55.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo N61",
    "storage": "64 GB",
    "price": 5810,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-n61.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo N63",
    "storage": "64 GB",
    "price": 5400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-n63.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo N65 5G",
    "storage": "128 GB",
    "price": 5400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-n65-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme Narzo Power 5G",
    "storage": "128 GB",
    "price": 19580,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-power-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Narzo & P Series",
    "model": "Realme P1 5G",
    "storage": "128 GB",
    "price": 11500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p1.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Narzo & P Series",
    "model": "Realme P1 Pro 5G",
    "storage": "128 GB",
    "price": 14000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p1-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme P2 Pro 5G",
    "storage": "128 GB",
    "price": 16500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p2-pro-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme P3 5G",
    "storage": "128 GB",
    "price": 12560,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p3-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme P3 Lite 5G",
    "storage": "128 GB",
    "price": 9190,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p3-lite-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme P3 Pro 5G",
    "storage": "128 GB",
    "price": 14930,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p3-pro-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme P3 Ultra 5G",
    "storage": "128 GB",
    "price": 16190,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p3-ultra-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme P3X 5G",
    "storage": "128 GB",
    "price": 10690,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p3x-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme P4 5G",
    "storage": "128 GB",
    "price": 15740,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p4-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme P4 Lite 5G",
    "storage": "64 GB",
    "price": 9530,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p4-lite-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme P4 Power 5G",
    "storage": "128 GB",
    "price": 19680,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p4-power-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme P4 Pro 5G",
    "storage": "128 GB",
    "price": 18160,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p4-pro-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme P4R 5G",
    "storage": "64 GB",
    "price": 14450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p4r-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme P4s 5G",
    "storage": "128 GB",
    "price": 24400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p4s-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme P4x 5G",
    "storage": "128 GB",
    "price": 12300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-p4x-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme X",
    "storage": "128 GB",
    "price": 4500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-x.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme X2",
    "storage": "64 GB",
    "price": 5500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-x2.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme X2 Pro",
    "storage": "64 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-x2-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme X3",
    "storage": "128 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-x3.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme X3 SuperZoom",
    "storage": "128 GB",
    "price": 7800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-x3-superzoom.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme X50 Pro",
    "storage": "128 GB",
    "price": 10500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-x50-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme X7",
    "storage": "128 GB",
    "price": 6800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-x7.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme X7 Max 5G",
    "storage": "128 GB",
    "price": 9500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-x7-max-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme X7 Pro",
    "storage": "128 GB",
    "price": 8500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-x7-pro.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Series",
    "model": "Realme XT",
    "storage": "64 GB",
    "price": 4800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-xt.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A04s",
    "storage": "64 GB",
    "price": 4200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a04s.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A05",
    "storage": "64 GB",
    "price": 5200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a05.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A05s",
    "storage": "64 GB",
    "price": 6200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a05s.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A06 5G",
    "storage": "64 GB",
    "price": 6840,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a06-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A07",
    "storage": "64 GB",
    "price": 7460,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a07.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A12",
    "storage": "64 GB",
    "price": 5200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a12-sm-a125.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A13",
    "storage": "64 GB",
    "price": 6000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a13.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A14 5G",
    "storage": "64 GB",
    "price": 7000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a14-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A15 5G",
    "storage": "128 GB",
    "price": 7800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a15-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A16 5G",
    "storage": "128 GB",
    "price": 12560,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a16-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A17 5G",
    "storage": "128 GB",
    "price": 13720,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a17-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A21s",
    "storage": "64 GB",
    "price": 5300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a21s.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A22 5G",
    "storage": "128 GB",
    "price": 4900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a22-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A23 5G",
    "storage": "128 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a23-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A24",
    "storage": "128 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a24-4g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A25 5G",
    "storage": "128 GB",
    "price": 10500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a25.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A26 5G",
    "storage": "128 GB",
    "price": 13870,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a26-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A27 5G",
    "storage": "128 GB",
    "price": 23670,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a27-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A30",
    "storage": "64 GB",
    "price": 2900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a30.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A30s",
    "storage": "64 GB",
    "price": 3800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a30s.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A31",
    "storage": "128 GB",
    "price": 4500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a31.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A32",
    "storage": "128 GB",
    "price": 5600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a32-4g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A33 5G",
    "storage": "128 GB",
    "price": 8500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a33-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A34 5G",
    "storage": "128 GB",
    "price": 11000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a34.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A35 5G",
    "storage": "128 GB",
    "price": 14500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A36 5G",
    "storage": "128 GB",
    "price": 19580,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a36-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A37 5G",
    "storage": "128 GB",
    "price": 25180,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a37-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A50",
    "storage": "64 GB",
    "price": 3600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a50.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A50s",
    "storage": "128 GB",
    "price": 5000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a50s.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A51",
    "storage": "128 GB",
    "price": 5400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a51.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A52",
    "storage": "128 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a52-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A52s 5G",
    "storage": "128 GB",
    "price": 9200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a52s-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A53 5G",
    "storage": "128 GB",
    "price": 12000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a53-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A54 5G",
    "storage": "128 GB",
    "price": 15000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A55 5G",
    "storage": "128 GB",
    "price": 18500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A56 5G",
    "storage": "128 GB",
    "price": 24580,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a56-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A57 5G",
    "storage": "256 GB",
    "price": 34250,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a57-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A7 2018",
    "storage": "64 GB",
    "price": 3660,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a7-2018.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A70",
    "storage": "128 GB",
    "price": 4700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a70.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A70s",
    "storage": "128 GB",
    "price": 5200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a70s.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A71",
    "storage": "128 GB",
    "price": 7000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a71.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A72",
    "storage": "128 GB",
    "price": 8500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a72-4g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy A Series",
    "model": "Samsung Galaxy A73 5G",
    "storage": "128 GB",
    "price": 13500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a73-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A8 Plus",
    "storage": "64 GB",
    "price": 2600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a8-plus.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A8 Star",
    "storage": "64 GB",
    "price": 3670,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a8-star.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A80",
    "storage": "128 GB",
    "price": 6100,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a80.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy A9 2018",
    "storage": "128 GB",
    "price": 4030,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a9-2018.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy C5 Pro",
    "storage": "64 GB",
    "price": 3930,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-c5-pro-sm-c5010.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy C7 Pro",
    "storage": "64 GB",
    "price": 4050,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-c7-pro.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy C9 Pro",
    "storage": "64 GB",
    "price": 3990,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-c9-pro-.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F04",
    "storage": "64 GB",
    "price": 2800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f04.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F05",
    "storage": "64 GB",
    "price": 6320,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f05.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F06 5G",
    "storage": "64 GB",
    "price": 6950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f06-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F07",
    "storage": "64 GB",
    "price": 7300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f07.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F12",
    "storage": "64 GB",
    "price": 3000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f12.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy F13",
    "storage": "64 GB",
    "price": 4000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f13.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy F14 5G",
    "storage": "128 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f14-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F15 5G",
    "storage": "128 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f15-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F16 5G",
    "storage": "128 GB",
    "price": 10550,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f16-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F17 5G",
    "storage": "128 GB",
    "price": 11040,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f17-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F22",
    "storage": "64 GB",
    "price": 4800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f22.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy F23 5G",
    "storage": "128 GB",
    "price": 6000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f23-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy F34 5G",
    "storage": "128 GB",
    "price": 8500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f34-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F36 5G",
    "storage": "128 GB",
    "price": 13720,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f36-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F41",
    "storage": "64 GB",
    "price": 3800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f41.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F42 5G",
    "storage": "128 GB",
    "price": 5500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f42-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy F54 5G",
    "storage": "256 GB",
    "price": 12000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f54.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy F55 5G",
    "storage": "128 GB",
    "price": 16000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f55.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F56 5G",
    "storage": "128 GB",
    "price": 17860,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f56-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F62",
    "storage": "128 GB",
    "price": 7200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f62.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F70 Pro 5G",
    "storage": "128 GB",
    "price": 19850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f70-pro-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy F70e 5G",
    "storage": "128 GB",
    "price": 10790,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f70e-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy Fold",
    "storage": "512 GB",
    "price": 14560,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-fold.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M04",
    "storage": "64 GB",
    "price": 2800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m04.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M05",
    "storage": "64 GB",
    "price": 6620,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m05.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M06 5G",
    "storage": "64 GB",
    "price": 7400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m06-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M07",
    "storage": "64 GB",
    "price": 6670,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m07.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M12",
    "storage": "64 GB",
    "price": 3000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m12.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M13",
    "storage": "64 GB",
    "price": 4500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m13-4g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M14 4G",
    "storage": "64 GB",
    "price": 7290,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m14-4g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M14 5G",
    "storage": "128 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m14-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M15 5G",
    "storage": "128 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m15-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M15 5G Prime Edition",
    "storage": "128 GB",
    "price": 8910,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m15-5g-prime-edition.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M16 5G",
    "storage": "128 GB",
    "price": 10230,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m16-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M17e 5G",
    "storage": "128 GB",
    "price": 11600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m17e-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M21",
    "storage": "64 GB",
    "price": 3500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m21.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M21 2021 Edition",
    "storage": "64 GB",
    "price": 5210,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m21-2021-edition.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M30s",
    "storage": "64 GB",
    "price": 3800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m30s.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M31",
    "storage": "64 GB",
    "price": 5000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m31.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M31s",
    "storage": "128 GB",
    "price": 5800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m31s.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M32",
    "storage": "64 GB",
    "price": 5800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m32-4g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M32 Prime Edition",
    "storage": "64 GB",
    "price": 6880,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m32-prime-edition.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M33 5G",
    "storage": "128 GB",
    "price": 7200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m33-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M34 5G",
    "storage": "128 GB",
    "price": 8500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m34-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M35 5G",
    "storage": "128 GB",
    "price": 11000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m35.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M36 5G",
    "storage": "128 GB",
    "price": 12350,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m36-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M40",
    "storage": "128 GB",
    "price": 3600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m40.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M42 5G",
    "storage": "128 GB",
    "price": 6800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m42-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M47 5G",
    "storage": "128 GB",
    "price": 22300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m47-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M51",
    "storage": "128 GB",
    "price": 7000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m51.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M52 5G",
    "storage": "128 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m52-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M53 5G",
    "storage": "128 GB",
    "price": 10500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m53-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M54 5G",
    "storage": "128 GB",
    "price": 10500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m54.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy M & F Series",
    "model": "Samsung Galaxy M55 5G",
    "storage": "128 GB",
    "price": 13500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m55.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M55s 5G",
    "storage": "128 GB",
    "price": 13300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m55s-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy M56 5G",
    "storage": "128 GB",
    "price": 17000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m56-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Note Series",
    "model": "Samsung Galaxy Note 10",
    "storage": "256 GB",
    "price": 9800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Note Series",
    "model": "Samsung Galaxy Note 10 Lite",
    "storage": "128 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-lite.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Note Series",
    "model": "Samsung Galaxy Note 10+",
    "storage": "256 GB",
    "price": 9800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-plus-.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Note Series",
    "model": "Samsung Galaxy Note 20",
    "storage": "256 GB",
    "price": 14000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-5g-r.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Note Series",
    "model": "Samsung Galaxy Note 20 Ultra 5G",
    "storage": "256 GB",
    "price": 23000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-ultra-5g-.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Note Series",
    "model": "Samsung Galaxy Note 8",
    "storage": "64 GB",
    "price": 5000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note8-sm-n950.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Note Series",
    "model": "Samsung Galaxy Note 9",
    "storage": "128 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note9-r1.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S10 Series",
    "model": "Samsung Galaxy S10",
    "storage": "128 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-1.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S10 Series",
    "model": "Samsung Galaxy S10 Lite",
    "storage": "128 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-lite-sm-g770f.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S10 Series",
    "model": "Samsung Galaxy S10+",
    "storage": "128 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-plus-new.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S10 Series",
    "model": "Samsung Galaxy S10e",
    "storage": "128 GB",
    "price": 6000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10e-1.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S20 Series",
    "model": "Samsung Galaxy S20",
    "storage": "128 GB",
    "price": 11000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-r.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S20 Series",
    "model": "Samsung Galaxy S20 FE",
    "storage": "128 GB",
    "price": 11000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-fe-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S20 Series",
    "model": "Samsung Galaxy S20 Ultra 5G",
    "storage": "128 GB",
    "price": 18000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-ultra-5g-r.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S20 Series",
    "model": "Samsung Galaxy S20+",
    "storage": "128 GB",
    "price": 13500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-plus-r.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S21 Series",
    "model": "Samsung Galaxy S21 5G",
    "storage": "128 GB",
    "price": 16000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-5g-r.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S21 Series",
    "model": "Samsung Galaxy S21 FE 5G",
    "storage": "128 GB",
    "price": 14000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-fe-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S21 Series",
    "model": "Samsung Galaxy S21 Ultra 5G",
    "storage": "128 GB",
    "price": 25500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-ultra-5g-.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S21 Series",
    "model": "Samsung Galaxy S21+ 5G",
    "storage": "128 GB",
    "price": 16000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-plus-5g-.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S22 Series",
    "model": "Samsung Galaxy S22 5G",
    "storage": "128 GB",
    "price": 21500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S22 Series",
    "model": "Samsung Galaxy S22 Ultra 5G",
    "storage": "128 GB",
    "price": 32000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-ultra-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S22 Series",
    "model": "Samsung Galaxy S22+ 5G",
    "storage": "128 GB",
    "price": 25500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-plus-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S23 Series",
    "model": "Samsung Galaxy S23 5G",
    "storage": "128 GB",
    "price": 28000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S23 Series",
    "model": "Samsung Galaxy S23 FE 5G",
    "storage": "128 GB",
    "price": 21500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-fe.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S23 Series",
    "model": "Samsung Galaxy S23 Ultra",
    "storage": "256 GB",
    "price": 48000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S23 Series",
    "model": "Samsung Galaxy S23+",
    "storage": "256 GB",
    "price": 34000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-plus-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S24 Series",
    "model": "Samsung Galaxy S24 5G",
    "storage": "128 GB",
    "price": 43000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S24 Series",
    "model": "Samsung Galaxy S24 FE",
    "storage": "128 GB",
    "price": 33300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-fe.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S24 Series",
    "model": "Samsung Galaxy S24 Ultra",
    "storage": "256 GB",
    "price": 65500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-stylus.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S24 Series",
    "model": "Samsung Galaxy S24+",
    "storage": "256 GB",
    "price": 50000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S25 Series",
    "model": "Samsung Galaxy S25 5G",
    "storage": "128 GB",
    "price": 43850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy S25 Edge",
    "storage": "256 GB",
    "price": 44620,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-edge.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Samsung Series",
    "model": "Samsung Galaxy S25 FE",
    "storage": "128 GB",
    "price": 33650,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-fe.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S26 Series",
    "model": "Samsung Galaxy S26 5G",
    "storage": "128 GB",
    "price": 51850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S26 Series",
    "model": "Samsung Galaxy S26 Ultra",
    "storage": "256 GB",
    "price": 92950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S26 Series",
    "model": "Samsung Galaxy S26+",
    "storage": "256 GB",
    "price": 74800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Fold 7",
    "storage": "256 GB",
    "price": 98000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Flip 7",
    "storage": "256 GB",
    "price": 62000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Fold Special Edition",
    "storage": "512 GB",
    "price": 88900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S25 Series",
    "model": "Samsung Galaxy S25+",
    "storage": "256 GB",
    "price": 68850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S Legacy Series",
    "model": "Samsung Galaxy S9",
    "storage": "64 GB",
    "price": 4500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s9.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy S Legacy Series",
    "model": "Samsung Galaxy S9 Plus",
    "storage": "64 GB",
    "price": 5500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s9-plus.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Flip",
    "storage": "128 GB",
    "price": 14000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip-01.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Flip 3 5G",
    "storage": "128 GB",
    "price": 16000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip3-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Flip 4",
    "storage": "128 GB",
    "price": 24500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip4.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Flip 5",
    "storage": "256 GB",
    "price": 36000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Flip 6",
    "storage": "256 GB",
    "price": 49000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Flip7 FE 5G",
    "storage": "256 GB",
    "price": 42000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Fold 2 5G",
    "storage": "256 GB",
    "price": 26950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold2-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Fold 3 5G",
    "storage": "256 GB",
    "price": 27000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold3-5g.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Fold 4",
    "storage": "256 GB",
    "price": 42000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold4.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Fold 5",
    "storage": "256 GB",
    "price": 55000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg"
  },
  {
    "brand": "Samsung",
    "series": "Galaxy Z Series (Fold & Flip)",
    "model": "Samsung Galaxy Z Fold 6",
    "storage": "256 GB",
    "price": 76000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Camon Series",
    "model": "Tecno Camon 20 Pro 5G",
    "storage": "128 GB",
    "price": 11900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-20-pro-5g.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Camon Series",
    "model": "Tecno Camon 30 5G",
    "storage": "256 GB",
    "price": 14950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-5g.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Camon Series",
    "model": "Tecno Camon 30 Pro 5G",
    "storage": "256 GB",
    "price": 18900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-pro.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Camon Series",
    "model": "Tecno Camon 30 Premier 5G",
    "storage": "512 GB",
    "price": 24850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-premier.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Phantom Series",
    "model": "Tecno Phantom V Flip 5G",
    "storage": "256 GB",
    "price": 32900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-phantom-v-flip.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Phantom Series",
    "model": "Tecno Phantom V Fold 5G",
    "storage": "256 GB",
    "price": 47000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-phantom-v-fold.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Phantom Series",
    "model": "Tecno Phantom X2 Pro 5G",
    "storage": "256 GB",
    "price": 24950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-phantom-x2-pro.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Pova Series",
    "model": "Tecno Pova 5 Pro 5G",
    "storage": "128 GB",
    "price": 10800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-pova-5-pro.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Pova Series",
    "model": "Tecno Pova 6 Pro 5G",
    "storage": "128 GB",
    "price": 13450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-pova-6-pro.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Spark Series",
    "model": "Tecno Spark 20",
    "storage": "128 GB",
    "price": 7700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-spark-20.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Spark Series",
    "model": "Tecno Spark 20 Pro+",
    "storage": "256 GB",
    "price": 11400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-spark-20-pro-plus.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Spark Series",
    "model": "Tecno Spark Go 2024",
    "storage": "64 GB",
    "price": 5350,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-spark-go-2024.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Flagship & Neo Series",
    "model": "iQOO 11 5G",
    "storage": "256 GB",
    "price": 28900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-11.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Flagship & Neo Series",
    "model": "iQOO 12 5G",
    "storage": "256 GB",
    "price": 31850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo12.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Flagship & Neo Series",
    "model": "iQOO Neo 6",
    "storage": "128 GB",
    "price": 13900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-6.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Flagship & Neo Series",
    "model": "iQOO Neo 7 Pro",
    "storage": "128 GB",
    "price": 16400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-7-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Flagship & Neo Series",
    "model": "iQOO Neo 9 Pro",
    "storage": "128 GB",
    "price": 21400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo9-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Flagship & Neo Series",
    "model": "iQOO Z7 Pro 5G",
    "storage": "128 GB",
    "price": 14950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z7-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Flagship & Neo Series",
    "model": "iQOO Z9 5G",
    "storage": "128 GB",
    "price": 13850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Flagship & Neo Series",
    "model": "iQOO Z9 Turbo",
    "storage": "256 GB",
    "price": 18450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9-turbo.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo NEX",
    "storage": "128 GB",
    "price": 6340,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-nex.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo S1",
    "storage": "64 GB",
    "price": 4790,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-s1.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo S1 Pro",
    "storage": "128 GB",
    "price": 5200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-s1-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo S2",
    "storage": "128 GB",
    "price": 4000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-s2.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo T1",
    "storage": "128 GB",
    "price": 7480,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t1.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo T Series (Turbo Speed)",
    "model": "Vivo T1 Pro 5G",
    "storage": "128 GB",
    "price": 8570,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t1-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo T1x",
    "storage": "64 GB",
    "price": 5460,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t1x.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo T Series (Turbo Speed)",
    "model": "Vivo T2 5G",
    "storage": "128 GB",
    "price": 9480,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t2.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo T Series (Turbo Speed)",
    "model": "Vivo T2 Pro 5G",
    "storage": "128 GB",
    "price": 13260,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t2-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo T Series (Turbo Speed)",
    "model": "Vivo T2x 5G",
    "storage": "128 GB",
    "price": 7240,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t2x.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo T Series (Turbo Speed)",
    "model": "Vivo T3 5G",
    "storage": "128 GB",
    "price": 12780,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t3.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo T3 Lite 5G",
    "storage": "128 GB",
    "price": 7410,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-lite-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo T Series (Turbo Speed)",
    "model": "Vivo T3 Pro 5G",
    "storage": "128 GB",
    "price": 17680,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo T Series (Turbo Speed)",
    "model": "Vivo T3 Ultra 5G",
    "storage": "128 GB",
    "price": 19330,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-ultra.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo T Series (Turbo Speed)",
    "model": "Vivo T3x 5G",
    "storage": "128 GB",
    "price": 9130,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t3x.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo T4 5G",
    "storage": "128 GB",
    "price": 17800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t4-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo T4 Lite 5G",
    "storage": "64 GB",
    "price": 8570,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t4-lite-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo T4 Pro 5G",
    "storage": "128 GB",
    "price": 19940,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t4-pro-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo T4 Ultra 5G",
    "storage": "256 GB",
    "price": 25300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t4-ultra-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo T4R 5G",
    "storage": "128 GB",
    "price": 15590,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t4r-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo T4x 5G",
    "storage": "128 GB",
    "price": 12460,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t4x-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo T5 5G",
    "storage": "128 GB",
    "price": 25000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t5-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo T5 Lite 5G",
    "storage": "64 GB",
    "price": 13850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t5-lite-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo T5 Pro 5G",
    "storage": "128 GB",
    "price": 20350,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t5-pro-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo T5x 5G",
    "storage": "128 GB",
    "price": 16040,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-t5x-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo U20",
    "storage": "64 GB",
    "price": 3910,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-u20.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V11",
    "storage": "64 GB",
    "price": 3190,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v11.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V11 Pro",
    "storage": "64 GB",
    "price": 3720,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v11-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V15",
    "storage": "64 GB",
    "price": 4420,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v15.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V15 Pro",
    "storage": "128 GB",
    "price": 5390,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v15-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V17",
    "storage": "128 GB",
    "price": 5240,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v17.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V17 Pro",
    "storage": "128 GB",
    "price": 6050,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v17-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V19",
    "storage": "128 GB",
    "price": 6200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v19.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V20",
    "storage": "128 GB",
    "price": 6770,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v20.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V20 2021",
    "storage": "128 GB",
    "price": 7340,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v20-2021.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V20 Pro",
    "storage": "128 GB",
    "price": 9960,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v20-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V20 SE",
    "storage": "128 GB",
    "price": 5330,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v20-se.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V21 5G",
    "storage": "128 GB",
    "price": 8850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v21-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V21e 5G",
    "storage": "128 GB",
    "price": 7410,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v21e-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V23 5G",
    "storage": "128 GB",
    "price": 10810,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v23-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo V Series",
    "model": "Vivo V23 Pro 5G",
    "storage": "128 GB",
    "price": 12070,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v23-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V23e 5G",
    "storage": "128 GB",
    "price": 8970,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v23e-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V25 5G",
    "storage": "128 GB",
    "price": 11280,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v25-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo V Series",
    "model": "Vivo V25 Pro 5G",
    "storage": "128 GB",
    "price": 13790,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v25-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo V Series",
    "model": "Vivo V27 5G",
    "storage": "128 GB",
    "price": 17550,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v27.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo V Series",
    "model": "Vivo V27 Pro 5G",
    "storage": "128 GB",
    "price": 19790,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v27-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo V Series",
    "model": "Vivo V29 5G",
    "storage": "128 GB",
    "price": 18500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v29.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo V Series",
    "model": "Vivo V29 Pro 5G",
    "storage": "256 GB",
    "price": 19500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v29-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo V Series",
    "model": "Vivo V29e",
    "storage": "128 GB",
    "price": 17320,
    "image": "https://api.mobileapi.dev/devices/4948/thumb.png"
  },
  {
    "brand": "Vivo",
    "series": "Vivo V Series",
    "model": "Vivo V30 5G",
    "storage": "128 GB",
    "price": 19500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v30.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo V Series",
    "model": "Vivo V30 Pro 5G",
    "storage": "256 GB",
    "price": 24000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo V Series",
    "model": "Vivo V30e 5G",
    "storage": "128 GB",
    "price": 19270,
    "image": "https://api.mobileapi.dev/devices/4909/thumb.png"
  },
  {
    "brand": "Vivo",
    "series": "Vivo V Series",
    "model": "Vivo V40 5G",
    "storage": "128 GB",
    "price": 22000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v40.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo V Series",
    "model": "Vivo V40 Pro 5G",
    "storage": "256 GB",
    "price": 31000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v40-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo V Series",
    "model": "Vivo V40e 5G",
    "storage": "128 GB",
    "price": 20120,
    "image": "https://api.mobileapi.dev/devices/4871/thumb.png"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V50",
    "storage": "128 GB",
    "price": 22150,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v50.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V50e",
    "storage": "128 GB",
    "price": 21040,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v50e.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V60",
    "storage": "128 GB",
    "price": 24260,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v60.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V60e",
    "storage": "128 GB",
    "price": 21780,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v60e.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V7 Plus",
    "storage": "64 GB",
    "price": 2440,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v7-plus.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V70",
    "storage": "256 GB",
    "price": 33650,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v70.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V70 Elite",
    "storage": "256 GB",
    "price": 36950,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v70-elite.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V70 FE",
    "storage": "128 GB",
    "price": 25430,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v70-fe.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V9",
    "storage": "64 GB",
    "price": 3200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v9.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo V9 Pro",
    "storage": "64 GB",
    "price": 3140,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v9-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X Fold 3 Pro",
    "storage": "512 GB",
    "price": 60780,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x-fold-3-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X Fold 5",
    "storage": "512 GB",
    "price": 80770,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x-fold-5.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo X Series (Zeiss Flagship)",
    "model": "Vivo X100 5G",
    "storage": "256 GB",
    "price": 30000,
    "image": "https://api.mobileapi.dev/devices/355/thumb.png"
  },
  {
    "brand": "Vivo",
    "series": "Vivo X Series (Zeiss Flagship)",
    "model": "Vivo X100 Pro 5G",
    "storage": "512 GB",
    "price": 36000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X200 FE",
    "storage": "256 GB",
    "price": 36290,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x200-fe.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X200T",
    "storage": "256 GB",
    "price": 39300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x200t.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X21",
    "storage": "128 GB",
    "price": 5470,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x21.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X300",
    "storage": "256 GB",
    "price": 47120,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x300.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X300 FE",
    "storage": "256 GB",
    "price": 47850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x300-fe.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X300 Pro",
    "storage": "512 GB",
    "price": 63750,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x300-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X300 Ultra",
    "storage": "512 GB",
    "price": 79940,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x300-ultra.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X50",
    "storage": "128 GB",
    "price": 7630,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x50.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X50 Pro",
    "storage": "256 GB",
    "price": 7560,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x50-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X60",
    "storage": "128 GB",
    "price": 10100,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x60.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X60 Pro",
    "storage": "256 GB",
    "price": 9890,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x60-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X60 Pro Plus",
    "storage": "256 GB",
    "price": 15070,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x60-pro-plus.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo X Series (Zeiss Flagship)",
    "model": "Vivo X70 Pro 5G",
    "storage": "128 GB",
    "price": 16090,
    "image": "https://api.mobileapi.dev/devices/13983/thumb.png"
  },
  {
    "brand": "Vivo",
    "series": "Vivo X Series (Zeiss Flagship)",
    "model": "Vivo X70 Pro+ 5G",
    "storage": "256 GB",
    "price": 17850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x70-pro-plus.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo X Series (Zeiss Flagship)",
    "model": "Vivo X80 5G",
    "storage": "128 GB",
    "price": 17090,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x80.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo X Series (Zeiss Flagship)",
    "model": "Vivo X80 Pro 5G",
    "storage": "256 GB",
    "price": 22090,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x80-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X9",
    "storage": "64 GB",
    "price": 28900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x9.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo X Series (Zeiss Flagship)",
    "model": "Vivo X90 5G",
    "storage": "256 GB",
    "price": 28950,
    "image": "https://api.mobileapi.dev/devices/4965/thumb.png"
  },
  {
    "brand": "Vivo",
    "series": "Vivo X Series (Zeiss Flagship)",
    "model": "Vivo X90 Pro 5G",
    "storage": "256 GB",
    "price": 28850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x90-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X9s",
    "storage": "64 GB",
    "price": 4160,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x9s.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo X9s Plus",
    "storage": "64 GB",
    "price": 4340,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x9s-plus.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y02T",
    "storage": "64 GB",
    "price": 3620,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y02t.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y05",
    "storage": "64 GB",
    "price": 10440,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y05.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Y Series",
    "model": "Vivo Y100 5G",
    "storage": "128 GB",
    "price": 11750,
    "image": "https://api.mobileapi.dev/devices/4997/thumb.png"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y100A 5G",
    "storage": "128 GB",
    "price": 12520,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y100a-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y11 5G",
    "storage": "64 GB",
    "price": 11600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y11-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y12",
    "storage": "64 GB",
    "price": 3590,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y12.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y15 2019",
    "storage": "64 GB",
    "price": 5550,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y15-2019.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Y Series",
    "model": "Vivo Y16",
    "storage": "64 GB",
    "price": 4650,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y16.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y17",
    "storage": "128 GB",
    "price": 5110,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y17.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y17s",
    "storage": "64 GB",
    "price": 4910,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y17s.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y18",
    "storage": "64 GB",
    "price": 5930,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y18.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y18e",
    "storage": "64 GB",
    "price": 5780,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y18e.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y18i",
    "storage": "64 GB",
    "price": 6990,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y18i.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y19",
    "storage": "128 GB",
    "price": 4190,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y19.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y19e",
    "storage": "64 GB",
    "price": 7270,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y19e.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y19s 5G",
    "storage": "64 GB",
    "price": 9780,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y19s-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y20",
    "storage": "64 GB",
    "price": 4210,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y20.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Y Series",
    "model": "Vivo Y200 5G",
    "storage": "128 GB",
    "price": 12850,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y200.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Y Series",
    "model": "Vivo Y200 Pro 5G",
    "storage": "128 GB",
    "price": 14930,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y200-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y200e 5G",
    "storage": "128 GB",
    "price": 11420,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y200e-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y20A",
    "storage": "64 GB",
    "price": 4070,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y20a.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y20G",
    "storage": "64 GB",
    "price": 4730,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y20g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y20i",
    "storage": "64 GB",
    "price": 4330,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y20i.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y20T",
    "storage": "64 GB",
    "price": 4590,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y20t.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y21 2021",
    "storage": "64 GB",
    "price": 6210,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y21-2021.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y21 5G",
    "storage": "128 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y21-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y21a",
    "storage": "64 GB",
    "price": 6090,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y21a.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y21e",
    "storage": "64 GB",
    "price": 4760,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y21e.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y21G",
    "storage": "64 GB",
    "price": 4760,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y21g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y21T",
    "storage": "128 GB",
    "price": 5090,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y21t.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y22 2022",
    "storage": "64 GB",
    "price": 6490,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y22-2022.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y27",
    "storage": "128 GB",
    "price": 6690,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y27.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Y Series",
    "model": "Vivo Y28 5G",
    "storage": "128 GB",
    "price": 11000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y28.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y28e 5G",
    "storage": "64 GB",
    "price": 9800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y28e-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y28s 5G",
    "storage": "128 GB",
    "price": 11500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y28s-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y29 5G",
    "storage": "128 GB",
    "price": 12350,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y29-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y30",
    "storage": "128 GB",
    "price": 4500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y30.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y300 Plus 5G",
    "storage": "128 GB",
    "price": 14370,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y300-plus-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y31 2021",
    "storage": "128 GB",
    "price": 6820,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y31-2021.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y31 5G",
    "storage": "128 GB",
    "price": 8500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y31-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y31 Pro 5G",
    "storage": "128 GB",
    "price": 15120,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y31-pro-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y31T 5G",
    "storage": "128 GB",
    "price": 18400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y31t-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y33s",
    "storage": "128 GB",
    "price": 6430,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y33s.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y33T",
    "storage": "128 GB",
    "price": 6020,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y33t.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y35",
    "storage": "128 GB",
    "price": 7020,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y35.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Y Series",
    "model": "Vivo Y36",
    "storage": "128 GB",
    "price": 7820,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y36.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y39 5G",
    "storage": "128 GB",
    "price": 14500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y39-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y400 5G",
    "storage": "128 GB",
    "price": 18010,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y400-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y400 Pro 5G",
    "storage": "128 GB",
    "price": 18800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y400-pro-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y50",
    "storage": "128 GB",
    "price": 7020,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y50.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y51 2020",
    "storage": "128 GB",
    "price": 7170,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y51-2020.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y51 Pro 5G",
    "storage": "128 GB",
    "price": 18450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y51-pro-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y51A",
    "storage": "128 GB",
    "price": 4800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y51a.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y53s",
    "storage": "128 GB",
    "price": 7380,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y53s.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Y Series",
    "model": "Vivo Y56 5G",
    "storage": "128 GB",
    "price": 9170,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y56.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Y Series",
    "model": "Vivo Y58 5G",
    "storage": "128 GB",
    "price": 10860,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y58.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y72 5G",
    "storage": "128 GB",
    "price": 7440,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y72-5g.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y73",
    "storage": "128 GB",
    "price": 7370,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y73.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y75",
    "storage": "128 GB",
    "price": 6960,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y75.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y83 Pro",
    "storage": "64 GB",
    "price": 2740,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y83-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Y95",
    "storage": "64 GB",
    "price": 3240,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y95.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Z1 Pro",
    "storage": "64 GB",
    "price": 4600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-z1-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Series",
    "model": "Vivo Z1x",
    "storage": "128 GB",
    "price": 5160,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-z1x.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO C Series",
    "model": "POCO C51",
    "storage": "64 GB",
    "price": 4800,
    "image": "https://api.mobileapi.dev/devices/15702/thumb.png"
  },
  {
    "brand": "Poco",
    "series": "POCO C Series",
    "model": "POCO C55",
    "storage": "64 GB",
    "price": 5750,
    "image": "https://api.mobileapi.dev/devices/15703/thumb.png"
  },
  {
    "brand": "Poco",
    "series": "POCO C Series",
    "model": "POCO C65",
    "storage": "128 GB",
    "price": 7200,
    "image": "https://api.mobileapi.dev/devices/15697/thumb.png"
  },
  {
    "brand": "Poco",
    "series": "POCO F Series",
    "model": "POCO F1",
    "storage": "64 GB",
    "price": 5070,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f1.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO F Series",
    "model": "POCO F3 GT",
    "storage": "128 GB",
    "price": 12300,
    "image": "https://api.mobileapi.dev/devices/15719/thumb.png"
  },
  {
    "brand": "Poco",
    "series": "POCO F Series",
    "model": "POCO F4 5G",
    "storage": "128 GB",
    "price": 13900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f4.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO F Series",
    "model": "POCO F4 GT",
    "storage": "128 GB",
    "price": 16000,
    "image": "https://api.mobileapi.dev/devices/15706/thumb.png"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M4 Pro 5G",
    "storage": "128 GB",
    "price": 7700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m4-pro-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M5",
    "storage": "64 GB",
    "price": 6700,
    "image": "https://api.mobileapi.dev/devices/15711/thumb.png"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M6 5G",
    "storage": "128 GB",
    "price": 8150,
    "image": "https://api.mobileapi.dev/devices/15691/thumb.png"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M6 Pro 5G",
    "storage": "128 GB",
    "price": 9450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-pro-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X2",
    "storage": "64 GB",
    "price": 6340,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x2.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X3 Pro",
    "storage": "128 GB",
    "price": 8800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x3-pro.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X4 Pro 5G",
    "storage": "128 GB",
    "price": 9400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x4-pro-5g.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X5 5G",
    "storage": "128 GB",
    "price": 10350,
    "image": "https://api.mobileapi.dev/devices/15708/thumb.png"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X5 Pro 5G",
    "storage": "128 GB",
    "price": 13000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x5-pro.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X6 5G",
    "storage": "128 GB",
    "price": 16300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO X Series",
    "model": "POCO X6 Pro 5G",
    "storage": "256 GB",
    "price": 16450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Number & C/A Series",
    "model": "Redmi 10",
    "storage": "64 GB",
    "price": 5100,
    "image": "https://api.mobileapi.dev/devices/31570/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Number & C/A Series",
    "model": "Redmi 10A",
    "storage": "64 GB",
    "price": 4860,
    "image": "https://api.mobileapi.dev/devices/31571/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Number & C/A Series",
    "model": "Redmi 11 Prime 5G",
    "storage": "64 GB",
    "price": 6900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-11-prime-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Number & C/A Series",
    "model": "Redmi 12",
    "storage": "128 GB",
    "price": 7320,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-12.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Number & C/A Series",
    "model": "Redmi 13C",
    "storage": "128 GB",
    "price": 6800,
    "image": "https://api.mobileapi.dev/devices/31508/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Number & C/A Series",
    "model": "Redmi 9",
    "storage": "64 GB",
    "price": 4100,
    "image": "https://api.mobileapi.dev/devices/13626/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Number & C/A Series",
    "model": "Redmi A3",
    "storage": "64 GB",
    "price": 6100,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-a3.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 10, 9 & Older Series",
    "model": "Redmi Note 10",
    "storage": "64 GB",
    "price": 5200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-10.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 10, 9 & Older Series",
    "model": "Redmi Note 10 Pro",
    "storage": "128 GB",
    "price": 6800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note10-pro.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 10, 9 & Older Series",
    "model": "Redmi Note 10 Pro Max",
    "storage": "128 GB",
    "price": 13170,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note10-pro-max.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 10, 9 & Older Series",
    "model": "Redmi Note 10S",
    "storage": "64 GB",
    "price": 5700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-10s.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 12 & 11 Series",
    "model": "Redmi Note 11",
    "storage": "64 GB",
    "price": 5800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 12 & 11 Series",
    "model": "Redmi Note 11 Pro",
    "storage": "128 GB",
    "price": 7250,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-global.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 12 & 11 Series",
    "model": "Redmi Note 11 Pro+ 5G",
    "storage": "128 GB",
    "price": 8900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-plus-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 12 & 11 Series",
    "model": "Redmi Note 11S",
    "storage": "128 GB",
    "price": 6600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11s.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 12 & 11 Series",
    "model": "Redmi Note 12 4G",
    "storage": "128 GB",
    "price": 7900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-4g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 12 & 11 Series",
    "model": "Redmi Note 12 5G",
    "storage": "128 GB",
    "price": 9500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 12 & 11 Series",
    "model": "Redmi Note 12 Pro 5G",
    "storage": "128 GB",
    "price": 13500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 12 & 11 Series",
    "model": "Redmi Note 12 Pro+ 5G",
    "storage": "256 GB",
    "price": 15500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro-plus.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 13 & 14 Series",
    "model": "Redmi Note 13 4G",
    "storage": "128 GB",
    "price": 9100,
    "image": "https://api.mobileapi.dev/devices/13590/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 13 & 14 Series",
    "model": "Redmi Note 13 5G",
    "storage": "128 GB",
    "price": 11500,
    "image": "https://api.mobileapi.dev/devices/31521/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 13 & 14 Series",
    "model": "Redmi Note 13 Pro 5G",
    "storage": "128 GB",
    "price": 15500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 13 & 14 Series",
    "model": "Redmi Note 13 Pro+ 5G",
    "storage": "256 GB",
    "price": 18500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 10, 9 & Older Series",
    "model": "Redmi Note 8",
    "storage": "64 GB",
    "price": 4100,
    "image": "https://api.mobileapi.dev/devices/31618/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 10, 9 & Older Series",
    "model": "Redmi Note 8 Pro",
    "storage": "64 GB",
    "price": 4900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-8-pro.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 10, 9 & Older Series",
    "model": "Redmi Note 9",
    "storage": "64 GB",
    "price": 4600,
    "image": "https://api.mobileapi.dev/devices/31608/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 10, 9 & Older Series",
    "model": "Redmi Note 9 Pro",
    "storage": "64 GB",
    "price": 5200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-9-pro.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Redmi Note 10, 9 & Older Series",
    "model": "Redmi Note 9 Pro Max",
    "storage": "64 GB",
    "price": 13740,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-9-pro-max.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi 11 Lite NE 5G",
    "storage": "128 GB",
    "price": 10490,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-11-lite-ne-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi 11i 5G",
    "storage": "128 GB",
    "price": 9960,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-11i-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi 11i Hypercharge 5G",
    "storage": "128 GB",
    "price": 9730,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-11i-hypercharge-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Mi / Flagship Series",
    "model": "Xiaomi 11T Pro",
    "storage": "128 GB",
    "price": 12400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-11t-pro.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Mi / Flagship Series",
    "model": "Xiaomi 12 Lite",
    "storage": "128 GB",
    "price": 15900,
    "image": "https://api.mobileapi.dev/devices/1837/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Mi / Flagship Series",
    "model": "Xiaomi 12 Pro",
    "storage": "256 GB",
    "price": 19000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-12-pro.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Mi / Flagship Series",
    "model": "Xiaomi 13",
    "storage": "256 GB",
    "price": 36950,
    "image": "https://api.mobileapi.dev/devices/31521/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Mi / Flagship Series",
    "model": "Xiaomi 13 Lite",
    "storage": "128 GB",
    "price": 19950,
    "image": "https://api.mobileapi.dev/devices/1834/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Mi / Flagship Series",
    "model": "Xiaomi 13 Pro",
    "storage": "256 GB",
    "price": 31000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13-pro.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Mi / Flagship Series",
    "model": "Xiaomi 14",
    "storage": "256 GB",
    "price": 35000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Mi / Flagship Series",
    "model": "Xiaomi 14 Civi",
    "storage": "128 GB",
    "price": 19620,
    "image": "https://api.mobileapi.dev/devices/840/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Mi / Flagship Series",
    "model": "Xiaomi 14 Ultra",
    "storage": "512 GB",
    "price": 56000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi 15",
    "storage": "512 GB",
    "price": 62300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-15.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi 15 Ultra",
    "storage": "512 GB",
    "price": 61780,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-15-ultra.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi 17",
    "storage": "256 GB",
    "price": 55930,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-17.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi 17 Ultra",
    "storage": "512 GB",
    "price": 77470,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-17-ultra.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi 17T",
    "storage": "256 GB",
    "price": 39150,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-17t.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Black Shark 2",
    "storage": "128 GB",
    "price": 6970,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-black-shark-2.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Mi / Flagship Series",
    "model": "Xiaomi Mi 10",
    "storage": "128 GB",
    "price": 11500,
    "image": "https://api.mobileapi.dev/devices/1946/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Mi / Flagship Series",
    "model": "Xiaomi Mi 10i",
    "storage": "128 GB",
    "price": 8100,
    "image": "https://api.mobileapi.dev/devices/29024/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Mi 10T",
    "storage": "128 GB",
    "price": 8600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-mi-10t.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Mi / Flagship Series",
    "model": "Xiaomi Mi 10T Pro",
    "storage": "128 GB",
    "price": 9900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-mi-10t-pro-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi 10 Power",
    "storage": "128 GB",
    "price": 6400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-10-power.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi 10 Prime",
    "storage": "64 GB",
    "price": 5600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-10-prime.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi 10 Prime 2022",
    "storage": "64 GB",
    "price": 5600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-10-prime-2022.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi 12C",
    "storage": "64 GB",
    "price": 5900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-12c.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi 13 5G",
    "storage": "128 GB",
    "price": 9500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-13-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi 14C 5G",
    "storage": "64 GB",
    "price": 7500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-14c-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi 15 5G",
    "storage": "128 GB",
    "price": 11000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-15-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi 15A 5G",
    "storage": "64 GB",
    "price": 11240,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-15a-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi 15C 5G",
    "storage": "128 GB",
    "price": 11140,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-15c-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi 17 5G",
    "storage": "128 GB",
    "price": 17400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-17-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi 9 Activ",
    "storage": "64 GB",
    "price": 5130,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-9-activ.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi 9 Power",
    "storage": "64 GB",
    "price": 4700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-9-power.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi 9 Prime",
    "storage": "64 GB",
    "price": 4300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-9-prime.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi A3x",
    "storage": "64 GB",
    "price": 6120,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-a3x.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi A4 5G",
    "storage": "64 GB",
    "price": 8120,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-a4-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi A5",
    "storage": "64 GB",
    "price": 6700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-a5.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi A7",
    "storage": "64 GB",
    "price": 8820,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-a7.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi A7 Pro 5G",
    "storage": "64 GB",
    "price": 9630,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-a7-pro-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi K20",
    "storage": "64 GB",
    "price": 5600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-k20.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi K20 Pro",
    "storage": "128 GB",
    "price": 7200,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-k20-pro.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi K50i 5G",
    "storage": "128 GB",
    "price": 9510,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-k50i-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi Note 10 Lite",
    "storage": "64 GB",
    "price": 5100,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-10-lite.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi Note 10T 5G",
    "storage": "64 GB",
    "price": 5900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-10t-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi Note 11 SE",
    "storage": "64 GB",
    "price": 6100,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-se.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi Note 11T 5G",
    "storage": "64 GB",
    "price": 6800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11t-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi Note 14 SE 5G",
    "storage": "128 GB",
    "price": 11240,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-14-se-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi Note 15 5G",
    "storage": "128 GB",
    "price": 18620,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-15-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi Note 15 Pro 5G",
    "storage": "128 GB",
    "price": 23770,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-15-pro-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi Note 15 Pro Plus 5G",
    "storage": "256 GB",
    "price": 27550,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-15-pro-plus-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi Note 15 SE 5G",
    "storage": "128 GB",
    "price": 17510,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-15-se-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi Note 17 5G",
    "storage": "128 GB",
    "price": 20350,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-17-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi Note 17 Pro 5G",
    "storage": "128 GB",
    "price": 26400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-17-pro-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi Note 17 Pro Max 5G",
    "storage": "256 GB",
    "price": 34450,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-17-pro-max-5g.jpg"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Series",
    "model": "Xiaomi Redmi Turbo 5",
    "storage": "256 GB",
    "price": 26550,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-turbo-5.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord CE 5",
    "storage": "128 GB",
    "price": 18500,
    "image": "https://api.mobileapi.dev/devices/809/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord 6",
    "storage": "128 GB",
    "price": 24500,
    "image": "https://api.mobileapi.dev/devices/809/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus Nord Series",
    "model": "OnePlus Nord 5",
    "storage": "128 GB",
    "price": 21500,
    "image": "https://api.mobileapi.dev/devices/809/thumb.png"
  },
  {
    "brand": "Xiaomi",
    "series": "Xiaomi Mi / Flagship Series",
    "model": "Xiaomi 11X Pro",
    "storage": "128 GB",
    "price": 14500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-mi11x-pro.jpg"
  },
  {
    "brand": "Apple",
    "series": "Apple iPad & Tablet Series",
    "model": "iPad Pro 13",
    "storage": "256 GB",
    "price": 92900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-pro-13-2024.jpg"
  },
  {
    "brand": "Apple",
    "series": "Apple iPad & Tablet Series",
    "model": "iPad 10.9",
    "storage": "64 GB",
    "price": 29000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-109-2022.jpg"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 10 Series",
    "model": "OnePlus 10R 5G",
    "storage": "128 GB",
    "price": 13450,
    "image": "https://api.mobileapi.dev/devices/16344/thumb.png"
  },
  {
    "brand": "OnePlus",
    "series": "OnePlus 8 & 7 Series",
    "model": "OnePlus 8 5G UW",
    "storage": "128 GB",
    "price": 10450,
    "image": "https://api.mobileapi.dev/devices/16348/thumb.png"
  },
  {
    "brand": "Google",
    "series": "Google Pixel Series",
    "model": "Google Pixel 10",
    "storage": "128 GB",
    "price": 44500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Number Series",
    "model": "Realme 11 Pro+ 5G",
    "storage": "256 GB",
    "price": 15000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro-plus.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Narzo Series",
    "model": "Realme Narzo 80 Lite 5G",
    "storage": "128 GB",
    "price": 9500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-pro-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme Narzo Series",
    "model": "Realme Narzo 80 Lite 4G",
    "storage": "128 GB",
    "price": 7800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-pro-5g.jpg"
  },
  {
    "brand": "Realme",
    "series": "Realme C Series",
    "model": "Realme C19",
    "storage": "64 GB",
    "price": 5500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-c15.jpg"
  },
  {
    "brand": "Poco",
    "series": "POCO M Series",
    "model": "POCO M2",
    "storage": "64 GB",
    "price": 4900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m2.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Flagship Series",
    "model": "iQOO 15",
    "storage": "256 GB",
    "price": 48000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-13.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Neo Series",
    "model": "iQOO Neo 9 SE",
    "storage": "128 GB",
    "price": 21500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo9.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Neo Series",
    "model": "iQOO Neo 10R",
    "storage": "128 GB",
    "price": 24000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo9-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Z Series",
    "model": "iQOO Z11",
    "storage": "128 GB",
    "price": 17500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9-turbo.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Z Series",
    "model": "iQOO Z11x 5G",
    "storage": "128 GB",
    "price": 12500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9x.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Z Series",
    "model": "iQOO Z11 Lite",
    "storage": "128 GB",
    "price": 9500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9-lite.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Z Series",
    "model": "iQOO Z10",
    "storage": "128 GB",
    "price": 15500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Z Series",
    "model": "iQOO Z10R",
    "storage": "128 GB",
    "price": 16800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9-turbo.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Z Series",
    "model": "iQOO Z10x",
    "storage": "128 GB",
    "price": 11500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9x.jpg"
  },
  {
    "brand": "Vivo",
    "series": "iQOO Z Series",
    "model": "iQOO Z10 Lite",
    "storage": "128 GB",
    "price": 8800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9-lite.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 18 Series",
    "model": "Apple iPhone 18 Pro Max",
    "storage": "256 GB",
    "price": 160000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg"
  },
  {
    "brand": "Apple",
    "series": "iPhone 18 Series",
    "model": "Apple iPhone 18 Pro",
    "storage": "128 GB",
    "price": 152000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg"
  },
  {
    "brand": "Vivo",
    "series": "Vivo Y Series",
    "model": "Vivo Y15",
    "storage": "64 GB",
    "price": 3560,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-y15-2019.jpg"
  },
  {
    "brand": "Oppo",
    "series": "Oppo Find Series",
    "model": "Oppo Find N3",
    "storage": "512 GB",
    "price": 68000,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-find-n3.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Camon Imaging Series",
    "model": "Tecno Camon 20",
    "storage": "128 GB",
    "price": 9400,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-20.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Camon Imaging Series",
    "model": "Tecno Camon 20 Premier 5G",
    "storage": "512 GB",
    "price": 15500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-20-premier.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Pova Power Gaming Series",
    "model": "Tecno Pova 4 Pro",
    "storage": "128 GB",
    "price": 8700,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-pova-4-pro.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Pova Power Gaming Series",
    "model": "Tecno Pova 3",
    "storage": "128 GB",
    "price": 6900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-pova-3.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Spark Series",
    "model": "Tecno Spark 10 Pro",
    "storage": "128 GB",
    "price": 7100,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-spark-10-pro.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Spark Series",
    "model": "Tecno Spark 10 5G",
    "storage": "64 GB",
    "price": 6500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-spark-10-5g.jpg"
  },
  {
    "brand": "Tecno",
    "series": "Spark Series",
    "model": "Tecno Spark 9",
    "storage": "64 GB",
    "price": 4600,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/tecno-spark-9.jpg"
  },
  {
    "brand": "Infinix",
    "series": "Note Pro Series",
    "model": "Infinix Note 40 5G",
    "storage": "256 GB",
    "price": 11800,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-note-40-5g.jpg"
  },
  {
    "brand": "Infinix",
    "series": "Note Pro Series",
    "model": "Infinix Note 12 Pro 5G",
    "storage": "128 GB",
    "price": 8900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-note-12-pro-5g.jpg"
  },
  {
    "brand": "Infinix",
    "series": "Zero Flagship Series",
    "model": "Infinix Zero Ultra 5G",
    "storage": "256 GB",
    "price": 16500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-zero-ultra.jpg"
  },
  {
    "brand": "Infinix",
    "series": "Hot Performance Series",
    "model": "Infinix Hot 30i",
    "storage": "64 GB",
    "price": 5100,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-hot-30i.jpg"
  },
  {
    "brand": "Infinix",
    "series": "Hot Performance Series",
    "model": "Infinix Hot 20 5G",
    "storage": "64 GB",
    "price": 5900,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-hot-20-5g.jpg"
  },
  {
    "brand": "Infinix",
    "series": "Smart Series",
    "model": "Infinix Smart 8",
    "storage": "64 GB",
    "price": 4300,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-smart-8.jpg"
  },
  {
    "brand": "Infinix",
    "series": "Smart Series",
    "model": "Infinix Smart 7",
    "storage": "64 GB",
    "price": 3500,
    "image": "https://fdn2.gsmarena.com/vv/bigpic/infinix-smart-7.jpg"
  }
];
export const STORAGE_OPTIONS = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];

export const ACCESSORIES_LIST = [
  { id: 'Original Box', label: 'Original Box with IMEI', bonus: '+ ₹300' },
  { id: 'Original Charger', label: 'Original Brand Charger', bonus: '+ ₹300' },
  { id: 'Valid Bill', label: 'Valid Purchase Bill / Invoice', bonus: '+ ₹200' },
];

export const HARDWARE_DEFECTS = [
  { id: 'camera', label: 'Camera Fault (Front/Back Lens or Autofocus Issue)' },
  { id: 'charging_port', label: 'Charging Port / Connection Fault' },
  { id: 'speaker_mic', label: 'Speaker / Earpiece / Microphone Fault' },
  { id: 'biometrics', label: 'Biometrics Fault (Face ID or Fingerprint)' },
];

export const FAQS_LIST = [
  {
    "q": "Is entering the IMEI number required while booking online?",
    "a": "No, entering your IMEI number online is completely optional! If you prefer, our executive will simply verify it at your doorstep during pickup."
  },
  {
    "q": "How do I check my phone IMEI number?",
    "a": "Simply open your phone dialer app and type *#06#. A 15-digit IMEI number will appear instantly on screen."
  },
  {
    "q": "When do I get paid for my old phone?",
    "a": "Payout is instant! Our Doorstep pickup executive inspects your device at your doorstep and transfers cash or UPI directly into your account on spot before taking the phone."
  },
  {
    "q": "Is doorstep pickup 100% free across all service localities?",
    "a": "Yes! Pickup is 100% FREE with zero hidden charges across all service areas areas including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana, Chowk, Rajajipuram, and Jankipuram."
  },
  {
    "q": "What documents are required to sell an old phone?",
    "a": "You only need a valid Govt ID proof (Aadhaar Card or Driving License) and the phone itself. Having the original box or invoice gives you extra cash bonuses!"
  },
  {
    "q": "What happens to my personal data on the phone?",
    "a": "Fundu performs an automated, military-grade factory data wipe right at your doorstep before handing over the digital receipt."
  },
  {
    "q": "Do you buy non-working or screen-damaged phones?",
    "a": "Yes! We buy phones in all conditions — flawless, minor body scratches, cracked display glass, or faulty battery."
  },
  {
    "q": "How is the final cash quote calculated?",
    "a": "Our automated AI algorithm checks live resale market rates and adjusts for screen condition, body condition, hardware defects, warranty status, and original box/charger accessories."
  },
  {
    "q": "Can I cancel or reschedule my doorstep pickup slot?",
    "a": "Yes, you can easily reschedule or cancel your pickup slot anytime by calling our Doorstep helpline at +91-9839122345."
  },
  {
    "q": "Is Fundu better than local offline shops at your doorstep?",
    "a": "Yes! With Fundu, you get algorithmic highest price guarantee, zero market bargaining, free doorstep visit, and instant spot payment."
  },
  {
    "q": "How long is the instant price quote valid?",
    "a": "Your Fundu price quote is guaranteed and locked in for 7 full days from the time of booking."
  },
  {
    "q": "Can I sell multiple phones at once?",
    "a": "Absolutely! You can book individual sell requests or inform our executive during doorstep visit for bulk spot cash payouts."
  },
  {
    "q": "What if my phone brand is not listed?",
    "a": "You can use our live search bar or contact our customer hotline +91-9839122345 for custom manual valuation."
  },
  {
    "q": "Do I get a legal seller invoice?",
    "a": "Yes, an official digital seller invoice & receipt is sent to your mobile number immediately upon completion of pickup."
  }
];
