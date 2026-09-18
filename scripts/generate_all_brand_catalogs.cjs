const fs = require('fs');

// Load API dataset
const apiDevices = JSON.parse(fs.readFileSync('scripts/api_fetched_devices.json', 'utf8'));

// Helper to look up an image from API dataset
function getApiThumb(brand, query, fallback) {
  const list = apiDevices[brand] || [];
  const q = query.toLowerCase().replace(/^(oneplus|xiaomi|redmi|poco|realme|oppo|vivo|google|motorola|moto|nothing)\s+/i, '').trim();
  for (const item of list) {
    const iname = item.name.toLowerCase();
    if (iname === q || (q.length > 2 && iname.includes(q)) || (iname.length > 2 && q.includes(iname))) {
      if (item.image_url) return item.image_url;
    }
  }
  return fallback;
}

// 1. ONEPLUS SERIES
const oneplusSeries = [
  {
    id: 'oneplus-13-12',
    slug: 'oneplus-13-12-series',
    name: 'OnePlus 13 & 12 Series',
    brand: 'OnePlus',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
    description: 'OnePlus 13, 13R, 12, 12R',
    pattern: '/\\b(13|13r|12|12r)\\b/i',
    defaultModels: [
      { brand: 'OnePlus', series: 'OnePlus 13 & 12 Series', model: 'OnePlus 13', storage: '256 GB', price: 58000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-13.jpg' },
      { brand: 'OnePlus', series: 'OnePlus 13 & 12 Series', model: 'OnePlus 13R', storage: '128 GB', price: 38000, image: getApiThumb('OnePlus', '13R', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12r.jpg') },
      { brand: 'OnePlus', series: 'OnePlus 13 & 12 Series', model: 'OnePlus 12', storage: '256 GB', price: 42000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg' },
      { brand: 'OnePlus', series: 'OnePlus 13 & 12 Series', model: 'OnePlus 12R', storage: '128 GB', price: 28000, image: getApiThumb('OnePlus', '12R', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12r.jpg') },
    ],
  },
  {
    id: 'oneplus-11',
    slug: 'oneplus-11-series',
    name: 'OnePlus 11 Series',
    brand: 'OnePlus',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg',
    description: 'OnePlus 11 5G, 11R',
    pattern: '/\\b(11|11r)\\b/i',
    defaultModels: [
      { brand: 'OnePlus', series: 'OnePlus 11 Series', model: 'OnePlus 11', storage: '128 GB', price: 32000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg' },
      { brand: 'OnePlus', series: 'OnePlus 11 Series', model: 'OnePlus 11R', storage: '128 GB', price: 24000, image: getApiThumb('OnePlus', '11R', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11r.jpg') },
    ],
  },
  {
    id: 'oneplus-10',
    slug: 'oneplus-10-series',
    name: 'OnePlus 10 Series',
    brand: 'OnePlus',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg',
    description: 'OnePlus 10 Pro, 10T, 10R',
    pattern: '/\\b(10\\s*pro|10t|10r)\\b/i',
    defaultModels: [
      { brand: 'OnePlus', series: 'OnePlus 10 Series', model: 'OnePlus 10 Pro', storage: '128 GB', price: 26000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg' },
      { brand: 'OnePlus', series: 'OnePlus 10 Series', model: 'OnePlus 10T', storage: '128 GB', price: 22000, image: getApiThumb('OnePlus', '10T', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10t-5g.jpg') },
      { brand: 'OnePlus', series: 'OnePlus 10 Series', model: 'OnePlus 10R 150W', storage: '128 GB', price: 19000, image: getApiThumb('OnePlus', '10R 150W', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10r.jpg') },
      { brand: 'OnePlus', series: 'OnePlus 10 Series', model: 'OnePlus 10R', storage: '128 GB', price: 18000, image: getApiThumb('OnePlus', '10R 5G', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10r.jpg') },
    ],
  },
  {
    id: 'oneplus-9',
    slug: 'oneplus-9-series',
    name: 'OnePlus 9 Series',
    brand: 'OnePlus',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro-.jpg',
    description: 'OnePlus 9 Pro, 9RT, 9, 9R',
    pattern: '/\\b(9\\s*pro|9rt|9r|9)\\b/i',
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
    pattern: '/\\b(8\\s*pro|8t|8|7t\\s*pro|7t|7\\s*pro|7)\\b/i',
    defaultModels: [
      { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 8 Pro', storage: '128 GB', price: 14000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8-pro.jpg' },
      { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 8T', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8t.jpg' },
      { brand: 'OnePlus', series: 'OnePlus 8 & 7 Series', model: 'OnePlus 8', storage: '128 GB', price: 12000, image: getApiThumb('OnePlus', '8 5G UW', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8.jpg') },
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
    pattern: '/\\bnord\\b/i',
    defaultModels: [
      { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord 4', storage: '128 GB', price: 23000, image: getApiThumb('OnePlus', 'Nord 4', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-4.jpg') },
      { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord 3', storage: '128 GB', price: 18000, image: getApiThumb('OnePlus', 'Nord 3', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-3.jpg') },
      { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord 2T', storage: '128 GB', price: 14000, image: getApiThumb('OnePlus', 'Nord 2T', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-2t.jpg') },
      { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord 2', storage: '128 GB', price: 12000, image: getApiThumb('OnePlus', 'Nord 2 5G', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-2-5g.jpg') },
      { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord CE4', storage: '128 GB', price: 16500, image: getApiThumb('OnePlus', 'Nord CE4', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4.jpg') },
      { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord CE4 Lite', storage: '128 GB', price: 13500, image: getApiThumb('OnePlus', 'Nord CE 4', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4-lite.jpg') },
      { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord CE3', storage: '128 GB', price: 13000, image: getApiThumb('OnePlus', 'Nord CE3', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-3.jpg') },
      { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord CE3 Lite', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-3-lite.jpg' },
      { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord CE 2', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-2-5g.jpg' },
      { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord CE', storage: '128 GB', price: 8500, image: getApiThumb('OnePlus', 'Nord CE 5G', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-5g.jpg') },
      { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord', storage: '128 GB', price: 7500, image: getApiThumb('OnePlus', 'Nord', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord.jpg') },
      { brand: 'OnePlus', series: 'OnePlus Nord Series', model: 'OnePlus Nord N30 5G', storage: '128 GB', price: 10000, image: getApiThumb('OnePlus', 'Nord N30', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-n30-5g.jpg') },
    ],
  },
  {
    id: 'oneplus-open',
    slug: 'oneplus-open-series',
    name: 'OnePlus Open & Foldable Series',
    brand: 'OnePlus',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-open.jpg',
    description: 'OnePlus Open Flagship Foldable',
    pattern: '/\\bopen\\b/i',
    defaultModels: [
      { brand: 'OnePlus', series: 'OnePlus Open & Foldable Series', model: 'OnePlus Open', storage: '512 GB', price: 78000, image: getApiThumb('OnePlus', 'Open', 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-open.jpg') },
    ],
  },
  {
    id: 'oneplus-classic',
    slug: 'oneplus-classic-series',
    name: 'OnePlus 6 & Classic Series',
    brand: 'OnePlus',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6t.jpg',
    description: 'OnePlus 6T, 6, 5T, 5',
    pattern: '/\\b(6t|6|5t|5|3t|3|one|x)\\b/i',
    defaultModels: [
      { brand: 'OnePlus', series: 'OnePlus 6 & Classic Series', model: 'OnePlus 6T', storage: '128 GB', price: 6500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6t.jpg' },
      { brand: 'OnePlus', series: 'OnePlus 6 & Classic Series', model: 'OnePlus 6', storage: '64 GB', price: 5500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6.jpg' },
      { brand: 'OnePlus', series: 'OnePlus 6 & Classic Series', model: 'OnePlus 5T', storage: '64 GB', price: 4500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-5t.jpg' },
      { brand: 'OnePlus', series: 'OnePlus 6 & Classic Series', model: 'OnePlus 5', storage: '64 GB', price: 4000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-5.jpg' },
    ],
  },
];

// 2. XIAOMI SERIES
const xiaomiSeries = [
  {
    id: 'xiaomi-mi-flagship',
    slug: 'xiaomi-mi-flagship-series',
    name: 'Xiaomi Mi / Flagship Series',
    brand: 'Xiaomi',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg',
    description: 'Xiaomi 14 Ultra, 14, 14 Civi, 13 Pro, 13, 12 Pro, 11X',
    pattern: '/\\b(xiaomi\\s*(14|13|12|11|10)|mi\\s*(11|10|9|8|mix|civi)|14\\s*civi|civi)\\b/i',
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
    id: 'redmi-note-13-14',
    slug: 'redmi-note-13-14-series',
    name: 'Redmi Note 13 & 14 Series',
    brand: 'Xiaomi',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg',
    description: 'Redmi Note 13 Pro+, 13 Pro, 13 5G',
    pattern: '/redmi\\s*note\\s*(14|13)/i',
    defaultModels: [
      { brand: 'Xiaomi', series: 'Redmi Note 13 & 14 Series', model: 'Redmi Note 13 Pro+ 5G', storage: '256 GB', price: 20500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 13 & 14 Series', model: 'Redmi Note 13 Pro 5G', storage: '128 GB', price: 16500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-5g.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 13 & 14 Series', model: 'Redmi Note 13 5G', storage: '128 GB', price: 12500, image: getApiThumb('Xiaomi', '13 5G', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-5g.jpg') },
      { brand: 'Xiaomi', series: 'Redmi Note 13 & 14 Series', model: 'Redmi Note 13 4G', storage: '128 GB', price: 10500, image: getApiThumb('Xiaomi', '13 4G', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-4g.jpg') },
    ],
  },
  {
    id: 'redmi-note-12-11',
    slug: 'redmi-note-12-11-series',
    name: 'Redmi Note 12 & 11 Series',
    brand: 'Xiaomi',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro-plus.jpg',
    description: 'Redmi Note 12 Pro+, 12 Pro, 12, 11 Pro+, 11',
    pattern: '/redmi\\s*note\\s*(12|11)/i',
    defaultModels: [
      { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 12 Pro+ 5G', storage: '256 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro-plus.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 12 Pro 5G', storage: '128 GB', price: 12500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 12 5G', storage: '128 GB', price: 10000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 12 4G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-4g.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 11 Pro+ 5G', storage: '128 GB', price: 10500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-plus-5g.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 11 Pro', storage: '128 GB', price: 9000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-global.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 11S', storage: '128 GB', price: 8000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11s.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 12 & 11 Series', model: 'Redmi Note 11', storage: '64 GB', price: 7000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11.jpg' },
    ],
  },
  {
    id: 'redmi-note-older',
    slug: 'redmi-note-older-series',
    name: 'Redmi Note 10, 9 & Older Series',
    brand: 'Xiaomi',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note10-pro-max.jpg',
    description: 'Redmi Note 10 Pro Max, 10, 9 Pro Max, 9, 8 Pro',
    pattern: '/redmi\\s*note\\s*(10|9|8|7|6|5)/i',
    defaultModels: [
      { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 10 Pro Max', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note10-pro-max.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 10 Pro', storage: '128 GB', price: 7500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note10-pro.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 10S', storage: '64 GB', price: 6500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-10s.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 10', storage: '64 GB', price: 6000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-10.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 9 Pro Max', storage: '64 GB', price: 5500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-9-pro-max.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 9 Pro', storage: '64 GB', price: 5000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-9-pro.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 9', storage: '64 GB', price: 4500, image: getApiThumb('Xiaomi', 'Note 9', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-9.jpg') },
      { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 8 Pro', storage: '64 GB', price: 4200, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-8-pro.jpg' },
      { brand: 'Xiaomi', series: 'Redmi Note 10, 9 & Older Series', model: 'Redmi Note 8', storage: '64 GB', price: 3800, image: getApiThumb('Xiaomi', 'Note 8', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-8.jpg') },
    ],
  },
  {
    id: 'redmi-number-c',
    slug: 'redmi-number-c-series',
    name: 'Redmi Number & C/A Series',
    brand: 'Xiaomi',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-12-5g.jpg',
    description: 'Redmi 13C, 12 5G, 11 Prime, 10, 9, A3, A2',
    pattern: '/redmi\\s*(\\d+|[ca]\\d+)/i',
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
    pattern: '/poco\\s*[xf]/i',
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
    pattern: '/poco\\s*[mc]/i',
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
];

// 3. REALME SERIES
const realmeSeries = [
  {
    id: 'realme-gt',
    slug: 'realme-gt-series',
    name: 'Realme GT Series',
    brand: 'Realme',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-6.jpg',
    description: 'Realme GT 6, GT 6T, GT 2 Pro, GT Neo 3, GT Neo 2',
    pattern: '/\\bgt\\b/i',
    defaultModels: [
      { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT 6', storage: '256 GB', price: 28000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-6.jpg' },
      { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT 6T', storage: '128 GB', price: 21000, image: getApiThumb('Realme', 'GT 6T', 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-6t.jpg') },
      { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT 2 Pro', storage: '128 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt2-pro.jpg' },
      { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT Neo 3', storage: '128 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-neo3.jpg' },
      { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT Neo 2', storage: '128 GB', price: 13000, image: getApiThumb('Realme', 'GT Neo2', 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-neo2.jpg') },
      { brand: 'Realme', series: 'Realme GT Series', model: 'Realme GT 5G', storage: '128 GB', price: 12000, image: getApiThumb('Realme', 'GT 5G', 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-5g.jpg') },
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
    pattern: '/\\b(13|12|11|10|9|8|7|6)\\s*pro/i',
    defaultModels: [
      { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 13 Pro+ 5G', storage: '256 GB', price: 23000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro-plus.jpg' },
      { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 13 Pro 5G', storage: '128 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-pro.jpg' },
      { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 12 Pro+ 5G', storage: '256 GB', price: 19500, image: getApiThumb('Realme', '12 Pro+', 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg') },
      { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 12 Pro 5G', storage: '128 GB', price: 16000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro.jpg' },
      { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 11 Pro+ 5G', storage: '256 GB', price: 15500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro-plus.jpg' },
      { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 11 Pro 5G', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro.jpg' },
      { brand: 'Realme', series: 'Realme Number Pro Series', model: 'Realme 10 Pro+ 5G', storage: '128 GB', price: 12000, image: getApiThumb('Realme', '10 Pro+', 'https://fdn2.gsmarena.com/vv/bigpic/realme-10-pro-plus.jpg') },
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
    pattern: '/\\b(13\\+|13|12\\+|12|11x|11|10t|10|9i|9|8s|8)\\b/i',
    defaultModels: [
      { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 13+ 5G', storage: '128 GB', price: 16500, image: getApiThumb('Realme', '13+ 5G', 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-plus-5g.jpg') },
      { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 13 5G', storage: '128 GB', price: 14000, image: getApiThumb('Realme', '13 5G', 'https://fdn2.gsmarena.com/vv/bigpic/realme-13-5g.jpg') },
      { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 12+ 5G', storage: '128 GB', price: 14500, image: getApiThumb('Realme', '12+ 5G', 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-plus-5g.jpg') },
      { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 12 5G', storage: '128 GB', price: 12000, image: getApiThumb('Realme', '12 5G', 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-5g.jpg') },
      { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 12x 5G', storage: '128 GB', price: 9500, image: getApiThumb('Realme', '12x 5G', 'https://fdn2.gsmarena.com/vv/bigpic/realme-12x.jpg') },
      { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 11 5G', storage: '128 GB', price: 10500, image: getApiThumb('Realme', '11 5G', 'https://fdn2.gsmarena.com/vv/bigpic/realme-11-5g.jpg') },
      { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 11x 5G', storage: '128 GB', price: 9000, image: getApiThumb('Realme', '11x 5G', 'https://fdn2.gsmarena.com/vv/bigpic/realme-11x-5g.jpg') },
      { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 10 5G', storage: '128 GB', price: 8500, image: getApiThumb('Realme', '10 5G', 'https://fdn2.gsmarena.com/vv/bigpic/realme-10-5g.jpg') },
      { brand: 'Realme', series: 'Realme Number & Plus Series', model: 'Realme 9i 5G', storage: '64 GB', price: 6500, image: getApiThumb('Realme', '9i 5G', 'https://fdn2.gsmarena.com/vv/bigpic/realme-9i-5g.jpg') },
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
    pattern: '/\\b(narzo|p1|p2|p3|p4)\\b/i',
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
    pattern: '/\\bc\\d+/i',
    defaultModels: [
      { brand: 'Realme', series: 'Realme C Series', model: 'Realme C67 5G', storage: '128 GB', price: 8500, image: getApiThumb('Realme', 'C67 5G', 'https://fdn2.gsmarena.com/vv/bigpic/realme-c67-5g.jpg') },
      { brand: 'Realme', series: 'Realme C Series', model: 'Realme C65 5G', storage: '128 GB', price: 7500, image: getApiThumb('Realme', 'C65 5G', 'https://fdn2.gsmarena.com/vv/bigpic/realme-c65-5g.jpg') },
      { brand: 'Realme', series: 'Realme C Series', model: 'Realme C63 5G', storage: '128 GB', price: 6800, image: getApiThumb('Realme', 'C63 5G', 'https://fdn2.gsmarena.com/vv/bigpic/realme-c63.jpg') },
      { brand: 'Realme', series: 'Realme C Series', model: 'Realme C55', storage: '64 GB', price: 5800, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c55.jpg' },
      { brand: 'Realme', series: 'Realme C Series', model: 'Realme C53', storage: '64 GB', price: 5200, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c53.jpg' },
      { brand: 'Realme', series: 'Realme C Series', model: 'Realme C35', storage: '64 GB', price: 4500, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c35.jpg' },
      { brand: 'Realme', series: 'Realme C Series', model: 'Realme C33', storage: '32 GB', price: 3800, image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c33.jpg' },
    ],
  },
];

// 4. OPPO SERIES
const oppoSeries = [
  {
    id: 'oppo-find',
    slug: 'oppo-find-series',
    name: 'Oppo Find Series',
    brand: 'Oppo',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-n3-flip.jpg',
    description: 'Find N3 Flip, Find N2 Flip, Find X7 Ultra, Find X5 Pro',
    pattern: '/\\bfind\\b/i',
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
    pattern: '/\\breno\\b/i',
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
    pattern: '/\\bf\\d+/i',
    defaultModels: [
      { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F27 Pro+ 5G', storage: '128 GB', price: 20000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f27-pro-plus.jpg' },
      { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F25 Pro 5G', storage: '128 GB', price: 16000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f25-pro.jpg' },
      { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F23 5G', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f23.jpg' },
      { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F21s Pro 5G', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f21s-pro-5g.jpg' },
      { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F21 Pro 5G', storage: '128 GB', price: 10000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f21-pro-5g.jpg' },
      { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F19 Pro+ 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f19-pro-plus-5g.jpg' },
      { brand: 'Oppo', series: 'Oppo F Series', model: 'Oppo F19s', storage: '128 GB', price: 7500, image: getApiThumb('Oppo', 'F19s', 'https://fdn2.gsmarena.com/vv/bigpic/oppo-f19s.jpg') },
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
    pattern: '/\\b[ak]\\d+/i',
    defaultModels: [
      { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A79 5G', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a79.jpg' },
      { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A78 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a78-5g.jpg' },
      { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A59 5G', storage: '128 GB', price: 8800, image: getApiThumb('Oppo', 'A59s', 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a59.jpg') },
      { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A58 5G', storage: '128 GB', price: 8000, image: getApiThumb('Oppo', 'A58x', 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a58.jpg') },
      { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A38', storage: '128 GB', price: 6500, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a38.jpg' },
      { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A18', storage: '64 GB', price: 5200, image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a18.jpg' },
      { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo A17k', storage: '64 GB', price: 4500, image: getApiThumb('Oppo', 'A17k', 'https://fdn2.gsmarena.com/vv/bigpic/oppo-a17k.jpg') },
      { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo K12x 5G', storage: '128 GB', price: 9500, image: getApiThumb('Oppo', 'K12x', 'https://fdn2.gsmarena.com/vv/bigpic/oppo-k12x.jpg') },
      { brand: 'Oppo', series: 'Oppo A & K Series', model: 'Oppo K10 5G', storage: '128 GB', price: 7500, image: getApiThumb('Oppo', 'K10x', 'https://fdn2.gsmarena.com/vv/bigpic/oppo-k10-5g.jpg') },
    ],
  },
];

// 5. VIVO SERIES
const vivoSeries = [
  {
    id: 'vivo-x-series',
    slug: 'vivo-x-series',
    name: 'Vivo X Series (Zeiss Flagship)',
    brand: 'Vivo',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg',
    description: 'Vivo X100 Pro, X100, X90 Pro, X90, X80 Pro, X70 Pro+',
    pattern: '/\\bx\\d+/i',
    defaultModels: [
      { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X100 Pro', storage: '512 GB', price: 52000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg' },
      { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X100', storage: '256 GB', price: 42000, image: getApiThumb('Vivo', 'X100', 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100.jpg') },
      { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X90 Pro', storage: '256 GB', price: 32000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x90-pro.jpg' },
      { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X90', storage: '256 GB', price: 27000, image: getApiThumb('Vivo', 'X90s', 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x90.jpg') },
      { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X80 Pro', storage: '256 GB', price: 24000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x80-pro.jpg' },
      { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X80', storage: '128 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x80.jpg' },
      { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X70 Pro+', storage: '256 GB', price: 17000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x70-pro-plus.jpg' },
      { brand: 'Vivo', series: 'Vivo X Series (Zeiss Flagship)', model: 'Vivo X70 Pro', storage: '128 GB', price: 14000, image: getApiThumb('Vivo', 'X70t', 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x70-pro.jpg') },
    ],
  },
  {
    id: 'vivo-v-series',
    slug: 'vivo-v-series',
    name: 'Vivo V Series',
    brand: 'Vivo',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40-pro.jpg',
    description: 'Vivo V40 Pro, V40, V40e, V30 Pro, V30, V29 Pro, V27 Pro',
    pattern: '/\\bv\\d+/i',
    defaultModels: [
      { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V40 Pro', storage: '256 GB', price: 34000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40-pro.jpg' },
      { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V40', storage: '128 GB', price: 27000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40.jpg' },
      { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V40e', storage: '128 GB', price: 20000, image: getApiThumb('Vivo', 'V40e', 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v40e.jpg') },
      { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V30 Pro', storage: '256 GB', price: 26000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg' },
      { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V30', storage: '128 GB', price: 21000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30.jpg' },
      { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V30e', storage: '128 GB', price: 16500, image: getApiThumb('Vivo', 'V30e', 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30e.jpg') },
      { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V29 Pro', storage: '256 GB', price: 19000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v29-pro.jpg' },
      { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V29', storage: '128 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v29.jpg' },
      { brand: 'Vivo', series: 'Vivo V Series', model: 'Vivo V29e', storage: '128 GB', price: 13000, image: getApiThumb('Vivo', 'V29e', 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v29e.jpg') },
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
    pattern: '/\\bt\\d+/i',
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
    pattern: '/\\by\\d+/i',
    defaultModels: [
      { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y200 Pro 5G', storage: '128 GB', price: 16500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y200-pro.jpg' },
      { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y200 5G', storage: '128 GB', price: 13000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y200.jpg' },
      { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y58 5G', storage: '128 GB', price: 12000, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y58.jpg' },
      { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y28 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y28.jpg' },
      { brand: 'Vivo', series: 'Vivo Y Series', model: 'Vivo Y100 5G', storage: '128 GB', price: 11500, image: getApiThumb('Vivo', 'Y100', 'https://fdn2.gsmarena.com/vv/bigpic/vivo-y100.jpg') },
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
    pattern: '/\\biqoo\\b/i',
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
];

// 6. GOOGLE PIXEL SERIES
const googleSeries = [
  {
    id: 'pixel-9',
    slug: 'google-pixel-9-series',
    name: 'Google Pixel 9 Series',
    brand: 'Google',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-xl.jpg',
    description: 'Pixel 9 Pro XL, 9 Pro, 9, 9 Pro Fold',
    pattern: '/pixel\\s*9/i',
    defaultModels: [
      { brand: 'Google', series: 'Google Pixel 9 Series', model: 'Google Pixel 9 Pro XL', storage: '128 GB', price: 72000, image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-xl.jpg' },
      { brand: 'Google', series: 'Google Pixel 9 Series', model: 'Google Pixel 9 Pro', storage: '128 GB', price: 64000, image: getApiThumb('Google', 'Pixel 9 Pro', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro.jpg') },
      { brand: 'Google', series: 'Google Pixel 9 Series', model: 'Google Pixel 9', storage: '128 GB', price: 52000, image: getApiThumb('Google', 'Pixel 9', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9.jpg') },
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
    pattern: '/pixel\\s*8/i',
    defaultModels: [
      { brand: 'Google', series: 'Google Pixel 8 Series', model: 'Google Pixel 8 Pro', storage: '128 GB', price: 46000, image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg' },
      { brand: 'Google', series: 'Google Pixel 8 Series', model: 'Google Pixel 8', storage: '128 GB', price: 36000, image: getApiThumb('Google', 'Pixel 8', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg') },
      { brand: 'Google', series: 'Google Pixel 8 Series', model: 'Google Pixel 8a', storage: '128 GB', price: 29000, image: getApiThumb('Google', 'Pixel 8a', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8a.jpg') },
    ],
  },
  {
    id: 'pixel-7',
    slug: 'google-pixel-7-series',
    name: 'Google Pixel 7 Series',
    brand: 'Google',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-pro.jpg',
    description: 'Pixel 7 Pro, Pixel 7, Pixel 7a',
    pattern: '/pixel\\s*7/i',
    defaultModels: [
      { brand: 'Google', series: 'Google Pixel 7 Series', model: 'Google Pixel 7 Pro', storage: '128 GB', price: 28000, image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-pro.jpg' },
      { brand: 'Google', series: 'Google Pixel 7 Series', model: 'Google Pixel 7', storage: '128 GB', price: 22000, image: getApiThumb('Google', 'Pixel 7', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7.jpg') },
      { brand: 'Google', series: 'Google Pixel 7 Series', model: 'Google Pixel 7a', storage: '128 GB', price: 19000, image: getApiThumb('Google', 'Pixel 7a', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg') },
    ],
  },
  {
    id: 'pixel-older',
    slug: 'pixel-6-older-generation-series',
    name: 'Pixel 6 & Older Generation Series',
    brand: 'Google',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6-pro.jpg',
    description: 'Pixel 6 Pro, 6, 6a, Pixel Fold, Pixel 5, 4a, 3a',
    pattern: '/pixel\\s*(6|5|4|3|2|1|xl|fold)/i',
    defaultModels: [
      { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 6 Pro', storage: '128 GB', price: 18000, image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6-pro.jpg' },
      { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 6', storage: '128 GB', price: 14000, image: getApiThumb('Google', 'Pixel 6', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6.jpg') },
      { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 6a', storage: '128 GB', price: 13000, image: getApiThumb('Google', 'Pixel 6a', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6a.jpg') },
      { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel Fold', storage: '256 GB', price: 55000, image: getApiThumb('Google', 'Pixel Fold', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-fold.jpg') },
      { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 5', storage: '128 GB', price: 11000, image: getApiThumb('Google', 'Pixel 5', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-5.jpg') },
      { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 4a', storage: '128 GB', price: 8500, image: getApiThumb('Google', 'Pixel 4a', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-4a.jpg') },
      { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 4 XL', storage: '64 GB', price: 8000, image: getApiThumb('Google', 'Pixel 4 XL', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-4-xl.jpg') },
      { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 3a XL', storage: '64 GB', price: 6000, image: getApiThumb('Google', 'Pixel 3a XL', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3a-xl.jpg') },
      { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 3a', storage: '64 GB', price: 5500, image: getApiThumb('Google', 'Pixel 3a', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3a.jpg') },
      { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 3 XL', storage: '64 GB', price: 5000, image: getApiThumb('Google', 'Pixel 3 XL', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3-xl.jpg') },
      { brand: 'Google', series: 'Pixel 6 & Older Generation Series', model: 'Google Pixel 2 XL', storage: '64 GB', price: 4000, image: getApiThumb('Google', 'Pixel 2 XL', 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-2-xl.jpg') },
    ],
  },
];

// 7. MOTOROLA SERIES
const motorolaSeries = [
  {
    id: 'moto-razr',
    slug: 'moto-razr-series',
    name: 'Moto Razr Series',
    brand: 'Motorola',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-50-ultra.jpg',
    description: 'Motorola Razr 50 Ultra, Razr 50, Razr 40 Ultra, Razr 40',
    pattern: '/\\brazr\\b/i',
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
    pattern: '/\\bedge\\b/i',
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
    pattern: '/\\b(moto\\s*[ge]|[ge]\\d+)\\b/i',
    defaultModels: [
      { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G85 5G', storage: '128 GB', price: 13500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g85.jpg' },
      { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G64 5G', storage: '128 GB', price: 11000, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g64.jpg' },
      { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G54 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g54.jpg' },
      { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G34 5G', storage: '128 GB', price: 8200, image: getApiThumb('Motorola', 'Moto G34', 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g34.jpg') },
      { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G24 Power', storage: '128 GB', price: 6800, image: getApiThumb('Motorola', 'Moto G24', 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g24-power.jpg') },
      { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G14', storage: '128 GB', price: 5800, image: getApiThumb('Motorola', 'Moto G14', 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g14.jpg') },
      { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G73 5G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g73.jpg' },
      { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto G62 5G', storage: '128 GB', price: 7500, image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g62-5g.jpg' },
      { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto E13', storage: '64 GB', price: 4200, image: getApiThumb('Motorola', 'Moto E13', 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-e13.jpg') },
      { brand: 'Motorola', series: 'Moto G & E Series', model: 'Motorola Moto E22s', storage: '64 GB', price: 3900, image: getApiThumb('Motorola', 'Moto E22', 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-e22s.jpg') },
    ],
  },
];

// 8. NOTHING SERIES
const nothingSeries = [
  {
    id: 'nothing-phone',
    slug: 'nothing-phone-series',
    name: 'Nothing Phone Series',
    brand: 'Nothing',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg',
    description: 'Nothing Phone (2), Phone (1), Phone (2a) Plus, Phone (2a)',
    pattern: '/phone\\s*\\(/i',
    defaultModels: [
      { brand: 'Nothing', series: 'Nothing Phone Series', model: 'Nothing Phone (2)', storage: '256 GB', price: 27000, image: getApiThumb('Nothing', 'Phone (2)', 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2.jpg') },
      { brand: 'Nothing', series: 'Nothing Phone Series', model: 'Nothing Phone (1)', storage: '128 GB', price: 16500, image: getApiThumb('Nothing', 'Phone (1)', 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-1.jpg') },
      { brand: 'Nothing', series: 'Nothing Phone Series', model: 'Nothing Phone (2a) Plus', storage: '256 GB', price: 21000, image: getApiThumb('Nothing', 'Phone (2a) Plus', 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a-plus.jpg') },
      { brand: 'Nothing', series: 'Nothing Phone Series', model: 'Nothing Phone (2a)', storage: '128 GB', price: 17500, image: getApiThumb('Nothing', 'Phone (2a)', 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg') },
    ],
  },
  {
    id: 'cmf-nothing',
    slug: 'cmf-by-nothing-series',
    name: 'CMF by Nothing Series',
    brand: 'Nothing',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/cmf-phone-1.jpg',
    description: 'CMF Phone 1 by Nothing',
    pattern: '/cmf/i',
    defaultModels: [
      { brand: 'Nothing', series: 'CMF by Nothing Series', model: 'CMF Phone 1 by Nothing', storage: '128 GB', price: 12000, image: getApiThumb('Nothing', 'CMF Phone 1', 'https://fdn2.gsmarena.com/vv/bigpic/cmf-phone-1.jpg') },
    ],
  },
];

// Helper to stringify series definitions into clean TypeScript
function formatSeriesTs(seriesList) {
  return seriesList.map(s => {
    const modelsStr = s.defaultModels.map(m => 
      `        { brand: '${m.brand}', series: '${m.series.replace(/'/g, "\\'")}', model: '${m.model.replace(/'/g, "\\'")}', storage: '${m.storage}', price: ${m.price}, image: '${m.image}' },`
    ).join('\n');

    return `    {
      id: '${s.id}',
      slug: '${s.slug}',
      name: '${s.name}',
      brand: '${s.brand}',
      image: '${s.image}',
      description: '${s.description.replace(/'/g, "\\'")}',
      pattern: ${s.pattern},
      defaultModels: [
${modelsStr}
      ],
    },`;
  }).join('\n');
}

// Generate the new BRAND_SERIES_DEFINITIONS content
const newBrandSeriesParts = `  oneplus: [
${formatSeriesTs(oneplusSeries)}
  ],

  xiaomi: [
${formatSeriesTs(xiaomiSeries)}
  ],

  realme: [
${formatSeriesTs(realmeSeries)}
  ],

  oppo: [
${formatSeriesTs(oppoSeries)}
  ],

  vivo: [
${formatSeriesTs(vivoSeries)}
  ],

  google: [
${formatSeriesTs(googleSeries)}
  ],

  motorola: [
${formatSeriesTs(motorolaSeries)}
  ],

  nothing: [
${formatSeriesTs(nothingSeries)}
  ],
};`;

// Read current brandSeriesCatalog.ts
let catalogContent = fs.readFileSync('src/data/brandSeriesCatalog.ts', 'utf8');

// Replace from '  oneplus: [' up to '};' before groupModelsBySeries
const oneplusStart = catalogContent.indexOf('  oneplus: [');
const defsEnd = catalogContent.indexOf('export function groupModelsBySeries');
const before = catalogContent.slice(0, oneplusStart);
const after = catalogContent.slice(defsEnd);

// Assemble updated brandSeriesCatalog.ts
const updatedCatalog = before + newBrandSeriesParts + '\n\n' + after;
fs.writeFileSync('src/data/brandSeriesCatalog.ts', updatedCatalog, 'utf8');
console.log('Successfully updated src/data/brandSeriesCatalog.ts!');

// 2. Now collect ALL models from ALL series to update SellPhone.tsx MASTER_MODEL_CATALOG
const allNewModels = [
  ...oneplusSeries.flatMap(s => s.defaultModels),
  ...xiaomiSeries.flatMap(s => s.defaultModels),
  ...realmeSeries.flatMap(s => s.defaultModels),
  ...oppoSeries.flatMap(s => s.defaultModels),
  ...vivoSeries.flatMap(s => s.defaultModels),
  ...googleSeries.flatMap(s => s.defaultModels),
  ...motorolaSeries.flatMap(s => s.defaultModels),
  ...nothingSeries.flatMap(s => s.defaultModels),
];

console.log(`Total new default models curated across brands: ${allNewModels.length}`);

// Read SellPhone.tsx
let sellPhoneContent = fs.readFileSync('src/pages/SellPhone.tsx', 'utf8');

// Load Apple and Samsung models from brandSeriesCatalog.ts defaultModels to ensure completeness
// Read Apple & Samsung defaultModels from catalog
const appleSamsungMatches = [...catalogContent.matchAll(/\{\s*brand:\s*'(Apple|Samsung)'[^}]+\}/g)].map(m => m[0]);
console.log(`Found ${appleSamsungMatches.length} existing Apple & Samsung catalog items`);

// Build a clean unified MASTER_MODEL_CATALOG
// Keep existing Apple & Samsung models from SellPhone.tsx
const masterStart = sellPhoneContent.indexOf('export const MASTER_MODEL_CATALOG = [');
const masterEnd = sellPhoneContent.indexOf('];\n\nconst STORAGE_OPTIONS', masterStart);

// Let's parse existing items from MASTER_MODEL_CATALOG
const masterBlock = sellPhoneContent.slice(masterStart, masterEnd);
// Extract Apple and Samsung items
const appleSamsungItems = [];
const itemRegex = /\{\s*brand:\s*'(Apple|Samsung)',[\s\S]*?\},/g;
let match;
while ((match = itemRegex.exec(masterBlock)) !== null) {
  appleSamsungItems.push(match[0].trim());
}
console.log(`Retained ${appleSamsungItems.length} Apple & Samsung items from MASTER_MODEL_CATALOG`);

// Format all new models
const newModelLines = allNewModels.map(m => 
  `  { brand: '${m.brand}', series: '${m.series.replace(/'/g, "\\'")}', model: '${m.model.replace(/'/g, "\\'")}', storage: '${m.storage}', price: ${m.price}, image: '${m.image}' },`
);

const combinedMasterCatalog = `export const MASTER_MODEL_CATALOG = [\n` + 
  appleSamsungItems.map(it => '  ' + it).join('\n') + '\n' +
  newModelLines.join('\n') + '\n];\n\n';

const storageOptionsMarker = 'const STORAGE_OPTIONS = [';
const storageOptionsIndex = sellPhoneContent.indexOf(storageOptionsMarker);
if (storageOptionsIndex === -1) {
  throw new Error('Could not find STORAGE_OPTIONS marker');
}
sellPhoneContent = sellPhoneContent.slice(0, masterStart) + combinedMasterCatalog + sellPhoneContent.slice(storageOptionsIndex);

// Also update BRAND_TILES in SellPhone.tsx
const brandTilesOld = `const BRAND_TILES = [
  { name: 'Apple', logo: getCleanBrandLogo('Apple'), count: '30+ Models' },
  { name: 'Samsung', logo: getCleanBrandLogo('Samsung'), count: '45+ Models' },
  { name: 'OnePlus', logo: getCleanBrandLogo('OnePlus'), count: '25+ Models' },
  { name: 'Xiaomi', logo: getCleanBrandLogo('Xiaomi'), count: '50+ Models' },
  { name: 'Realme', logo: getCleanBrandLogo('Realme'), count: '35+ Models' },
  { name: 'Vivo', logo: getCleanBrandLogo('Vivo'), count: '40+ Models' },
];`;

const brandTilesNew = `const BRAND_TILES = [
  { name: 'Apple', logo: getCleanBrandLogo('Apple'), count: '46+ Models' },
  { name: 'Samsung', logo: getCleanBrandLogo('Samsung'), count: '105+ Models' },
  { name: 'OnePlus', logo: getCleanBrandLogo('OnePlus'), count: '40+ Models' },
  { name: 'Xiaomi', logo: getCleanBrandLogo('Xiaomi'), count: '60+ Models' },
  { name: 'Realme', logo: getCleanBrandLogo('Realme'), count: '40+ Models' },
  { name: 'Vivo', logo: getCleanBrandLogo('Vivo'), count: '45+ Models' },
  { name: 'Oppo', logo: getCleanBrandLogo('Oppo'), count: '35+ Models' },
  { name: 'Google', logo: getCleanBrandLogo('Google'), count: '25+ Models' },
  { name: 'Motorola', logo: getCleanBrandLogo('Motorola'), count: '30+ Models' },
  { name: 'Nothing', logo: getCleanBrandLogo('Nothing'), count: '10+ Models' },
];`;

if (sellPhoneContent.includes(brandTilesOld)) {
  sellPhoneContent = sellPhoneContent.replace(brandTilesOld, brandTilesNew);
  console.log('Updated BRAND_TILES in SellPhone.tsx!');
}

fs.writeFileSync('src/pages/SellPhone.tsx', sellPhoneContent, 'utf8');
console.log('Successfully updated src/pages/SellPhone.tsx!');

// 3. Update SellBrandPage.tsx BRAND_DETAILS to include all brands cleanly
let brandPageContent = fs.readFileSync('src/pages/SellBrandPage.tsx', 'utf8');

const brandDetailsOldMatch = brandPageContent.match(/const BRAND_DETAILS: Record<[\s\S]*?> = \{([\s\S]*?)\n\};/);
if (brandDetailsOldMatch) {
  const brandDetailsNew = `const BRAND_DETAILS: Record<
  string,
  { logo: string; tagline: string; desc: string; count: string }
> = {
  apple: {
    logo: getCleanBrandLogo('apple'),
    tagline: 'Sell Old Apple iPhone Online for Instant Cash at Doorstep',
    desc: 'Get highest guaranteed spot cash for your old Apple iPhone in Lucknow. Free doorstep pickup & instant UPI payment across all Lucknow localities.',
    count: '46+ iPhone Models',
  },
  samsung: {
    logo: getCleanBrandLogo('samsung'),
    tagline: 'Sell Old Samsung Galaxy Mobile Online at Best Resale Valuation',
    desc: 'Sell used Samsung Galaxy S, Z Fold/Flip, A & M series smartphones online in Lucknow for maximum spot payment.',
    count: '105+ Galaxy Models',
  },
  oneplus: {
    logo: getCleanBrandLogo('oneplus'),
    tagline: 'Sell Old OnePlus Smartphone Online at Highest Cash Rates',
    desc: 'Sell old OnePlus 13, 12, 11, Nord & Open series phones at best doorstep cash rates in Lucknow with instant data wipe.',
    count: '40+ OnePlus Models',
  },
  xiaomi: {
    logo: getCleanBrandLogo('xiaomi'),
    tagline: 'Get Maximum Resale Cash Value for Your Old Xiaomi / Redmi Phone in Lucknow',
    desc: 'Sell used Xiaomi Mi, Redmi Note & POCO smartphones online in Lucknow for instant spot cash & 100% free doorstep pickup across Gomti Nagar, Hazratganj, Indira Nagar & Aliganj.',
    count: '60+ Xiaomi Models',
  },
  redmi: {
    logo: getCleanBrandLogo('redmi'),
    tagline: 'Sell Old Redmi Mobile Phone Online for Instant Cash',
    desc: 'Sell used Redmi Note 13, 12, 11 & C series phones online in Lucknow for instant spot payment.',
    count: '40+ Redmi Models',
  },
  poco: {
    logo: getCleanBrandLogo('poco'),
    tagline: 'Sell Old POCO Gaming Phone Online at Best Resale Price',
    desc: 'Sell used POCO F, X, M & C series performance smartphones with zero hassle and instant cash at doorstep.',
    count: '25+ POCO Models',
  },
  realme: {
    logo: getCleanBrandLogo('realme'),
    tagline: 'Sell Old Realme Mobile Phone Online at Best Price',
    desc: 'Sell used Realme GT, Number Pro, Narzo & C series phones online in Lucknow for instant cash in hand.',
    count: '40+ Realme Models',
  },
  oppo: {
    logo: getCleanBrandLogo('oppo'),
    tagline: 'Sell Old Oppo Mobile Phone Online for Instant Cash',
    desc: 'Sell old Oppo Find, Reno, F & A series mobiles in Lucknow with zero hassle and instant GPay/PhonePe transfer.',
    count: '35+ Oppo Models',
  },
  vivo: {
    logo: getCleanBrandLogo('vivo'),
    tagline: 'Sell Old Vivo Mobile Online for Instant Spot Payout',
    desc: 'Sell used Vivo X, V, T & Y series smartphones in Lucknow with free doorstep pickup & guaranteed valuation.',
    count: '45+ Vivo Models',
  },
  iqoo: {
    logo: getCleanBrandLogo('iqoo'),
    tagline: 'Sell Old iQOO Gaming Smartphone Online at Best Value',
    desc: 'Sell used iQOO 12, 11, Neo & Z series performance phones for instant doorstep payment in Lucknow.',
    count: '15+ iQOO Models',
  },
  google: {
    logo: getCleanBrandLogo('google'),
    tagline: 'Sell Old Google Pixel Phone Online at Best Resale Value',
    desc: 'Sell used Google Pixel 9, 8, 7, 6 & Fold series phones in Lucknow at highest market value.',
    count: '25+ Pixel Models',
  },
  motorola: {
    logo: getCleanBrandLogo('motorola'),
    tagline: 'Sell Old Motorola Moto Phone Online for Instant Cash',
    desc: 'Sell used Motorola Razr, Edge & Moto G series smartphones in Lucknow for maximum spot payment.',
    count: '30+ Moto Models',
  },
  moto: {
    logo: getCleanBrandLogo('motorola'),
    tagline: 'Sell Old Moto Smartphone Online for Quick Doorstep Cash',
    desc: 'Sell used Moto G, Edge & Razr series phones online in Lucknow with free doorstep pickup.',
    count: '30+ Moto Models',
  },
  nothing: {
    logo: getCleanBrandLogo('nothing'),
    tagline: 'Sell Old Nothing Phone Online at Top Guaranteed Price',
    desc: 'Sell used Nothing Phone (2), (1), (2a) & CMF Phone 1 in Lucknow for instant spot cash.',
    count: '10+ Nothing Models',
  },
};`;

  brandPageContent = brandPageContent.replace(brandDetailsOldMatch[0], brandDetailsNew);
  
  // Replace fallback unsplash logo with getCleanBrandLogo
  brandPageContent = brandPageContent.replace(
    `logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=150&auto=format&fit=crop&q=80'`,
    `logo: getCleanBrandLogo(brandDisplayName)`
  );

  fs.writeFileSync('src/pages/SellBrandPage.tsx', brandPageContent, 'utf8');
  console.log('Successfully updated src/pages/SellBrandPage.tsx BRAND_DETAILS!');
}
