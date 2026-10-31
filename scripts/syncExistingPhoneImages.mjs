// Script to sync clean official upright device studio renders into MongoDB master_phones
const API_BASE = 'https://fundu-tagr.onrender.com/api';

const MODEL_IMAGE_MAP = {
  // Apple iPhones
  'apple:iphone 16 pro max': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg',
  'apple:iphone 16 pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg',
  'apple:iphone 16 plus': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-plus.jpg',
  'apple:iphone 16': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg',
  'apple:iphone 15 pro max': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg',
  'apple:iphone 15 pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg',
  'apple:iphone 15 plus': 'https://api.mobileapi.dev/devices/37/thumb.png',
  'apple:iphone 15': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg',
  'apple:iphone 14 pro max': 'https://api.mobileapi.dev/devices/35/thumb.png',
  'apple:iphone 14 pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg',
  'apple:iphone 14 plus': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-plus.jpg',
  'apple:iphone 14': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg',
  'apple:iphone 13 pro max': 'https://api.mobileapi.dev/devices/33/thumb.png',
  'apple:iphone 13 pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro.jpg',
  'apple:iphone 13 mini': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-mini.jpg',
  'apple:iphone 13': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg',
  'apple:iphone 12 pro max': 'https://api.mobileapi.dev/devices/32/thumb.png',
  'apple:iphone 12 pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro.jpg',
  'apple:iphone 12 mini': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-mini.jpg',
  'apple:iphone 12': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12.jpg',
  'apple:iphone 11 pro max': 'https://api.mobileapi.dev/devices/30/thumb.png',
  'apple:iphone 11 pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11-pro.jpg',
  'apple:iphone 11': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11.jpg',
  'apple:iphone xr': 'https://api.mobileapi.dev/devices/842/thumb.png',
  'apple:iphone x': 'https://api.mobileapi.dev/devices/843/thumb.png',
  'apple:iphone xs max': 'https://api.mobileapi.dev/devices/840/thumb.png',
  'apple:iphone xs': 'https://api.mobileapi.dev/devices/841/thumb.png',
  'apple:iphone se': 'https://api.mobileapi.dev/devices/29322/thumb.png',

  // Samsung Galaxy
  'samsung:galaxy s25 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg',
  'samsung:galaxy s24 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928-stylus.jpg',
  'samsung:galaxy s24 plus': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg',
  'samsung:galaxy s24': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg',
  'samsung:galaxy s23 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg',
  'samsung:galaxy s23 5g': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg',
  'samsung:galaxy s23': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-5g.jpg',
  'samsung:galaxy s22 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-ultra-5g.jpg',
  'samsung:galaxy s22 5g': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-5g.jpg',
  'samsung:galaxy s22': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s22-5g.jpg',
  'samsung:galaxy s21 fe 5g': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-fe-5g.jpg',
  'samsung:galaxy s21 fe': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-fe-5g.jpg',
  'samsung:galaxy s21 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-ultra-5g-.jpg',
  'samsung:galaxy s21': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-5g.jpg',
  'samsung:galaxy z fold6': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg',
  'samsung:galaxy z flip6': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg',
  'samsung:galaxy z fold5': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5-5g.jpg',
  'samsung:galaxy z flip5': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5-5g.jpg',
  'samsung:galaxy a55 5g': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg',
  'samsung:galaxy a55': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg',
  'samsung:galaxy a54 5g': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg',
  'samsung:galaxy a54': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg',
  'samsung:galaxy a35 5g': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg',
  'samsung:galaxy a34 5g': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a34.jpg',
  'samsung:galaxy m34 5g': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m34-5g.jpg',
  'samsung:galaxy m34': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m34-5g.jpg',
  'samsung:galaxy note 20 ultra 5g': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-ultra-.jpg',
  'samsung:galaxy note 20 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-ultra-.jpg',
  'samsung:galaxy j7 prime': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-prime.jpg',
  'samsung:galaxy j7': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-2016.jpg',

  // OnePlus
  'oneplus:oneplus 13': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-13.jpg',
  'oneplus:oneplus 12': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
  'oneplus:oneplus 12r': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12r.jpg',
  'oneplus:oneplus 11 5g': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg',
  'oneplus:oneplus 11': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg',
  'oneplus:oneplus 11r': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-ace2.jpg',
  'oneplus:oneplus 10 pro': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg',
  'oneplus:oneplus 9 pro': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro-.jpg',
  'oneplus:oneplus 9': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-.jpg',
  'oneplus:oneplus 8 pro': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8-pro.jpg',
  'oneplus:oneplus 8': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8.jpg',
  'oneplus:oneplus 7t': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t-.jpg',
  'oneplus:oneplus 7 pro': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7-pro.jpg',
  'oneplus:oneplus nord ce 4 5g': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4-5g.jpg',
  'oneplus:oneplus nord ce 4': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4-5g.jpg',
  'oneplus:oneplus nord 4': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-4.jpg',
  'oneplus:oneplus nord 3': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-3.jpg',
  'oneplus:oneplus nord ce 3 lite 5g': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-3-lite.jpg',
  'oneplus:oneplus open': 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-open.jpg',

  // Xiaomi / Redmi
  'xiaomi:xiaomi 14 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg',
  'xiaomi:xiaomi 14': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14.jpg',
  'xiaomi:redmi note 13 pro+ 5g': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg',
  'xiaomi:redmi note 13 pro+': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus.jpg',
  'xiaomi:redmi note 13 pro 5g': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro.jpg',
  'xiaomi:redmi note 13': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-5g.jpg',
  'xiaomi:redmi note 12 pro 5g': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro.jpg',
  'xiaomi:redmi note 12 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro.jpg',
  'xiaomi:redmi note 10 pro max': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-10-pro-max.jpg',
  'xiaomi:redmi note 7 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-7-pro.jpg',
  'xiaomi:redmi note 4': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-4.jpg',

  // Realme
  'realme:realme gt 6 5g': 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt6.jpg',
  'realme:realme gt 6': 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt6.jpg',
  'realme:realme 12 pro+ 5g': 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg',
  'realme:realme 12 pro+': 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg',
  'realme:realme 11 pro+ 5g': 'https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro-plus.jpg',
  'realme:realme 11 pro+': 'https://fdn2.gsmarena.com/vv/bigpic/realme-11-pro-plus.jpg',

  // Vivo / iQOO
  'vivo:vivo x100 pro 5g': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg',
  'vivo:vivo x100 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg',
  'vivo:vivo v30 pro 5g': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg',
  'vivo:vivo v30 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg',
  'vivo:vivo t3 5g': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3.jpg',
  'iqoo:iqoo neo 9 pro 5g': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo9-pro.jpg',
  'iqoo:iqoo neo 9 pro': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo9-pro.jpg',
  'iqoo:iqoo 12 5g': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-12.jpg',
  'iqoo:iqoo 12': 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-12.jpg',

  // Nothing
  'nothing:nothing phone (2)': 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2.jpg',
  'nothing:nothing phone 2': 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2.jpg',
  'nothing:nothing phone (2a)': 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg',
  'nothing:nothing phone 2a': 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg',
  'nothing:nothing phone (1)': 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-1.jpg',

  // Google Pixel
  'google:pixel 9 pro xl': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-xl.jpg',
  'google:pixel 9 pro': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-.jpg',
  'google:pixel 9': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9.jpg',
  'google:pixel 8 pro': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',
  'google:pixel 8a': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8a.jpg',
  'google:pixel 8': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg',
  'google:pixel 7a': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg',
  'google:pixel 7 pro': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-pro-.jpg',
  'google:pixel 7': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-.jpg',
  'google:pixel 4a': 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-4a.jpg',

  // Poco
  'poco:poco x6 pro 5g': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg',
  'poco:poco x6 pro': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg',
  'poco:poco f6 5g': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f6.jpg',
  'poco:poco f1': 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-pocophone-f1.jpg',

  // Motorola
  'motorola:moto edge 50 pro 5g': 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
  'motorola:moto edge 50 pro': 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
  'motorola:moto g84 5g': 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g84.jpg',
  'motorola:moto g84': 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g84.jpg',
};

function getStudioRender(brand, model) {
  const b = (brand || '').toLowerCase().trim();
  const m = (model || '').toLowerCase().trim();
  const directKey = `${b}:${m}`;
  if (MODEL_IMAGE_MAP[directKey]) return MODEL_IMAGE_MAP[directKey];

  // Try stripping brand from model
  let strippedM = m;
  if (b && strippedM.startsWith(b)) {
    strippedM = strippedM.slice(b.length).trim();
  }
  const strippedKey = `${b}:${strippedM}`;
  if (MODEL_IMAGE_MAP[strippedKey]) return MODEL_IMAGE_MAP[strippedKey];

  // Try substring match in map
  for (const [k, url] of Object.entries(MODEL_IMAGE_MAP)) {
    const [kb, km] = k.split(':');
    if (kb === b && (m.includes(km) || km.includes(m) || strippedM.includes(km))) {
      return url;
    }
  }

  return null;
}

async function syncAllExistingPhoneImages() {
  console.log('1. Logging in as Admin...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@fundu.in', password: 'Admin@123456' }),
  });
  if (!loginRes.ok) {
    throw new Error('Failed to log in as admin: ' + (await loginRes.text()));
  }
  const { data: loginData } = await loginRes.json();
  const token = loginData.session.access_token;
  console.log('✅ Admin authenticated successfully.');

  console.log('2. Fetching existing master_phones from database...');
  const phonesRes = await fetch(`${API_BASE}/db/master_phones?limit=5000`);
  const { data: phones } = await phonesRes.json();
  console.log(`Found ${phones?.length || 0} phones in MongoDB.`);

  let updatedCount = 0;
  let alreadyCleanCount = 0;
  let noMatchCount = 0;

  for (const phone of phones || []) {
    const isUnsplash = phone.image_url && phone.image_url.includes('unsplash.com');
    const isMissing = !phone.image_url || phone.image_url.includes('777/thumb');

    if (isUnsplash || isMissing) {
      const cleanUrl = getStudioRender(phone.brand, phone.model);
      if (cleanUrl) {
        console.log(`[Updating] ${phone.brand} ${phone.model} -> ${cleanUrl}`);
        const patchRes = await fetch(`${API_BASE}/db/master_phones`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filters: [{ field: 'id', op: 'eq', value: phone.id }],
            values: { image_url: cleanUrl },
          }),
        });

        if (patchRes.ok) {
          updatedCount++;
        } else {
          console.warn(`Failed to update ${phone.id}:`, await patchRes.text());
        }
      } else {
        noMatchCount++;
        console.log(`[No clean match] ${phone.brand} ${phone.model}`);
      }
    } else {
      alreadyCleanCount++;
    }
  }

  console.log(`\n================================`);
  console.log(`✅ SYNC COMPLETE:`);
  console.log(`Updated with official renders: ${updatedCount}`);
  console.log(`Already clean: ${alreadyCleanCount}`);
  console.log(`No match: ${noMatchCount}`);
  console.log(`================================`);
}

syncAllExistingPhoneImages().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
