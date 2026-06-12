import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../Router';
import { useCart } from '../CartContext';
import { fetchProducts } from '../shopify';

function mapHandleToCategory(handle) {
  if (!handle || handle === 'all') return 'All';
  
  const mapping = {
    'lingerie-nightwear': 'Lingerie & Nightwear',
    'lingerie': 'Lingerie & Nightwear',
    'nightwear': 'Lingerie & Nightwear',
    'beauty-tools-accessories': 'Beauty Tools & Accessories',
    'beauty-tools': 'Beauty Tools & Accessories',
    'accessories': 'Beauty Tools & Accessories',
    'beauty': 'Beauty Tools & Accessories',
    'skincare-creams': 'Beauty Tools & Accessories',
    'creams': 'Beauty Tools & Accessories',
    'skincare': 'Beauty Tools & Accessories',
    'serums': 'Beauty Tools & Accessories',
    'cosmetics-nails': 'Beauty Tools & Accessories',
    'cosmetics': 'Beauty Tools & Accessories',
    'nails': 'Beauty Tools & Accessories',
    'eye': 'Beauty Tools & Accessories',
    'wellness-selfcare': 'Wellness & Self-Care',
    'wellness': 'Wellness & Self-Care',
    'selfcare': 'Wellness & Self-Care',
    'fashion-shoes': 'Fashion & Shoes',
    'shoes': 'Fashion & Shoes',
    'heels': 'Fashion & Shoes',
    'fashion': 'Fashion & Shoes'
  };
  
  return mapping[handle.toLowerCase()] || 'All';
}

function matchProductToCategory(product, category) {
  if (!product.productType) return false;
  const pType = product.productType.toLowerCase();
  const handle = product.handle.toLowerCase();
  const title = product.title.toLowerCase();
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
}

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

const CATEGORIES = [
  'All',
  'Lingerie & Nightwear',
  'Beauty Tools & Accessories',
  'Wellness & Self-Care',
  'Fashion & Shoes'
];

export default function CollectionsPage() {
  const { routeParams, navigate } = useRouter();
  const { handle } = routeParams;
  const { addToCart } = useCart();

  const categoryScrollRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('Featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  
  // Mobile filter drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Pagination
  const [visibleCount, setVisibleCount] = useState(24);

  // Sync category state from URL handle
  useEffect(() => {
    if (handle) {
      setSelectedCategory(mapHandleToCategory(handle));
      setVisibleCount(24);
    }
  }, [handle]);

  useEffect(() => {
    if (categoryScrollRef.current) {
      const activeEl = categoryScrollRef.current.querySelector('.category-pill.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedCategory]);

  useEffect(() => {
    async function loadCollections() {
      try {
        setLoading(true);
        const fetched = await fetchProducts(250);
        setProducts(fetched);
        
        // Extract unique productTypes
        const types = fetched.reduce((acc, p) => {
          if (p.productType && !acc.includes(p.productType)) {
            acc.push(p.productType);
          }
          return acc;
        }, []);
        setCategories(types);
      } catch (err) {
        console.error('Failed to load collections:', err);
        setError(err.message || 'Failed to load collections');
      } finally {
        setLoading(false);
      }
    }
    loadCollections();
  }, []);

  const handleAddProduct = (e, product) => {
    e.stopPropagation();
    if (product.variants && product.variants.length > 0) {
      addToCart(product, product.variants[0], 1);
    }
  };

  // Filter products locally based on sidebar inputs
  const getProcessedProducts = () => {
    let result = [...products];

    // Category Filter (Robust, case-insensitive, substring matching)
    if (selectedCategory !== 'All') {
      result = result.filter(p => matchProductToCategory(p, selectedCategory));
    }

    // Search Query Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.productType && p.productType.toLowerCase().includes(q))
      );
    }

    // On Sale Filter
    if (onSaleOnly) {
      result = result.filter(p => p.compareAtPrice && p.compareAtPrice > p.minPrice);
    }

    // Size Filter
    if (selectedSize) {
      result = result.filter(p => p.sizes && p.sizes.includes(selectedSize));
    }

    // Color Filter
    if (selectedColor) {
      result = result.filter(p => p.colors && p.colors.includes(selectedColor));
    }

    // Top Rated Filter
    if (topRatedOnly) {
      result = result.filter(p => p.rating && p.rating >= 4.5);
    }

    // Min Price Filter
    if (minPrice.trim() !== '') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter(p => p.minPrice >= min);
      }
    }

    // Max Price Filter
    if (maxPrice.trim() !== '') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter(p => p.minPrice <= max);
      }
    }

    // Sorting
    if (sortBy === 'Price Low to High') {
      result.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sortBy === 'Price High to Low') {
      result.sort((a, b) => b.minPrice - a.minPrice);
    } else if (sortBy === 'Newest') {
      // Sort by handle length or ID descending as proxy for newest
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  };

  const filteredProducts = getProcessedProducts();
  const paginatedProducts = filteredProducts.slice(0, visibleCount);

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
        <p style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Loading Catalog...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>All Products</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Showing {filteredProducts.length} premium dropshipping products
        </p>
      </div>

      {/* Mobile Category Navigation (Horizontal Scroll) */}
      <div className="category-bar mobile-only-categories" style={{ borderBottom: 'none', padding: '0 0 16px 0', margin: '-10px 0 20px 0' }}>
        <div className="category-scroll" ref={categoryScrollRef}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleCount(24);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile control bar */}
      <div className="filter-mobile-bar">
        <button 
          className="filter-drawer-toggle-btn"
          onClick={() => setIsFilterDrawerOpen(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
          Filters
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-muted)', display: 'none', md: 'inline' }} className="sort-label-desktop">Sort By:</span>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Featured</option>
            <option>Price Low to High</option>
            <option>Price High to Low</option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      {/* Main Layout */}
      <div className="collections-layout">
        
        {/* Desktop Sidebar Filters */}
        <aside className="filter-sidebar">
          {/* Search Filter */}
          <div className="filter-widget">
            <h3 className="filter-widget-title">Search</h3>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products..."
                className="price-input-field"
                style={{ width: '100%', paddingLeft: '32px' }}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(24); }}
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

          {/* Category Filter */}
          <div className="filter-widget">
            <h3 className="filter-widget-title">Categories</h3>
            <ul className="filter-links-list">
              <li 
                className={`filter-link-item ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => { setSelectedCategory('All'); setVisibleCount(24); }}
              >
                <span>All Categories</span>
                <span>({products.length})</span>
              </li>
              {CATEGORIES.slice(1).map(cat => {
                const count = products.filter(p => matchProductToCategory(p, cat)).length;
                return (
                  <li 
                    key={cat}
                    className={`filter-link-item ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => { setSelectedCategory(cat); setVisibleCount(24); }}
                  >
                    <span>{cat}</span>
                    <span>({count})</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sale & Rating Filter */}
          <div className="filter-widget">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', color: 'var(--color-primary)' }}>
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(e) => { setOnSaleOnly(e.target.checked); setVisibleCount(24); }}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
                />
                <span>On Sale Only</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', color: 'var(--color-primary)' }}>
                <input
                  type="checkbox"
                  checked={topRatedOnly}
                  onChange={(e) => { setTopRatedOnly(e.target.checked); setVisibleCount(24); }}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
                />
                <span>Top Rated (4.5+ ★)</span>
              </label>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-widget">
            <h3 className="filter-widget-title">Price Range</h3>
            <div className="filter-price-inputs" style={{ marginBottom: '12px' }}>
              <input
                type="number"
                placeholder="Min $"
                className="price-input-field"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setVisibleCount(24); }}
              />
              <span style={{ color: 'var(--color-text-muted)' }}>-</span>
              <input
                type="number"
                placeholder="Max $"
                className="price-input-field"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setVisibleCount(24); }}
              />
            </div>
            
            {/* Price Presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
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
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                      color: isActive ? '#0F172A' : 'var(--color-text)',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setMinPrice(preset.min === 0 ? '' : String(preset.min));
                      setMaxPrice(preset.max === 9999 ? '' : String(preset.max));
                      setVisibleCount(24);
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Filter */}
          <div className="filter-widget">
            <h3 className="filter-widget-title">Size</h3>
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
                      backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                      color: isActive ? '#0F172A' : 'var(--color-text)',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    onClick={() => { setSelectedSize(prev => prev === size ? '' : size); setVisibleCount(24); }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Filter */}
          <div className="filter-widget" style={{ borderBottom: 'none' }}>
            <h3 className="filter-widget-title">Color</h3>
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
                      backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                      color: isActive ? '#0F172A' : 'var(--color-text)',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    onClick={() => { setSelectedColor(prev => prev === color ? '' : color); setVisibleCount(24); }}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear All Filters */}
          {(searchQuery || selectedCategory !== 'All' || minPrice || maxPrice || onSaleOnly || selectedSize || selectedColor || topRatedOnly) && (
            <div style={{ padding: '15px 0' }}>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setMinPrice('');
                  setMaxPrice('');
                  setOnSaleOnly(false);
                  setSelectedSize('');
                  setSelectedColor('');
                  setTopRatedOnly(false);
                  setVisibleCount(24);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid #DC2626',
                  color: '#DC2626',
                  borderRadius: '4px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </aside>

        {/* Product Grid */}
        <div>
          {paginatedProducts.length > 0 ? (
            <>
              <div 
                className="product-grid" 
                style={{ 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))'
                }}
              >
                {paginatedProducts.map(product => {
                  const discount = (product.compareAtPrice && product.compareAtPrice > product.minPrice)
                    ? Math.round(((product.compareAtPrice - product.minPrice) / product.compareAtPrice) * 100)
                    : 0;

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

              {/* Load More Button */}
              {filteredProducts.length > visibleCount && (
                <div className="pagination-row">
                  <button
                    className="btn btn-outline"
                    onClick={() => setVisibleCount(prev => prev + 24)}
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0', border: '1px dashed var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)' }}>
              <p style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '8px', color: 'var(--color-primary)' }}>No products match your filters</p>
              <p style={{ fontSize: '0.9rem' }}>Try clearing some filters or narrowing down your search.</p>
              <button 
                className="btn btn-primary"
                style={{ marginTop: '16px' }}
                onClick={() => {
                  setSelectedCategory('All');
                  setMinPrice('');
                  setMaxPrice('');
                  setSearchQuery('');
                  setOnSaleOnly(false);
                  setVisibleCount(24);
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      <div 
        className={`filter-drawer-overlay ${isFilterDrawerOpen ? 'open' : ''}`}
        onClick={() => setIsFilterDrawerOpen(false)}
      ></div>
      <div className={`filter-drawer ${isFilterDrawerOpen ? 'open' : ''}`}>
        <div className="filter-drawer-header">
          <span className="cart-drawer-title">Filters</span>
          <button 
            onClick={() => setIsFilterDrawerOpen(false)}
            aria-label="Close filters"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="filter-widget">
          <h3 className="filter-widget-title">Search</h3>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search products..."
              className="price-input-field"
              style={{ width: '100%', paddingLeft: '32px' }}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(24); }}
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

        {/* Categories */}
        <div className="filter-widget">
          <h3 className="filter-widget-title">Categories</h3>
          <ul className="filter-links-list">
            <li 
              className={`filter-link-item ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => { setSelectedCategory('All'); setIsFilterDrawerOpen(false); setVisibleCount(24); }}
            >
              <span>All Categories</span>
              <span>({products.length})</span>
            </li>
            {CATEGORIES.slice(1).map(cat => {
              const count = products.filter(p => matchProductToCategory(p, cat)).length;
              return (
                <li 
                  key={cat}
                  className={`filter-link-item ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => { setSelectedCategory(cat); setIsFilterDrawerOpen(false); setVisibleCount(24); }}
                >
                  <span>{cat}</span>
                  <span>({count})</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sale & Rating Filter */}
        <div className="filter-widget">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', color: 'var(--color-primary)' }}>
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => { setOnSaleOnly(e.target.checked); setVisibleCount(24); }}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
              />
              <span>On Sale Only</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', color: 'var(--color-primary)' }}>
              <input
                type="checkbox"
                checked={topRatedOnly}
                onChange={(e) => { setTopRatedOnly(e.target.checked); setVisibleCount(24); }}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
              />
              <span>Top Rated (4.5+ ★)</span>
            </label>
          </div>
        </div>

        {/* Price Range */}
        <div className="filter-widget">
          <h3 className="filter-widget-title">Price Range</h3>
          <div className="filter-price-inputs" style={{ marginBottom: '12px' }}>
            <input
              type="number"
              placeholder="Min $"
              className="price-input-field"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setVisibleCount(24); }}
            />
            <span style={{ color: 'var(--color-text-muted)' }}>-</span>
            <input
              type="number"
              placeholder="Max $"
              className="price-input-field"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setVisibleCount(24); }}
            />
          </div>

          {/* Price Presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
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
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                    color: isActive ? '#0F172A' : 'var(--color-text)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setMinPrice(preset.min === 0 ? '' : String(preset.min));
                    setMaxPrice(preset.max === 9999 ? '' : String(preset.max));
                    setVisibleCount(24);
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Size Filter */}
        <div className="filter-widget">
          <h3 className="filter-widget-title">Size</h3>
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
                    backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                    color: isActive ? '#0F172A' : 'var(--color-text)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onClick={() => { setSelectedSize(prev => prev === size ? '' : size); setVisibleCount(24); }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Filter */}
        <div className="filter-widget" style={{ borderBottom: 'none' }}>
          <h3 className="filter-widget-title">Color</h3>
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
                    backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                    color: isActive ? '#0F172A' : 'var(--color-text)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onClick={() => { setSelectedColor(prev => prev === color ? '' : color); setVisibleCount(24); }}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '20px 15px' }}>
          <button
            className="btn btn-primary btn-full"
            onClick={() => setIsFilterDrawerOpen(false)}
          >
            Apply Filters
          </button>
          {(minPrice || maxPrice || searchQuery || selectedCategory !== 'All' || onSaleOnly || selectedSize || selectedColor || topRatedOnly) && (
            <button 
              onClick={() => {
                setSelectedCategory('All');
                setMinPrice('');
                setMaxPrice('');
                setSearchQuery('');
                setOnSaleOnly(false);
                setSelectedSize('');
                setSelectedColor('');
                setTopRatedOnly(false);
                setIsFilterDrawerOpen(false);
                setVisibleCount(24);
              }}
              style={{ fontSize: '0.85rem', color: '#DC2626', fontWeight: '600', marginTop: '16px', display: 'block', margin: '16px auto 0', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
