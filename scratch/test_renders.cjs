const urls = [
  // Apple
  'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16e.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-plus.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro-max.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro-max.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-11-pro-max.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-8-plus.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-7-plus.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-7.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-6-plus.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-5se.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-pro-13-2024.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-109-2022.jpg',

  // Samsung
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-fe.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-plus-5g-.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-ultra-5g-r.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s20-5g-r.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s10-lite.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s9-plus-.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s9-.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s8-plus-.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s8-.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip4.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note20-ultra-5g-.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note10-lite.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-note-8.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a8-2018.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a8-star.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a24-4g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a7-2018.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a6-plus-2018.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a6-2018.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a53-5g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a32-4g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a12.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a51.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a80.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a50.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a30s.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a20s.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a10s.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m55-5g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m35.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m15-5g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f34-5g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m14-5g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f14-5g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m04.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m33-5g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f23-5g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m13-4g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m52-5g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m42-5g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m02s.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-f41.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m31.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m21-2021.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m11.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m01s.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m01-core.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m40.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m30s.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m30.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m20.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m10s.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-duo.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-nxt.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j6.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j4-plus-sm-j415f.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j4.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j2-2018-sm-j250-.jpg',

  // OnePlus
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10r.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9rt-5g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7-pro.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t-pro-5g-mclaren.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-4.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4-lite.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-3.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce3-5g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce3-lite.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-2-lite-5g.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-open.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6t-mclaren.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6t.jpg',
  'https://fdn2.gsmarena.com/vv/bigpic/oneplus-3t.jpg'
];

async function check() {
  const bad = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.status !== 200) {
        bad.push({ status: res.status, url });
      }
    } catch (e) {
      bad.push({ error: e.message, url });
    }
  }
  console.log(`Checked ${urls.length} urls. Bad count:`, bad.length);
  if (bad.length) console.log('Bad URLs:', bad);
}
check();
