import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import type { Product } from '../types';
import {
  HeroSection,
  PopularBrands,
  BestDeals,
  SellFlow,
  TrustAndTestimonials,
  FaqSection,
  TrendingArticles,
} from '../components/home';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db
      .from<Product[]>('products')
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
    <div className="bg-[#f6f7fb]">
      <HeroSection />
      <PopularBrands />
      <BestDeals products={products} loading={loading} />
      <SellFlow />
      <TrustAndTestimonials />
      {/* <OffersAndReviews /> */}
      <FaqSection />
      <TrendingArticles />
    </div>
  );
}
