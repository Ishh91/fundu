const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('scripts/api_fetched_devices.json', 'utf8'));

function getApiThumb(brand, query, fallback) {
  const list = rawData[brand] || [];
  const q = query.toLowerCase().replace(/^(oneplus|xiaomi|redmi|poco|realme|oppo|vivo|google|motorola|moto|nothing)\s+/i, '').trim();
  for (const item of list) {
    const iname = item.name.toLowerCase();
    if (iname === q || (q.length > 2 && iname.includes(q)) || (iname.length > 2 && q.includes(iname))) {
      if (item.image_url) return item.image_url;
    }
  }
  return fallback;
}

// 1. UPDATE brandSeriesCatalog.ts
let catalogContent = fs.readFileSync('src/data/brandSeriesCatalog.ts', 'utf8');

// We will replace the Xiaomi series definition block to ensure redmi-note-11-series exists with full models
const xiaomiStart = catalogContent.indexOf('  xiaomi: [');
const realmeStart = catalogContent.indexOf('  realme: [');

if (xiaomiStart === -1 || realmeStart === -1) {
  console.error('Could not find boundaries for xiaomi series');
  process.exit(1);
}

const xiaomiNewBlock = `  xiaomi: [
    {
      id: 'xiaomi-mi-flagship',
      slug: 'xiaomi-mi-flagship-series',
      name: 'Xiaomi Mi / Flagship Series',
      brand: 'Xiaomi',
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg',
      description: 'Xiaomi 14 Ultra, 14, 14 Civi, 13 Pro, 13, 12 Pro, 11X',
      pattern: /\\b(xiaomi\\s*(14|13|12|11|10)|mi\\s*(11|10|9|8|mix|civi)|14\\s*civi|civi)\\b/i,
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
      pattern: /redmi\\s*note\\s*(14|13)/i,
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
      pattern: /redmi\\s*note\\s*12/i,
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
      pattern: /redmi\\s*note\\s*(11|10|9|8|7|6|5)/i,
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
      pattern: /redmi\\s*(\\d+|[ca]\\d+)/i,
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
      pattern: /poco\\s*[xf]/i,
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
      pattern: /poco\\s*[mc]/i,
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

  realme: [`;

catalogContent = catalogContent.slice(0, xiaomiStart) + xiaomiNewBlock + catalogContent.slice(realmeStart + '  realme: ['.length);
fs.writeFileSync('src/data/brandSeriesCatalog.ts', catalogContent, 'utf8');
console.log('Successfully updated xiaomi series in brandSeriesCatalog.ts with redmi-note-11-series!');
