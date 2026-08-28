import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, CheckCircle2, Mail, X } from 'lucide-react';
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
  const [params] = useSearchParams();
  const showWelcome = params.get('welcome') === 'true';
  const userName = params.get('name') || 'User';

  const [welcomeBannerVisible, setWelcomeBannerVisible] = useState(showWelcome);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showWelcome) {
      setWelcomeBannerVisible(true);
      // Auto-dismiss welcome banner after 10 seconds
      const timer = setTimeout(() => setWelcomeBannerVisible(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

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
      {/* ── Welcome Notification Banner (Shown After Registration) ── */}
      {welcomeBannerVisible && (
        <div className="bg-gradient-to-r from-brand-600 via-teal-600 to-indigo-600 text-white px-4 py-3.5 shadow-md relative animate-slide-down z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs md:text-sm font-semibold">
              <div className="w-8 h-8 rounded-full bg-white/20 grid place-items-center shrink-0">
                <Sparkles className="h-4 w-4 text-amber-300 animate-spin-slow" />
              </div>
              <div>
                <span className="font-extrabold text-amber-200">🎉 Welcome to Fundu, {userName}!</span> Your account is activated & email verified.
                <span className="hidden md:inline ml-2 opacity-90">
                  A welcome email has been sent to your inbox via EmailJS.
                </span>
              </div>
            </div>

            <button
              onClick={() => setWelcomeBannerVisible(false)}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors shrink-0"
              title="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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
