const fs = require('fs');

async function testAllNewOnePlusUrls() {
  const verifiedList = [
    { model: 'OnePlus 13', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-13.jpg' },
    { model: 'OnePlus 13R', url: 'https://api.mobileapi.dev/devices/366/thumb.png' },
    { model: 'OnePlus 12', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg' },
    { model: 'OnePlus 12R', url: 'https://api.mobileapi.dev/devices/364/thumb.png' },
    { model: 'OnePlus 11', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-11.jpg' },
    { model: 'OnePlus 11R', url: 'https://api.mobileapi.dev/devices/362/thumb.png' },
    { model: 'OnePlus 10 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-10-pro.jpg' },
    { model: 'OnePlus 10T', url: 'https://api.mobileapi.dev/devices/16342/thumb.png' },
    { model: 'OnePlus 10R', url: 'https://api.mobileapi.dev/devices/16344/thumb.png' },
    { model: 'OnePlus 9 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro-.jpg' },
    { model: 'OnePlus 9RT', url: 'https://api.mobileapi.dev/devices/369/thumb.png' },
    { model: 'OnePlus 9', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-.jpg' },
    { model: 'OnePlus 9R', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9r.jpg' },
    { model: 'OnePlus 8 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8-pro.jpg' },
    { model: 'OnePlus 8T', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-8t.jpg' },
    { model: 'OnePlus 8', url: 'https://api.mobileapi.dev/devices/16348/thumb.png' },
    { model: 'OnePlus 7T Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t-pro.jpg' },
    { model: 'OnePlus 7T', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7t-.jpg' },
    { model: 'OnePlus 7 Pro', url: 'https://api.mobileapi.dev/devices/16351/thumb.png' },
    { model: 'OnePlus 7', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-7-.jpg' },
    { model: 'OnePlus 6T', url: 'https://api.mobileapi.dev/devices/16353/thumb.png' },
    { model: 'OnePlus 6', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-6-.jpg' },
    { model: 'OnePlus 5T', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-5t.jpg' },
    { model: 'OnePlus 5', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-5.jpg' },
    { model: 'OnePlus 3T', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-3t-.jpg' },
    { model: 'OnePlus 3', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-3.jpg' },
    { model: 'OnePlus Nord 4', url: 'https://api.mobileapi.dev/devices/809/thumb.png' },
    { model: 'OnePlus Nord 3', url: 'https://api.mobileapi.dev/devices/373/thumb.png' },
    { model: 'OnePlus Nord 2T', url: 'https://api.mobileapi.dev/devices/811/thumb.png' },
    { model: 'OnePlus Nord 2', url: 'https://api.mobileapi.dev/devices/377/thumb.png' },
    { model: 'OnePlus Nord CE4', url: 'https://api.mobileapi.dev/devices/385/thumb.png' },
    { model: 'OnePlus Nord CE4 Lite', url: 'https://api.mobileapi.dev/devices/16320/thumb.png' },
    { model: 'OnePlus Nord CE3', url: 'https://api.mobileapi.dev/devices/374/thumb.png' },
    { model: 'OnePlus Nord CE3 Lite', url: 'https://api.mobileapi.dev/devices/16320/thumb.png' },
    { model: 'OnePlus Nord CE 2', url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-2-5g.jpg' },
    { model: 'OnePlus Nord CE 2 Lite', url: 'https://api.mobileapi.dev/devices/815/thumb.png' },
    { model: 'OnePlus Nord CE', url: 'https://api.mobileapi.dev/devices/810/thumb.png' },
    { model: 'OnePlus Nord', url: 'https://api.mobileapi.dev/devices/811/thumb.png' },
    { model: 'OnePlus Nord N30 5G', url: 'https://api.mobileapi.dev/devices/387/thumb.png' },
    { model: 'OnePlus Open', url: 'https://api.mobileapi.dev/devices/391/thumb.png' }
  ];

  let failed = 0;
  for (const item of verifiedList) {
    try {
      const res = await fetch(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.status !== 200) {
        console.log(`FAILED (${res.status}): ${item.model} -> ${item.url}`);
        failed++;
      }
    } catch (e) {
      console.log(`ERROR: ${item.model} -> ${e.message}`);
      failed++;
    }
  }

  console.log(`Total: ${verifiedList.length}, Failed: ${failed}`);
}

testAllNewOnePlusUrls();
