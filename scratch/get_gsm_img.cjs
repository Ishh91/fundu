async function run() {
  const res = await fetch('https://www.gsmarena.com/samsung_galaxy_s20_ultra_5g-10040.php', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html = await res.text();
  const imgs = [];
  const re = /https:\/\/fdn2?\.gsmarena\.com\/[^\s"']+\.jpg/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    imgs.push(match[0]);
  }
  console.log('Images found:', [...new Set(imgs)]);
}
run();
