/**
 * Runs after `vite build`: writes dist/<route>/index.html for every indexable page in the sitemap
 * (with its own title, description and canonical), and dist/app-shell.html for every other route.
 *
 * Usage: node scripts/prerender_routes.mjs   (runs automatically as part of `npm run build`)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectEntries, loadCatalog } from './generate_sitemap.mjs';
import { renderAppShell, renderRoutePage } from './lib/prerender.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

async function main() {
  const shell = await readFile(path.join(DIST, 'index.html'), 'utf8');
  const catalog = await loadCatalog();
  const entries = collectEntries(catalog);
  const origin = catalog.SITE_ORIGIN;

  // Written first: the untouched shell minus its home-page canonical, for routes such as /product/:id.
  await writeFile(path.join(DIST, 'app-shell.html'), renderAppShell(shell), 'utf8');

  let written = 0;
  for (const [routePath] of entries) {
    const meta = catalog.resolveSeoMeta(routePath);
    const page = renderRoutePage(shell, { meta, canonicalUrl: origin + (routePath === '/' ? '/' : routePath) });
    const target = routePath === '/' ? path.join(DIST, 'index.html') : path.join(DIST, routePath, 'index.html');
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, page, 'utf8');
    written += 1;
  }
  console.log(`Prerendered ${written} routes into dist/ (plus app-shell.html)`);
}

main().catch((error) => {
  console.error('Prerender failed:', error);
  process.exit(1);
});
