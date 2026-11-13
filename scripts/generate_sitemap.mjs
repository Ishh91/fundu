/**
 * Generates public/sitemap.xml from the app's own catalog data, so every
 * indexable brand, series and model page is listed with its canonical URL.
 *
 * Usage: npm run sitemap   (also runs automatically before `npm run build`)
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_FILE = path.join(ROOT, 'public', 'sitemap.xml');
const MAX_SITEMAP_URLS = 50000;

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/sell', changefreq: 'daily', priority: '0.9' },
  { path: '/buy', changefreq: 'daily', priority: '0.9' },
  { path: '/repair', changefreq: 'daily', priority: '0.9' },
  { path: '/spare-parts', changefreq: 'weekly', priority: '0.7' },
  { path: '/store', changefreq: 'weekly', priority: '0.6' },
  { path: '/brand', changefreq: 'weekly', priority: '0.6' },
  { path: '/articles', changefreq: 'weekly', priority: '0.6' },
  { path: '/recycle', changefreq: 'monthly', priority: '0.5' },
  { path: '/partner', changefreq: 'monthly', priority: '0.5' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
];

// Mirrors the repair issue ids routed at /repair/issue/:issueSlug.
const REPAIR_ISSUE_SLUGS = ['screen', 'battery', 'charging', 'mic', 'speaker', 'receiver'];

const CATALOG_ENTRY = `
  export { BRAND_TILES, MASTER_MODEL_CATALOG } from './src/data/masterModelCatalog';
  export { BRAND_SERIES_DEFINITIONS } from './src/data/brandSeriesCatalog';
  export { resolveSeoMeta, SITE_ORIGIN } from './src/lib/seoMeta';
`;

/** Bundles the TypeScript catalog modules so plain Node can import them. */
async function loadCatalog() {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'fundu-sitemap-'));
  const bundleFile = path.join(tempDir, 'catalog.mjs');
  try {
    await build({
      stdin: { contents: CATALOG_ENTRY, resolveDir: ROOT, loader: 'ts' },
      outfile: bundleFile,
      bundle: true,
      format: 'esm',
      platform: 'node',
      logLevel: 'error',
      define: { 'import.meta.env': '{}' },
    });
    return await import(pathToFileURL(bundleFile).href);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

const brandSlugOf = (brand) => brand.toLowerCase().replace(/[^a-z0-9]/g, '');

// Same slug rule the brand pages use when linking to a model.
const modelSlugOf = (model) =>
  model
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function collectEntries(catalog) {
  const { BRAND_TILES, MASTER_MODEL_CATALOG, BRAND_SERIES_DEFINITIONS, resolveSeoMeta } = catalog;
  const entries = new Map();

  // Every URL goes through the app's own canonical resolver, so the sitemap
  // can never list a URL that the page itself canonicalises elsewhere.
  const add = (rawPath, changefreq, priority) => {
    const meta = resolveSeoMeta(rawPath);
    if (meta.noindex || entries.has(meta.canonicalPath)) return;
    entries.set(meta.canonicalPath, { changefreq, priority });
  };

  for (const page of STATIC_PAGES) add(page.path, page.changefreq, page.priority);
  for (const issue of REPAIR_ISSUE_SLUGS) add(`/repair/issue/${issue}`, 'weekly', '0.7');

  const brandSlugs = new Set(BRAND_TILES.map((tile) => brandSlugOf(tile.name)));

  for (const brandSlug of brandSlugs) {
    add(`/sell/${brandSlug}`, 'weekly', '0.8');
    add(`/repair/${brandSlug}`, 'weekly', '0.8');
    for (const series of BRAND_SERIES_DEFINITIONS[brandSlug] || []) {
      add(`/sell/${brandSlug}/series/${series.slug}`, 'weekly', '0.7');
    }
  }

  for (const item of MASTER_MODEL_CATALOG) {
    const brandSlug = brandSlugOf(item.brand || '');
    const modelSlug = modelSlugOf(item.model || '');
    if (!brandSlugs.has(brandSlug) || !modelSlug) continue;
    add(`/sell/${brandSlug}/${modelSlug}`, 'weekly', '0.6');
  }

  return entries;
}

function renderSitemap(entries, siteOrigin) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [...entries].map(
    ([urlPath, { changefreq, priority }]) =>
      `  <url>\n    <loc>${escapeXml(siteOrigin + urlPath)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

async function main() {
  const catalog = await loadCatalog();
  const entries = collectEntries(catalog);
  if (entries.size > MAX_SITEMAP_URLS) {
    throw new Error(`Sitemap has ${entries.size} URLs; the limit is ${MAX_SITEMAP_URLS}. Split it into a sitemap index.`);
  }
  await writeFile(OUTPUT_FILE, renderSitemap(entries, catalog.SITE_ORIGIN), 'utf8');
  console.log(`Wrote ${entries.size} URLs to ${path.relative(ROOT, OUTPUT_FILE)}`);
}

main().catch((error) => {
  console.error('Sitemap generation failed:', error);
  process.exit(1);
});
