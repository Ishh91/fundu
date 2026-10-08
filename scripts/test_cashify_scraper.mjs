const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

async function extractVariantsFromModelPage(modelUrl) {
  try {
    const text = await fetchPage(`https://www.cashify.in${modelUrl}`);
    const nextFPushes = [...text.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
    const fullPayload = nextFPushes.map(m => m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')).join('\n');

    // Look for product details
    const productDetailMatch = fullPayload.match(/"productName":"([^"]+)"[^{}]*?"getUpTo":\s*(\d+)/);
    const results = [];
    if (productDetailMatch) {
      results.push({
        name: productDetailMatch[1],
        cashifyPrice: Number(productDetailMatch[2]),
        url: modelUrl
      });
    }

    // Look for all variant URLs linked on this page
    const variantHrefs = [...text.matchAll(/href="(\/sell-old-mobile-phone\/used-[^"]+)"/g)].map(m => m[1]);
    const siblingVariants = Array.from(new Set(variantHrefs)).filter(h => h !== modelUrl && h.split('/').pop().startsWith(modelUrl.split('/').pop().split('-').slice(0, 4).join('-')));
    
    return { current: results[0] || null, siblings: siblingVariants };
  } catch (e) {
    return { current: null, siblings: [] };
  }
}

async function runTest() {
  console.log('Testing extraction on Apple model...');
  const res = await extractVariantsFromModelPage('/sell-old-mobile-phone/used-apple-iphone-14-6-gb-128-gb');
  console.log('Current:', res.current);
  console.log('Siblings found:', res.siblings);
}

runTest();
