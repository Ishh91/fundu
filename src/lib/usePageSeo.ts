import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveSeoMeta, SITE_ORIGIN } from './seoMeta';

export type PageSeoOverrides = {
  /** Overrides the route-derived title (e.g. a product name loaded from the API). */
  title?: string;
  /** Overrides the route-derived description. */
  description?: string;
  /** Forces the page out of search results (e.g. a missing product). */
  noindex?: boolean;
};

const upsertMeta = (attribute: 'name' | 'property', key: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertCanonical = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

/**
 * Keeps <title>, description, canonical, robots and social tags in sync with
 * the current route. App applies the route defaults for every page; a page
 * can call this hook again to override them with data it has loaded.
 */
export function usePageSeo({ title, description, noindex }: PageSeoOverrides = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = resolveSeoMeta(pathname);
    const finalTitle = title || meta.title;
    const finalDescription = description || meta.description;
    const canonicalUrl = `${SITE_ORIGIN}${meta.canonicalPath}`;
    const shouldNoindex = noindex ?? meta.noindex;

    document.title = finalTitle;
    upsertMeta('name', 'description', finalDescription);
    upsertMeta('name', 'robots', shouldNoindex ? 'noindex, follow' : 'index, follow');
    upsertCanonical(canonicalUrl);

    upsertMeta('property', 'og:title', finalTitle);
    upsertMeta('property', 'og:description', finalDescription);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('name', 'twitter:title', finalTitle);
    upsertMeta('name', 'twitter:description', finalDescription);
  }, [pathname, title, description, noindex]);
}
