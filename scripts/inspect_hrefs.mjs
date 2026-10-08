async function testVariantDetection() {
  const urls = [
    '/sell-old-mobile-phone/used-samsung-galaxy-s24-ultra',
    '/sell-old-mobile-phone/used-oneplus-12',
    '/sell-old-mobile-phone/used-google-pixel-8-pro',
  ];

  const GENERIC_POPULAR = new Set([
    '/sell-old-mobile-phone/used-apple-iphone-12',
    '/sell-old-mobile-phone/used-apple-iphone-11',
    '/sell-old-mobile-phone/used-samsung-galaxy-note-20-8-gb-256-gb',
    '/sell-old-mobile-phone/used-oneplus-9-pro-5g',
    '/sell-old-mobile-phone/used-redmi-note-4',
    '/sell-old-mobile-phone/used-iphone-6',
  ]);

  for (const u of urls) {
    const res = await fetch(`https://www.cashify.in${u}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const text = await res.text();
    const hrefs = Array.from(new Set([...text.matchAll(/href="(\/sell-old-mobile-phone\/used-[^"]+)"/g)].map(m => m[1])));
    const variants = hrefs.filter(h => !GENERIC_POPULAR.has(h) && h !== u && /-\d+-(?:gb|tb)/i.test(h));
    console.log(`URL: ${u} -> Found variants:`, variants);
  }
}

testVariantDetection();
