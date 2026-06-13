import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../Router';
import { useCart } from '../CartContext';
import { fetchProducts } from '../shopify';
import heroImage from '../assets/beauty_hero_lifestyle.png';
import beforeImage from '../assets/hairy_arm_before.png';
import afterImage from '../assets/clean_arm_after.png';

export default function Homepage() {
  const { navigate } = useRouter();
  const { addToCart, setIsCartOpen } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [selectedHomeCategory, setSelectedHomeCategory] = useState('Best Sellers');

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await fetchProducts(250);
        setProducts(data);
      } catch (err) {
        console.error('Homepage load error:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // ── Best Sellers: 4 rotating beauty products ──
  const getBestSellers = () => {
    if (products.length === 0) return [];

    const beautyProducts = products.filter(p => {
      const handle = p.handle.toLowerCase();
      const title = p.title.toLowerCase();
      const pType = (p.productType || '').toLowerCase();

      const isLingerie = ['lingerie', 'bra', 'babydoll', 'teddy', 'thong', 'panties', 'chemise', 'nightwear']
        .some(k => handle.includes(k) || title.includes(k));
      if (isLingerie) return false;

      const keywords = [
        'brush-cleaner', 'makeup', 'massager', 'mascara', 'hair-removal',
        'depilatory', 'ear-wax', 'eyelash', 'skincare', 'cosmetics',
        'brush', 'slimming', 'hair-identifier'
      ];
      return pType.includes('beauty') || pType.includes('makeup') || pType.includes('cosmetics')
        || keywords.some(k => handle.includes(k) || title.includes(k));
    });

    if (beautyProducts.length === 0) return [];

    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const offset = Math.floor(daysSinceEpoch / 5) % beautyProducts.length;
    const shifted = [...beautyProducts.slice(offset), ...beautyProducts.slice(0, offset)];
    return shifted.slice(0, 4);
  };

  // ── Dynamic homepage product filter based on premium category cards ──
  const getFilteredProducts = (categoryName) => {
    if (products.length === 0) return [];
    
    switch (categoryName) {
      case 'Makeup Essentials':
        return products.filter(p => {
          const title = p.title.toLowerCase();
          const handle = p.handle.toLowerCase();
          return title.includes('mascara') || title.includes('cleaner') || title.includes('brush') || handle.includes('mascara') || handle.includes('brush');
        });
      case 'Skincare':
        return products.filter(p => {
          const title = p.title.toLowerCase();
          const handle = p.handle.toLowerCase();
          return title.includes('mask') || title.includes('massager') || title.includes('identifying') || title.includes('care') || handle.includes('mask') || handle.includes('massager') || handle.includes('identifier') || handle.includes('care');
        });
      case 'Beauty Tools':
        return products.filter(p => {
          const title = p.title.toLowerCase();
          const handle = p.handle.toLowerCase();
          return title.includes('cleaner') || title.includes('massager') || title.includes('device') || title.includes('tool') || handle.includes('cleaner') || handle.includes('massager') || handle.includes('device') || handle.includes('tool');
        });
      case 'Hair Removal':
        return products.filter(p => {
          const title = p.title.toLowerCase();
          const handle = p.handle.toLowerCase();
          return title.includes('removal') || title.includes('depilatory') || title.includes('identifying') || handle.includes('removal') || handle.includes('depilatory') || handle.includes('identifier');
        });
      case 'Self-Care':
        return products.filter(p => {
          const title = p.title.toLowerCase();
          const handle = p.handle.toLowerCase();
          return title.includes('massager') || title.includes('mask') || title.includes('lingerie') || title.includes('babydoll') || title.includes('teddy') || handle.includes('massager') || handle.includes('mask') || handle.includes('lingerie') || handle.includes('babydoll') || handle.includes('teddy');
        });
      case 'Nail Care':
        return products.filter(p => {
          const title = p.title.toLowerCase();
          return title.includes('nail') || title.includes('manicure') || title.includes('pedicure') || title.includes('massager') || title.includes('cleaner');
        });
      case 'New Arrivals':
        return products.filter(p => {
          const handle = p.handle.toLowerCase();
          return handle.includes('mascara') || handle.includes('mask') || handle.includes('teddy') || handle.includes('babydoll');
        });
      case 'Best Sellers':
      default:
        return getBestSellers();
    }
  };

  // ── Featured Product: Hair Removal Foam Spray ──
  const getFeaturedProduct = () => {
    return products.find(p =>
      p.handle.includes('hair-removal-spray') || p.handle.includes('depilatory')
      || p.title.toLowerCase().includes('foam spray')
    ) || null;
  };

  const featuredProduct = getFeaturedProduct();
  const activeProducts = getFilteredProducts(selectedHomeCategory).slice(0, 4);

  const handleAddProduct = (e, product) => {
    e.stopPropagation();
    const variant = product.variants && product.variants.length > 0
      ? product.variants[0]
      : { id: product.id, title: 'Default Title', price: product.price || product.minPrice };
    addToCart(product, variant, 1);
    setIsCartOpen(true);
  };

  const CATEGORIES = [
    { name: 'Makeup Essentials', path: '/collections/makeup-essentials', emoji: '💄' },
    { name: 'Skincare', path: '/collections/skincare', emoji: '✨' },
    { name: 'Beauty Tools', path: '/collections/beauty-tools', emoji: '🧴' },
    { name: 'Hair Removal', path: '/collections/hair-removal', emoji: '🪒' },
    { name: 'Self-Care', path: '/collections/self-care', emoji: '💆' },
    { name: 'Nail Care', path: '/collections/nail-care', emoji: '💅' },
    { name: 'Best Sellers', path: '/collections/best-sellers', emoji: '🔥' },
    { name: 'New Arrivals', path: '/collections/new-arrivals', emoji: '🆕' },
  ];

  const REVIEWS = [
    { stars: 5, quote: "Exactly what I needed. Fast shipping and great quality.", name: "Jessica L.", loc: "Miami, USA" },
    { stars: 5, quote: "The brush cleaner saves me so much time every week.", name: "Ashley P.", loc: "Boston, USA" },
    { stars: 5, quote: "Love the hair removal products. Part of my weekly routine now.", name: "Chloe M.", loc: "Los Angeles, USA" },
  ];

  const FAQS = [
    { q: 'How long does shipping take?', a: 'Standard shipping takes 7–15 business days across the US. All orders include tracking.' },
    { q: 'Are returns accepted?', a: 'Yes — 7-day hassle-free returns for unused products in original packaging. Email support@northlane.com.' },
    { q: 'Is checkout secure?', a: '256-bit SSL encryption on all transactions, processed securely through Shopify Checkout.' },
    { q: 'Do you ship internationally?', a: 'Currently we ship to the United States only. International shipping coming soon.' },
    { q: 'How can I contact support?', a: 'Email support@northlane.com — we respond within 24 hours.' },
  ];

  // ── Loading & Error States ──
  if (error) {
    return (
      <div className="hp-state-container">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h2>Connection Error</h2>
        <p>Unable to connect to storefront. Please try again.</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hp-state-container">
        <div className="hp-spinner"></div>
        <p>Loading Northlane...</p>
      </div>
    );
  }

  return (
    <div className="hp-root">

      {/* ═══════ SECTION 1: HERO ═══════ */}
      <section className="hp-hero">
        <div className="container">
          <div className="hp-hero-grid">
            <div className="hp-hero-text">
              <h1 className="hp-hero-title">Flawless Skin. Effortless Routine.</h1>
              <p className="hp-hero-subtitle">
                Dermatologist-approved beauty tools and self-care essentials for professional results at home.
              </p>
              <div className="hp-hero-actions">
                <button onClick={() => { const el = document.getElementById('best-sellers'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="hp-btn-primary">
                  Shop Best Sellers
                </button>
                <Link to="/collections/all" className="hp-btn-secondary">
                  Explore All
                </Link>
              </div>
              
              {/* Trust Indicators below CTA */}
              <div className="hp-hero-trust-indicators">
                <span className="hp-hero-trust-item">
                  <svg className="hp-hero-trust-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Fast US Shipping
                </span>
                <span className="hp-hero-trust-item">
                  <svg className="hp-hero-trust-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Secure Checkout
                </span>
                <span className="hp-hero-trust-item">
                  <svg className="hp-hero-trust-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Easy Returns
                </span>
              </div>
            </div>
            
            <div className="hp-hero-img-col">
              <div className="hp-hero-img-wrap">
                <img src={heroImage} alt="Confident woman with glowing skin" className="hp-hero-img" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 2: FEATURED CATEGORIES ═══════ */}
      <section className="premium-cat-nav">
        <div className="container">
          <div className="premium-cat-scroll">
            {CATEGORIES.map(cat => {
              const isActive = selectedHomeCategory === cat.name;
              return (
                <button 
                  key={cat.name} 
                  className={`premium-cat-card ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedHomeCategory(cat.name);
                    // Scroll down to the products section if not already in view
                    const el = document.getElementById('best-sellers');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  aria-label={`Filter by ${cat.name}`}
                >
                  <span className="premium-cat-icon">{cat.emoji}</span>
                  <span className="premium-cat-label">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 3: BEST SELLERS / DYNAMIC GRID ═══════ */}
      {activeProducts.length > 0 && (
        <section id="best-sellers" className="hp-section">
          <div className="container">
            <div className="hp-sec-header">
              <h2 className="hp-sec-title">
                {selectedHomeCategory === 'Best Sellers' ? 'Most Loved Products' : selectedHomeCategory}
              </h2>
              <p className="hp-sec-subtitle">
                {selectedHomeCategory === 'Best Sellers' 
                  ? 'Top-rated beauty essentials chosen by our customers' 
                  : `Handpicked collection for your beauty routine`}
              </p>
            </div>
            <div className="hp-products-grid">
              {activeProducts.map(product => {
                const price = product.price || product.minPrice;
                const compareAt = product.compareAtPrice;
                const discount = (compareAt && compareAt > price)
                  ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

                return (
                  <div key={product.id} className="hp-product-card" onClick={() => navigate(`/products/${product.handle}`)}>
                    {discount > 0 && <span className="hp-card-badge">-{discount}%</span>}
                    <div className="hp-card-img-wrap">
                      <img src={product.images[0]} alt={product.title} className="hp-card-img" />
                    </div>
                    <div className="hp-card-body">
                      <span className="hp-card-type">{product.productType || 'Beauty'}</span>
                      <h3 className="hp-card-title">{product.title}</h3>
                      <div className="hp-card-stars">
                        <span className="hp-stars-text">★★★★★</span>
                        <span className="hp-review-count">({product.reviewCount || 120})</span>
                      </div>
                      <div className="hp-card-price-row">
                        <span className="hp-price-now">${price.toFixed(2)}</span>
                        {compareAt > price && <span className="hp-price-was">${compareAt.toFixed(2)}</span>}
                      </div>
                      <button className="hp-card-cta" onClick={(e) => handleAddProduct(e, product)}>
                        Add To Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="hp-view-all-row">
              <Link 
                to={CATEGORIES.find(c => c.name === selectedHomeCategory)?.path || '/collections/all'} 
                className="hp-btn-secondary"
              >
                View All {selectedHomeCategory === 'Best Sellers' ? 'Products' : selectedHomeCategory} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ SECTION 4: TRUST STRIP ═══════ */}
      <section className="hp-trust-strip">
        <div className="container">
          <div className="hp-trust-row">
            <div className="hp-trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              <div>
                <strong>Free US Shipping</strong>
                <span>On orders over $15</span>
              </div>
            </div>
            <div className="hp-trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <div>
                <strong>Secure Checkout</strong>
                <span>256-bit SSL encrypted</span>
              </div>
            </div>
            <div className="hp-trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <div>
                <strong>Easy Returns</strong>
                <span>7-day hassle-free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 5: FEATURED PRODUCT ═══════ */}
      {featuredProduct && (
        <section className="hp-featured">
          <div className="container">
            <div className="hp-featured-grid">
              <div className="hp-featured-img-col">
                <div className="hp-featured-ba">
                  <div className="hp-ba-card">
                    <div className="hp-ba-label">Before</div>
                    <img src={beforeImage} alt="Before hair removal" className="hp-ba-img" />
                  </div>
                  <div className="hp-ba-card">
                    <div className="hp-ba-label hp-ba-after">After</div>
                    <img src={afterImage} alt="After hair removal — smooth skin" className="hp-ba-img" />
                  </div>
                </div>
              </div>
              <div className="hp-featured-info">
                <span className="hp-featured-tag">★ Best Seller</span>
                <h2 className="hp-featured-title">Smooth Skin Made Simple</h2>
                <ul className="hp-featured-benefits">
                  <li><span className="hp-check">✓</span> Fast, painless application</li>
                  <li><span className="hp-check">✓</span> Gentle on all skin types</li>
                  <li><span className="hp-check">✓</span> Easy at-home use</li>
                </ul>
                <div className="hp-featured-price-row">
                  <span className="hp-price-now">${(featuredProduct.price || featuredProduct.minPrice).toFixed(2)}</span>
                  {featuredProduct.compareAtPrice > (featuredProduct.price || featuredProduct.minPrice) && (
                    <span className="hp-price-was">${featuredProduct.compareAtPrice.toFixed(2)}</span>
                  )}
                </div>
                <button className="hp-btn-primary" onClick={(e) => handleAddProduct(e, featuredProduct)}>
                  Add To Cart
                </button>
                <button className="hp-btn-link" onClick={() => navigate(`/products/${featuredProduct.handle}`)}>
                  View Full Details →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ SECTION 6: CUSTOMER REVIEWS ═══════ */}
      <section className="hp-section hp-section-alt">
        <div className="container">
          <div className="hp-sec-header">
            <h2 className="hp-sec-title">Loved by Women Everywhere</h2>
            <p className="hp-sec-subtitle">Real experiences from verified customers</p>
          </div>
          <div className="hp-reviews-grid">
            {REVIEWS.map((r, i) => (
              <div key={i} className="hp-review-card">
                <div className="hp-review-stars">★★★★★</div>
                <p className="hp-review-quote">"{r.quote}"</p>
                <div className="hp-reviewer">
                  <strong>{r.name}</strong>
                  <span>{r.loc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 7: FAQ ═══════ */}
      <section className="hp-section">
        <div className="container">
          <div className="hp-sec-header">
            <h2 className="hp-sec-title">Frequently Asked Questions</h2>
          </div>
          <div className="hp-faq-list">
            {FAQS.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className={`hp-faq-item ${isOpen ? 'open' : ''}`}>
                  <button className="hp-faq-trigger" onClick={() => setOpenFaqIdx(isOpen ? null : idx)}>
                    <span>{item.q}</span>
                    <svg className="hp-faq-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <div className="hp-faq-answer">
                    <p>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
