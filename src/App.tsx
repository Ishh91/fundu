import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BuyPhones from './pages/BuyPhones';
import SellPhone from './pages/SellPhone';
import SellBrandPage from './pages/SellBrandPage';
import Repair from './pages/Repair';
import SpareParts from './pages/SpareParts';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Vendor from './pages/Vendor';
import Wholesaler from './pages/Wholesaler';
import DeliveryAgentPortal from './pages/DeliveryAgentPortal';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import NotFound from './pages/NotFound';
import DocumentDoctor from './pages/DocumentDoctor';
import PartnerProgram from './pages/PartnerProgram';
import FunduStore from './pages/FunduStore';
import BrandHub from './pages/BrandHub';
import Recycle from './pages/Recycle';
import Articles from './pages/Articles';
import LaptopComingSoon from './pages/LaptopComingSoon';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './pages/AdminLogin';
import VendorLogin from './pages/VendorLogin';
import WholesalerLogin from './pages/WholesalerLogin';
import DeliveryLogin from './pages/DeliveryLogin';
import SEO from './components/SEO';
import VipLoginModal from './components/VipLoginModal';

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
        <div className="h-10 w-10 border-4 border-[#00a896] border-t-transparent rounded-full animate-spin mb-3" />
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

function MainLayout() {
  const location = useLocation();
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
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isStandaloneApp = isAdminPath || isDeliveryPath || isVendorPath || isAuthPage;
  const hideFooter = isStandaloneApp || isProfilePath;

  return (
    <div className="flex min-h-screen flex-col">
      <SEO />
      <VipLoginModal />
      {!isStandaloneApp && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buy" element={<BuyPhones />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/sell" element={<SellPhone />} />
          <Route path="/sell/:brandSlug" element={<SellBrandPage />} />
          <Route path="/sell/:brandSlug/:modelSlug" element={<SellPhone />} />
          <Route path="/sell-old-mobile-phone" element={<SellPhone />} />
          <Route path="/sell-old-mobile-phone/sell-:brandSlug" element={<SellBrandPage />} />
          <Route path="/sell-old-mobile-phone/sell-:brandSlug/sell-:modelSlug" element={<SellPhone />} />
          <Route path="/repair" element={<Repair />} />
          <Route path="/spare-parts" element={<SpareParts />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          {/* Admin Dedicated Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']} redirectLogin="/admin-login">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/:subtab"
            element={
              <ProtectedRoute allowedRoles={['admin']} redirectLogin="/admin-login">
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
          <Route path="/document-doctor" element={<DocumentDoctor />} />
          <Route path="/partner" element={<PartnerProgram />} />
          <Route path="/festival" element={<BuyPhones />} />
          <Route path="/store" element={<FunduStore />} />
          <Route path="/brand" element={<BrandHub />} />
          <Route path="/recycle" element={<Recycle />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/buy-laptop" element={<LaptopComingSoon />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
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
