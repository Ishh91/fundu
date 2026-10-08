async function testParentToVariant() {
  const parentUrl = '/sell-old-mobile-phone/used-samsung-galaxy-a14-5g';
  const res = await fetch(`https://www.cashify.in${parentUrl}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const text = await res.text();

  // Find all variants that start with the parent url
  const aRegex = /href="(\/sell-old-mobile-phone\/used-samsung-galaxy-a14-5g-[^"]+)"/g;
  const variants = Array.from(new Set([...text.matchAll(aRegex)].map(m => m[1])));
  console.log('Variants found for A14 5G:', variants);

  for (const v of variants) {
    const vRes = await fetch(`https://www.cashify.in${v}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const vText = await vRes.text();
    const nextFPushes = [...vText.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
    const fullPayload = nextFPushes.map(m => m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')).join('\n');
    const match = fullPayload.match(/"productName":"([^"]+)".*?"getUpTo":\s*(\d+)/);
    if (match) {
      console.log(`  -> ${match[1]} | Cashify: ₹${match[2]} | Fundu (+1000): ₹${Number(match[2]) + 1000}`);
    }
  }
}

testParentToVariant();
