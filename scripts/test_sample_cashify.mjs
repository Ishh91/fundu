async function testVariantPrices() {
  const testVariants = [
    '/sell-old-mobile-phone/used-apple-iphone-15-pro-max-8-gb-256-gb',
    '/sell-old-mobile-phone/used-apple-iphone-15-pro-max-8-gb-512-gb',
    '/sell-old-mobile-phone/used-apple-iphone-15-pro-max-8-gb-1-tb',
    '/sell-old-mobile-phone/used-apple-iphone-14-6-gb-128-gb',
    '/sell-old-mobile-phone/used-apple-iphone-13-4-gb-128-gb',
    '/sell-old-mobile-phone/used-apple-iphone-12-4-gb-64-gb',
    '/sell-old-mobile-phone/used-apple-iphone-11-4-gb-64-gb',
    '/sell-old-mobile-phone/used-samsung-galaxy-s24-ultra-5g-12-gb-256-gb',
    '/sell-old-mobile-phone/used-samsung-galaxy-s23-ultra-5g-12-gb-256-gb',
    '/sell-old-mobile-phone/used-oneplus-12-12-gb-256-gb',
    '/sell-old-mobile-phone/used-nothing-phone-2-8-gb-128-gb',
    '/sell-old-mobile-phone/used-google-pixel-8-pro-12-gb-128-gb',
  ];

  for (const v of testVariants) {
    try {
      const res = await fetch(`https://www.cashify.in${v}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });
      const text = await res.text();
      const nextFPushes = [...text.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
      const fullPayload = nextFPushes.map(m => m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')).join('\n');

      const match = fullPayload.match(/"productName":"([^"]+)".*?"getUpTo":\s*(\d+)/);
      if (match) {
        const cashifyPrice = Number(match[2]);
        const funduPrice = cashifyPrice + 1000;
        console.log(`[CASHIFY] ${match[1]} -> Cashify: ₹${cashifyPrice} | Fundu (+1000): ₹${funduPrice}`);
      } else {
        console.log(`[NO PRICE] ${v}`);
      }
    } catch (e) {
      console.log(`[ERR] ${v}:`, e.message);
    }
  }
}

testVariantPrices();
