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

// 1. Full Redmi Note 11 Models
const redmiNote11Models = [
  { brand: 'Xiaomi', series: 'Redmi Note 11 Series', model: 'Redmi Note 11 Pro+ 5G', storage: '128 GB', price: 10500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-plus-5g.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 11 Series', model: 'Redmi Note 11 Pro 5G', storage: '128 GB', price: 9500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-global.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 11 Series', model: 'Redmi Note 11 Pro', storage: '128 GB', price: 9000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11-pro-global.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 11 Series', model: 'Redmi Note 11S 5G', storage: '128 GB', price: 8500, image: getApiThumb('Xiaomi', 'Note 11S', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11s-5g.jpg') },
  { brand: 'Xiaomi', series: 'Redmi Note 11 Series', model: 'Redmi Note 11S', storage: '128 GB', price: 8000, image: getApiThumb('Xiaomi', 'Note 11S', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11s.jpg') },
  { brand: 'Xiaomi', series: 'Redmi Note 11 Series', model: 'Redmi Note 11T 5G', storage: '128 GB', price: 8200, image: getApiThumb('Xiaomi', 'Note 11T', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11t-5g.jpg') },
  { brand: 'Xiaomi', series: 'Redmi Note 11 Series', model: 'Redmi Note 11', storage: '64 GB', price: 7000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 11 Series', model: 'Redmi Note 11E Pro', storage: '128 GB', price: 8000, image: getApiThumb('Xiaomi', 'Note 11E', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11e-pro.jpg') },
  { brand: 'Xiaomi', series: 'Redmi Note 11 Series', model: 'Redmi Note 11R', storage: '128 GB', price: 7500, image: getApiThumb('Xiaomi', 'Note 11R', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-11r.jpg') },
];

// 2. Full Redmi Note 12 Models
const redmiNote12Models = [
  { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12 Pro+ 5G', storage: '256 GB', price: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro-plus.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12 Pro 5G', storage: '128 GB', price: 12500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12 5G', storage: '128 GB', price: 10000, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12 4G', storage: '128 GB', price: 8500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-4g.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12 Turbo', storage: '256 GB', price: 13500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-turbo.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12S', storage: '128 GB', price: 9000, image: getApiThumb('Xiaomi', 'Note 12S', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12s.jpg') },
  { brand: 'Xiaomi', series: 'Redmi Note 12 Series', model: 'Redmi Note 12R', storage: '128 GB', price: 8000, image: getApiThumb('Xiaomi', 'Note 12R', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12r.jpg') },
];

// 3. Full Redmi Note 13 Models
const redmiNote13Models = [
  { brand: 'Xiaomi', series: 'Redmi Note 13 Series', model: 'Redmi Note 13 Pro+ 5G', storage: '256 GB', price: 20500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 13 Series', model: 'Redmi Note 13 Pro 5G', storage: '128 GB', price: 16500, image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-5g.jpg' },
  { brand: 'Xiaomi', series: 'Redmi Note 13 Series', model: 'Redmi Note 13 5G', storage: '128 GB', price: 12500, image: 'https://api.mobileapi.dev/devices/31521/thumb.png' },
  { brand: 'Xiaomi', series: 'Redmi Note 13 Series', model: 'Redmi Note 13 4G', storage: '128 GB', price: 10500, image: 'https://api.mobileapi.dev/devices/13590/thumb.png' },
  { brand: 'Xiaomi', series: 'Redmi Note 13 Series', model: 'Redmi Note 13R Pro', storage: '256 GB', price: 14000, image: getApiThumb('Xiaomi', 'Note 13R', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13r-pro.jpg') },
  { brand: 'Xiaomi', series: 'Redmi Note 13 Series', model: 'Redmi Note 13R', storage: '128 GB', price: 11000, image: getApiThumb('Xiaomi', 'Note 13R', 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13r.jpg') },
];

console.log('Redmi Note 11 models count:', redmiNote11Models.length);
console.log('Redmi Note 12 models count:', redmiNote12Models.length);
console.log('Redmi Note 13 models count:', redmiNote13Models.length);
