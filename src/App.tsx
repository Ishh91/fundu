import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BuyPhones from './pages/BuyPhones';
import SellPhone from './pages/SellPhone';
import Repair from './pages/Repair';
import SpareParts from './pages/SpareParts';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
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

function MainLayout() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isDeliveryPath =
    location.pathname.startsWith('/delivery') ||
    location.pathname.startsWith('/rider') ||
    location.pathname.startsWith('/fleet-desk') ||
    location.pathname.startsWith('/rider-login');
  const isStandaloneApp = isAdminPath || isDeliveryPath;

  return (
    <div className="flex min-h-screen flex-col">
      {!isStandaloneApp && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buy" element={<BuyPhones />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/sell" element={<SellPhone />} />
          <Route path="/repair" element={<Repair />} />
          <Route path="/spare-parts" element={<SpareParts />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/:subtab" element={<Admin />} />
          <Route path="/wholesaler" element={<Wholesaler />} />
          
          {/* Private Delivery & Rider Portal Routes */}
          <Route path="/fleet-desk" element={<DeliveryAgentPortal />} />
          <Route path="/rider-login" element={<DeliveryAgentPortal />} />
          <Route path="/delivery" element={<DeliveryAgentPortal />} />
          <Route path="/rider" element={<DeliveryAgentPortal />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/document-doctor" element={<DocumentDoctor />} />
          <Route path="/partner" element={<PartnerProgram />} />
          <Route path="/store" element={<FunduStore />} />
          <Route path="/brand" element={<BrandHub />} />
          <Route path="/recycle" element={<Recycle />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/buy-laptop" element={<LaptopComingSoon />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isStandaloneApp && <Footer />}
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
