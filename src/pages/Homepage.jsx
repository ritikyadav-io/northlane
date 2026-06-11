import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../Router';
import { useCart } from '../CartContext';
import { fetchProducts } from '../shopify';

const CATEGORIES = [
  'All',
  'Home Decor',
  'Kitchen and Dining',
  'Health and Wellness',
  'Office and Stationery',
  'Photography and Lighting',
  'Womens Fashion',
  'Outdoor and Camping'
];

export default function Homepage() {
  const { navigate } = useRouter();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Category filter state (shares between category bar and shop all products)
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Sorting state
  const [sortBy, setSortBy] = useState('Featured');
  
  // FAQ accordion state
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

  // Newsletter state
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await fetchProducts(20);
        // Filter out lingerie and wellness correctors (belts) from home view loops
        const filtered = data.filter(p => {
          const handle = p.handle.toLowerCase();
          const isLingerie = handle.includes('lace') || handle.includes('lingerie') || handle.includes('bra') || handle.includes('babydoll') || handle.includes('teddy') || handle.includes('thong');
          const isWellnessBelt = handle.includes('posture') || handle.includes('spine') || handle.includes('corrector');
          return !isLingerie && !isWellnessBelt;
        });
        setProducts(filtered);
      } catch (err) {
        console.error('Homepage load error:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter products by category (matching productType)
  const getFilteredProducts = (category) => {
    if (category === 'All') return products;
    
    // Helper to map category names to API product types if they differ slightly
    const categoryMapping = {
      'Home Decor': 'Home Decor',
      'Kitchen and Dining': 'Kitchen & Dining',
      'Health and Wellness': 'Health & Wellness',
      'Office and Stationery': 'Office & Stationery',
      'Photography and Lighting': 'Photography & Lighting',
      'Womens Fashion': 'Womens Fashion',
      'Outdoor and Camping': 'Outdoor & Camping'
    };

    const targetType = categoryMapping[category] || category;
    return products.filter(p => p.productType.toLowerCase() === targetType.toLowerCase());
  };

  // Sort products
  const sortProducts = (items, sortType) => {
    const list = [...items];
    if (sortType === 'Price Low to High') {
      return list.sort((a, b) => a.minPrice - b.minPrice);
    }
    if (sortType === 'Price High to Low') {
      return list.sort((a, b) => b.minPrice - a.minPrice);
    }
    // Default or Featured (order returned by API)
    return list;
  };

  const handleAddProduct = (e, product) => {
    e.stopPropagation();
    if (product.variants && product.variants.length > 0) {
      addToCart(product, product.variants[0], 1);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() !== '') {
      setSubscribed(true);
      setEmail('');
    }
  };

  // Dynamic copy mapping helper for the featured section
  const getFeaturedCopy = (product) => {
    if (!product) return {};
    const handle = product.handle.toLowerCase();
    
    if (handle.includes('tumbler')) {
      return {
        tag: 'Customer Favorite',
        headline: 'The Last Water Bottle You Will Ever Need',
        subheadline: 'Keeps drinks cold for 24 hours and hot for 12. The perfect companion for the gym, office, and road trips.',
        soldText: 'Over 500 sold this month'
      };
    }
    if (handle.includes('ripple')) {
      return {
        tag: 'Relaxing Ambiance',
        headline: 'The Ultimate Ambient Ripple Light',
        subheadline: 'Transform your bedroom into a peaceful oasis. Project relaxing rotating water ripples across your walls.',
        soldText: 'Over 350 sold this month'
      };
    }
    if (handle.includes('octopus')) {
      return {
        tag: 'Best Seller',
        headline: 'Bring the Ocean Stars Into Your Room',
        subheadline: 'Stunning octopus design night light projecting gorgeous underwater and starry sky patterns.',
        soldText: 'Over 200 sold this month'
      };
    }
    if (handle.includes('camping') || handle.includes('lantern')) {
      return {
        tag: 'Adventure Ready',
        headline: 'The Only Adventure Lantern You Need',
        subheadline: 'Type-C rechargeable, anti-drop, and highly transparent creative atmosphere light for your backyard or camp.',
        soldText: 'Over 400 sold this month'
      };
    }
    if (handle.includes('printer')) {
      return {
        tag: 'Office Essential',
        headline: 'Label Everything with One Click',
        subheadline: 'Bluetooth inkless thermal printing. Organize your home office, kitchen jars, and files instantly from your phone.',
        soldText: 'Over 600 sold this month'
      };
    }
    if (handle.includes('posture')) {
      return {
        tag: 'Wellness Pick',
        headline: 'Alleviate Back Pain Instantly',
        subheadline: 'Comfortable and discreet back posture corrector. Relieve neck, shoulder, and back tension at your desk.',
        soldText: 'Over 300 sold this month'
      };
    }
    if (handle.includes('ring-light')) {
      return {
        tag: 'Creator Choice',
        headline: 'Perfect Lighting For Any Stream',
        subheadline: 'LED clip-on ring light with adjustable brightness and warm colors. Perfect for virtual meetings and streaming.',
        soldText: 'Over 150 sold this month'
      };
    }
    
    return {
      tag: 'Featured Selection',
      headline: `Premium ${product.title}`,
      subheadline: product.description ? product.description.split('.').slice(0, 2).join('.') + '.' : 'Carefully selected and reviewed for premium US & UK quality.',
      soldText: 'High demand product'
    };
  };

  // 1. Daily Best Sellers Rotation
  const getDailyBestSellers = () => {
    if (products.length === 0) return [];
    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const offset = daysSinceEpoch % products.length;
    const shifted = [...products.slice(offset), ...products.slice(0, offset)];
    return shifted.slice(0, 4);
  };
  const bestSellers = getDailyBestSellers();

  // 2. 5-Day Featured Product Rotation (> $20)
  const getFeaturedProduct = () => {
    const eligible = products.filter(p => p.minPrice > 20);
    if (eligible.length === 0) return products[0];
    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const index = Math.floor(daysSinceEpoch / 5) % eligible.length;
    return eligible[index];
  };
  const featuredProduct = getFeaturedProduct();
  const featuredCopy = getFeaturedCopy(featuredProduct);

  // Products for featured collection (Home Decor and Outdoor)
  const featuredCollectionProducts = products.filter(p => 
    p.handle.includes('octopus') || 
    p.handle.includes('water-ripple') || 
    p.handle.includes('camping-light')
  ).slice(0, 4);

  // Fallback if we don't have exactly 4 images for the 2x2 grid
  const promoImages = [];
  featuredCollectionProducts.forEach(p => {
    if (p.images && p.images[0]) promoImages.push(p.images[0]);
  });
  while (promoImages.length > 0 && promoImages.length < 4) {
    promoImages.push(promoImages[promoImages.length - 1]);
  }

  // Parse bullet points from featured product features
  const featuredBullets = featuredProduct ? featuredProduct.features.slice(0, 4) : [
    'Premium quality materials',
    'Designed for durability and style',
    'US & UK shipping friendly'
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--color-accent)', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderWidth: '4px' }}></div>
        <p style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Loading Northlane Storefront...</p>
      </div>
    );
  }

  return (
    <div>
      {/* SECTION 1: HERO BANNER */}
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">Everyday Essentials. Extraordinary Quality.</h1>
          <p className="hero-subtitle">
            Curated home, lifestyle, and wellness products delivered to your door across the US and UK
          </p>
          <div className="hero-actions">
            <Link to="/collections/all" className="btn btn-primary">Shop Now</Link>
            <a 
              href="#best-sellers" 
              className="btn btn-outline"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('best-sellers').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Best Sellers
            </a>
          </div>
          
          <div className="hero-trust">
            <div className="trust-item">
              <span className="trust-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </span>
              <span>Free US and UK Shipping</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                </svg>
              </span>
              <span>30-Day Returns</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CATEGORY BAR */}
      <div className="category-bar">
        <div className="container">
          <div className="category-scroll">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat);
                  // Scroll down slightly to shop grid
                  document.getElementById('shop-all-products').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: BEST SELLERS */}
      <section id="best-sellers" className="section">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">Best Sellers</h2>
            <p className="section-subtitle">Our most loved products, chosen by customers across the US and UK</p>
          </div>
          
          <div className="product-grid" style={{ overflowX: 'auto', display: 'grid', gridAutoFlow: 'column', gridTemplateColumns: 'none', gap: '20px', paddingBottom: '16px' }} className="product-grid-best-sellers">
            {bestSellers.map(product => {
              const discount = (product.compareAtPrice && product.compareAtPrice > product.minPrice) 
                ? Math.round(((product.compareAtPrice - product.minPrice) / product.compareAtPrice) * 100)
                : 0;

              return (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => navigate(`/products/${product.handle}`)}
                  style={{ width: '100%', minWidth: '240px' }}
                >
                  {discount > 0 && (
                    <span className="discount-badge">SAVE {discount}%</span>
                  )}
                  <div className="product-card-img-wrapper">
                    <img src={product.images[0]} alt={product.title} className="product-card-img" />
                  </div>
                  <div className="product-card-body">
                    <span className="product-card-type">{product.productType}</span>
                    <h3 className="product-card-title">{product.title}</h3>
                    <div className="product-card-price-row">
                      <span className="price-current">${product.minPrice.toFixed(2)}</span>
                      {product.compareAtPrice > product.minPrice && (
                        <span className="price-compare">${product.compareAtPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <button
                      className="btn btn-primary btn-full"
                      onClick={(e) => handleAddProduct(e, product)}
                      style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/collections/all" className="btn btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURED PRODUCT BANNER (LANDING PAGE STYLE) */}
      {featuredProduct && (
        <section className="section section-bg">
          <div className="container">
            <div className="split-banner">
              <div className="split-img-side">
                <img src={featuredProduct.images[0]} alt={featuredProduct.title} className="split-img" />
              </div>
              <div className="split-content-side">
                <span className="split-tag">{featuredCopy.tag}</span>
                <h2 className="split-title">{featuredCopy.headline}</h2>
                <p className="split-subtitle">{featuredCopy.subheadline}</p>
                
                <div className="product-card-price-row" style={{ marginBottom: '10px' }}>
                  <span className="price-current" style={{ fontSize: '1.5rem' }}>${featuredProduct.minPrice.toFixed(2)}</span>
                  {featuredProduct.compareAtPrice > featuredProduct.minPrice && (
                    <span className="price-compare" style={{ fontSize: '1.25rem' }}>${featuredProduct.compareAtPrice.toFixed(2)}</span>
                  )}
                </div>

                <ul className="split-bullets">
                  {featuredBullets.map((bullet, idx) => (
                    <li key={idx} className="split-bullet-item">
                      <span className="bullet-check">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="split-cta-row">
                  <button
                    className="btn btn-primary"
                    onClick={(e) => handleAddProduct(e, featuredProduct)}
                  >
                    Add to Cart
                  </button>
                  <span className="split-meta-text">{featuredCopy.soldText}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: ALL PRODUCTS GRID */}
      <section id="shop-all-products" className="section">
        <div className="container">
          <div className="section-title-wrapper" style={{ marginBottom: '30px' }}>
            <h2 className="section-title">Shop All Products</h2>
            <p className="section-subtitle">Free shipping on US orders over $15 and UK orders over $20</p>
          </div>

          {/* Grid control bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
            {/* Inline filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.slice(0, 4).map(cat => (
                <button
                  key={cat}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: activeCategory === cat ? '#fff' : 'var(--color-text)',
                    fontWeight: '600'
                  }}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
              {activeCategory !== 'All' && !CATEGORIES.slice(0, 4).includes(activeCategory) && (
                <span style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  borderRadius: '4px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  fontWeight: '600'
                }}>
                  {activeCategory}
                </span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Sort By:</span>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option>Featured</option>
                <option>Price Low to High</option>
                <option>Price High to Low</option>
              </select>
            </div>
          </div>

          {/* Products List */}
          {sortProducts(getFilteredProducts(activeCategory), sortBy).length > 0 ? (
            <div className="product-grid">
              {sortProducts(getFilteredProducts(activeCategory), sortBy).map(product => {
                const discount = (product.compareAtPrice && product.compareAtPrice > product.minPrice) 
                  ? Math.round(((product.compareAtPrice - product.minPrice) / product.compareAtPrice) * 100)
                  : 0;

                const savings = (product.compareAtPrice && product.compareAtPrice > product.minPrice)
                  ? (product.compareAtPrice - product.minPrice).toFixed(2)
                  : null;

                return (
                  <div 
                    key={product.id} 
                    className="product-card"
                    onClick={() => navigate(`/products/${product.handle}`)}
                  >
                    {discount > 0 && (
                      <span className="discount-badge">SAVE {discount}%</span>
                    )}
                    <div className="product-card-img-wrapper">
                      <img src={product.images[0]} alt={product.title} className="product-card-img" />
                    </div>
                    <div className="product-card-body">
                      <span className="product-card-type">{product.productType}</span>
                      <h3 className="product-card-title">{product.title}</h3>
                      
                      <div className="product-card-price-row">
                        <span className="price-current">${product.minPrice.toFixed(2)}</span>
                        {product.compareAtPrice > product.minPrice && (
                          <span className="price-compare">${product.compareAtPrice.toFixed(2)}</span>
                        )}
                      </div>

                      {savings && parseFloat(savings) > 0 && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: '700', marginBottom: '12px' }}>
                          Save ${savings}
                        </div>
                      )}

                      <button
                        className="btn btn-primary btn-full"
                        onClick={(e) => handleAddProduct(e, product)}
                        style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
              No products found in this category.
            </div>
          )}
        </div>
      </section>

      {/* SECTION 6: WHY CHOOSE NORTHLANE */}
      <section id="why-choose" className="section section-bg">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">Why Thousands of Customers Choose Northlane</h2>
          </div>
          
          <div className="why-grid">
            <div className="why-card">
              <span className="why-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </span>
              <h3 className="why-card-title">Fast US and UK Shipping</h3>
              <p className="why-card-text">Orders delivered in 7 to 15 business days to the US and 10 to 18 business days to the UK.</p>
            </div>

            <div className="why-card">
              <span className="why-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                </svg>
              </span>
              <h3 className="why-card-title">30-Day Returns</h3>
              <p className="why-card-text">Not happy with your order? Return it within 30 days, no questions asked.</p>
            </div>

            <div className="why-card">
              <span className="why-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <h3 className="why-card-title">Secure Checkout</h3>
              <p className="why-card-text">Every transaction is protected with SSL encryption and processed through Shopify.</p>
            </div>

            <div className="why-card">
              <span className="why-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </span>
              <h3 className="why-card-title">Quality Guaranteed</h3>
              <p className="why-card-text">Every product is carefully selected and reviewed before being listed on our store.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: SOCIAL PROOF NUMBERS */}
      <section className="stats-banner">
        <div className="container stats-grid">
          <div>
            <div className="stat-number">2,400+</div>
            <div className="stat-label">Happy Customers</div>
          </div>
          <div>
            <div className="stat-number">98%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
          <div>
            <div className="stat-number">30-Day</div>
            <div className="stat-label">Return Policy</div>
          </div>
          <div>
            <div className="stat-number">2</div>
            <div className="stat-label">Countries Supported</div>
          </div>
        </div>
      </section>

      {/* SECTION 8: CUSTOMER REVIEWS */}
      <section className="section">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">What Our Customers Are Saying</h2>
            <p className="section-subtitle">Real reviews from real customers across the US and UK</p>
          </div>
          
          <div className="reviews-grid">
            {/* Review 1 */}
            <div className="review-card">
              <div className="review-card-header">
                <span className="reviewer-name">Sarah M.</span>
                <span className="reviewer-loc">New York, USA</span>
              </div>
              <div className="star-rating">
                {Array(5).fill().map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <span className="review-product">40oz Insulated Tumbler</span>
              <p className="review-text">
                I take this tumbler everywhere. Keeps my coffee hot through my entire morning commute and my iced drinks cold all afternoon. Absolutely worth every penny.
              </p>
              <span className="verified-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Verified Buyer
              </span>
            </div>

            {/* Review 2 */}
            <div className="review-card">
              <div className="review-card-header">
                <span className="reviewer-name">James R.</span>
                <span className="reviewer-loc">London, UK</span>
              </div>
              <div className="star-rating">
                {Array(5).fill().map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <span className="review-product">LED Water Ripple Night Light</span>
              <p className="review-text">
                Bought this for my bedroom and the effect is stunning. The water ripple projection across the ceiling is so relaxing. My wife loves it too.
              </p>
              <span className="verified-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Verified Buyer
              </span>
            </div>

            {/* Review 3 */}
            <div className="review-card">
              <div className="review-card-header">
                <span className="reviewer-name">Emily T.</span>
                <span className="reviewer-loc">Los Angeles, USA</span>
              </div>
              <div className="star-rating">
                {Array(4).fill().map((_, i) => (
                  <span key={i}>★</span>
                ))}
                <span style={{color: '#E2E8F0'}}>★</span>
              </div>
              <span className="review-product">Adjustable Back Posture Corrector</span>
              <p className="review-text">
                I work from home and my posture was terrible. After two weeks of wearing this for a few hours a day I can already feel the difference. Comfortable and discreet under my shirt.
              </p>
              <span className="verified-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Verified Buyer
              </span>
            </div>

            {/* Review 4 */}
            <div className="review-card">
              <div className="review-card-header">
                <span className="reviewer-name">Daniel K.</span>
                <span className="reviewer-loc">Manchester, UK</span>
              </div>
              <div className="star-rating">
                {Array(5).fill().map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <span className="review-product">Portable Bluetooth Thermal Label Printer</span>
              <p className="review-text">
                Connects to my phone instantly and prints perfectly. I use it for labelling everything in my home office. Compact and really well made.
              </p>
              <span className="verified-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Verified Buyer
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: FEATURED COLLECTION BANNER */}
      {promoImages.length > 0 && (
        <section className="section section-bg">
          <div className="container">
            <div className="split-banner">
              {/* Left Side: 2x2 grid of real product images */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gridTemplateRows: 'repeat(2, 1fr)',
                  gap: '8px',
                  padding: '16px',
                  backgroundColor: 'var(--color-bg-secondary)',
                  height: '350px'
                }}
                className="split-img-side"
              >
                {promoImages.slice(0, 4).map((url, i) => (
                  <img 
                    key={i} 
                    src={url} 
                    alt="Collection product" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                  />
                ))}
              </div>
              
              {/* Right Side: Heading, description, CTA */}
              <div className="split-content-side">
                <span className="split-tag">Modern Living</span>
                <h2 className="split-title">Transform Your Space</h2>
                <p className="split-subtitle">
                  Discover our collection of premium LED lights and home decor products, designed to elevate your home atmosphere.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setActiveCategory('Home Decor');
                    document.getElementById('shop-all-products').scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Shop Collection
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 10: NEWSLETTER */}
      <section className="section newsletter-section">
        <div className="container newsletter-box">
          <h2 className="section-title" style={{ fontSize: '1.75rem' }}>Get 10% Off Your First Order</h2>
          <p className="section-subtitle">
            Join thousands of customers and get exclusive deals, new arrivals, and style inspiration delivered to your inbox
          </p>
          
          {subscribed ? (
            <div style={{ margin: '24px 0 12px', padding: '16px', backgroundColor: 'var(--color-success)', color: '#fff', borderRadius: '4px', fontWeight: '600' }}>
              Thank you for subscribing! Your discount code has been sent.
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                className="newsletter-input"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          )}
          <p className="newsletter-disclaimer">No spam ever. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* SECTION 11: FAQ ACCORDION */}
      <section id="faq" className="section">
        <div className="container faq-box">
          <div className="section-title-wrapper">
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {
                q: 'Where do you ship?',
                a: 'We ship to the United States and United Kingdom. Free shipping on US orders over $15 and UK orders over $20.'
              },
              {
                q: 'How long does delivery take?',
                a: 'US orders take 7 to 15 business days. UK orders take 10 to 18 business days after processing.'
              },
              {
                q: 'Can I return my order?',
                a: 'Yes. We offer a 30-day return policy for all unused items in original packaging. Email support@northlane.com to start a return.'
              },
              {
                q: 'How do I track my order?',
                a: 'Once your order ships you will receive a tracking number by email. Visit 17track.net and enter your tracking number to see live updates.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept Visa, Mastercard, American Express, Discover, PayPal, and Shop Pay.'
              },
              {
                q: 'Is my payment information secure?',
                a: 'Yes. All payments are processed through Shopify\'s secure checkout system with SSL encryption. We never store your card details.'
              }
            ].map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  >
                    <span>{item.q}</span>
                    <span className="faq-icon-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </button>
                  <div className="faq-answer">
                    {item.a}
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
