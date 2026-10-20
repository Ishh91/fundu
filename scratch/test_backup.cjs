async function searchGsmArenaPublic(query) {
  try {
    const res = await fetch('https://www.gsmarena.com/res.php3?sSearch=' + encodeURIComponent(query), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    const m = html.match(/<div class="makers">[\s\S]*?<img src="([^"]+)"[^>]*title="([^"]+)"/i);
    if (m) {
      return { image: m[1], title: m[2] };
    }
  } catch (e) {
    return null;
  }
}
searchGsmArenaPublic('Oneplus 10R').then(r => console.log('Public GSMArena search result:', r));
