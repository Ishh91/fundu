import { getCleanPhoneImage } from '../lib/phoneImages';
import type { CatalogModelItem } from '../lib/mobileApi';

export function getApiThumb(brand: string, query: string, fallback?: string): string {
  return getCleanPhoneImage(brand, query, fallback);
}

export type BrandSeriesDefinition = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  description: string;
  pattern: RegExp;
  defaultModels?: CatalogModelItem[];
};

export type SeriesGroup = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  modelsCount: number;
  models: CatalogModelItem[];
};

export const BRAND_SERIES_DEFINITIONS: Record<string, BrandSeriesDefinition[]> = {
  apple: [
    {
      id: 'iphone-16',
      slug: 'iphone-16-series',
      name: 'iPhone 16 Series',
      brand: 'Apple',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg',
      description: '16 Pro Max, 16 Pro, 16 Plus, 16',
      pattern: /\biphone\s*16\b/i,
      defaultModels: [
        { brand: 'Apple', series: 'iPhone 16 Series', model: 'Apple iPhone 16 Pro Max', storage: '256 GB', price: 98000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg' },
        { brand: 'Apple', series: 'iPhone 16 Series', model: 'Apple iPhone 16 Pro', storage: '128 GB', price: 88000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg' },
        { brand: 'Apple', series: 'iPhone 16 Series', model: 'Apple iPhone 16 Plus', storage: '128 GB', price: 68000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
        { brand: 'Apple', series: 'iPhone 16 Series', model: 'Apple iPhone 16', storage: '128 GB', price: 58000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
      ],
    },
    {
      id: 'iphone-15',
      slug: 'iphone-15-series',
      name: 'iPhone 15 Series',
      brand: 'Apple',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg',
      description: '15 Pro Max, 15 Pro, 15 Plus, 15',
      pattern: /\biphone\s*15\b/i,
      defaultModels: [
        { brand: 'Apple', series: 'iPhone 15 Series', model: 'Apple iPhone 15 Pro Max', storage: '256 GB', price: 85000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg' },
        { brand: 'Apple', series: 'iPhone 15 Series', model: 'Apple iPhone 15 Pro', storage: '128 GB', price: 74000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg' },
        { brand: 'Apple', series: 'iPhone 15 Series', model: 'Apple iPhone 15 Plus', storage: '128 GB', price: 59000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg' },
        { brand: 'Apple', series: 'iPhone 15 Series', model: 'Apple iPhone 15', storage: '128 GB', price: 54000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg' },
      ],
    },
    {
      id: 'iphone-14',
      slug: 'iphone-14-series',
      name: 'iPhone 14 Series',
      brand: 'Apple',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg',
      description: '14 Pro Max, 14 Pro, 14 Plus, 14',
      pattern: /\biphone\s*14\b/i,
      defaultModels: [
        { brand: 'Apple', series: 'iPhone 14 Series', model: 'Apple iPhone 14 Pro Max', storage: '128 GB', price: 65000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg' },
        { brand: 'Apple', series: 'iPhone 14 Series', model: 'Apple iPhone 14 Pro', storage: '128 GB', price: 58000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg' },
        { brand: 'Apple', series: 'iPhone 14 Series', model: 'Apple iPhone 14 Plus', storage: '128 GB', price: 49000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg' },
        { brand: 'Apple', series: 'iPhone 14 Series', model: 'Apple iPhone 14', storage: '128 GB', price: 46000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg' },
      ],
    },
    {
      id: 'iphone-13',
      slug: 'iphone-13-series',
      name: 'iPhone 13 Series',
      brand: 'Apple',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg',
      description: '13 Pro Max, 13 Pro, 13, 13 mini',
      pattern: /\biphone\s*13\b/i,
      defaultModels: [
        { brand: 'Apple', series: 'iPhone 13 Series', model: 'Apple iPhone 13 Pro Max', storage: '128 GB', price: 54000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg' },
        { brand: 'Apple', series: 'iPhone 13 Series', model: 'Apple iPhone 13 Pro', storage: '128 GB', price: 47000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg' },
        { brand: 'Apple', series: 'iPhone 13 Series', model: 'Apple iPhone 13', storage: '128 GB', price: 38500, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg' },
        { brand: 'Apple', series: 'iPhone 13 mini', model: 'Apple iPhone 13 mini', storage: '128 GB', price: 32000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-mini.jpg' },
      ],
    },
    {
      id: 'iphone-12',
      slug: 'iphone-12-series',
      name: 'iPhone 12 Series',
      brand: 'Apple',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg',
      description: '12 Pro Max, 12 Pro, 12, 12 mini',
      pattern: /\biphone\s*12\b/i,
      defaultModels: [
        { brand: 'Apple', series: 'iPhone 12 Series', model: 'Apple iPhone 12 Pro Max', storage: '128 GB', price: 42000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg' },
        { brand: 'Apple', series: 'iPhone 12 Series', model: 'Apple iPhone 12 Pro', storage: '128 GB', price: 36000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg' },
        { brand: 'Apple', series: 'iPhone 12 Series', model: 'Apple iPhone 12', storage: '64 GB', price: 28000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg' },
        { brand: 'Apple', series: 'iPhone 12 Series', model: 'Apple iPhone 12 mini', storage: '64 GB', price: 22000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg' },
      ],
    },
    {
      id: 'iphone-11',
      slug: 'iphone-11-series',
      name: 'iPhone 11 Series',
      brand: 'Apple',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg',
      description: '11 Pro Max, 11 Pro, 11',
      pattern: /\biphone\s*11\b/i,
      defaultModels: [
        { brand: 'Apple', series: 'iPhone 11 Series', model: 'Apple iPhone 11 Pro Max', storage: '64 GB', price: 31000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg' },
        { brand: 'Apple', series: 'iPhone 11 Series', model: 'Apple iPhone 11 Pro', storage: '64 GB', price: 26000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg' },
        { brand: 'Apple', series: 'iPhone 11 Series', model: 'Apple iPhone 11', storage: '64 GB', price: 21000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg' },
      ],
    },
    {
      id: 'iphone-x',
      slug: 'iphone-x-series',
      name: 'iPhone X / XS / XR Series',
      brand: 'Apple',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg',
      description: 'XS Max, XS, XR, iPhone X',
      pattern: /\biphone\s*(x|xs|xr)\b/i,
      defaultModels: [
        { brand: 'Apple', series: 'iPhone X Series', model: 'Apple iPhone XS Max', storage: '64 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg' },
        { brand: 'Apple', series: 'iPhone X Series', model: 'Apple iPhone XS', storage: '64 GB', price: 16000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg' },
        { brand: 'Apple', series: 'iPhone X Series', model: 'Apple iPhone XR', storage: '64 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-xr.jpg' },
        { brand: 'Apple', series: 'iPhone X Series', model: 'Apple iPhone X', storage: '64 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-x.jpg' },
      ],
    },
    {
      id: 'iphone-8',
      slug: 'iphone-8-series',
      name: 'iPhone 8 Series',
      brand: 'Apple',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-8.jpg',
      description: 'iPhone 8 Plus, iPhone 8',
      pattern: /\biphone\s*8\b/i,
      defaultModels: [
        { brand: 'Apple', series: 'iPhone 8 Series', model: 'Apple iPhone 8 Plus', storage: '64 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-8.jpg' },
        { brand: 'Apple', series: 'iPhone 8 Series', model: 'Apple iPhone 8', storage: '64 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-8.jpg' },
      ],
    },
    {
      id: 'iphone-7',
      slug: 'iphone-7-series',
      name: 'iPhone 7 Series',
      brand: 'Apple',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-7r4.jpg',
      description: 'iPhone 7 Plus, iPhone 7',
      pattern: /\biphone\s*7\b/i,
      defaultModels: [
        { brand: 'Apple', series: 'iPhone 7 Series', model: 'Apple iPhone 7 Plus', storage: '32 GB', price: 7500, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-7r4.jpg' },
        { brand: 'Apple', series: 'iPhone 7 Series', model: 'Apple iPhone 7', storage: '32 GB', price: 5500, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-7r4.jpg' },
      ],
    },
    {
      id: 'iphone-6',
      slug: 'iphone-6-series',
      name: 'iPhone 6 & 6S Series',
      brand: 'Apple',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6s.jpg',
      description: '6S Plus, 6S, 6 Plus, 6',
      pattern: /\biphone\s*6\b/i,
      defaultModels: [
        { brand: 'Apple', series: 'iPhone 6 Series', model: 'Apple iPhone 6s Plus', storage: '32 GB', price: 4800, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6s-plus.jpg' },
        { brand: 'Apple', series: 'iPhone 6 Series', model: 'Apple iPhone 6s', storage: '32 GB', price: 3800, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6s.jpg' },
        { brand: 'Apple', series: 'iPhone 6 Series', model: 'Apple iPhone 6 Plus', storage: '16 GB', price: 3500, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6-plus.jpg' },
        { brand: 'Apple', series: 'iPhone 6 Series', model: 'Apple iPhone 6', storage: '16 GB', price: 2800, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6s.jpg' },
      ],
    },
    {
      id: 'iphone-se',
      slug: 'iphone-se-series',
      name: 'iPhone SE Series',
      brand: 'Apple',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg',
      description: 'SE 3rd Gen, SE 2020, SE 1st Gen',
      pattern: /\biphone\s*se\b/i,
      defaultModels: [
        { brand: 'Apple', series: 'iPhone SE Series', model: 'Apple iPhone SE 3rd Gen (2022)', storage: '64 GB', price: 18000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg' },
        { brand: 'Apple', series: 'iPhone SE Series', model: 'Apple iPhone SE 2nd Gen (2020)', storage: '64 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2020.jpg' },
        { brand: 'Apple', series: 'iPhone SE Series', model: 'Apple iPhone SE 1st Gen (2016)', storage: '16 GB', price: 3000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5s.jpg' },
      ],
    },
    {
      id: 'iphone-classic',
      slug: 'iphone-classic-series',
      name: 'iPhone 5 & Older Classic Series',
      brand: 'Apple',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5s.jpg',
      description: 'iPhone 5S, 5C, 5, 4S, 4, 3GS, 3G, 1',
      pattern: /\biphone\s*(5|4|3|2|1)\b/i,
      defaultModels: [
        { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 5s', storage: '16 GB', price: 2200, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5s.jpg' },
        { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 5c', storage: '16 GB', price: 1800, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5c.jpg' },
        { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 5', storage: '16 GB', price: 1600, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-5.jpg' },
        { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 4s', storage: '8 GB', price: 1200, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-4s.jpg' },
        { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 4', storage: '8 GB', price: 1000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-4.jpg' },
        { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 3GS', storage: '8 GB', price: 800, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-3gs.jpg' },
        { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 3G', storage: '8 GB', price: 700, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-3gs.jpg' },
        { brand: 'Apple', series: 'Classic Series', model: 'Apple iPhone 1 (Original 2007)', storage: '4 GB', price: 600, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-3gs.jpg' },
      ],
    },
  ],

  samsung: [
    {
      id: 'galaxy-s25',
      slug: 'galaxy-s25-series',
      name: 'Galaxy S25 Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg',
      description: 'S25 Ultra, S25+, S25 5G',
      pattern: /\bs25\b/i,
      defaultModels: [
        { brand: 'Samsung', series: 'Galaxy S25 Series', model: 'Samsung Galaxy S25 Ultra', storage: '256 GB', price: 84000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg' },
        { brand: 'Samsung', series: 'Galaxy S25 Series', model: 'Samsung Galaxy S25+', storage: '256 GB', price: 68000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
        { brand: 'Samsung', series: 'Galaxy S25 Series', model: 'Samsung Galaxy S25 5G', storage: '128 GB', price: 56000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg' },
      ],
    },
    {
      id: 'galaxy-s24',
      slug: 'galaxy-s24-series',
      name: 'Galaxy S24 Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-stylus.jpg',
      description: 'S24 Ultra, S24+, S24 5G, S24 FE',
      pattern: /\bs24\b/i,
      defaultModels: [
        { brand: 'Samsung', series: 'Galaxy S24 Series', model: 'Samsung Galaxy S24 Ultra', storage: '256 GB', price: 78000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-stylus.jpg' },
        { brand: 'Samsung', series: 'Galaxy S24 Series', model: 'Samsung Galaxy S24+', storage: '256 GB', price: 59000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
        { brand: 'Samsung', series: 'Galaxy S24 Series', model: 'Samsung Galaxy S24 5G', storage: '128 GB', price: 48000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg' },
        { brand: 'Samsung', series: 'Galaxy S24 Series', model: 'Samsung Galaxy S24 FE', storage: '128 GB', price: 38000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-fe.jpg' },
      ],
    },
    {
      id: 'galaxy-s23',
      slug: 'galaxy-s23-series',
      name: 'Galaxy S23 Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg',
      description: 'S23 Ultra, S23+, S23 5G, S23 FE',
      pattern: /\bs23\b/i,
      defaultModels: [
        { brand: 'Samsung', series: 'Galaxy S23 Series', model: 'Samsung Galaxy S23 Ultra', storage: '256 GB', price: 62000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg' },
        { brand: 'Samsung', series: 'Galaxy S23 Series', model: 'Samsung Galaxy S23+', storage: '256 GB', price: 46000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-plus-5g.jpg' },
        { brand: 'Samsung', series: 'Galaxy S23 Series', model: 'Samsung Galaxy S23 5G', storage: '128 GB', price: 39000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg' },
        { brand: 'Samsung', series: 'Galaxy S23 Series', model: 'Samsung Galaxy S23 FE 5G', storage: '128 GB', price: 31000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-fe.jpg' },
      ],
    },
    {
      id: 'galaxy-s22',
      slug: 'galaxy-s22-series',
      name: 'Galaxy S22 Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-ultra-5g.jpg',
      description: 'S22 Ultra, S22+, S22 5G',
      pattern: /\bs22\b/i,
      defaultModels: [
        { brand: 'Samsung', series: 'Galaxy S22 Series', model: 'Samsung Galaxy S22 Ultra 5G', storage: '128 GB', price: 44000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-ultra-5g.jpg' },
        { brand: 'Samsung', series: 'Galaxy S22 Series', model: 'Samsung Galaxy S22+ 5G', storage: '128 GB', price: 34000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-plus-5g.jpg' },
        { brand: 'Samsung', series: 'Galaxy S22 Series', model: 'Samsung Galaxy S22 5G', storage: '128 GB', price: 27000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-5g.jpg' },
      ],
    },
    {
      id: 'galaxy-s21',
      slug: 'galaxy-s21-series',
      name: 'Galaxy S21 Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-fe-5g.jpg',
      description: 'S21 Ultra, S21+, S21 5G, S21 FE',
      pattern: /\bs21\b/i,
      defaultModels: [
        { brand: 'Samsung', series: 'Galaxy S21 Series', model: 'Samsung Galaxy S21 Ultra 5G', storage: '128 GB', price: 32000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-ultra-5g-.jpg' },
        { brand: 'Samsung', series: 'Galaxy S21 Series', model: 'Samsung Galaxy S21+ 5G', storage: '128 GB', price: 24000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-plus-5g-.jpg' },
        { brand: 'Samsung', series: 'Galaxy S21 Series', model: 'Samsung Galaxy S21 5G', storage: '128 GB', price: 20000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-5g-r.jpg' },
        { brand: 'Samsung', series: 'Galaxy S21 Series', model: 'Samsung Galaxy S21 FE 5G', storage: '128 GB', price: 18500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-fe-5g.jpg' },
      ],
    },
    {
      id: 'galaxy-s20',
      slug: 'galaxy-s20-series',
      name: 'Galaxy S20 Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-ultra-5g-r.jpg',
      description: 'S20 Ultra, S20+, S20 5G, S20 FE',
      pattern: /\bs20\b/i,
      defaultModels: [
        { brand: 'Samsung', series: 'Galaxy S20 Series', model: 'Samsung Galaxy S20 Ultra 5G', storage: '128 GB', price: 23000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-ultra-5g-r.jpg' },
        { brand: 'Samsung', series: 'Galaxy S20 Series', model: 'Samsung Galaxy S20+', storage: '128 GB', price: 18000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-plus-r.jpg' },
        { brand: 'Samsung', series: 'Galaxy S20 Series', model: 'Samsung Galaxy S20', storage: '128 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-r.jpg' },
        { brand: 'Samsung', series: 'Galaxy S20 Series', model: 'Samsung Galaxy S20 FE 5G', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-fe-5g.jpg' },
        { brand: 'Samsung', series: 'Galaxy S20 Series', model: 'Samsung Galaxy S20 FE', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-fe-5g.jpg' },
      ],
    },
    {
      id: 'galaxy-s10',
      slug: 'galaxy-s10-series',
      name: 'Galaxy S10 Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-plus-new.jpg',
      description: 'S10+, S10, S10e, S10 Lite',
      pattern: /\bs10\b/i,
      defaultModels: [
        { brand: 'Samsung', series: 'Galaxy S10 Series', model: 'Samsung Galaxy S10+', storage: '128 GB', price: 12500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-plus-new.jpg' },
        { brand: 'Samsung', series: 'Galaxy S10 Series', model: 'Samsung Galaxy S10', storage: '128 GB', price: 10500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-1.jpg' },
        { brand: 'Samsung', series: 'Galaxy S10 Series', model: 'Samsung Galaxy S10e', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10e-1.jpg' },
        { brand: 'Samsung', series: 'Galaxy S10 Series', model: 'Samsung Galaxy S10 Lite', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-lite-sm-g770f.jpg' },
      ],
    },
    {
      id: 'galaxy-z',
      slug: 'galaxy-z-series',
      name: 'Galaxy Z Series (Fold & Flip)',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg',
      description: 'Fold 6, Flip 6, Fold 5, Flip 5, Fold 4, Flip 4',
      pattern: /\b(fold|flip)\b/i,
      defaultModels: [
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
      ],
    },
    {
      id: 'galaxy-note',
      slug: 'galaxy-note-series',
      name: 'Galaxy Note Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-ultra-5g-.jpg',
      description: 'Note 20 Ultra, Note 20, Note 10+, Note 10',
      pattern: /\bnote\b/i,
      defaultModels: [
        { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 20 Ultra 5G', storage: '256 GB', price: 36000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-ultra-5g-.jpg' },
        { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 20', storage: '256 GB', price: 24000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-5g-r.jpg' },
        { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 10+', storage: '256 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-plus-.jpg' },
        { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 10', storage: '256 GB', price: 16000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-.jpg' },
        { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 10 Lite', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-lite.jpg' },
        { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 9', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note9-r1.jpg' },
        { brand: 'Samsung', series: 'Galaxy Note Series', model: 'Samsung Galaxy Note 8', storage: '64 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note8-sm-n950.jpg' },
      ],
    },
    {
      id: 'galaxy-a',
      slug: 'galaxy-a-series',
      name: 'Galaxy A Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg',
      description: 'A55, A54, A35, A34, A25, A15, A14...',
      pattern: /\ba\d+/i,
      defaultModels: [
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
      ],
    },
    {
      id: 'galaxy-m-f',
      slug: 'galaxy-m-series',
      name: 'Galaxy M & F Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m55.jpg',
      description: 'M55, M54, M34, M33, F55, F54, F34...',
      pattern: /\b(m|f)\d+/i,
      defaultModels: [
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
      ],
    },
    {
      id: 'galaxy-j',
      slug: 'galaxy-j-series',
      name: 'Galaxy J Series (Classic)',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-prime.jpg',
      description: 'J8, J7 Prime, J7 Pro, J7 Max, J6, J4...',
      pattern: /\bj\d+/i,
      defaultModels: [
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
      ],
    },
  ],

  oneplus: [
    {
      id: 'oneplus-13-12',
      slug: 'oneplus-13-12-series',
      name: 'OnePlus 13 & 12 Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
      description: 'OnePlus 13, 13R, 12, 12R',
      pattern: /\b(13|13r|12|12r)\b/i,
      defaultModels: [
        { brand: 'OnePlus', series: 'OnePlus 13 & 12 Series', model: 'OnePlus 13', storage: '256 GB', price: 58000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-13.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 13 & 12 Series', model: 'OnePlus 13R', storage: '128 GB', price: 38000, image: 'https://api.mobileapi.dev/devices/366/thumb.png' },
        { brand: 'OnePlus', series: 'OnePlus 13 & 12 Series', model: 'OnePlus 12', storage: '256 GB', price: 42000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 13 & 12 Series', model: 'OnePlus 12R', storage: '128 GB', price: 28000, image: 'https://api.mobileapi.dev/devices/364/thumb.png' },
      ],
    },
    {
      id: 'oneplus-11',
      slug: 'oneplus-11-series',
      name: 'OnePlus 11 Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg',
      description: 'OnePlus 11 5G, 11R',
      pattern: /\b(11|11r)\b/i,
      defaultModels: [
        { brand: 'OnePlus', series: 'OnePlus 11 Series', model: 'OnePlus 11', storage: '128 GB', price: 32000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 11 Series', model: 'OnePlus 11R', storage: '128 GB', price: 24000, image: 'https://api.mobileapi.dev/devices/362/thumb.png' },
      ],
    },
    {
      id: 'oneplus-10',
      slug: 'oneplus-10-series',
      name: 'OnePlus 10 Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg',
      description: 'OnePlus 10 Pro, 10T, 10R',
      pattern: /\b(10\s*pro|10t|10r)\b/i,
      defaultModels: [
        { brand: 'OnePlus', series: 'OnePlus 10 Series', model: 'OnePlus 10 Pro', storage: '128 GB', price: 26000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 10 Series', model: 'OnePlus 10T', storage: '128 GB', price: 22000, image: 'https://api.mobileapi.dev/devices/16342/thumb.png' },
        { brand: 'OnePlus', series: 'OnePlus 10 Series', model: 'OnePlus 10R 150W', storage: '128 GB', price: 19000, image: 'https://api.mobileapi.dev/devices/370/thumb.png' },
        { brand: 'OnePlus', series: 'OnePlus 10 Series', model: 'OnePlus 10R', storage: '128 GB', price: 18000, image: 'https://api.mobileapi.dev/devices/16344/thumb.png' },
      ],
    },
    {
      id: 'oneplus-9',
      slug: 'oneplus-9-series',
      name: 'OnePlus 9 Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro-.jpg',
      description: 'OnePlus 9 Pro, 9RT, 9, 9R',
      pattern: /\b(9\s*pro|9rt|9r|9)\b/i,
      defaultModels: [
        { brand: 'OnePlus', series: 'OnePlus 9 Series', model: 'OnePlus 9 Pro', storage: '128 GB', price: 20000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro-.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 9 Series', model: 'OnePlus 9RT', storage: '128 GB', price: 17500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9rt-5g.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 9 Series', model: 'OnePlus 9', storage: '128 GB', price: 16000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 9 Series', model: 'OnePlus 9R', storage: '128 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9r.jpg' },
      ],
    },
    {
      id: 'oneplus-8-7',
      slug: 'oneplus-8-7-series',
      name: 'OnePlus 8 & 7 Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8-pro.jpg',
      description: 'OnePlus 8 Pro, 8T, 8, 7T Pro, 7T, 7 Pro, 7',
      pattern: /\b(8\s*pro|8t|8|7t\s*pro|7t|7\s*pro|7)\b/i,
      defaultModels: [
        { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 8 Pro', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8-pro.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 8T', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8t.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 8', storage: '128 GB', price: 12000, image: 'https://api.mobileapi.dev/devices/16348/thumb.png' },
        { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 7T Pro', storage: '256 GB', price: 11500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t-pro.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 7T', storage: '128 GB', price: 10000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 7 Pro', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7-pro.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 7', storage: '128 GB', price: 8000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7.jpg' },
      ],
    },
    {
      id: 'oneplus-nord',
      slug: 'oneplus-nord-series',
      name: 'OnePlus Nord Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-4.jpg',
      description: 'OnePlus Nord 4, 3, 2T, CE4, CE3, CE 2',
      pattern: /\bnord\b/i,
      defaultModels: [
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
      ],
    },
    {
      id: 'oneplus-open',
      slug: 'oneplus-open-series',
      name: 'OnePlus Open & Foldable Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-open.jpg',
      description: 'OnePlus Open Flagship Foldable',
      pattern: /\bopen\b/i,
      defaultModels: [
        { brand: 'OnePlus', series: 'OnePlus Open & Foldable Series', model: 'OnePlus Open', storage: '512 GB', price: 78000, image: 'https://api.mobileapi.dev/devices/391/thumb.png' },
      ],
    },
    {
      id: 'oneplus-classic',
      slug: 'oneplus-classic-series',
      name: 'OnePlus 6 & Classic Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6t.jpg',
      description: 'OnePlus 6T, 6, 5T, 5',
      pattern: /\b(6t|6|5t|5|3t|3|one|x)\b/i,
      defaultModels: [
        { brand: 'OnePlus', series: 'OnePlus 6 & Classic Series', model: 'OnePlus 6T', storage: '128 GB', price: 6500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6t.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 6 & Classic Series', model: 'OnePlus 6', storage: '64 GB', price: 5500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 6 & Classic Series', model: 'OnePlus 5T', storage: '64 GB', price: 4500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-5t.jpg' },
        { brand: 'OnePlus', series: 'OnePlus 6 & Classic Series', model: 'OnePlus 5', storage: '64 GB', price: 4000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-5.jpg' },
      ],
    },
  ],

  xiaomi: [
    {
      id: 'xiaomi-mi-flagship',
      slug: 'xiaomi-mi-flagship-series',
      name: 'Xiaomi Mi / Flagship Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg',
      description: 'Xiaomi 14 Ultra, 14, 14 Civi, 13 Pro, 13, 12 Pro, 11X',
      pattern: /\b(xiaomi\s*(14|13|12|11|10)|mi\s*(11|10|9|8|mix|civi)|14\s*civi|civi)\b/i,
      defaultModels: [
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 14 Ultra', storage: '512 GB', price: 62000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg' },
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 14', storage: '256 GB', price: 42000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14.jpg' },
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 14 Civi', storage: '128 GB', price: 27000, image: getApiThumb('Xiaomi', '14 Civi', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-civi.jpg') },
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 13 Pro', storage: '256 GB', price: 38000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13-pro.jpg' },
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 13', storage: '256 GB', price: 30000, image: getApiThumb('Xiaomi', '13 5G', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13.jpg') },
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 13 Lite', storage: '128 GB', price: 19000, image: getApiThumb('Xiaomi', '13 Lite', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13-lite.jpg') },
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 12 Pro', storage: '256 GB', price: 26000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-12-pro.jpg' },
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 12 Lite', storage: '128 GB', price: 15000, image: getApiThumb('Xiaomi', '12 Lite', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-12-lite.jpg') },
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi 11T Pro', storage: '128 GB', price: 17000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-11t-pro.jpg' },
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi Mi 11X Pro', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-mi-11x-pro.jpg' },
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi Mi 11X', storage: '128 GB', price: 12000, image: getApiThumb('Xiaomi', 'Mi 11X', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-mi-11x.jpg') },
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi Mi 10T Pro', storage: '128 GB', price: 11500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-mi-10t-pro-5g.jpg' },
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi Mi 10', storage: '128 GB', price: 12500, image: getApiThumb('Xiaomi', 'Mi 10', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-mi-10-5g.jpg') },
        { brand: 'Xiaomi', series: 'Xiaomi Mi / Flagship Series', model: 'Xiaomi Mi 10i', storage: '128 GB', price: 9000, image: getApiThumb('Xiaomi', 'Mi 10i', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-mi-10i-5g.jpg') },
      ],
    },
    {
      id: 'redmi-note-13',
      slug: 'redmi-note-13-series',
      name: 'Redmi Note 13 Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg',
      description: 'Redmi Note 13 Pro+, 13 Pro, 13 5G, 13 4G',
      pattern: /redmi\s*note\s*(14|13)/i,
      defaultModels: [
        { brand: 'Xiaomi', series: 'Redmi Note 13 Series', model: 'Redmi Note 13 Pro+ 5G', storage: '256 GB', price: 20500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 13 Series', model: 'Redmi Note 13 Pro 5G', storage: '128 GB', price: 16500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-5g.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 13 Series', model: 'Redmi Note 13 5G', storage: '128 GB', price: 12500, image: 'https://api.mobileapi.dev/devices/31521/thumb.png' },
        { brand: 'Xiaomi', series: 'Redmi Note 13 Series', model: 'Redmi Note 13 4G', storage: '128 GB', price: 10500, image: 'https://api.mobileapi.dev/devices/13590/thumb.png' },
        { brand: 'Xiaomi', series: 'Redmi Note 13 Series', model: 'Redmi Note 13R Pro', storage: '256 GB', price: 14000, image: getApiThumb('Xiaomi', 'Note 13R', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13r-pro.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Note 13 Series', model: 'Redmi Note 13R', storage: '128 GB', price: 11000, image: getApiThumb('Xiaomi', 'Note 13R', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13r.jpg') },
      ],
    },
    {
      id: 'redmi-note-12',
      slug: 'redmi-note-12-series',
      name: 'Redmi Note 12 Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro-plus.jpg',
      description: 'Redmi Note 12 Pro+, 12 Pro, 12 5G, 12 4G, 12 Turbo, 12S',
      pattern: /redmi\s*note\s*12/i,
      defaultModels: [
        { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12 Pro+ 5G', storage: '256 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro-plus.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12 Pro 5G', storage: '128 GB', price: 12500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12 5G', storage: '128 GB', price: 10000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12 4G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-4g.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12 Turbo', storage: '256 GB', price: 13500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-turbo.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12S', storage: '128 GB', price: 9000, image: getApiThumb('Xiaomi', 'Note 12S', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12s.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12R', storage: '128 GB', price: 8000, image: getApiThumb('Xiaomi', 'Note 12R', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12r.jpg') },
      ],
    },
    {
      id: 'redmi-note-11',
      slug: 'redmi-note-11-series',
      name: 'Redmi Note 11 & Older Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-plus-5g.jpg',
      description: 'Redmi Note 11 Pro+, 11 Pro, 11S, 11T 5G, 11, Note 10, Note 9, Note 8',
      pattern: /redmi\s*note\s*(11|10|9|8|7|6|5)/i,
      defaultModels: [
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 11 Pro+ 5G', storage: '128 GB', price: 10500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-plus-5g.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 11 Pro 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-global.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 11 Pro', storage: '128 GB', price: 9000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-global.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 11S 5G', storage: '128 GB', price: 8500, image: getApiThumb('Xiaomi', 'Note 11S', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11s-5g.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 11S', storage: '128 GB', price: 8000, image: getApiThumb('Xiaomi', 'Note 11S', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11s.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 11T 5G', storage: '128 GB', price: 8200, image: getApiThumb('Xiaomi', 'Note 11T', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11t-5g.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 11', storage: '64 GB', price: 7000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 11E Pro', storage: '128 GB', price: 8000, image: getApiThumb('Xiaomi', 'Note 11E', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11e-pro.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 11R', storage: '128 GB', price: 7500, image: getApiThumb('Xiaomi', 'Note 11R', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11r.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 10 Pro Max', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note10-pro-max.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 10 Pro', storage: '128 GB', price: 7500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note10-pro.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 10S', storage: '64 GB', price: 6500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-10s.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 10', storage: '64 GB', price: 6000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-10.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 9 Pro Max', storage: '64 GB', price: 5500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-9-pro-max.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 9 Pro', storage: '64 GB', price: 5000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-9-pro.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 9', storage: '64 GB', price: 4500, image: getApiThumb('Xiaomi', 'Note 9', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-9.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 8 Pro', storage: '64 GB', price: 4200, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-8-pro.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Note 11 & Older Series', model: 'Redmi Note 8', storage: '64 GB', price: 3800, image: getApiThumb('Xiaomi', 'Note 8', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-8.jpg') },
      ],
    },
    {
      id: 'redmi-number-c',
      slug: 'redmi-number-c-series',
      name: 'Redmi Number & C/A Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-12-5g.jpg',
      description: 'Redmi 13C, 12 5G, 11 Prime, 10, 9, A3, A2',
      pattern: /redmi\s*(\d+|[ca]\d+)/i,
      defaultModels: [
        { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 13C 5G', storage: '128 GB', price: 8000, image: getApiThumb('Xiaomi', '13C 5G', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-13c-5g.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 13C', storage: '128 GB', price: 6500, image: getApiThumb('Xiaomi', '13C', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-13c.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 12 5G', storage: '128 GB', price: 7800, image: getApiThumb('Xiaomi', '12 5G', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-12-5g.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 12', storage: '128 GB', price: 6200, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-12.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 11 Prime 5G', storage: '64 GB', price: 5800, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-11-prime-5g.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 10', storage: '64 GB', price: 5000, image: getApiThumb('Xiaomi', '10 2022', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-10.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 10A', storage: '64 GB', price: 4200, image: getApiThumb('Xiaomi', '10A', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-10a.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi 9', storage: '64 GB', price: 3800, image: getApiThumb('Xiaomi', '9 India', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-9.jpg') },
        { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi A3', storage: '64 GB', price: 4500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-a3.jpg' },
        { brand: 'Xiaomi', series: 'Redmi Number & C/A Series', model: 'Redmi A2', storage: '32 GB', price: 3500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-a2.jpg' },
      ],
    },
    {
      id: 'poco-x-f',
      slug: 'poco-x-f-series',
      name: 'POCO X & F Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg',
      description: 'POCO F6, F5, F4 GT, X6 Pro 5G, X6, X5 Pro',
      pattern: /poco\s*[xf]/i,
      defaultModels: [
        { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO F6', storage: '256 GB', price: 21000, image: getApiThumb('Xiaomi', 'F6 Pro', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f6.jpg') },
        { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO F5', storage: '256 GB', price: 16500, image: getApiThumb('Xiaomi', 'F5', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f5.jpg') },
        { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO F4 GT', storage: '128 GB', price: 15000, image: getApiThumb('Xiaomi', 'F4 GT', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f4-gt.jpg') },
        { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO F4 5G', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f4.jpg' },
        { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO F3 GT', storage: '128 GB', price: 11500, image: getApiThumb('Xiaomi', 'F3 GT', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f3-gt.jpg') },
        { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X6 Pro 5G', storage: '256 GB', price: 17500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg' },
        { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X6 5G', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6.jpg' },
        { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X6 Neo', storage: '128 GB', price: 11500, image: getApiThumb('Xiaomi', 'X6 Neo', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-neo.jpg') },
        { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X5 Pro 5G', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x5-pro.jpg' },
        { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X5 5G', storage: '128 GB', price: 9500, image: getApiThumb('Xiaomi', 'X5 5G', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x5.jpg') },
        { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X4 Pro 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x4-pro-5g.jpg' },
        { brand: 'Xiaomi', series: 'POCO X & F Series', model: 'POCO X3 Pro', storage: '128 GB', price: 8000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x3-pro.jpg' },
      ],
    },
    {
      id: 'poco-m-c',
      slug: 'poco-m-c-series',
      name: 'POCO M & C Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-pro-5g.jpg',
      description: 'POCO M6 Pro 5G, M6, M5, C65, C55',
      pattern: /poco\s*[mc]/i,
      defaultModels: [
        { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO M6 Pro 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-pro-5g.jpg' },
        { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO M6 5G', storage: '128 GB', price: 7200, image: getApiThumb('Xiaomi', 'M6 5G', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m6-5g.jpg') },
        { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO M5', storage: '64 GB', price: 5800, image: getApiThumb('Xiaomi', 'M5s', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m5.jpg') },
        { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO M4 Pro 5G', storage: '128 GB', price: 6800, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m4-pro-5g.jpg' },
        { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO C65', storage: '128 GB', price: 6200, image: getApiThumb('Xiaomi', 'C65 India', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-c65.jpg') },
        { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO C55', storage: '64 GB', price: 4800, image: getApiThumb('Xiaomi', 'C55', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-c55.jpg') },
        { brand: 'Xiaomi', series: 'POCO M & C Series', model: 'POCO C51', storage: '64 GB', price: 4000, image: getApiThumb('Xiaomi', 'C51', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-c51.jpg') },
      ],
    },
  ],

  realme: [
    {
      id: 'realme-gt',
      slug: 'realme-gt-series',
      name: 'Realme GT Series',
      brand: 'Realme',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-6.jpg',
      description: 'Realme GT 6, GT 6T, GT 2 Pro, GT Neo 3, GT Neo 2',
      pattern: /\bgt\b/i,
      defaultModels: [
        { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT 6', storage: '256 GB', price: 28000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-6.jpg' },
        { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT 6T', storage: '128 GB', price: 21000, image: 'https://api.mobileapi.dev/devices/13718/thumb.png' },
        { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT 2 Pro', storage: '128 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt2-pro.jpg' },
        { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT Neo 3', storage: '128 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-neo3.jpg' },
        { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT Neo 2', storage: '128 GB', price: 13000, image: 'https://api.mobileapi.dev/devices/13676/thumb.png' },
        { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT 5G', storage: '128 GB', price: 12000, image: 'https://api.mobileapi.dev/devices/13816/thumb.png' },
        { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT Master Edition', storage: '128 GB', price: 10500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-master.jpg' },
      ],
    },
    {
      id: 'realme-number-pro',
      slug: 'realme-number-pro-series',
      name: 'Realme Number Pro Series',
      brand: 'Realme',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg',
      description: 'Realme 13 Pro+, 12 Pro+, 11 Pro+, 10 Pro+, 9 Pro+',
      pattern: /\b(13|12|11|10|9|8|7|6)\s*pro/i,
      defaultModels: [
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
      ],
    },
    {
      id: 'realme-number',
      slug: 'realme-number-series',
      name: 'Realme Number & Plus Series',
      brand: 'Realme',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-plus-5g.jpg',
      description: 'Realme 13+ 5G, 13 5G, 12+ 5G, 12 5G, 11 5G, 10',
      pattern: /\b(13\+|13|12\+|12|11x|11|10t|10|9i|9|8s|8)\b/i,
      defaultModels: [
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
      ],
    },
    {
      id: 'realme-narzo-p',
      slug: 'realme-narzo-p-series',
      name: 'Realme Narzo & P Series',
      brand: 'Realme',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-pro.jpg',
      description: 'Realme Narzo 70 Pro, 60, 50, P1 Pro 5G, P1 5G',
      pattern: /\b(narzo|p1|p2|p3|p4)\b/i,
      defaultModels: [
        { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme P1 Pro 5G', storage: '128 GB', price: 14500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-p1-pro.jpg' },
        { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme P1 5G', storage: '128 GB', price: 11500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-p1.jpg' },
        { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme Narzo 70 Pro 5G', storage: '128 GB', price: 13500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70-pro.jpg' },
        { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme Narzo 70x 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-70x.jpg' },
        { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme Narzo 60 Pro 5G', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-60-pro.jpg' },
        { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme Narzo 60 5G', storage: '128 GB', price: 9800, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-60.jpg' },
        { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme Narzo 50 Pro 5G', storage: '128 GB', price: 8000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-50-pro-5g.jpg' },
        { brand: 'Realme', series: 'Realme Narzo & P Series', model: 'Realme Narzo 50', storage: '64 GB', price: 6000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-50.jpg' },
      ],
    },
    {
      id: 'realme-c',
      slug: 'realme-c-series',
      name: 'Realme C Series',
      brand: 'Realme',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c55.jpg',
      description: 'Realme C67 5G, C65 5G, C63, C55, C53, C35',
      pattern: /\bc\d+/i,
      defaultModels: [
        { brand: 'Realme', series: 'Realme C Series', model: 'Realme C67 5G', storage: '128 GB', price: 8500, image: 'https://api.mobileapi.dev/devices/13733/thumb.png' },
        { brand: 'Realme', series: 'Realme C Series', model: 'Realme C65 5G', storage: '128 GB', price: 7500, image: 'https://api.mobileapi.dev/devices/13720/thumb.png' },
        { brand: 'Realme', series: 'Realme C Series', model: 'Realme C63 5G', storage: '128 GB', price: 6800, image: 'https://api.mobileapi.dev/devices/13705/thumb.png' },
        { brand: 'Realme', series: 'Realme C Series', model: 'Realme C55', storage: '64 GB', price: 5800, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c55.jpg' },
        { brand: 'Realme', series: 'Realme C Series', model: 'Realme C53', storage: '64 GB', price: 5200, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c53.jpg' },
        { brand: 'Realme', series: 'Realme C Series', model: 'Realme C35', storage: '64 GB', price: 4500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c35.jpg' },
        { brand: 'Realme', series: 'Realme C Series', model: 'Realme C33', storage: '32 GB', price: 3800, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c33.jpg' },
      ],
    },
  ],

  oppo: [
    {
      id: 'oppo-find',
      slug: 'oppo-find-series',
      name: 'Oppo Find Series',
      brand: 'Oppo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-n3-flip.jpg',
      description: 'Find N3 Flip, Find N2 Flip, Find X7 Ultra, Find X5 Pro',
      pattern: /\bfind\b/i,
      defaultModels: [
        { brand: 'Oppo', series: 'Oppo Find Series', model: 'Oppo Find N3 Flip', storage: '256 GB', price: 54000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-n3-flip.jpg' },
        { brand: 'Oppo', series: 'Oppo Find Series', model: 'Oppo Find N2 Flip', storage: '256 GB', price: 38000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-n2-flip.jpg' },
        { brand: 'Oppo', series: 'Oppo Find Series', model: 'Oppo Find X7 Ultra', storage: '256 GB', price: 58000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x7-ultra.jpg' },
        { brand: 'Oppo', series: 'Oppo Find Series', model: 'Oppo Find X5 Pro', storage: '256 GB', price: 28000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x5-pro.jpg' },
      ],
    },
    {
      id: 'oppo-reno',
      slug: 'oppo-reno-series',
      name: 'Oppo Reno Series',
      brand: 'Oppo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-reno12-pro.jpg',
      description: 'Reno 12 Pro, 12, 11 Pro, 11, 10 Pro+, 10 Pro, 8 Pro',
      pattern: /\breno\b/i,
      defaultModels: [
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
      ],
    },
    {
      id: 'oppo-f',
      slug: 'oppo-f-series',
      name: 'Oppo F Series',
      brand: 'Oppo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f27-pro-plus.jpg',
      description: 'Oppo F27 Pro+, F25 Pro, F23 5G, F21s Pro, F19 Pro+',
      pattern: /\bf\d+/i,
      defaultModels: [
        { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F27 Pro+ 5G', storage: '128 GB', price: 20000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f27-pro-plus.jpg' },
        { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F25 Pro 5G', storage: '128 GB', price: 16000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f25-pro.jpg' },
        { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F23 5G', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f23.jpg' },
        { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F21s Pro 5G', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f21s-pro-5g.jpg' },
        { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F21 Pro 5G', storage: '128 GB', price: 10000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f21-pro-5g.jpg' },
        { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F19 Pro+ 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f19-pro-plus-5g.jpg' },
        { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F19s', storage: '128 GB', price: 7500, image: 'https://api.mobileapi.dev/devices/1593/thumb.png' },
        { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F17 Pro', storage: '128 GB', price: 6800, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f17-pro.jpg' },
      ],
    },
    {
      id: 'oppo-a-k',
      slug: 'oppo-a-k-series',
      name: 'Oppo A & K Series',
      brand: 'Oppo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a79.jpg',
      description: 'Oppo A79 5G, A78 5G, A59, A38, K12x 5G, K10',
      pattern: /\b[ak]\d+/i,
      defaultModels: [
        { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A79 5G', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a79.jpg' },
        { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A78 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a78-5g.jpg' },
        { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A59 5G', storage: '128 GB', price: 8800, image: 'https://api.mobileapi.dev/devices/14324/thumb.png' },
        { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A58 5G', storage: '128 GB', price: 8000, image: 'https://api.mobileapi.dev/devices/428/thumb.png' },
        { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A38', storage: '128 GB', price: 6500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a38.jpg' },
        { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A18', storage: '64 GB', price: 5200, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a18.jpg' },
        { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A17k', storage: '64 GB', price: 4500, image: 'https://api.mobileapi.dev/devices/1526/thumb.png' },
        { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo K12x 5G', storage: '128 GB', price: 9500, image: 'https://api.mobileapi.dev/devices/1497/thumb.png' },
        { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo K10 5G', storage: '128 GB', price: 7500, image: 'https://api.mobileapi.dev/devices/1553/thumb.png' },
      ],
    },
  ],

  vivo: [
    {
      id: 'vivo-x-series',
      slug: 'vivo-x-series',
      name: 'Vivo X Series (Zeiss Flagship)',
      brand: 'Vivo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg',
      description: 'Vivo X100 Pro, X100, X90 Pro, X90, X80 Pro, X70 Pro+',
      pattern: /\bx\d+/i,
      defaultModels: [
        { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X100 Pro', storage: '512 GB', price: 52000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg' },
        { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X100', storage: '256 GB', price: 42000, image: 'https://api.mobileapi.dev/devices/355/thumb.png' },
        { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X90 Pro', storage: '256 GB', price: 32000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x90-pro.jpg' },
        { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X90', storage: '256 GB', price: 27000, image: 'https://api.mobileapi.dev/devices/4965/thumb.png' },
        { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X80 Pro', storage: '256 GB', price: 24000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x80-pro.jpg' },
        { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X80', storage: '128 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x80.jpg' },
        { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X70 Pro+', storage: '256 GB', price: 17000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x70-pro-plus.jpg' },
        { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X70 Pro', storage: '128 GB', price: 14000, image: 'https://api.mobileapi.dev/devices/13983/thumb.png' },
      ],
    },
    {
      id: 'vivo-v-series',
      slug: 'vivo-v-series',
      name: 'Vivo V Series',
      brand: 'Vivo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40-pro.jpg',
      description: 'Vivo V40 Pro, V40, V40e, V30 Pro, V30, V29 Pro, V27 Pro',
      pattern: /\bv\d+/i,
      defaultModels: [
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
      ],
    },
    {
      id: 'vivo-t-series',
      slug: 'vivo-t-series',
      name: 'Vivo T Series (Turbo Speed)',
      brand: 'Vivo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-ultra.jpg',
      description: 'Vivo T3 Ultra, T3 Pro 5G, T3 5G, T3x, T2 Pro 5G, T2x',
      pattern: /\bt\d+/i,
      defaultModels: [
        { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T3 Ultra', storage: '128 GB', price: 23000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-ultra.jpg' },
        { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T3 Pro 5G', storage: '128 GB', price: 18000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-pro.jpg' },
        { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T3 5G', storage: '128 GB', price: 13500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3.jpg' },
        { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T3x 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3x.jpg' },
        { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T2 Pro 5G', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t2-pro.jpg' },
        { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T2 5G', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t2.jpg' },
        { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T2x 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t2x.jpg' },
        { brand: 'Vivo', series: 'Vivo T Series (Turbo Speed)', model: 'Vivo T1 Pro 5G', storage: '128 GB', price: 9000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t1-pro.jpg' },
      ],
    },
    {
      id: 'vivo-y-series',
      slug: 'vivo-y-series',
      name: 'Vivo Y Series',
      brand: 'Vivo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y200-pro.jpg',
      description: 'Vivo Y200 Pro, Y200, Y58, Y28, Y100, Y56, Y36',
      pattern: /\by\d+/i,
      defaultModels: [
        { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y200 Pro 5G', storage: '128 GB', price: 16500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y200-pro.jpg' },
        { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y200 5G', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y200.jpg' },
        { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y58 5G', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y58.jpg' },
        { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y28 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y28.jpg' },
        { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y100 5G', storage: '128 GB', price: 11500, image: 'https://api.mobileapi.dev/devices/4997/thumb.png' },
        { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y56 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y56.jpg' },
        { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y36', storage: '128 GB', price: 7500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y36.jpg' },
        { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y16', storage: '64 GB', price: 5200, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y16.jpg' },
      ],
    },
    {
      id: 'iqoo-series',
      slug: 'iqoo-series',
      name: 'iQOO Flagship & Neo Series',
      brand: 'Vivo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo12.jpg',
      description: 'iQOO 12, 11, Neo 9 Pro, Neo 7 Pro, Z9, Z7 Pro',
      pattern: /\biqoo\b/i,
      defaultModels: [
        { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO 12 5G', storage: '256 GB', price: 38000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo12.jpg' },
        { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO 11 5G', storage: '256 GB', price: 28000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-11.jpg' },
        { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO Neo 9 Pro', storage: '128 GB', price: 26000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo9-pro.jpg' },
        { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO Neo 7 Pro', storage: '128 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-7-pro.jpg' },
        { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO Neo 6', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo-6.jpg' },
        { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO Z9 Turbo', storage: '256 GB', price: 17500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9-turbo.jpg' },
        { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO Z9 5G', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z9.jpg' },
        { brand: 'Vivo', series: 'iQOO Flagship & Neo Series', model: 'iQOO Z7 Pro 5G', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z7-pro.jpg' },
      ],
    },
  ],

  google: [
    {
      id: 'pixel-9',
      slug: 'google-pixel-9-series',
      name: 'Google Pixel 9 Series',
      brand: 'Google',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-xl.jpg',
      description: 'Pixel 9 Pro XL, 9 Pro, 9, 9 Pro Fold',
      pattern: /pixel\s*9/i,
      defaultModels: [
        { brand: 'Google', series: 'Google Pixel 9 Series', model: 'Google Pixel 9 Pro XL', storage: '128 GB', price: 72000, image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-xl.jpg' },
        { brand: 'Google', series: 'Google Pixel 9 Series', model: 'Google Pixel 9 Pro', storage: '128 GB', price: 64000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
        { brand: 'Google', series: 'Google Pixel 9 Series', model: 'Google Pixel 9', storage: '128 GB', price: 52000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
        { brand: 'Google', series: 'Google Pixel 9 Series', model: 'Google Pixel 9 Pro Fold', storage: '256 GB', price: 98000, image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-fold.jpg' },
      ],
    },
    {
      id: 'pixel-8',
      slug: 'google-pixel-8-series',
      name: 'Google Pixel 8 Series',
      brand: 'Google',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',
      description: 'Pixel 8 Pro, Pixel 8, Pixel 8a',
      pattern: /pixel\s*8/i,
      defaultModels: [
        { brand: 'Google', series: 'Google Pixel 8 Series', model: 'Google Pixel 8 Pro', storage: '128 GB', price: 46000, image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg' },
        { brand: 'Google', series: 'Google Pixel 8 Series', model: 'Google Pixel 8', storage: '128 GB', price: 36000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
        { brand: 'Google', series: 'Google Pixel 8 Series', model: 'Google Pixel 8a', storage: '128 GB', price: 29000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
      ],
    },
    {
      id: 'pixel-7',
      slug: 'google-pixel-7-series',
      name: 'Google Pixel 7 Series',
      brand: 'Google',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-pro.jpg',
      description: 'Pixel 7 Pro, Pixel 7, Pixel 7a',
      pattern: /pixel\s*7/i,
      defaultModels: [
        { brand: 'Google', series: 'Google Pixel 7 Series', model: 'Google Pixel 7 Pro', storage: '128 GB', price: 28000, image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-pro.jpg' },
        { brand: 'Google', series: 'Google Pixel 7 Series', model: 'Google Pixel 7', storage: '128 GB', price: 22000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
        { brand: 'Google', series: 'Google Pixel 7 Series', model: 'Google Pixel 7a', storage: '128 GB', price: 19000, image: 'https://api.mobileapi.dev/devices/777/thumb.png' },
      ],
    },
    {
      id: 'pixel-older',
      slug: 'pixel-6-older-generation-series',
      name: 'Pixel 6 & Older Generation Series',
      brand: 'Google',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6-pro.jpg',
      description: 'Pixel 6 Pro, 6, 6a, Pixel Fold, Pixel 5, 4a, 3a',
      pattern: /pixel\s*(6|5|4|3|2|1|xl|fold)/i,
      defaultModels: [
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
      ],
    },
  ],

  motorola: [
    {
      id: 'moto-razr',
      slug: 'moto-razr-series',
      name: 'Moto Razr Series',
      brand: 'Motorola',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-50-ultra.jpg',
      description: 'Motorola Razr 50 Ultra, Razr 50, Razr 40 Ultra, Razr 40',
      pattern: /\brazr\b/i,
      defaultModels: [
        { brand: 'Motorola', series: 'Moto Razr Series', model: 'Motorola Razr 50 Ultra', storage: '512 GB', price: 58000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-50-ultra.jpg' },
        { brand: 'Motorola', series: 'Moto Razr Series', model: 'Motorola Razr 50', storage: '256 GB', price: 42000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-50.jpg' },
        { brand: 'Motorola', series: 'Moto Razr Series', model: 'Motorola Razr 40 Ultra', storage: '256 GB', price: 34000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-40-ultra.jpg' },
        { brand: 'Motorola', series: 'Moto Razr Series', model: 'Motorola Razr 40', storage: '256 GB', price: 25000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-40.jpg' },
      ],
    },
    {
      id: 'moto-edge',
      slug: 'moto-edge-series',
      name: 'Moto Edge Series',
      brand: 'Motorola',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
      description: 'Edge 50 Ultra, Edge 50 Pro, Edge 50 Fusion, Edge 40 Neo',
      pattern: /\bedge\b/i,
      defaultModels: [
        { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 50 Ultra', storage: '512 GB', price: 38000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-ultra.jpg' },
        { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 50 Pro', storage: '256 GB', price: 24000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg' },
        { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 50 Fusion', storage: '128 GB', price: 17500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-fusion.jpg' },
        { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 40 Pro', storage: '256 GB', price: 25000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40-pro.jpg' },
        { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 40', storage: '256 GB', price: 16500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40.jpg' },
        { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 40 Neo', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40-neo.jpg' },
        { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 30 Ultra', storage: '128 GB', price: 18000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-30-ultra.jpg' },
        { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 30 Fusion', storage: '128 GB', price: 14500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-30-fusion.jpg' },
        { brand: 'Motorola', series: 'Moto Edge Series', model: 'Motorola Edge 30', storage: '128 GB', price: 11500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-30.jpg' },
      ],
    },
    {
      id: 'moto-g-e',
      slug: 'moto-g-series',
      name: 'Moto G & E Series',
      brand: 'Motorola',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g85.jpg',
      description: 'Moto G85 5G, G64 5G, G54, G34, G24, G14, E13',
      pattern: /\b(moto\s*[ge]|[ge]\d+)\b/i,
      defaultModels: [
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
      ],
    },
  ],

  nothing: [
    {
      id: 'nothing-phone',
      slug: 'nothing-phone-series',
      name: 'Nothing Phone Series',
      brand: 'Nothing',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg',
      description: 'Nothing Phone (2), Phone (1), Phone (2a) Plus, Phone (2a)',
      pattern: /phone\s*\(/i,
      defaultModels: [
        { brand: 'Nothing', series: 'Nothing Phone Series', model: 'Nothing Phone (2)', storage: '256 GB', price: 27000, image: 'https://api.mobileapi.dev/devices/359/thumb.png' },
        { brand: 'Nothing', series: 'Nothing Phone Series', model: 'Nothing Phone (1)', storage: '128 GB', price: 16500, image: 'https://api.mobileapi.dev/devices/1258/thumb.png' },
        { brand: 'Nothing', series: 'Nothing Phone Series', model: 'Nothing Phone (2a) Plus', storage: '256 GB', price: 21000, image: 'https://api.mobileapi.dev/devices/1256/thumb.png' },
        { brand: 'Nothing', series: 'Nothing Phone Series', model: 'Nothing Phone (2a)', storage: '128 GB', price: 17500, image: 'https://api.mobileapi.dev/devices/1256/thumb.png' },
      ],
    },
    {
      id: 'cmf-nothing',
      slug: 'cmf-by-nothing-series',
      name: 'CMF by Nothing Series',
      brand: 'Nothing',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/cmf-phone-1.jpg',
      description: 'CMF Phone 1 by Nothing',
      pattern: /cmf/i,
      defaultModels: [
        { brand: 'Nothing', series: 'CMF by Nothing Series', model: 'CMF Phone 1 by Nothing', storage: '128 GB', price: 12000, image: 'https://api.mobileapi.dev/devices/1249/thumb.png' },
      ],
    },
  ],

  lava: [
    {
      id: 'lava-agni',
      slug: 'lava-agni-series',
      name: 'Agni Flagship Series',
      brand: 'Lava',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/lava-agni2-5g.jpg',
      description: 'Lava Agni 3 5G, Agni 2 5G',
      pattern: /\bagni\b/i,
      defaultModels: [
        { brand: 'Lava', series: 'Agni Flagship Series', model: 'Lava Agni 3 5G', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/lava-agni2-5g.jpg' },
        { brand: 'Lava', series: 'Agni Flagship Series', model: 'Lava Agni 2 5G', storage: '128 GB', price: 11500, image: 'https://fdn2.gsmarena.com/vv/bigpic/lava-agni2-5g.jpg' },
      ],
    },
    {
      id: 'lava-blaze',
      slug: 'lava-blaze-series',
      name: 'Blaze Series',
      brand: 'Lava',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/lava-blaze-curve-5g.jpg',
      description: 'Lava Blaze Curve 5G, Blaze 2 5G, Blaze 5G',
      pattern: /\bblaze\b/i,
      defaultModels: [
        { brand: 'Lava', series: 'Blaze Series', model: 'Lava Blaze Curve 5G', storage: '128 GB', price: 10200, image: 'https://fdn2.gsmarena.com/vv/bigpic/lava-blaze-curve-5g.jpg' },
        { brand: 'Lava', series: 'Blaze Series', model: 'Lava Blaze 2 5G', storage: '64 GB', price: 6800, image: 'https://fdn2.gsmarena.com/vv/bigpic/lava-blaze2-5g.jpg' },
      ],
    },
    {
      id: 'lava-yuva',
      slug: 'lava-yuva-series',
      name: 'Yuva Series',
      brand: 'Lava',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/lava-yuva-3-pro.jpg',
      description: 'Lava Yuva 3 Pro, Yuva 3, Yuva 2 Pro',
      pattern: /\byuva\b/i,
      defaultModels: [
        { brand: 'Lava', series: 'Yuva Series', model: 'Lava Yuva 3 Pro', storage: '128 GB', price: 5200, image: 'https://fdn2.gsmarena.com/vv/bigpic/lava-yuva-3-pro.jpg' },
      ],
    },
  ],

  tecno: [
    {
      id: 'tecno-camon',
      slug: 'tecno-camon-series',
      name: 'Camon Imaging Series',
      brand: 'Tecno',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-pro.jpg',
      description: 'Camon 30 Premier, Camon 30 Pro, Camon 30, Camon 20 Pro',
      pattern: /\bcamon\b/i,
      defaultModels: [
        { brand: 'Tecno', series: 'Camon Imaging Series', model: 'Tecno Camon 30 Premier 5G', storage: '512 GB', price: 27000, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-pro.jpg' },
        { brand: 'Tecno', series: 'Camon Imaging Series', model: 'Tecno Camon 30 Pro 5G', storage: '256 GB', price: 21000, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-pro.jpg' },
        { brand: 'Tecno', series: 'Camon Imaging Series', model: 'Tecno Camon 30 5G', storage: '256 GB', price: 16500, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-camon-30-pro.jpg' },
      ],
    },
    {
      id: 'tecno-pova',
      slug: 'tecno-pova-series',
      name: 'Pova Power Gaming Series',
      brand: 'Tecno',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-pova6-pro.jpg',
      description: 'Pova 6 Pro 5G, Pova 5 Pro, Pova Neo 3',
      pattern: /\bpova\b/i,
      defaultModels: [
        { brand: 'Tecno', series: 'Pova Power Gaming Series', model: 'Tecno Pova 6 Pro 5G', storage: '256 GB', price: 15500, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-pova6-pro.jpg' },
        { brand: 'Tecno', series: 'Pova Power Gaming Series', model: 'Tecno Pova 5 Pro 5G', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-pova6-pro.jpg' },
      ],
    },
    {
      id: 'tecno-spark',
      slug: 'tecno-spark-series',
      name: 'Spark Series',
      brand: 'Tecno',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-spark-20.jpg',
      description: 'Spark 20 Pro+, Spark 20, Spark Go 2024',
      pattern: /\bspark\b/i,
      defaultModels: [
        { brand: 'Tecno', series: 'Spark Series', model: 'Tecno Spark 20 Pro+ 5G', storage: '256 GB', price: 12500, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-spark-20.jpg' },
        { brand: 'Tecno', series: 'Spark Series', model: 'Tecno Spark 20', storage: '128 GB', price: 7800, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-spark-20.jpg' },
      ],
    },
    {
      id: 'tecno-phantom',
      slug: 'tecno-phantom-series',
      name: 'Phantom Flagship Series',
      brand: 'Tecno',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-phantom-v-fold.jpg',
      description: 'Phantom V Fold, Phantom V Flip, Phantom X2 Pro',
      pattern: /\bphantom\b/i,
      defaultModels: [
        { brand: 'Tecno', series: 'Phantom Flagship Series', model: 'Tecno Phantom V Fold', storage: '256 GB', price: 42000, image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-phantom-v-fold.jpg' },
      ],
    },
  ],

  itel: [
    {
      id: 'itel-color-pro',
      slug: 'itel-color-pro-series',
      name: 'Color Pro 5G Series',
      brand: 'Itel',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-color-pro-5g.jpg',
      description: 'Itel Color Pro 5G',
      pattern: /\bcolor\s*pro\b/i,
      defaultModels: [
        { brand: 'Itel', series: 'Color Pro 5G Series', model: 'Itel Color Pro 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-color-pro-5g.jpg' },
      ],
    },
    {
      id: 'itel-s',
      slug: 'itel-s-series',
      name: 'S Series (Curved AMOLED)',
      brand: 'Itel',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-s23-plus.jpg',
      description: 'Itel S24, Itel S23+',
      pattern: /\bs\d+/i,
      defaultModels: [
        { brand: 'Itel', series: 'S Series', model: 'Itel S24', storage: '128 GB', price: 7200, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-s24.jpg' },
        { brand: 'Itel', series: 'S Series', model: 'Itel S23+', storage: '256 GB', price: 8900, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-s23-plus.jpg' },
      ],
    },
    {
      id: 'itel-p',
      slug: 'itel-p-series',
      name: 'P Power Series',
      brand: 'Itel',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-p55.jpg',
      description: 'Itel P55 5G, P55+, P55, P55T',
      pattern: /\bp\d+/i,
      defaultModels: [
        { brand: 'Itel', series: 'P Series', model: 'Itel P55 5G', storage: '128 GB', price: 7800, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-p55.jpg' },
        { brand: 'Itel', series: 'P Series', model: 'Itel P55+', storage: '128 GB', price: 6800, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-p55.jpg' },
      ],
    },
    {
      id: 'itel-a',
      slug: 'itel-a-series',
      name: 'A Smart Series',
      brand: 'Itel',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-a70.jpg',
      description: 'Itel A70, A60s, A05s',
      pattern: /\ba\d+/i,
      defaultModels: [
        { brand: 'Itel', series: 'A Series', model: 'Itel A70', storage: '128 GB', price: 5600, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-a70.jpg' },
        { brand: 'Itel', series: 'A Series', model: 'Itel A60s', storage: '64 GB', price: 4200, image: 'https://fdn2.gsmarena.com/vv/bigpic/itel-a70.jpg' },
      ],
    },
  ],

  infinix: [
    {
      id: 'infinix-gt',
      slug: 'infinix-gt-series',
      name: 'GT Gaming Series',
      brand: 'Infinix',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-gt-20-pro.jpg',
      description: 'Infinix GT 20 Pro 5G, GT 10 Pro',
      pattern: /\bgt\b/i,
      defaultModels: [
        { brand: 'Infinix', series: 'GT Gaming Series', model: 'Infinix GT 20 Pro 5G', storage: '256 GB', price: 18500, image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-gt-20-pro.jpg' },
        { brand: 'Infinix', series: 'GT Gaming Series', model: 'Infinix GT 10 Pro', storage: '256 GB', price: 14500, image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-gt-10-pro.jpg' },
      ],
    },
    {
      id: 'infinix-zero',
      slug: 'infinix-zero-series',
      name: 'Zero Flagship Series',
      brand: 'Infinix',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-zero-30-5g.jpg',
      description: 'Infinix Zero 30 5G, Zero Ultra',
      pattern: /\bzero\b/i,
      defaultModels: [
        { brand: 'Infinix', series: 'Zero Flagship Series', model: 'Infinix Zero 30 5G', storage: '256 GB', price: 16500, image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-zero-30-5g.jpg' },
      ],
    },
    {
      id: 'infinix-note',
      slug: 'infinix-note-series',
      name: 'Note Pro Series',
      brand: 'Infinix',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-note-40-pro-plus-5g.jpg',
      description: 'Infinix Note 40 Pro+ 5G, Note 40 Pro, Note 30 5G',
      pattern: /\bnote\b/i,
      defaultModels: [
        { brand: 'Infinix', series: 'Note Pro Series', model: 'Infinix Note 40 Pro+ 5G', storage: '256 GB', price: 17500, image: 'https://fdn2.gsmarena.com/vv/bigpic/infinix-note-40-pro-plus-5g.jpg' },
      ],
    },
  ],
};

export function groupModelsBySeries(brand: string, allModels: CatalogModelItem[]): SeriesGroup[] {
  const cleanBrand = brand.trim().toLowerCase();
  const defs = BRAND_SERIES_DEFINITIONS[cleanBrand] || [];

  if (defs.length === 0) {
    // Dynamic series fallback for other brands
    const seriesMap = new Map<string, CatalogModelItem[]>();
    allModels.forEach((m) => {
      const s = m.series || 'All Models';
      if (!seriesMap.has(s)) seriesMap.set(s, []);
      seriesMap.get(s)!.push(m);
    });

    return Array.from(seriesMap.entries()).map(([sName, models], idx) => ({
      id: `series-${idx}`,
      slug: sName.toLowerCase().replace(/[\s&/]+/g, '-'),
      name: sName,
      brand,
      image: models[0]?.image || getCleanPhoneImage(brand, sName),
      modelsCount: models.length,
      models,
    }));
  }

  // Map each definition to matching models
  const grouped: SeriesGroup[] = [];
  const assignedModels = new Set<string>();

  for (const def of defs) {
    const matched = allModels.filter((m) => {
      const text = `${m.model} ${m.series || ''}`;
      return def.pattern.test(text);
    });

    matched.forEach((m) => assignedModels.add(m.model.toLowerCase()));

    // Combine matched models with defaultModels so all expected models are present
    const combinedModels: CatalogModelItem[] = [...matched];
    const seenNames = new Set(matched.map((m) => m.model.toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '')));

    if (def.defaultModels) {
      for (const defModel of def.defaultModels) {
        const norm = defModel.model.toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '');
        if (!seenNames.has(norm)) {
          combinedModels.push(defModel);
          seenNames.add(norm);
        }
        assignedModels.add(defModel.model.toLowerCase());
      }
    }

    const effectiveModels = combinedModels.length > 0 ? combinedModels : (def.defaultModels || []);

    grouped.push({
      id: def.id,
      slug: def.slug,
      name: def.name,
      brand: def.brand,
      image: def.image || effectiveModels[0]?.image || getCleanPhoneImage(brand, def.name),
      modelsCount: effectiveModels.length,
      models: effectiveModels,
    });
  }

  // Any remaining models go into "Other Models"
  const remaining = allModels.filter((m) => !assignedModels.has(m.model.toLowerCase()));
  if (remaining.length > 0) {
    grouped.push({
      id: 'other-models',
      slug: 'other-models',
      name: `${brand} Other Models`,
      brand,
      image: remaining[0]?.image || getCleanPhoneImage(brand, 'Other'),
      modelsCount: remaining.length,
      models: remaining,
    });
  }

  return grouped;
}

/**
 * Checks if a given URL slug refers to a series/generation grouping rather than an individual device model.
 */
export function isSeriesSlug(slug?: string): boolean {
  if (!slug) return false;
  const clean = slug.toLowerCase().trim().replace(/^sell-/, '');
  if (clean.endsWith('-series') || clean.endsWith('-models') || clean === 'other-models') {
    return true;
  }
  for (const list of Object.values(BRAND_SERIES_DEFINITIONS)) {
    if (list.some((def) => def.slug === clean || def.id === clean)) {
      return true;
    }
  }
  return false;
}

/**
 * Retrieves a series definition by its slug.
 */
export function getSeriesBySlug(brand: string, seriesSlug?: string): BrandSeriesDefinition | undefined {
  if (!seriesSlug) return undefined;
  const cleanBrand = brand.trim().toLowerCase();
  const cleanSlug = seriesSlug.trim().toLowerCase().replace(/^sell-/, '');
  const defs = BRAND_SERIES_DEFINITIONS[cleanBrand] || [];
  return defs.find((d) => d.slug === cleanSlug || d.id === cleanSlug);
}

