const escapeXml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MAX_SITEMAP_URLS = 50000;

const dateOf = (product) => {
  const raw = product.updated_at || product.created_at;
  const date = raw ? new Date(raw) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null;
};

/** A sitemap listing each approved product page. `products` need an `id` (or `_id`). */
export const renderProductSitemap = (products, siteOrigin) => {
  const urls = [];
  for (const product of products) {
    const id = String(product.id ?? product._id ?? '').trim();
    if (!id || product.is_approved === false) continue;
    const lastmod = dateOf(product);
    urls.push(
      `  <url>\n    <loc>${escapeXml(`${siteOrigin}/product/${id}`)}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    );
    if (urls.length >= MAX_SITEMAP_URLS) break;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
};
