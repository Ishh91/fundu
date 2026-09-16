import { getCleanPhoneImage } from '../lib/phoneImages';
import type { CatalogModelItem } from '../lib/mobileApi';

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
    },
    {
      id: 'galaxy-s24',
      slug: 'galaxy-s24-series',
      name: 'Galaxy S24 Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-stylus.jpg',
      description: 'S24 Ultra, S24+, S24 5G',
      pattern: /\bs24\b/i,
    },
    {
      id: 'galaxy-s23',
      slug: 'galaxy-s23-series',
      name: 'Galaxy S23 Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg',
      description: 'S23 Ultra, S23+, S23 5G, S23 FE',
      pattern: /\bs23\b/i,
    },
    {
      id: 'galaxy-s22',
      slug: 'galaxy-s22-series',
      name: 'Galaxy S22 Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-ultra-5g.jpg',
      description: 'S22 Ultra, S22+, S22 5G',
      pattern: /\bs22\b/i,
    },
    {
      id: 'galaxy-s21',
      slug: 'galaxy-s21-series',
      name: 'Galaxy S21 Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-fe-5g.jpg',
      description: 'S21 Ultra, S21+, S21 5G, S21 FE',
      pattern: /\bs21\b/i,
    },
    {
      id: 'galaxy-s20',
      slug: 'galaxy-s20-series',
      name: 'Galaxy S20 Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg',
      description: 'S20 Ultra, S20+, S20 5G, S20 FE',
      pattern: /\bs20\b/i,
    },
    {
      id: 'galaxy-z',
      slug: 'galaxy-z-series',
      name: 'Galaxy Z Series (Fold & Flip)',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg',
      description: 'Fold 6, Flip 6, Fold 5, Flip 5',
      pattern: /\b(fold|flip)\b/i,
    },
    {
      id: 'galaxy-note',
      slug: 'galaxy-note-series',
      name: 'Galaxy Note Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-stylus.jpg',
      description: 'Note 20 Ultra, Note 20, Note 10',
      pattern: /\bnote\b/i,
    },
    {
      id: 'galaxy-a',
      slug: 'galaxy-a-series',
      name: 'Galaxy A Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg',
      description: 'A55, A54, A35, A34, A15...',
      pattern: /\ba\d+/i,
    },
    {
      id: 'galaxy-m-f',
      slug: 'galaxy-m-series',
      name: 'Galaxy M & F Series',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg',
      description: 'M55, M54, M34, F55, F54...',
      pattern: /\b(m|f)\d+/i,
    },
    {
      id: 'galaxy-j',
      slug: 'galaxy-j-series',
      name: 'Galaxy J Series (Classic)',
      brand: 'Samsung',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-prime.jpg',
      description: 'J7 Prime, J7 Pro, J7 Max, J6...',
      pattern: /\bj\d+/i,
    },
  ],

  oneplus: [
    {
      id: 'oneplus-13-12',
      slug: 'oneplus-13-12-series',
      name: 'OnePlus 13 & 12 Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
      description: 'OnePlus 13, 12, 12R',
      pattern: /\b(oneplus\s*(13|12)|12r)\b/i,
    },
    {
      id: 'oneplus-11',
      slug: 'oneplus-11-series',
      name: 'OnePlus 11 Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg',
      description: 'OnePlus 11 5G, 11R 5G',
      pattern: /\b(oneplus\s*11|11r)\b/i,
    },
    {
      id: 'oneplus-10',
      slug: 'oneplus-10-series',
      name: 'OnePlus 10 Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
      description: 'OnePlus 10 Pro, 10T, 10R',
      pattern: /\b(oneplus\s*10|10t|10r)\b/i,
    },
    {
      id: 'oneplus-9',
      slug: 'oneplus-9-series',
      name: 'OnePlus 9 Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro-.jpg',
      description: 'OnePlus 9 Pro, 9, 9RT, 9R',
      pattern: /\b(oneplus\s*9|9r|9rt)\b/i,
    },
    {
      id: 'oneplus-8-7',
      slug: 'oneplus-8-7-series',
      name: 'OnePlus 8 & 7 Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
      description: '8 Pro, 8T, 8, 7T Pro, 7T, 7',
      pattern: /\b(oneplus\s*(8|7)|7t|8t)\b/i,
    },
    {
      id: 'oneplus-nord',
      slug: 'oneplus-nord-series',
      name: 'OnePlus Nord Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-3r.jpg',
      description: 'Nord 4, Nord 3, Nord CE 4...',
      pattern: /\bnord\b/i,
    },
    {
      id: 'oneplus-classic',
      slug: 'oneplus-classic-series',
      name: 'OnePlus 6 & Classic Series',
      brand: 'OnePlus',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
      description: '6T, 6, 5T, 5, 3T, 3, One',
      pattern: /\b(oneplus\s*(6|5|3|2|1|one)|6t|5t|3t)\b/i,
    },
  ],

  xiaomi: [
    {
      id: 'xiaomi-flagship',
      slug: 'xiaomi-flagship-series',
      name: 'Xiaomi Mi / Flagship Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg',
      description: 'Xiaomi 14, 13 Pro, 12 Pro, 11 Ultra',
      pattern: /\b(xiaomi\s*(14|13|12|11)|mi\s*\d+)\b/i,
    },
    {
      id: 'redmi-note-13',
      slug: 'redmi-note-13-series',
      name: 'Redmi Note 13 Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg',
      description: 'Note 13 Pro+, Note 13 Pro, Note 13',
      pattern: /note\s*13/i,
    },
    {
      id: 'redmi-note-12',
      slug: 'redmi-note-12-series',
      name: 'Redmi Note 12 Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13.jpg',
      description: 'Note 12 Pro+, Note 12 Pro, Note 12',
      pattern: /note\s*12/i,
    },
    {
      id: 'redmi-note-11-older',
      slug: 'redmi-note-11-series',
      name: 'Redmi Note 11 & Older Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13.jpg',
      description: 'Note 11, 10, 9, 8, 7...',
      pattern: /note\s*(11|10|[4-9])/i,
    },
    {
      id: 'poco-series',
      slug: 'poco-series',
      name: 'POCO Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg',
      description: 'X6 Pro, X5, F6, F5, M6...',
      pattern: /\bpoco\b/i,
    },
    {
      id: 'redmi-number',
      slug: 'redmi-number-series',
      name: 'Redmi Number Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13.jpg',
      description: 'Redmi 13C, 12 5G, 11 Prime...',
      pattern: /\bredmi\s*\d+/i,
    },
  ],

  vivo: [
    {
      id: 'vivo-x',
      slug: 'vivo-x-series',
      name: 'Vivo X Series (Zeiss Flagship)',
      brand: 'Vivo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x200-pro.jpg',
      description: 'X200 Pro, X100 Pro, X90, X80...',
      pattern: /\bx\d+/i,
    },
    {
      id: 'vivo-v',
      slug: 'vivo-v-series',
      name: 'Vivo V Series',
      brand: 'Vivo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg',
      description: 'V40, V30, V29, V27, V25...',
      pattern: /\bv\d+/i,
    },
    {
      id: 'vivo-t',
      slug: 'vivo-t-series',
      name: 'Vivo T Series (Turbo Speed)',
      brand: 'Vivo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg',
      description: 'T3 Pro, T3, T2 Pro, T1...',
      pattern: /\bt\d+/i,
    },
    {
      id: 'vivo-y',
      slug: 'vivo-y-series',
      name: 'Vivo Y Series',
      brand: 'Vivo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg',
      description: 'Y200, Y100, Y56, Y28...',
      pattern: /\by\d+/i,
    },
    {
      id: 'vivo-iqoo',
      slug: 'iqoo-series',
      name: 'iQOO Flagship & Neo Series',
      brand: 'Vivo',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo12.jpg',
      description: 'iQOO 12, 11, Neo 9 Pro, Neo 7...',
      pattern: /\biqoo\b/i,
    },
  ],

  realme: [
    {
      id: 'realme-gt',
      slug: 'realme-gt-series',
      name: 'Realme GT Series',
      brand: 'Realme',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg',
      description: 'GT 6, GT 6T, GT 2 Pro...',
      pattern: /\bgt\b/i,
    },
    {
      id: 'realme-number',
      slug: 'realme-number-series',
      name: 'Realme Number & Pro Series',
      brand: 'Realme',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg',
      description: '13 Pro+, 12 Pro+, 11 Pro, 10...',
      pattern: /\b(realme\s*\d+|\d+\s*pro)\b/i,
    },
    {
      id: 'realme-narzo',
      slug: 'realme-narzo-series',
      name: 'Realme Narzo Series',
      brand: 'Realme',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg',
      description: 'Narzo 70 Pro, Narzo 60, Narzo 50...',
      pattern: /\bnarzo\b/i,
    },
    {
      id: 'realme-c',
      slug: 'realme-c-series',
      name: 'Realme C Series',
      brand: 'Realme',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg',
      description: 'C67, C55, C53, C35...',
      pattern: /\bc\d+/i,
    },
  ],

  google: [
    {
      id: 'pixel-9',
      slug: 'pixel-9-series',
      name: 'Google Pixel 9 Series',
      brand: 'Google',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',
      description: 'Pixel 9 Pro XL, Pixel 9 Pro, Pixel 9',
      pattern: /pixel\s*9/i,
    },
    {
      id: 'pixel-8',
      slug: 'pixel-8-series',
      name: 'Google Pixel 8 Series',
      brand: 'Google',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',
      description: 'Pixel 8 Pro, Pixel 8, Pixel 8a',
      pattern: /pixel\s*8/i,
    },
    {
      id: 'pixel-7',
      slug: 'pixel-7-series',
      name: 'Google Pixel 7 Series',
      brand: 'Google',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg',
      description: 'Pixel 7 Pro, Pixel 7, Pixel 7a',
      pattern: /pixel\s*7/i,
    },
    {
      id: 'pixel-6-older',
      slug: 'pixel-6-older-series',
      name: 'Pixel 6 & Older Generation Series',
      brand: 'Google',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg',
      description: 'Pixel 6, 6 Pro, 5, 4, 3, 2, 1',
      pattern: /pixel\s*([1-6]|\b[a-z]+)/i,
    },
  ],

  motorola: [
    {
      id: 'moto-edge',
      slug: 'moto-edge-series',
      name: 'Moto Edge Series',
      brand: 'Motorola',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
      description: 'Edge 50 Pro, Edge 50 Ultra, Edge 40...',
      pattern: /edge/i,
    },
    {
      id: 'moto-razr',
      slug: 'moto-razr-series',
      name: 'Moto Razr Series',
      brand: 'Motorola',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
      description: 'Razr 50 Ultra, Razr 40 Ultra...',
      pattern: /razr/i,
    },
    {
      id: 'moto-g',
      slug: 'moto-g-series',
      name: 'Moto G Series',
      brand: 'Motorola',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g84.jpg',
      description: 'G85, G84, G54, G34...',
      pattern: /g\d+/i,
    },
  ],

  nothing: [
    {
      id: 'nothing-phone',
      slug: 'nothing-phone-series',
      name: 'Nothing Phone Series',
      brand: 'Nothing',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg',
      description: 'Phone (2), Phone (2a), Phone (1)',
      pattern: /phone\s*\(?[1-9]/i,
    },
    {
      id: 'cmf-phone',
      slug: 'cmf-phone-series',
      name: 'CMF by Nothing Series',
      brand: 'Nothing',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg',
      description: 'CMF Phone 1',
      pattern: /cmf/i,
    },
  ],
};

/**
 * Groups models of a brand into defined Series, ordered chronologically (newest down to oldest).
 */
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

    const effectiveModels = matched.length > 0 ? matched : (def.defaultModels || []);

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

