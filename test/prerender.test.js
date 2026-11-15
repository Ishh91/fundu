import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { headingFromTitle, renderAppShell, renderRoutePage } from '../scripts/lib/prerender.mjs';
import { renderProductSitemap } from '../server/services/seoService.js';

const SHELL = `<!doctype html>
<html lang="en">
  <head>
    <title>Home title | Fundu</title>
    <meta
      name="description"
      content="Home description"
    />
    <link rel="canonical" href="https://www.thefundu.com/" />
    <meta property="og:title" content="Home og" />
    <meta
      property="og:description"
      content="Home og description"
    />
    <meta property="og:url" content="https://www.thefundu.com/" />
    <meta name="twitter:title" content="Home tw" />
    <meta
      name="twitter:description"
      content="Home tw description"
    />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

const META = { title: 'Sell Old Apple iPhone 13 for Instant Cash | Fundu', description: 'Sell your "iPhone 13" & get cash.' };

describe('renderRoutePage', () => {
  const html = renderRoutePage(SHELL, { meta: META, canonicalUrl: 'https://www.thefundu.com/sell/apple/iphone-13' });

  it('puts the route title, description and canonical in the head', () => {
    assert.match(html, /<title>Sell Old Apple iPhone 13 for Instant Cash \| Fundu<\/title>/);
    assert.match(html, /name="description"\s+content="Sell your &quot;iPhone 13&quot; &amp; get cash\."/);
    assert.match(html, /rel="canonical" href="https:\/\/www\.thefundu\.com\/sell\/apple\/iphone-13"/);
  });

  it('updates the social tags too', () => {
    assert.match(html, /property="og:url" content="https:\/\/www\.thefundu\.com\/sell\/apple\/iphone-13"/);
    assert.match(html, /property="og:title" content="Sell Old Apple iPhone 13 for Instant Cash \| Fundu"/);
    assert.match(html, /name="twitter:description"\s+content="Sell your &quot;iPhone 13&quot;/);
    assert.doesNotMatch(html, /Home /);
  });

  it('gives crawlers a heading, text and links inside the root', () => {
    assert.match(html, /<div id="root"><main[^>]*><h1>Sell Old Apple iPhone 13 for Instant Cash<\/h1>/);
    assert.match(html, /<a href="\/sell">Sell old phone<\/a>/);
  });
});

describe('renderAppShell', () => {
  it('drops the home canonical and og:url but keeps the rest', () => {
    const shell = renderAppShell(SHELL);
    assert.doesNotMatch(shell, /rel="canonical"/);
    assert.doesNotMatch(shell, /property="og:url"/);
    assert.match(shell, /<title>Home title \| Fundu<\/title>/);
    assert.match(shell, /<div id="root"><\/div>/);
  });
});

describe('headingFromTitle', () => {
  it('removes the brand suffix only', () => {
    assert.equal(headingFromTitle('Doorstep Mobile Repair in 30 Minutes | Fundu'), 'Doorstep Mobile Repair in 30 Minutes');
    assert.equal(headingFromTitle('Fundu'), 'Fundu');
  });
});

describe('renderProductSitemap', () => {
  it('lists each approved product with its last change date', () => {
    const xml = renderProductSitemap(
      [
        { _id: 'a1', updated_at: '2026-11-10T08:00:00.000Z' },
        { id: 'b2', created_at: '2026-10-01T00:00:00.000Z' },
        { id: 'c3', is_approved: false },
        { id: '' },
      ],
      'https://www.thefundu.com',
    );
    assert.match(xml, /<loc>https:\/\/www\.thefundu\.com\/product\/a1<\/loc>\s*<lastmod>2026-11-10<\/lastmod>/);
    assert.match(xml, /<loc>https:\/\/www\.thefundu\.com\/product\/b2<\/loc>\s*<lastmod>2026-10-01<\/lastmod>/);
    assert.doesNotMatch(xml, /c3/);
    assert.equal((xml.match(/<url>/g) || []).length, 2);
  });

  it('escapes ids so the xml stays valid', () => {
    const xml = renderProductSitemap([{ id: 'x&y' }], 'https://www.thefundu.com');
    assert.match(xml, /product\/x&amp;y/);
  });
});
