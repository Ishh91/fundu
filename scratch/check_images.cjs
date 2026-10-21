const fs = require('fs');

async function testCatalogImages() {
  const masterContent = fs.readFileSync('./src/data/masterModelCatalog.ts', 'utf8');
  const lines = masterContent.split('\n');
  const oneplusModels = [];
  for (const line of lines) {
    if (line.includes('brand: "OnePlus"') || line.includes("brand: 'OnePlus'")) {
      const modelMatch = line.match(/model:\s*["']([^"']+)["']/);
      const imgMatch = line.match(/image:\s*["']([^"']+)["']/);
      if (modelMatch) {
        oneplusModels.push({
          model: modelMatch[1],
          image: imgMatch ? imgMatch[1] : null
        });
      }
    }
  }

  console.log(`Found ${oneplusModels.length} OnePlus models in masterModelCatalog:`);
  
  let okCount = 0;
  let failCount = 0;
  const failed = [];

  for (const item of oneplusModels) {
    if (!item.image) {
      failed.push({ model: item.model, reason: 'No image' });
      failCount++;
      continue;
    }
    try {
      const res = await fetch(item.image, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.status === 200) {
        okCount++;
      } else {
        failCount++;
        failed.push({ model: item.model, image: item.image, status: res.status });
      }
    } catch (e) {
      failCount++;
      failed.push({ model: item.model, image: item.image, error: e.message });
    }
  }

  console.log(`Results: ${okCount} OK, ${failCount} FAILED.`);
  console.log('Failed models:', failed);
}

testCatalogImages();
