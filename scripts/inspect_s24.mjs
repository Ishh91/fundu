async function check() {
  const res = await fetch('https://www.cashify.in/sell-old-mobile-phone/used-samsung-galaxy-s24-ultra-5g-12-gb-256-gb', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const nextFPushes = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
  const fullPayload = nextFPushes.map(m => m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')).join('\n');
  const match = fullPayload.match(/"productName":"([^"]+)".*?"getUpTo":\s*(\d+)/);
  if (match) {
    console.log('S24 Ultra Variant:', match[1], 'Cashify Price: ₹' + match[2], 'Fundu (+1000): ₹' + (Number(match[2]) + 1000));
  }
}
check();
