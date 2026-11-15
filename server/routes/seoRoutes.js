import { Router } from 'express';
import { Product } from '../models/Product.js';
import { renderProductSitemap } from '../services/seoService.js';

const router = Router();
const SITE_ORIGIN = 'https://www.thefundu.com';

/** GET /api/seo/sitemap-products.xml (served to crawlers as /sitemap-products.xml) */
router.get('/sitemap-products.xml', async (_req, res) => {
  try {
    const products = await Product.find({ is_approved: true }).select('_id updated_at created_at').lean();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=900, s-maxage=3600');
    res.send(renderProductSitemap(products, SITE_ORIGIN));
  } catch (error) {
    console.error('[seoRoutes] product sitemap failed:', error);
    res.status(500).type('text/plain').send('Sitemap unavailable');
  }
});

export default router;
