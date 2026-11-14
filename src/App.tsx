import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';

// Route-level code-splitting (Lazy loading saves ~2.4MB on initial home page load)
const BuyPhones = lazy(() => import('./pages/BuyPhones'));
const SellPhone = lazy(() => import('./pages/SellPhone'));
const SellBrandPage = lazy(() => import('./pages/SellBrandPage'));
const Repair = lazy(() => import('./pages/Repair'));
const RepairBrandPage = lazy(() => import('./pages/RepairBrandPage'));
const RepairIssuePage = lazy(() => import('./pages/RepairIssuePage'));
const SpareParts = lazy(() => import('./pages/SpareParts'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const Vendor = lazy(() => import('./pages/Vendor'));
const Wholesaler = lazy(() => import('./pages/Wholesaler'));
const DeliveryAgentPortal = lazy(() => import('./pages/DeliveryAgentPortal'));
const Profile = lazy(() => import('./pages/Profile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Payment = lazy(() => import('./pages/Payment'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PartnerProgram = lazy(() => import('./pages/PartnerProgram'));
const FunduStore = lazy(() => import('./pages/FunduStore'));
const BrandHub = lazy(() => import('./pages/BrandHub'));
const Recycle = lazy(() => import('./pages/Recycle'));
const Articles = lazy(() => import('./pages/Articles'));
const BuyLaptops = lazy(() => import('./pages/BuyLaptops'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const SearchActionPage = lazy(() => import('./pages/SearchActionPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const VendorLogin = lazy(() => import('./pages/VendorLogin'));
const WholesalerLogin = lazy(() => import('./pages/WholesalerLogin'));
const DeliveryLogin = lazy(() => import('./pages/DeliveryLogin'));
const DemoConditionFilter = lazy(() => import('./pages/DemoConditionFilter'));
import SEO from './components/SEO';
import { startRoutePrefetch } from './lib/routePrefetch';
import ErrorBoundary from './components/ErrorBoundary';

const PageLoaderFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 rounded-full border-3 border-gray-200 border-t-[#344257] animate-spin" />
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading...</span>
    </div>
  </div>
);

// Security Guard for Role-based Protected Routes
function ProtectedRoute({
  children,
  allowedRoles,
  redirectLogin,
}: {
  children: JSX.Element;
  allowedRoles?: string[];
  redirectLogin: string;
}) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="h-10 w-10 border-4 border-[#6A859F] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-400">Verifying Security Credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectLogin} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = profile?.role || user?.role || 'customer';
    if (!allowedRoles.includes(userRole) && userRole !== 'admin') {
      return <Navigate to={redirectLogin} replace />;
    }
  }

  return children;
}

// Route dispatchers lazy loaded to keep brand catalogs out of initial bundle
const SellModelOrSeriesRoute = lazy(() =>
  import('./routes/CatalogRouteDispatcher').then((m) => ({ default: m.SellModelOrSeriesRoute }))
);
const RepairModelOrSeriesRoute = lazy(() =>
  import('./routes/CatalogRouteDispatcher').then((m) => ({ default: m.RepairModelOrSeriesRoute }))
);

function ProductDetailRoute() {
  const { id } = useParams();
  return <ProductDetail key={id || 'product-detail'} />;
}

function MainLayout() {
  const location = useLocation();

  useEffect(() => startRoutePrefetch(), []);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }
  }, []);
  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-login');
  const isDeliveryPath =
    location.pathname.startsWith('/delivery') ||
    location.pathname.startsWith('/rider') ||
    location.pathname.startsWith('/fleet-desk') ||
    location.pathname.startsWith('/rider-login') ||
    location.pathname.startsWith('/delivery-login');
  const isVendorPath =
    location.pathname.startsWith('/vendor') ||
    location.pathname.startsWith('/vendor-login') ||
    location.pathname.startsWith('/wholesaler') ||
    location.pathname.startsWith('/wholesaler-login');
  const isProfilePath =
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/dashboard');
  const isAuthPage = location.pathname === '/login';
  const isStandaloneApp = isAdminPath || isDeliveryPath || isVendorPath || isAuthPage;
  const hideFooter = isStandaloneApp || isProfilePath;

  return (
    <div className="flex min-h-screen flex-col">
      <SEO />
      {!isStandaloneApp && <Navbar />}
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageLoaderFallback />}>
            <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buy" element={<BuyPhones />} />
          <Route path="/search" element={<SearchActionPage />} />
          <Route path="/product/:id" element={<ProductDetailRoute />} />
          <Route path="/demo-condition-filter" element={<DemoConditionFilter />} />
          {/* Multi-Page Sell Ecosystem: Brand -> Series -> Sub-Models -> Step 2 Valuation */}
          <Route path="/sell" element={<SellPhone />} />
          <Route path="/sell/:brandSlug" element={<SellBrandPage />} />
          <Route path="/sell/:brandSlug/series/:seriesSlug" element={<SellBrandPage />} />
          <Route path="/sell/:brandSlug/:modelSlug" element={<SellModelOrSeriesRoute />} />

          {/* Legacy / Direct Buyback URLs */}
          <Route path="/sell-old-mobile-phone" element={<SellPhone />} />
          <Route path="/sell-old-mobile-phone/:brandSlug" element={<SellBrandPage />} />
          <Route path="/sell-old-mobile-phone/:brandSlug/series/:seriesSlug" element={<SellBrandPage />} />
          <Route path="/sell-old-mobile-phone/:brandSlug/:modelSlug" element={<SellModelOrSeriesRoute />} />

          {/* Repair Ecosystem & Dynamic Sub-Pages */}
          <Route path="/repair" element={<Repair />} />
          <Route path="/repair/:brandSlug" element={<RepairBrandPage />} />
          <Route path="/repair/:brandSlug/series/:seriesSlug" element={<RepairBrandPage />} />
          <Route path="/repair/:brandSlug/:modelSlug" element={<RepairModelOrSeriesRoute />} />
          <Route path="/repair/issue/:issueSlug" element={<RepairIssuePage />} />
          <Route path="/mobile-repair" element={<Repair />} />
          <Route path="/mobile-repair/:brandSlug" element={<RepairBrandPage />} />
          <Route path="/mobile-repair/:brandSlug/series/:seriesSlug" element={<RepairBrandPage />} />
          <Route path="/mobile-repair/:brandSlug/:modelSlug" element={<RepairModelOrSeriesRoute />} />
          <Route path="/doorstep-mobile-repair" element={<Repair />} />
          <Route path="/doorstep-mobile-repair/:issueSlug" element={<RepairIssuePage />} />
          <Route path="/spare-parts" element={<SpareParts />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />

          {/* User Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute redirectLogin="/login">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute redirectLogin="/login">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute redirectLogin="/login">
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute redirectLogin="/login">
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* Admin Dedicated Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'staff']} redirectLogin="/admin-login">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/:subtab"
            element={
              <ProtectedRoute allowedRoles={['admin', 'staff']} redirectLogin="/admin-login">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Vendor Dedicated Protected Routes */}
          <Route
            path="/vendor"
            element={
              <ProtectedRoute allowedRoles={['vendor', 'wholesaler', 'admin']} redirectLogin="/vendor-login">
                <Vendor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wholesaler"
            element={
              <ProtectedRoute allowedRoles={['vendor', 'wholesaler', 'admin']} redirectLogin="/wholesaler-login">
                <Wholesaler />
              </ProtectedRoute>
            }
          />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/wholesaler-login" element={<WholesalerLogin />} />
          <Route path="/wholesaler/login" element={<WholesalerLogin />} />

          {/* Private Delivery & Rider Portal Protected Routes */}
          <Route
            path="/fleet-desk"
            element={
              <ProtectedRoute allowedRoles={['delivery', 'rider', 'admin']} redirectLogin="/delivery-login">
                <DeliveryAgentPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery"
            element={
              <ProtectedRoute allowedRoles={['delivery', 'rider', 'admin']} redirectLogin="/delivery-login">
                <DeliveryAgentPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rider"
            element={
              <ProtectedRoute allowedRoles={['delivery', 'rider', 'admin']} redirectLogin="/delivery-login">
                <DeliveryAgentPortal />
              </ProtectedRoute>
            }
          />
          <Route path="/rider-login" element={<DeliveryLogin />} />
          <Route path="/delivery-login" element={<DeliveryLogin />} />
          <Route path="/delivery/login" element={<DeliveryLogin />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/partner" element={<PartnerProgram />} />
          <Route path="/festival" element={<BuyPhones />} />
          <Route path="/store" element={<FunduStore />} />
          <Route path="/brand" element={<BrandHub />} />
          <Route path="/recycle" element={<Recycle />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/buy-laptop" element={<BuyLaptops />} />
          <Route path="/buy-laptops" element={<BuyLaptops />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
