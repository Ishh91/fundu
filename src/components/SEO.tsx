import { usePageSeo, type PageSeoOverrides } from '../lib/usePageSeo';

/** Applies route-based SEO tags for the current page. Rendered once in App. */
export default function SEO(props: PageSeoOverrides) {
  usePageSeo(props);
  return null;
}
