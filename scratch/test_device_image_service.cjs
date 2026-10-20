const key = '796f49e7850dc08f17c66c42f687e00d46ec2ba0';

async function testResolve(brand, model) {
  let queryTerm = model;
  if (!model.toLowerCase().startsWith(brand.toLowerCase())) {
    queryTerm = `${brand} ${model}`;
  }

  try {
    const searchParams = new URLSearchParams({
      key,
      q: queryTerm,
      limit: '10'
    });
    const res = await fetch(`https://api.mobileapi.dev/devices/autocomplete/?${searchParams.toString()}`);
    const results = await res.json();
    if (Array.isArray(results) && results.length > 0) {
      const modelLower = model.toLowerCase();
      let best = results.find(r => 
        (r.name && r.name.toLowerCase() === modelLower) || 
        (r.full_name && r.full_name.toLowerCase().includes(modelLower))
      );
      if (!best) best = results[0];
      const thumbUrl = `https://api.mobileapi.dev/devices/${best.id}/thumb.png`;
      console.log(`[Option A: MobileAPI] ${brand} ${model} -> MATCH: "${best.full_name}" (ID: ${best.id}) URL: ${thumbUrl}`);
      return thumbUrl;
    } else {
      console.log(`[Option A: MobileAPI] ${brand} ${model} -> No result found, falling back to Option B`);
    }
  } catch (err) {
    console.log(`[Option A: MobileAPI Error]:`, err.message);
  }
  return null;
}

async function run() {
  await testResolve('Samsung', 'Galaxy S25');
  await testResolve('Samsung', 'Galaxy S24 FE');
  await testResolve('OnePlus', 'Nord 4');
  await testResolve('Xiaomi', '14 Ultra');
  await testResolve('Realme', 'GT 6T');
  await testResolve('Vivo', 'V30 Pro');
  await testResolve('Apple', 'iPhone 15 Plus');
  await testResolve('Google', 'Pixel 8 Pro');
}
run();
