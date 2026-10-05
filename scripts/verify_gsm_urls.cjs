const { execSync } = require('child_process');

// Candidate mapping of model to official GSMArena render slug
const TEST_CANDIDATES = [
  // Apple
  { model: 'Apple iPhone 16 Pro Max', file: 'apple-iphone-16-pro-max.jpg' },
  { model: 'Apple iPhone 16 Pro', file: 'apple-iphone-16-pro.jpg' },
  { model: 'Apple iPhone 16 Plus', file: 'apple-iphone-16.jpg' },
  { model: 'Apple iPhone 16', file: 'apple-iphone-16.jpg' },
  { model: 'Apple iPhone 15 Pro Max', file: 'apple-iphone-15-pro-max.jpg' },
  { model: 'Apple iPhone 15 Pro', file: 'apple-iphone-15-pro.jpg' },
  { model: 'Apple iPhone 15 Plus', file: 'apple-iphone-15-plus.jpg' },
  { model: 'Apple iPhone 15', file: 'apple-iphone-15.jpg' },
  { model: 'Apple iPhone 14 Pro Max', file: 'apple-iphone-14-pro-max.jpg' },
  { model: 'Apple iPhone 14 Pro', file: 'apple-iphone-14-pro.jpg' },
  { model: 'Apple iPhone 14 Plus', file: 'apple-iphone-14-plus.jpg' },
  { model: 'Apple iPhone 14', file: 'apple-iphone-14.jpg' },
  { model: 'Apple iPhone 13 Pro Max', file: 'apple-iphone-13-pro-max.jpg' },
  { model: 'Apple iPhone 13 Pro', file: 'apple-iphone-13-pro.jpg' },
  { model: 'Apple iPhone 13', file: 'apple-iphone-13.jpg' },
  { model: 'Apple iPhone 13 mini', file: 'apple-iphone-13-mini.jpg' },
  { model: 'Apple iPhone 12 Pro Max', file: 'apple-iphone-12-pro-max-.jpg' },
  { model: 'Apple iPhone 12 Pro', file: 'apple-iphone-12-pro--.jpg' },
  { model: 'Apple iPhone 12', file: 'apple-iphone-12.jpg' },
  { model: 'Apple iPhone 12 mini', file: 'apple-iphone-12-mini.jpg' },
  { model: 'Apple iPhone 11 Pro Max', file: 'apple-iphone-11-pro-max.jpg' },
  { model: 'Apple iPhone 11 Pro', file: 'apple-iphone-11-pro.jpg' },
  { model: 'Apple iPhone 11', file: 'apple-iphone-11.jpg' },
  { model: 'Apple iPhone XS Max', file: 'apple-iphone-xs-max-new1.jpg' },
  { model: 'Apple iPhone XS', file: 'apple-iphone-xs-new.jpg' },
  { model: 'Apple iPhone XR', file: 'apple-iphone-xr-new.jpg' },
  { model: 'Apple iPhone X', file: 'apple-iphone-x.jpg' },

  // Samsung
  { model: 'Samsung Galaxy S24 Ultra', file: 'samsung-galaxy-s24-ultra-5g-sm-s928-stylus.jpg' },
  { model: 'Samsung Galaxy S24+', file: 'samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
  { model: 'Samsung Galaxy S24', file: 'samsung-galaxy-s24-5g-sm-s921.jpg' },
  { model: 'Samsung Galaxy S24 FE', file: 'samsung-galaxy-s24-fe.jpg' },
  { model: 'Samsung Galaxy S23 Ultra', file: 'samsung-galaxy-s23-ultra-5g.jpg' },
  { model: 'Samsung Galaxy S23+', file: 'samsung-galaxy-s23-plus-5g.jpg' },
  { model: 'Samsung Galaxy S23', file: 'samsung-galaxy-s23-5g.jpg' },
  { model: 'Samsung Galaxy S23 FE', file: 'samsung-galaxy-s23-fe.jpg' },
  { model: 'Samsung Galaxy Z Fold6', file: 'samsung-galaxy-z-fold6.jpg' },
  { model: 'Samsung Galaxy Z Flip6', file: 'samsung-galaxy-z-flip6.jpg' },
  { model: 'Samsung Galaxy Z Fold 5', file: 'samsung-galaxy-z-fold5.jpg' },
  { model: 'Samsung Galaxy Z Flip 5', file: 'samsung-galaxy-z-flip5.jpg' },
  { model: 'Samsung Galaxy A55 5G', file: 'samsung-galaxy-a55.jpg' },
  { model: 'Samsung Galaxy A35 5G', file: 'samsung-galaxy-a35.jpg' },
  { model: 'Samsung Galaxy A54 5G', file: 'samsung-galaxy-a54.jpg' },
  { model: 'Samsung Galaxy M55 5G', file: 'samsung-galaxy-m55.jpg' },
  { model: 'Samsung Galaxy M34 5G', file: 'samsung-galaxy-m34-5g.jpg' },

  // OnePlus
  { model: 'OnePlus 12', file: 'oneplus-12.jpg' },
  { model: 'OnePlus 12R', file: 'oneplus-12r.jpg' },
  { model: 'OnePlus 11', file: 'oneplus-11.jpg' },
  { model: 'OnePlus 11R', file: 'oneplus-ace2.jpg' },
  { model: 'OnePlus 10 Pro', file: 'oneplus-10-pro.jpg' },
  { model: 'OnePlus 9 Pro', file: 'oneplus-9-pro-.jpg' },
  { model: 'OnePlus 9', file: 'oneplus-9-.jpg' },
  { model: 'OnePlus Nord 4', file: 'oneplus-nord-4.jpg' },
  { model: 'OnePlus Nord 3', file: 'oneplus-nord-3r.jpg' },
  { model: 'OnePlus Nord 2T', file: 'oneplus-nord-2t.jpg' },
  { model: 'OnePlus Nord 2', file: 'oneplus-nord-2-5g.jpg' },
  { model: 'OnePlus Nord CE 4', file: 'oneplus-nord-ce4.jpg' },
  { model: 'OnePlus Nord CE 3 Lite', file: 'oneplus-nord-ce-3-lite.jpg' },
  { model: 'OnePlus Open', file: 'oneplus-open.jpg' },

  // Xiaomi / Redmi / Poco
  { model: 'Xiaomi 14 Ultra', file: 'xiaomi-14-ultra.jpg' },
  { model: 'Xiaomi 14', file: 'xiaomi-14.jpg' },
  { model: 'Redmi Note 13 Pro+', file: 'xiaomi-redmi-note-13-pro-plus.jpg' },
  { model: 'Redmi Note 13 Pro', file: 'xiaomi-redmi-note-13-pro-5g.jpg' },
  { model: 'Redmi Note 13', file: 'xiaomi-redmi-note-13.jpg' },
  { model: 'Redmi Note 12 Pro', file: 'xiaomi-redmi-note-12-pro-plus.jpg' },
  { model: 'Redmi Note 12', file: 'xiaomi-redmi-note-12-5g.jpg' },
  { model: 'POCO F6 Pro', file: 'xiaomi-poco-f6-pro.jpg' },
  { model: 'POCO F6', file: 'xiaomi-poco-f6.jpg' },
  { model: 'POCO X6 Pro', file: 'xiaomi-poco-x6-pro.jpg' },
  { model: 'POCO X6', file: 'xiaomi-poco-x6.jpg' },
  { model: 'POCO M6 Pro', file: 'xiaomi-poco-m6-pro.jpg' },

  // Vivo / iQOO
  { model: 'Vivo X200 Pro', file: 'vivo-x200-pro.jpg' },
  { model: 'Vivo X200', file: 'vivo-x200.jpg' },
  { model: 'Vivo X100 Pro', file: 'vivo-x100-pro.jpg' },
  { model: 'Vivo X100', file: 'vivo-x100.jpg' },
  { model: 'Vivo V40 Pro', file: 'vivo-v40-pro.jpg' },
  { model: 'Vivo V40', file: 'vivo-v40.jpg' },
  { model: 'Vivo V30 Pro', file: 'vivo-v30-pro.jpg' },
  { model: 'Vivo V30', file: 'vivo-v30.jpg' },
  { model: 'Vivo V29 Pro', file: 'vivo-v29-pro.jpg' },
  { model: 'Vivo V29', file: 'vivo-v29.jpg' },
  { model: 'Vivo T3 Pro 5G', file: 'vivo-t3-pro.jpg' },
  { model: 'iQOO 12', file: 'vivo-iqoo12.jpg' },
  { model: 'iQOO Neo 9 Pro', file: 'vivo-iqoo-neo9-pro.jpg' },
  { model: 'iQOO Neo 7 Pro', file: 'vivo-iqoo-neo-7-pro.jpg' },
  { model: 'iQOO Z9', file: 'vivo-iqoo-z9.jpg' },

  // Realme
  { model: 'Realme GT 6', file: 'realme-gt-6t.jpg' },
  { model: 'Realme 13 Pro+', file: 'realme-13-pro-plus.jpg' },
  { model: 'Realme 12 Pro+', file: 'realme-12-pro-plus.jpg' },
  { model: 'Realme 11 Pro+', file: 'realme-11-pro-plus.jpg' },
  { model: 'Realme P1 Pro', file: 'realme-p1-pro.jpg' },

  // Google Pixel
  { model: 'Pixel 9 Pro XL', file: 'google-pixel-9-pro-xl.jpg' },
  { model: 'Pixel 9 Pro', file: 'google-pixel-9-pro.jpg' },
  { model: 'Pixel 9', file: 'google-pixel-9.jpg' },
  { model: 'Pixel 8 Pro', file: 'google-pixel-8-pro.jpg' },
  { model: 'Pixel 8a', file: 'google-pixel-8a.jpg' },
  { model: 'Pixel 8', file: 'google-pixel-8.jpg' },
  { model: 'Pixel 7 Pro', file: 'google-pixel-7-pro.jpg' },
  { model: 'Pixel 7a', file: 'google-pixel-7a.jpg' },
  { model: 'Pixel 7', file: 'google-pixel-7.jpg' },

  // Motorola
  { model: 'Motorola Edge 50 Ultra', file: 'motorola-edge-50-ultra.jpg' },
  { model: 'Motorola Edge 50 Pro', file: 'motorola-edge-50-pro.jpg' },
  { model: 'Motorola Edge 40', file: 'motorola-edge-40.jpg' },
  { model: 'Moto G85 5G', file: 'motorola-moto-g85.jpg' },
  { model: 'Moto G84', file: 'motorola-moto-g84.jpg' },

  // Oppo
  { model: 'Oppo Reno 12 Pro', file: 'oppo-reno12-pro.jpg' },
  { model: 'Oppo Reno 12', file: 'oppo-reno12.jpg' },
  { model: 'Oppo Reno 11 Pro', file: 'oppo-reno11-pro.jpg' },
  { model: 'Oppo Find X7 Ultra', file: 'oppo-find-x7-ultra.jpg' },

  // Nothing
  { model: 'Nothing Phone (2a)', file: 'nothing-phone-2a.jpg' },
  { model: 'Nothing Phone (2)', file: 'nothing-phone-2.jpg' },
  { model: 'Nothing Phone (1)', file: 'nothing-phone-1.jpg' },
  { model: 'CMF Phone 1', file: 'cmf-phone-1.jpg' }
];

console.log(`Testing ${TEST_CANDIDATES.length} URLs using curl.exe...`);
let passed = 0;
let failed = 0;
const results = [];

for (const item of TEST_CANDIDATES) {
  const url = `https://fdn2.gsmarena.com/vv/bigpic/${item.file}`;
  try {
    const cmd = `curl.exe -s -o nul -w "%{http_code}" "${url}"`;
    const code = execSync(cmd).toString().trim();
    if (code === '200') {
      passed++;
      results.push({ ...item, url, status: 200 });
    } else {
      failed++;
      console.log(`FAILED (${code}): ${item.model} -> ${url}`);
      results.push({ ...item, url, status: code });
    }
  } catch (err) {
    failed++;
    console.log(`ERROR: ${item.model} -> ${url}`, err.message);
  }
}

console.log(`\nResults: ${passed} PASSED, ${failed} FAILED out of ${TEST_CANDIDATES.length}`);
