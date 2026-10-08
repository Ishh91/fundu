async function checkVariantPrice() {
  const url = 'https://www.cashify.in/sell-old-mobile-phone/used-samsung-galaxy-a14-5g-4-gb-64-gb';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  });
  const text = await res.text();
  const nextFPushes = [...text.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
  const fullPayload = nextFPushes.map(m => m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')).join('\n');

  const match = fullPayload.match(/"productName":"([^"]+)".*?"getUpTo":\s*(\d+)/);
  if (match) {
    console.log(`FOUND: ${match[1]} -> getUpTo: ₹${match[2]}`);
  } else {
    const pMatch = fullPayload.match(/"getUpTo":\s*(\d+)/);
    console.log('getUpTo fallback:', pMatch ? pMatch[1] : 'not found');
  }
}

checkVariantPrice();
