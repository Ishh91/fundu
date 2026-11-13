import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Compiles the pure TypeScript SEO resolver so plain Node can import it. */
async function loadSeoMeta() {
  const source = await readFile(path.join(ROOT, 'src', 'lib', 'seoMeta.ts'), 'utf8');
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

describe('resolveSeoMeta', () => {
  let resolveSeoMeta;

  before(async () => {
    ({ resolveSeoMeta } = await loadSeoMeta());
  });

  it('gives the home page its own canonical and keeps it indexable', () => {
    const meta = resolveSeoMeta('/');

    assert.equal(meta.canonicalPath, '/');
    assert.equal(meta.noindex, false);
  });

  it('builds a brand-specific title for a sell brand page', () => {
    const meta = resolveSeoMeta('/sell/apple');

    assert.equal(meta.title, 'Sell Old Apple Phone Online for Instant Cash | Fundu');
    assert.equal(meta.canonicalPath, '/sell/apple');
  });

  it('canonicalises the long sell URL family to the short one', () => {
    const meta = resolveSeoMeta('/sell-old-mobile-phone/sell-apple/sell-iphone-13');

    assert.equal(meta.canonicalPath, '/sell/apple/iphone-13');
    assert.equal(meta.title, 'Sell Old Apple iPhone 13 for Instant Cash | Fundu');
  });

  it('drops a repeated brand prefix from the model slug', () => {
    const meta = resolveSeoMeta('/sell/apple/apple-iphone-11-pro');

    assert.equal(meta.canonicalPath, '/sell/apple/iphone-11-pro');
    assert.equal(meta.title, 'Sell Old Apple iPhone 11 Pro for Instant Cash | Fundu');
  });

  it('treats a series slug as a series page', () => {
    const meta = resolveSeoMeta('/sell/apple/iphone-15-series');

    assert.equal(meta.canonicalPath, '/sell/apple/series/iphone-15-series');
    assert.match(meta.title, /^Sell Old Apple iPhone 15 Series Phones/);
  });

  it('ignores query strings and trailing slashes in the canonical', () => {
    const meta = resolveSeoMeta('/sell/samsung/galaxy-s24/?storage=256%20GB');

    assert.equal(meta.canonicalPath, '/sell/samsung/galaxy-s24');
    assert.equal(meta.title, 'Sell Old Samsung Galaxy S24 for Instant Cash | Fundu');
  });

  it('canonicalises every repair URL family to /repair', () => {
    assert.equal(resolveSeoMeta('/mobile-repair').canonicalPath, '/repair');
    assert.equal(resolveSeoMeta('/doorstep-mobile-repair').canonicalPath, '/repair');
    assert.equal(resolveSeoMeta('/mobile-repair/oneplus').canonicalPath, '/repair/oneplus');
    assert.equal(resolveSeoMeta('/doorstep-mobile-repair/battery').canonicalPath, '/repair/issue/battery');
  });

  it('builds a brand-specific title for a repair brand page', () => {
    const meta = resolveSeoMeta('/repair/oneplus');

    assert.equal(meta.title, 'OnePlus Mobile Repair at Your Doorstep | Fundu');
  });

  it('keeps private and transactional pages out of the index', () => {
    for (const privatePath of ['/admin', '/admin/orders', '/admin-login', '/vendor', '/dashboard', '/cart', '/checkout', '/login', '/fleet-desk', '/search']) {
      assert.equal(resolveSeoMeta(privatePath).noindex, true, privatePath);
    }
  });

  it('marks unknown paths as not found and noindex', () => {
    const meta = resolveSeoMeta('/this-page-does-not-exist');

    assert.equal(meta.noindex, true);
    assert.equal(meta.title, 'Page Not Found | Fundu');
  });

  it('gives different pages different titles', () => {
    const paths = ['/', '/sell', '/buy', '/repair', '/sell/apple', '/sell/samsung', '/sell/apple/iphone-13', '/repair/apple', '/repair/issue/screen'];

    const titles = new Set(paths.map((p) => resolveSeoMeta(p).title));

    assert.equal(titles.size, paths.length);
  });
});

describe('vercel.json rewrites', () => {
  it('serves the app for every top-level route declared in App.tsx', async () => {
    const appSource = await readFile(path.join(ROOT, 'src', 'App.tsx'), 'utf8');
    const vercelConfig = JSON.parse(await readFile(path.join(ROOT, 'vercel.json'), 'utf8'));
    const routeSegments = new Set(
      [...appSource.matchAll(/path="\/([^"/:*]+)/g)].map((match) => match[1]),
    );
    const rewriteSource = vercelConfig.rewrites.map((rule) => rule.source).join(' ');
    const allowedSegments = new Set(/\(([^)]+)\)/.exec(rewriteSource)[1].split('|'));

    const missing = [...routeSegments].filter((segment) => !allowedSegments.has(segment));

    assert.deepEqual(missing, [], `Add these routes to the rewrite in vercel.json: ${missing.join(', ')}`);
  });
});
