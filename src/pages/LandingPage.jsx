import React, { useState, useEffect } from 'react';
import { useRouter } from '../Router';
import { useCart } from '../CartContext';
import { fetchProductByHandle } from '../shopify';

export default function LandingPage() {
  const { navigate } = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

  const handleHandle = '40-oz-tumbler-with-handle-straw-insulated-stainless-steel-spill-proof-vacuum-coffee-cup-tumbler-with-lid-tapered-mug-gifts-for-valentine-lover-suitable-for-car-gym-office-travel';

  useEffect(() => {
    async function loadLandingProduct() {
      try {
        setLoading(true);
        const data = await fetchProductByHandle(handleHandle);
        if (data) {
          setProduct(data);
          setActiveImage(data.images[0] || '');
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load landing page product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLandingProduct();
  }, []);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    if (variant.image) {
      setActiveImage(variant.image);
    }
  };

  const handleAdd = () => {
    if (product && selectedVariant) {
      addToCart(product, selectedVariant, 1);
    }
  };

  if (loading || !product) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--color-accent)', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderWidth: '4px' }}></div>
        <p style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Loading Tumbler Offer...</p>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.minPrice;
  const comparePrice = selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice;

  return (
    <div className="landing-page-container" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* MINIMAL NAVBAR */}
      <nav className="landing-nav">
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
          style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '-0.5px' }}
        >
          NORTHLANE
        </a>
      </nav>

      {/* HERO SECTION */}
      <section className="section landing-hero" style={{ paddingBottom: '30px' }}>
        <div className="container landing-hero-grid">
          {/* Left: Product Image */}
          <div className="gallery-container">
            <div className="gallery-main-wrapper" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
              <img src={activeImage} alt={product.title} className="gallery-main-img" />
            </div>
            {product.images.length > 1 && (
              <div className="gallery-thumbnails" style={{ justifyContent: 'center' }}>
                {product.images.slice(0, 4).map((imgUrl, i) => (
                  <button
                    key={i}
                    className={`thumbnail-btn ${activeImage === imgUrl ? 'active' : ''}`}
                    onClick={() => setActiveImage(imgUrl)}
                  >
                    <img src={imgUrl} alt={`Thumb ${i + 1}`} className="thumbnail-img" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Pitch & Buy Box */}
          <div className="product-info-col">
            <span className="split-tag">Direct Offer</span>
            <h1 className="product-info-title" style={{ fontSize: '2.25rem', lineHeight: '1.2', marginBottom: '16px' }}>
              The Tumbler That Goes Everywhere You Do
            </h1>
            <div style={{ marginBottom: '12px', fontFamily: 'var(--font-sans)' }}>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>✓</span>
                  <span>40oz double-wall vacuum insulated stainless steel construction.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>✓</span>
                  <span>Keeps beverages ice cold for 24 hours and piping hot for 12 hours.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>✓</span>
                  <span>Tapered slim base slides perfectly into standard vehicle cup holders.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>✓</span>
                  <span>Spill-proof 3-way rotating lid with reusable Tritan straw included.</span>
                </li>
              </ul>
            </div>

            {/* Pricing */}
            <div className="product-info-price-row" style={{ marginBottom: '10px' }}>
              <span className="price-current" style={{ fontSize: '2rem' }}>${currentPrice.toFixed(2)}</span>
              {comparePrice > currentPrice && (
                <span className="price-compare" style={{ fontSize: '1.25rem' }}>${comparePrice.toFixed(2)}</span>
              )}
            </div>

            {/* Variant Selector */}
            <div className="variant-selector-box" style={{ marginBottom: '10px' }}>
              <h3 className="variant-label">Choose Your Color:</h3>
              <div className="variant-options">
                {product.variants.map((v) => {
                  const colorName = v.title.split(' / ')[0].replace(' color', '');
                  return (
                    <button
                      key={v.id}
                      className={`variant-pill-btn ${selectedVariant?.id === v.id ? 'active' : ''}`}
                      onClick={() => handleVariantSelect(v)}
                    >
                      {colorName}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              className="btn btn-accent btn-full"
              style={{ height: '46px', fontSize: '1rem', marginBottom: '16px' }}
              onClick={handleAdd}
            >
              Add to Cart
            </button>

            {/* Trust Badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-primary)' }}>
                <span style={{ color: 'var(--color-accent)', display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <span>Secure SSL Checkout</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-primary)' }}>
                <span style={{ color: 'var(--color-accent)', display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                  </svg>
                </span>
                <span>30-Day Guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-primary)' }}>
                <span style={{ color: 'var(--color-accent)', display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span>Tracked Shipping</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <section className="landing-social-proof">
        <div className="container landing-social-row">
          <div className="landing-social-item">
            <span style={{ color: 'var(--color-accent)' }}>★ ★ ★ ★ ★</span>
            <span>2,400+ Happy Customers</span>
          </div>
          <div className="landing-social-item">
            <span>4.8 Star Average Rating</span>
          </div>
          <div className="landing-social-item">
            <span>Free US and UK Shipping</span>
          </div>
        </div>
      </section>

      {/* PROBLEM & SOLUTION SECTION */}
      <section className="section">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">Sound Familiar?</h2>
            <p className="section-subtitle">Why traditional cups fail you daily</p>
          </div>

          <div className="pain-sol-container">
            {/* Pain Points */}
            <div className="pain-side">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#B91C1C', marginBottom: '20px' }}>The Standard Cup</h3>
              <div className="pain-sol-item">
                <span className="pain-x-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </span>
                <span>Your drink goes cold in an hour</span>
              </div>
              <div className="pain-sol-item">
                <span className="pain-x-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </span>
                <span>Condensation ruins your desk and bag</span>
              </div>
              <div className="pain-sol-item">
                <span className="pain-x-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </span>
                <span>Flimsy lids that leak everywhere</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="pain-sol-arrow-col">
              <span className="pain-sol-arrow">→</span>
            </div>

            {/* Solutions */}
            <div className="sol-side">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#15803D', marginBottom: '20px' }}>The Northlane Tumbler</h3>
              <div className="pain-sol-item">
                <span className="sol-check-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span>Stays ice cold for 24 hours, hot for 12 hours</span>
              </div>
              <div className="pain-sol-item">
                <span className="sol-check-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span>No condensation double-wall insulated design</span>
              </div>
              <div className="pain-sol-item">
                <span className="sol-check-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span>Spill-proof lid guaranteed for worry-free travel</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT FEATURES */}
      <section className="section section-bg">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">Designed for Everyday Excellence</h2>
            <p className="section-subtitle">Premium features backed by smart design</p>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <span className="why-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </span>
              <h3 className="why-card-title">Double Wall Vacuum</h3>
              <p className="why-card-text">Maintains your drink's starting temperature all day without sweating.</p>
            </div>
            
            <div className="why-card">
              <span className="why-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </span>
              <h3 className="why-card-title">Spill-Proof Lid</h3>
              <p className="why-card-text">Advanced sealing system locks tight to prevent leaks and splashes.</p>
            </div>

            <div className="why-card">
              <span className="why-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </span>
              <h3 className="why-card-title">Comfort Handle</h3>
              <p className="why-card-text">Ergonomically designed handle ensures a secure, easy, fatigue-free grip.</p>
            </div>

            <div className="why-card">
              <span className="why-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </span>
              <h3 className="why-card-title">Cup Holder Fit</h3>
              <p className="why-card-text">Tapered base slides perfectly into all standard vehicle cup holders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="section">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">How It Compares</h2>
            <p className="section-subtitle">Why Northlane is the clear choice</p>
          </div>

          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="compare-highlight">Northlane Tumbler</th>
                  <th>Standard Tumbler</th>
                  <th>Other Brands</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Temp Retention</td>
                  <td className="compare-highlight">24h Cold / 12h Hot</td>
                  <td>2h Cold / 1h Hot</td>
                  <td>6h Cold / 3h Hot</td>
                </tr>
                <tr>
                  <td>Spill-Proof Lid</td>
                  <td className="compare-highlight">Yes - 100% Leakproof</td>
                  <td>No</td>
                  <td>Leaks easily</td>
                </tr>
                <tr>
                  <td>Handle Included</td>
                  <td className="compare-highlight">Yes - Ergonomic</td>
                  <td>No</td>
                  <td>Extra Cost ($10)</td>
                </tr>
                <tr>
                  <td>Car Cup Holder Fit</td>
                  <td className="compare-highlight">Yes - Tapered base</td>
                  <td>No</td>
                  <td>Too wide</td>
                </tr>
                <tr>
                  <td>Price</td>
                  <td className="compare-highlight">$21.99</td>
                  <td>$15.00</td>
                  <td>$45.00+</td>
                </tr>
                <tr>
                  <td>Warranty</td>
                  <td className="compare-highlight">30-Day Hassle-Free</td>
                  <td>None</td>
                  <td>Limited 1-Year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section section-bg">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">Real Tumbler Reviews</h2>
          </div>

          <div className="reviews-grid">
            <div className="review-card">
              <div className="review-card-header">
                <span className="reviewer-name">Sarah M.</span>
                <span className="reviewer-loc">New York, USA</span>
              </div>
              <div className="star-rating">★★★★★</div>
              <p className="review-text">
                I take this tumbler everywhere. Keeps my coffee hot through my entire morning commute and my iced drinks cold all afternoon. Absolutely worth every penny.
              </p>
              <span className="verified-badge">Verified Buyer</span>
            </div>

            <div className="review-card">
              <div className="review-card-header">
                <span className="reviewer-name">James L.</span>
                <span className="reviewer-loc">London, UK</span>
              </div>
              <div className="star-rating">★★★★★</div>
              <p className="review-text">
                Bought this for my gym sessions and work. Fits the cup holder in my car perfectly, handle is super convenient, and the straw is nice and wide. No leaks!
              </p>
              <span className="verified-badge">Verified Buyer</span>
            </div>

            <div className="review-card">
              <div className="review-card-header">
                <span className="reviewer-name">Emily K.</span>
                <span className="reviewer-loc">Chicago, USA</span>
              </div>
              <div className="star-rating">★★★★★</div>
              <p className="review-text">
                The peony color is beautiful. Keeps my water cold all night long. Extremely sturdy, survived a couple of drops already without a scratch.
              </p>
              <span className="verified-badge">Verified Buyer</span>
            </div>

            <div className="review-card">
              <div className="review-card-header">
                <span className="reviewer-name">Robert T.</span>
                <span className="reviewer-loc">Edinburgh, UK</span>
              </div>
              <div className="star-rating">★★★★★</div>
              <p className="review-text">
                Delivered in just 10 days to Scotland. The lid lock is secure and it is very easy to clean. Perfect for long road trips.
              </p>
              <span className="verified-badge">Verified Buyer</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="section">
        <div className="container faq-box">
          <div className="section-title-wrapper">
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {
                q: 'Will it fit in my car cup holder?',
                a: 'Yes! The base of the tumbler is specifically tapered to fit into all standard size vehicle cup holders (approx. 3-inch diameter base).'
              },
              {
                q: 'Is the tumbler dishwasher safe?',
                a: 'Hand washing is recommended to preserve the premium double wall insulation and powder coat color finish. The lid and straw are top-rack dishwasher safe.'
              },
              {
                q: 'Does the lid leak?',
                a: 'No. The lid features an advanced silicone gasket seal and a locking straw closure that prevents spills and splashes, making it safe to carry.'
              },
              {
                q: 'What is the shipping time to the UK and US?',
                a: 'Standard tracked shipping is 7 to 15 business days to the United States and 10 to 18 business days to the United Kingdom.'
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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

      {/* FINAL CTA SECTION */}
      <section className="section section-bg" style={{ textAlign: 'center', padding: '40px 0' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Ready to Upgrade Your Daily Routine?</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Experience 40oz of pure hydration, kept ice cold all day long.
          </p>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '14px' }}>
            Only ${currentPrice.toFixed(2)}
          </div>
          <button
            className="btn btn-accent"
            style={{ padding: '12px 30px', fontSize: '0.95rem', marginBottom: '12px' }}
            onClick={handleAdd}
          >
            Order Now & Save
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: '700' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '4px' }}>
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>30-Day Hassle-Free Money Back Guarantee</span>
          </div>
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid var(--color-border)', textAlign: 'center', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 12px' }}>
            Copyright 2026 Northlane. All rights reserved.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/policies/privacy')} className="footer-link">Privacy Policy</span>
            <span>|</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/policies/terms')} className="footer-link">Terms of Service</span>
            <span>|</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/policies/shipping')} className="footer-link">Shipping & Returns</span>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Add to Cart Bar on Mobile */}
      <div className="mobile-sticky-add-to-cart">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={activeImage} alt={product.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{product.title}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-accent)' }}>${currentPrice.toFixed(2)}</span>
          </div>
        </div>
        <button 
          className="btn btn-accent" 
          style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem', fontWeight: '700', borderRadius: '4px' }}
          onClick={handleAdd}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
