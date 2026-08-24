import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import type { Product } from '../types';
import {
  HeroSection,
  PopularBrands,
  BestDeals,
  RepairShowcase,
  SellFlow,
  WhyChooseFundu,
  TrustAndTestimonials,
  FaqSection,
  TrendingArticles,
} from '../components/home';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.from<Product[]>('products')
      .select('*')
      .eq('is_approved', true)
      .order('is_featured', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setProducts(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen">
      {/* 1. Hero & Top Service Cards */}
      <HeroSection />

      {/* 2. Popular Brands Directory */}
      <PopularBrands />

      {/* 3. Refurbished Mobiles Best Deals */}
      <BestDeals products={products} loading={loading} />

      {/* 4. Doorstep Mobile Repair Hub in Lucknow */}
      <RepairShowcase />

      {/* 5. How Fundu Works (Sell / Buy / Repair) */}
      <SellFlow />

      {/* 6. Why Choose Fundu & Lucknow Coverage */}
      <WhyChooseFundu />

      {/* 7. Verified Lucknow Testimonials & Reviews */}
      <TrustAndTestimonials />

      {/* 8. Categorized FAQs */}
      <FaqSection />

      {/* 9. Trending Mobile Guides & Articles */}
      <TrendingArticles />
    </div>
  );
}


