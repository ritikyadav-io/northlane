import React from 'react';
import { RouterProvider, useRouter } from './Router';
import { CartProvider } from './CartContext';

// Components
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

// Pages
import Homepage from './pages/Homepage';
import ProductPage from './pages/ProductPage';
import CollectionsPage from './pages/CollectionsPage';
import LandingPage from './pages/LandingPage';
import PolicyPage from './pages/PolicyPage';
import AboutUs from './pages/AboutUs';
import DebugPage from './pages/DebugPage';

function AppContent() {
  const { currentView, routeParams } = useRouter();

  // Special landing page without announcement bar, header navigation, or standard footer
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage />
        <CartDrawer />
      </>
    );
  }

  // Standard multi-page layout
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      
      <main style={{ minHeight: '60vh' }}>
        {currentView === 'home' && <Homepage />}
        {currentView === 'product' && <ProductPage handle={routeParams.handle} />}
        {currentView === 'collections' && <CollectionsPage />}
        {currentView === 'policy' && <PolicyPage type={routeParams.policyType} />}
        {currentView === 'about' && <AboutUs />}
        {currentView === 'debug' && <DebugPage />}
      </main>

      <CartDrawer />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </CartProvider>
  );
}
