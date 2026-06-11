import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../Router';
import { useCart } from '../CartContext';
import { fetchProducts } from '../shopify';

export default function Navbar() {
  const { path, navigate } = useRouter();
  const { getItemCount, setIsCartOpen } = useCart();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect to add class to header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch products for local search
  useEffect(() => {
    async function loadSearchProducts() {
      try {
        const products = await fetchProducts(50); // Fetch all products for search
        setAllProducts(products);
      } catch (err) {
        console.error('Failed to load products for search:', err);
      }
    }
    loadSearchProducts();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = allProducts.filter(
      p =>
        p.title.toLowerCase().includes(query) ||
        p.productType.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
    setSearchResults(filtered.slice(0, 5)); // Limit to 5 results
  }, [searchQuery, allProducts]);

  const handleSearchItemClick = (handle) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(`/products/${handle}`);
  };

  const handleMobileLinkClick = (to) => {
    setIsMobileMenuOpen(false);
    navigate(to);
  };

  return (
    <>
      <div className="navbar-sticky-wrapper">
        <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            
            {/* Main top bar containing menu, logo, navigation and cart */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '50px', position: 'relative' }}>
              {/* Hamburger menu for mobile */}
              <button 
                className="menu-toggle"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
                style={{ padding: '4px' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>

              {/* Centered Logo on mobile, left logo on desktop */}
              <Link to="/" className="nav-logo">
                NORTHLANE
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="desktop-nav-menu" style={{ display: 'flex', flexGrow: 1, justifyContent: 'center' }}>
                <ul className="nav-links">
                  <li>
                    <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/collections/all" className={`nav-link ${path.startsWith('/collections') ? 'active' : ''}`}>
                      Shop
                    </Link>
                  </li>
                  <li>
                    <a 
                      href="/#best-sellers" 
                      className="nav-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/');
                        setTimeout(() => {
                          const el = document.getElementById('best-sellers');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                    >
                      Best Sellers
                    </a>
                  </li>
                  <li>
                    <Link to="/collections/all" className="nav-link">
                      Collections
                    </Link>
                  </li>
                  <li>
                    <a 
                      href="#why-choose" 
                      className="nav-link"
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById('why-choose');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          navigate('/');
                          setTimeout(() => {
                            const el = document.getElementById('why-choose');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#footer" 
                      className="nav-link"
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById('footer');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </nav>

              {/* Right actions */}
              <div className="nav-actions">
                {/* Desktop Search Button */}
                <button 
                  className="nav-icon-btn nav-search-desktop-btn" 
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search products"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
                
                {/* Cart Button with live Badge */}
                <button 
                  className="nav-icon-btn" 
                  onClick={() => setIsCartOpen(true)}
                  aria-label="View cart"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  {getItemCount() > 0 && (
                    <span className="cart-badge" style={{ top: '-4px', right: '-6px' }}>{getItemCount()}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Row 2: Persistent Mobile Search Input (Amazon/Flipkart Style) */}
            <div className="navbar-search-row" style={{ width: '100%', paddingBottom: '8px', position: 'relative' }}>
              <div className="mobile-search-container" style={{ position: 'relative', width: '100%' }}>
                <svg className="mobile-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search for products, brands & more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    fontSize: '0.85rem',
                    color: 'var(--color-text)',
                    height: '36px',
                    outline: 'none'
                  }}
                />
                
                {/* Mobile live auto-suggestions dropdown */}
                {searchQuery.trim() !== '' && (
                  <div className="mobile-search-results" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0 0 6px 6px',
                    boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    marginTop: '4px',
                    maxHeight: '260px',
                    overflowY: 'auto'
                  }}>
                    {searchResults.length > 0 ? (
                      searchResults.map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleSearchItemClick(p.handle)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--color-border)',
                            cursor: 'pointer'
                          }}
                        >
                          <img src={p.images[0]} alt={p.title} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', backgroundColor: 'var(--color-bg-secondary)' }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexGrow: 1 }}>{p.title}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-accent)' }}>${p.minPrice.toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        No products found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </header>
      </div>

      {/* Mobile Slide-In Navigation */}
      <div 
        className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <span className="nav-logo" style={{ fontSize: '1.35rem' }}>NORTHLANE</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
            style={{ padding: '4px' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <ul className="mobile-nav-links">
          <li>
            <button className="mobile-nav-link" onClick={() => handleMobileLinkClick('/')}>
              Home
            </button>
          </li>
          <li>
            <button className="mobile-nav-link" onClick={() => handleMobileLinkClick('/collections/all')}>
              Shop All
            </button>
          </li>
          <li>
            <button 
              className="mobile-nav-link" 
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/');
                setTimeout(() => {
                  const el = document.getElementById('best-sellers');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              Best Sellers
            </button>
          </li>
          <li>
            <button 
              className="mobile-nav-link" 
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/');
                setTimeout(() => {
                  const el = document.getElementById('why-choose');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              About Us
            </button>
          </li>
          <li>
            <button 
              className="mobile-nav-link" 
              onClick={() => {
                setIsMobileMenuOpen(false);
                const el = document.getElementById('footer');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Contact
            </button>
          </li>
        </ul>
      </div>

      {/* Live Search Modal Overlay (for Desktop view) */}
      <div 
        className={`search-modal-overlay ${isSearchOpen ? 'open' : ''}`}
        onClick={() => setIsSearchOpen(false)}
      >
        <div 
          className="search-modal-box" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="search-input-row">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--color-primary)'}}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="search-modal-input"
              placeholder="Search for products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus={isSearchOpen}
            />
            <button 
              className="search-close-btn"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              aria-label="Close search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          {searchQuery.trim() !== '' && (
            <div className="search-results-box">
              {searchResults.length > 0 ? (
                searchResults.map(p => (
                  <div 
                    key={p.id} 
                    className="search-result-item"
                    onClick={() => handleSearchItemClick(p.handle)}
                  >
                    <img src={p.images[0]} alt={p.title} className="search-result-img" />
                    <span className="search-result-title">{p.title}</span>
                    <span className="search-result-price">${p.minPrice.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div style={{padding: '20px 10px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>
                  No products found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
