import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../Router';
import { useCart } from '../CartContext';
import { fetchProducts } from '../shopify';

const CATEGORIES = [
  'All',
  'Lingerie & Nightwear',
  'Beauty Tools & Accessories',
  'Wellness & Self-Care',
  'Fashion & Shoes'
];

const renderStars = (rating) => {
  const rounded = Math.round(rating);
  return (
    <div style={{ display: 'flex', color: '#F59E0B', fontSize: '0.85rem', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star}>{star <= rounded ? '★' : '☆'}</span>
      ))}
    </div>
  );
};

export default function Homepage() {
  const { navigate } = useRouter();
  const { addToCart } = useCart();
  
  const categoryScrollRef = React.useRef(null);
  const shopCategoryScrollRef = React.useRef(null);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Category filter state (shares between category bar and shop all products)
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Sorting state
  const [sortBy, setSortBy] = useState('Featured');
  
  // New Filter states for homepage
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // FAQ accordion state
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

  // Newsletter state
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await fetchProducts(250);
        console.log('[Homepage] Raw products fetched from Shopify:', data);
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

  useEffect(() => {
    const centerActivePill = (container) => {
      if (!container) return;
      const activeEl = container.querySelector('.category-pill.active');
      if (!activeEl) return;
      
      const containerWidth = container.clientWidth;
      const pillOffset = activeEl.offsetLeft;
      const pillWidth = activeEl.clientWidth;
      
      const scrollTarget = pillOffset - (containerWidth / 2) + (pillWidth / 2);
      
      container.scrollTo({
        left: scrollTarget,
        behavior: 'smooth'
      });
    };

    centerActivePill(categoryScrollRef.current);
    centerActivePill(shopCategoryScrollRef.current);
  }, [activeCategory]);

  // Filter products by category, search query, sale status, and price
  const getFilteredProducts = (category) => {
    let result = [...products];

    // 1. Category Filter (Robust matching)
    if (category !== 'All') {
      result = result.filter(p => {
        if (!p.productType) return false;
        const pType = p.productType.toLowerCase();
        const handle = p.handle.toLowerCase();
        const title = p.title.toLowerCase();
        const cat = category.toLowerCase();
        
        // Exact matches
        if (pType === cat) return true;
        
        // Lingerie & Nightwear
        if (cat.includes('lingerie') || cat.includes('nightwear')) {
          const keywords = ['lingerie', 'bra', 'babydoll', 'teddy', 'thong', 'panties', 'chemise', 'nightwear'];
          return keywords.some(k => handle.includes(k) || title.includes(k));
        }
        
        // Beauty Tools & Accessories
        if (cat.includes('beauty') || cat.includes('tool') || cat.includes('accessories')) {
          const keywords = [
            'brush-cleaner', 'makeup', 'massager', 'hair-identifier', 
            'mascara', 'hair-removal', 'depilatory', 'ear-wax', 
            'eyelash', 'skincare', 'cosmetics', 'brush', 'slimming'
          ];
          // Exclude lingerie
          const isLingerie = ['lingerie', 'bra', 'babydoll', 'teddy', 'thong', 'panties', 'chemise', 'nightwear']
            .some(k => handle.includes(k) || title.includes(k));
          if (isLingerie) return false;

          return pType.includes('beauty') || pType.includes('makeup') || pType.includes('cosmetics') || keywords.some(k => handle.includes(k) || title.includes(k));
        }
        
        // Wellness & Self-Care
        if (cat.includes('wellness') || cat.includes('care')) {
          const keywords = [
            'tumbler', 'pilates', 'headband', 'fitness', 'bracelet', 
            'massager', 'ear-wax', 'posture', 'spine', 'belt', 
            'orthosis', 'health', 'relax', 'massage'
          ];
          // Exclude lingerie
          const isLingerie = ['lingerie', 'bra', 'babydoll', 'teddy', 'thong', 'panties', 'chemise', 'nightwear']
            .some(k => handle.includes(k) || title.includes(k));
          if (isLingerie) return false;

          // Exclude fashion/shoes/heels
          const isFashionOrHeels = ['heels', 'shoes', 'jumpsuit', 'dress']
            .some(k => handle.includes(k) || title.includes(k));
          if (isFashionOrHeels) return false;

          return pType.includes('wellness') || pType.includes('fitness') || pType.includes('lifestyle') || keywords.some(k => handle.includes(k) || title.includes(k));
        }
        
        // Fashion & Shoes
        if (cat.includes('shoes') || cat.includes('fashion') || cat.includes('heel')) {
          const keywords = ['heels', 'shoes', 'jumpsuit', 'bag', 'accessories', 'headband', 'jewelry', 'outfit', 'dress', 'doll', 'couple doll', 'decor'];
          // Exclude lingerie
          const isLingerie = ['lingerie', 'bra', 'babydoll', 'teddy', 'thong', 'panties', 'chemise', 'nightwear']
            .some(k => handle.includes(k) || title.includes(k));
          if (isLingerie) return false;

          return pType.includes('fashion') || pType.includes('shoes') || pType.includes('lifestyle') || pType.includes('decor') || keywords.some(k => handle.includes(k) || title.includes(k));
        }
        
        return pType.includes(cat) || cat.includes(pType);
      });
    }

    // 2. Search Query Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.productType && p.productType.toLowerCase().includes(q))
      );
    }

    // 3. On Sale Filter
    if (onSaleOnly) {
      result = result.filter(p => p.compareAtPrice && p.compareAtPrice > p.minPrice);
    }

    // 3a. Size Filter
    if (selectedSize) {
      result = result.filter(p => p.sizes && p.sizes.includes(selectedSize));
    }

    // 3b. Color Filter
    if (selectedColor) {
      result = result.filter(p => p.colors && p.colors.includes(selectedColor));
    }

    // 3c. Top Rated Filter
    if (topRatedOnly) {
      result = result.filter(p => p.rating && p.rating >= 4.5);
    }

    // 4. Min Price Filter
    if (minPrice.trim() !== '') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter(p => p.minPrice >= min);
      }
    }

    // 5. Max Price Filter
    if (maxPrice.trim() !== '') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter(p => p.minPrice <= max);
      }
    }

    return result;
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
    if (handle.includes('lingerie') || handle.includes('bra') || handle.includes('babydoll') || handle.includes('teddy') || handle.includes('thong')) {
      return {
        tag: 'Exquisite Lace',
        headline: 'Luxurious Lingerie & Nightwear Collection',
        subheadline: 'Crafted with premium soft-touch lace and sheer mesh designed to hug your curves with complete comfort and elegance.',
        soldText: 'Trending this week'
      };
    }
    if (handle.includes('heels') || handle.includes('toe-solid-color')) {
      return {
        tag: 'Premium Footwear',
        headline: 'Elegant Pointed-Toe Heels',
        subheadline: 'Solid-color square-toe premium heels combining supreme comfort and high-fashion block heel design.',
        soldText: 'Chic collection favorite'
      };
    }
    if (handle.includes('massager') || handle.includes('vibration-body')) {
      return {
        tag: 'Self-Care Wellness',
        headline: 'Micro-Vibration Compression Massager',
        subheadline: 'Relieve daily tension and soothe muscles with high-frequency micro-vibration and adjustable compression.',
        soldText: 'Wellness top pick'
      };
    }

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
      subheadline: product.description ? product.description.split('.').slice(0, 2).join('.') + '.' : 'Carefully selected and reviewed for premium US quality.',
      soldText: 'High demand product'
    };
  };

  // 1. 5-Day Best Sellers Rotation (Always show beauty tools)
  const getDailyBestSellers = () => {
    if (products.length === 0) return [];
    
    // Filter for beauty tools
    const beautyTools = products.filter(p => {
      if (!p.productType) return false;
      const pType = p.productType.toLowerCase();
      const handle = p.handle.toLowerCase();
      const title = p.title.toLowerCase();
      
      const keywords = [
        'brush-cleaner', 'makeup', 'massager', 'hair-identifier', 
        'mascara', 'hair-removal', 'depilatory', 'ear-wax', 
        'eyelash', 'skincare', 'cosmetics', 'brush', 'slimming'
      ];
      // Exclude lingerie
      const isLingerie = ['lingerie', 'bra', 'babydoll', 'teddy', 'thong', 'panties', 'chemise', 'nightwear']
        .some(k => handle.includes(k) || title.includes(k));
      if (isLingerie) return false;
      
      return pType.includes('beauty') || pType.includes('makeup') || pType.includes('cosmetics') || keywords.some(k => handle.includes(k) || title.includes(k));
    });

    if (beautyTools.length === 0) return [];

    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const offset = Math.floor(daysSinceEpoch / 5) % beautyTools.length;
    const shifted = [...beautyTools.slice(offset), ...beautyTools.slice(0, offset)];
    return shifted.slice(0, 4);
  };
  const bestSellers = getDailyBestSellers();

  // 2. 3-Day Featured Product Rotation (> $20)
  const getFeaturedProduct = () => {
    const eligible = products.filter(p => p.minPrice > 20);
    if (eligible.length === 0) return products[0];
    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const index = Math.floor(daysSinceEpoch / 3) % eligible.length;
    return eligible[index];
  };
  const featuredProduct = getFeaturedProduct();
  const featuredCopy = getFeaturedCopy(featuredProduct);

  // 3. 3-Day Featured Collection Rotation (Home Decor, Dining, Lifestyle)
  const getFeaturedCollectionProducts = () => {
    const eligible = products.filter(p => 
      p.handle.includes('octopus') || 
      p.handle.includes('water-ripple') || 
      p.handle.includes('camping-light') ||
      p.productType.toLowerCase().includes('decor') ||
      p.productType.toLowerCase().includes('dining') ||
      p.productType.toLowerCase().includes('lifestyle')
    );
    if (eligible.length === 0) return [];
    
    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const offset = Math.floor(daysSinceEpoch / 3) % eligible.length;
    const shifted = [...eligible.slice(offset), ...eligible.slice(0, offset)];
    return shifted.slice(0, 4);
  };
  const featuredCollectionProducts = getFeaturedCollectionProducts();

  // Fallback if we don't have exactly 4 images for the 2x2 grid
  const promoImages = [];
  featuredCollectionProducts.forEach(p => {
    if (p.images && p.images[0]) promoImages.push(p.images[0]);
  });
  while (promoImages.length > 0 && promoImages.length < 4) {
    promoImages.push(promoImages[promoImages.length - 1]);
  }

  // Parse bullet points from featured product features
  const featuredBullets = featuredProduct ? featuredProduct.features.slice(0, 3) : [
    'Premium Curated Design',
    'Everyday Functionality',
    'US Tracked Delivery'
  ];

  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div style={{ maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>Storefront Connection Error</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
            We're unable to connect to the Shopify storefront at the moment. Please verify your internet connection or try again later.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginTop: '8px', fontFamily: 'monospace' }}>Error: {error}</p>
        </div>
        <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ padding: '10px 24px' }}>
          Retry Connection
        </button>
      </div>
    );
  }

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
          <h1 className="hero-title">Unveil Your Radiance. Embrace Your Elegance.</h1>
          <p className="hero-subtitle">
            Luxury lingerie, boutique skincare, creams, serums, cosmetics, and self-care essentials curated for the modern woman.
          </p>
          <div className="hero-actions">
            <Link to="/collections/all" className="btn btn-primary">Shop the Boutique</Link>
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
              <span>Free US Shipping</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                </svg>
              </span>
              <span>7-Day Returns</span>
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
          <div className="category-scroll" ref={categoryScrollRef}>
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
            <p className="section-subtitle">Our most loved products, chosen by customers across the United States</p>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0 8px' }}>
                      {renderStars(product.rating || 4.5)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>({product.ratingCount || 28})</span>
                    </div>
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
            <p className="section-subtitle">Free shipping on all US orders over $15</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }} className="shop-grid-control-bar">
            {/* Inline filters */}
            <div className="category-scroll" ref={shopCategoryScrollRef} style={{ flex: '1', minWidth: '280px' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat);
                    setSearchQuery('');
                    setMinPrice('');
                    setMaxPrice('');
                    setOnSaleOnly(false);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Right Side: Filters toggle & Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {/* Collapsible Filters Toggle Button */}
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: isFilterPanelOpen || searchQuery || minPrice || maxPrice || onSaleOnly || selectedSize || selectedColor || topRatedOnly ? 'var(--color-bg-secondary)' : 'transparent',
                  color: 'var(--color-primary)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={() => setIsFilterPanelOpen(prev => !prev)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                <span>Filters {searchQuery || minPrice || maxPrice || onSaleOnly || selectedSize || selectedColor || topRatedOnly ? '•' : ''}</span>
              </button>

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
          </div>

          {/* Collapsible Filters Panel */}
          {isFilterPanelOpen && (
            <div 
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '30px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}
            >
              {/* Search Within Category */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>Search products</h4>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Type to search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>Price Range</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder="Min $"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                  <input
                    type="number"
                    placeholder="Max $"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Price Presets */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>Price Presets</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { label: 'Under $20', min: 0, max: 20 },
                    { label: '$20 - $50', min: 20, max: 50 },
                    { label: '$50 & Above', min: 50, max: 9999 }
                  ].map(preset => {
                    const isActive = (minPrice === (preset.min === 0 ? '' : String(preset.min))) && (maxPrice === (preset.max === 9999 ? '' : String(preset.max)));
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-bg)',
                          color: isActive ? '#0F172A' : 'var(--color-text)',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setMinPrice(preset.min === 0 ? '' : String(preset.min));
                          setMaxPrice(preset.max === 9999 ? '' : String(preset.max));
                        }}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>Filter by Size</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['S', 'M', 'L', 'XL', 'US 6', 'US 7', 'US 8', 'US 9', 'US 10'].map(size => {
                    const isActive = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-bg)',
                          color: isActive ? '#0F172A' : 'var(--color-text)',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedSize(prev => prev === size ? '' : size)}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Filter */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>Filter by Color</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['Black', 'Ruby Red', 'Emerald Green', 'White', 'Nude', 'Pink'].map(color => {
                    const isActive = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-bg)',
                          color: isActive ? '#0F172A' : 'var(--color-text)',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedColor(prev => prev === color ? '' : color)}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sale & Rating Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', color: 'var(--color-primary)', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => setOnSaleOnly(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
                  />
                  <span>On Sale Only</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', color: 'var(--color-primary)' }}>
                  <input
                    type="checkbox"
                    checked={topRatedOnly}
                    onChange={(e) => setTopRatedOnly(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
                  />
                  <span>Top Rated Only (4.5+ ★)</span>
                </label>

                {(searchQuery || minPrice || maxPrice || onSaleOnly || selectedSize || selectedColor || topRatedOnly) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setMinPrice('');
                      setMaxPrice('');
                      setOnSaleOnly(false);
                      setSelectedSize('');
                      setSelectedColor('');
                      setTopRatedOnly(false);
                    }}
                    style={{
                      fontSize: '0.8rem',
                      color: '#DC2626',
                      fontWeight: '600',
                      textDecoration: 'underline',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '4px 0',
                      marginTop: '8px'
                    }}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}

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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0 8px' }}>
                        {renderStars(product.rating || 4.5)}
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>({product.ratingCount || 28})</span>
                      </div>
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
            <div style={{ textAlign: 'center', padding: '80px 0', border: '1px dashed var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)' }}>
              <p style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '8px', color: 'var(--color-primary)' }}>No products match your filters</p>
              <p style={{ fontSize: '0.9rem' }}>Try clearing some filters or narrowing down your search.</p>
              <button 
                className="btn btn-primary"
                style={{ marginTop: '16px' }}
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                  setMinPrice('');
                  setMaxPrice('');
                  setOnSaleOnly(false);
                }}
              >
                Reset Filters
              </button>
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
              <h3 className="why-card-title">Fast & Discreet Shipping</h3>
              <p className="why-card-text">Delivered in 7 to 15 business days to the US in secure, unbranded, discreet packaging.</p>
            </div>

            <div className="why-card">
              <span className="why-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                </svg>
              </span>
              <h3 className="why-card-title">Hassle-Free Returns</h3>
              <p className="why-card-text">Not fully satisfied? Return any unused beauty or lingerie product within 7 days.</p>
            </div>

            <div className="why-card">
              <span className="why-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <h3 className="why-card-title">Secure Checkout</h3>
              <p className="why-card-text">Every transaction is fully SSL encrypted and securely processed via Shopify checkout.</p>
            </div>

            <div className="why-card">
              <span className="why-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </span>
              <h3 className="why-card-title">Premium Fabric & Ingredients</h3>
              <p className="why-card-text">Every lace set, cosmetic formulation, and self-care accessory is dermatologically safe and tested.</p>
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
            <p className="section-subtitle">Real reviews from real customers across the United States</p>
          </div>
          
          <div className="reviews-grid">
            {/* Review 1 */}
            <div className="review-card">
              <div className="review-card-header">
                <span className="reviewer-name">Jessica L.</span>
                <span className="reviewer-loc">Miami, USA</span>
              </div>
              <div className="star-rating">
                {Array(5).fill().map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <span className="review-product">Lace Lingerie Set with Bra and Thong</span>
              <p className="review-text">
                The fit is absolutely perfect! The lace is incredibly soft and comfortable on the skin, and the design is stunning. My new favorite lingerie set!
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
                <span className="reviewer-name">Ashley P.</span>
                <span className="reviewer-loc">Boston, USA</span>
              </div>
              <div className="star-rating">
                {Array(5).fill().map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <span className="review-product">Pointed-toe Solid-color High Heels</span>
              <p className="review-text">
                So elegant and surprisingly comfortable for square-toe heels! I wore them for a whole wedding reception and my feet didn't hurt. Highly recommend.
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
                <span className="reviewer-name">Chloe M.</span>
                <span className="reviewer-loc">Los Angeles, USA</span>
              </div>
              <div className="star-rating">
                {Array(5).fill().map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <span className="review-product">Adjustable Back Posture Corrector</span>
              <p className="review-text">
                As a beauty blogger, I spend hours hunching over editing screens. This corrector is discreet, fits perfectly under my tops, and has significantly reduced my back strain.
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
                <span className="reviewer-name">Sophia K.</span>
                <span className="reviewer-loc">New York, USA</span>
              </div>
              <div className="star-rating">
                {Array(5).fill().map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <span className="review-product">Lace Babydoll Chemise with Thong</span>
              <p className="review-text">
                This chemise is beautiful! The sheer mesh is high-quality and the details are exquisite. Shipping was fast, and the packaging was very discreet.
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
  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', borderRadius: '4px' }}
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
                a: 'We ship across the United States. Free shipping is available on all US orders over $15.'
              },
              {
                q: 'How long does delivery take?',
                a: 'Orders are processed in 1 to 3 business days, and standard delivery takes 7 to 15 business days.'
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
