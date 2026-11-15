/**
 * Turns the built single-page shell into a per-route HTML file, so a crawler (or a link preview)
 * that does not run JavaScript still sees the right title, description, canonical and some text.
 * Pure string functions, no file access, so they can be tested.
 */

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const BRAND_SUFFIX = ' | Fundu';
const MAIN_LINKS = [
  ['/sell', 'Sell old phone'],
  ['/buy', 'Buy refurbished phones'],
  ['/repair', 'Doorstep mobile repair'],
  ['/spare-parts', 'Spare parts'],
  ['/about', 'About Fundu'],
  ['/contact', 'Contact'],
];

/** "Sell Old Phone Online for Instant Cash | Fundu" -> "Sell Old Phone Online for Instant Cash". */
export const headingFromTitle = (title) => (title.endsWith(BRAND_SUFFIX) ? title.slice(0, -BRAND_SUFFIX.length) : title);

const setTag = (html, pattern, replacement) => (pattern.test(html) ? html.replace(pattern, replacement) : html);

/** The same shell with the route's own head tags and a short text body inside #root. */
export const renderRoutePage = (shellHtml, { meta, canonicalUrl }) => {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = escapeHtml(canonicalUrl);
  let html = shellHtml;

  html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = setTag(html, /(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${description}$2`);
  html = setTag(html, /(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`);
  html = setTag(html, /(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${title}$2`);
  html = setTag(html, /(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${url}$2`);
  html = setTag(html, /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${title}$2`);
  // The description tags in the shell wrap across lines, so match them across whitespace.
  html = setTag(html, /(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${description}$2`);
  html = setTag(html, /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${description}$2`);

  const links = MAIN_LINKS.map(([href, label]) => `<a href="${href}">${escapeHtml(label)}</a>`).join(' · ');
  const body =
    `<main style="max-width:960px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif">` +
    `<h1>${escapeHtml(headingFromTitle(meta.title))}</h1><p>${description}</p><nav aria-label="Main">${links}</nav></main>`;
  return html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
};

/** The shell for routes that are not prerendered (products): no canonical or og:url that would name another page. */
export const renderAppShell = (shellHtml) =>
  shellHtml
    .replace(/\s*<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, '')
    .replace(/\s*<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, '');
