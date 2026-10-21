const https = require('https');

const candidates = [
  { name: 'Google Pixel 2 XL', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-xl2.jpg' },
  { name: 'Google Pixel 3 XL', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3-xl.jpg' },
  { name: 'Google Pixel 3a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3a.jpg' },
  { name: 'Google Pixel 3a XL', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3a-xl.jpg' },
  { name: 'Google Pixel 4 XL', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-4-xl.jpg' },
  { name: 'Google Pixel 4a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-4a.jpg' },
  { name: 'Google Pixel 5', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-5-5g.jpg' },
  { name: 'Google Pixel 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6.jpg' },
  { name: 'Google Pixel 6 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6-pro.jpg' },
  { name: 'Google Pixel 6a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6a.jpg' },
  { name: 'Google Pixel 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7.jpg' },
  { name: 'Google Pixel 7 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-pro.jpg' },
  { name: 'Google Pixel 7a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg' },
  { name: 'Google Pixel 8', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg' },
  { name: 'Google Pixel 8 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg' },
  { name: 'Google Pixel 8a', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8a.jpg' },
  { name: 'Google Pixel 9', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9.jpg' },
  { name: 'Google Pixel 9 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-.jpg' },
  { name: 'Google Pixel 9 Pro XL', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-xl.jpg' },
  { name: 'Google Pixel 9 Pro Fold', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-fold.jpg' },
  { name: 'Google Pixel Fold', url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-fold.jpg' },
];

function check(item) {
  return new Promise((resolve) => {
    const u = new URL(item.url);
    const req = https.request(
      {
        method: 'HEAD',
        host: u.hostname,
        path: u.pathname + u.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 4000,
      },
      (res) => {
        resolve({ ...item, status: res.statusCode });
      }
    );
    req.on('error', () => resolve({ ...item, status: 500 }));
    req.end();
  });
}

Promise.all(candidates.map(check)).then((results) => {
  results.forEach((r) => {
    console.log(`${r.status === 200 ? '✅ 200' : '❌ ' + r.status} [${r.name}] ${r.url}`);
  });
});
