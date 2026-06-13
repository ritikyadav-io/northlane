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

import { useCart } from './CartContext';

function SubPageHeader() {
  const { goBack, currentView } = useRouter();
  const { getItemCount, setIsCartOpen } = useCart();

  let title = '';
  if (currentView === 'product') title = 'Product';
  else if (currentView === 'collections') title = 'Shop';
  else if (currentView === 'policy') title = 'Help Center';
  else if (currentView === 'about') title = 'About Us';
  else if (currentView === 'debug') title = 'Diagnostics';

  return (
    <div className="subpage-header-container" style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 99 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px', padding: '0 16px' }}>
        {/* Back button */}
        <button 
          onClick={goBack} 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.88rem', 
            fontWeight: '700', 
            color: 'var(--color-primary)',
            height: '44px',
            padding: '0 8px',
            marginLeft: '-8px',
            cursor: 'pointer'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back</span>
        </button>

        {/* Center title */}
        <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>

        {/* Cart Icon on right */}
        <button 
          onClick={() => setIsCartOpen(true)}
          aria-label="View cart"
          style={{ 
            position: 'relative',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            marginRight: '-8px',
            color: 'var(--color-primary)',
            cursor: 'pointer'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {getItemCount() > 0 && (
            <span className="cart-badge" style={{ top: '4px', right: '4px', border: '1.5px solid #fff' }}>{getItemCount()}</span>
          )}
        </button>
      </div>
    </div>
  );
}

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
  const isHome = currentView === 'home';

  return (
    <>
      {isHome ? (
        <>
          <AnnouncementBar />
          <Navbar />
        </>
      ) : (
        <SubPageHeader />
      )}
      
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
