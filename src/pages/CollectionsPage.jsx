import React, { useState, useEffect } from 'react';
import { useRouter } from '../Router';
import { useCart } from '../CartContext';
import { fetchProducts } from '../shopify';

export default function CollectionsPage() {
  const { navigate } = useRouter();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('Featured');
  
  // Mobile filter drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Pagination
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    async function loadCollections() {
      try {
        setLoading(true);
        const fetched = await fetchProducts(50);
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

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.productType === selectedCategory);
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
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>All Products</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Showing {filteredProducts.length} premium dropshipping products
        </p>
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
          {/* Category Filter */}
          <div className="filter-widget">
            <h3 className="filter-widget-title">Categories</h3>
            <ul className="filter-links-list">
              <li 
                className={`filter-link-item ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => { setSelectedCategory('All'); setVisibleCount(6); }}
              >
                <span>All Categories</span>
                <span>({products.length})</span>
              </li>
              {categories.map(cat => {
                const count = products.filter(p => p.productType === cat).length;
                return (
                  <li 
                    key={cat}
                    className={`filter-link-item ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => { setSelectedCategory(cat); setVisibleCount(6); }}
                  >
                    <span>{cat}</span>
                    <span>({count})</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Price Range Filter */}
          <div className="filter-widget" style={{ borderBottom: 'none' }}>
            <h3 className="filter-widget-title">Price Range</h3>
            <div className="filter-price-inputs">
              <input
                type="number"
                placeholder="Min $"
                className="price-input-field"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setVisibleCount(6); }}
              />
              <span style={{ color: 'var(--color-text-muted)' }}>-</span>
              <input
                type="number"
                placeholder="Max $"
                className="price-input-field"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setVisibleCount(6); }}
              />
            </div>
            {(minPrice || maxPrice) && (
              <button 
                onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: '600', marginTop: '12px', textDecoration: 'underline' }}
              >
                Clear Price Filter
              </button>
            )}
          </div>
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
                    onClick={() => setVisibleCount(prev => prev + 6)}
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

        {/* Categories */}
        <div className="filter-widget">
          <h3 className="filter-widget-title">Categories</h3>
          <ul className="filter-links-list">
            <li 
              className={`filter-link-item ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => { setSelectedCategory('All'); setIsFilterDrawerOpen(false); setVisibleCount(6); }}
            >
              <span>All Categories</span>
              <span>({products.length})</span>
            </li>
            {categories.map(cat => {
              const count = products.filter(p => p.productType === cat).length;
              return (
                <li 
                  key={cat}
                  className={`filter-link-item ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => { setSelectedCategory(cat); setIsFilterDrawerOpen(false); setVisibleCount(6); }}
                >
                  <span>{cat}</span>
                  <span>({count})</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Price Range */}
        <div className="filter-widget" style={{ borderBottom: 'none' }}>
          <h3 className="filter-widget-title">Price Range</h3>
          <div className="filter-price-inputs" style={{ marginBottom: '16px' }}>
            <input
              type="number"
              placeholder="Min $"
              className="price-input-field"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setVisibleCount(6); }}
            />
            <span style={{ color: 'var(--color-text-muted)' }}>-</span>
            <input
              type="number"
              placeholder="Max $"
              className="price-input-field"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setVisibleCount(6); }}
            />
          </div>
          <button
            className="btn btn-primary btn-full"
            onClick={() => setIsFilterDrawerOpen(false)}
          >
            Apply Filters
          </button>
          {(minPrice || maxPrice) && (
            <button 
              onClick={() => { setMinPrice(''); setMaxPrice(''); setIsFilterDrawerOpen(false); }}
              style={{ fontSize: '0.85rem', color: '#DC2626', fontWeight: '600', marginTop: '16px', display: 'block', margin: '16px auto 0', textDecoration: 'underline' }}
            >
              Clear Price Filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
