import { lazy } from 'react';
import { useParams } from 'react-router-dom';
import { isSeriesSlug } from '../data/brandSeriesCatalog';

const SellBrandPage = lazy(() => import('../pages/SellBrandPage'));
const SellPhone = lazy(() => import('../pages/SellPhone'));
const RepairBrandPage = lazy(() => import('../pages/RepairBrandPage'));
const Repair = lazy(() => import('../pages/Repair'));

// Route dispatcher for multi-page brand series -> sub-models -> valuation
export function SellModelOrSeriesRoute() {
  const { modelSlug, seriesSlug } = useParams<{ modelSlug?: string; seriesSlug?: string }>();
  const slug = seriesSlug || modelSlug || '';
  const cleanSlug = slug.replace(/^sell-/, '').toLowerCase();

  if (isSeriesSlug(cleanSlug)) {
    return <SellBrandPage />;
  }
  return <SellPhone />;
}

// Route dispatcher for multi-page repair brand series -> models
export function RepairModelOrSeriesRoute() {
  const { modelSlug, seriesSlug } = useParams<{ modelSlug?: string; seriesSlug?: string }>();
  const slug = seriesSlug || modelSlug || '';
  const cleanSlug = slug.replace(/^repair-/, '').toLowerCase();

  if (isSeriesSlug(cleanSlug)) {
    return <RepairBrandPage />;
  }
  return <Repair />;
}

