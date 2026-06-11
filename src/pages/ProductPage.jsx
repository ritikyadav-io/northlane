import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../Router';
import { useCart } from '../CartContext';
import { fetchProductByHandle, fetchProducts, createCheckout } from '../shopify';

// Deterministic pseudo-random number generator seeded by string
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateReviews(handle, title) {
  const seed = hashCode(handle || 'default');
  const rng = seededRandom(seed);

  // Unique review count between 16 and 87
  const count = 16 + Math.floor(rng() * 72);

  const firstNames = [
    'Sarah', 'James', 'Emily', 'Robert', 'Jessica', 'Daniel', 'Ashley', 'Michael',
    'Megan', 'Chris', 'Amanda', 'David', 'Nicole', 'Andrew', 'Laura', 'Ryan',
    'Rebecca', 'Kevin', 'Stephanie', 'Brian', 'Rachel', 'Tyler', 'Heather', 'Jason',
    'Amber', 'Nathan', 'Hannah', 'Patrick', 'Olivia', 'Mark', 'Samantha', 'Alex'
  ];
  const lastInitials = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const locations = [
    'New York, USA', 'London, UK', 'Los Angeles, USA', 'Chicago, USA',
    'Manchester, UK', 'Houston, USA', 'Birmingham, UK', 'Phoenix, USA',
    'Edinburgh, UK', 'Dallas, USA', 'Liverpool, UK', 'Seattle, USA',
    'Bristol, UK', 'Denver, USA', 'Leeds, UK', 'San Francisco, USA'
  ];

  const reviewTemplates = [
    { title: 'Absolutely love it!', text: `This ${title} exceeded my expectations. The quality is outstanding and it arrived faster than I expected. Would definitely recommend to anyone.` },
    { title: 'Great quality product', text: `Very impressed with the build quality. Exactly as described and the packaging was excellent. Will be ordering again.` },
    { title: 'Perfect gift', text: `Bought this as a gift and they absolutely loved it. The quality is premium and it looks even better in person.` },
    { title: 'Worth every penny', text: `I was hesitant at first but so glad I purchased. The quality is amazing for the price. Fast shipping too!` },
    { title: 'Exceeded expectations', text: `The product photos don't do this justice. It's even better in real life. Very happy with my purchase.` },
    { title: 'Five stars all the way', text: `From ordering to delivery, the whole experience was smooth. Product quality is top notch. Highly recommended.` },
    { title: 'Very happy customer', text: `This is my second order from Northlane and once again I'm impressed. Great product, fast delivery, excellent customer service.` },
    { title: 'Impressive quality', text: `The attention to detail on this product is remarkable. It feels premium and well-made. No regrets with this purchase.` },
    { title: 'Fantastic purchase', text: `Been using this daily and it holds up perfectly. The design is sleek and functional. Exactly what I needed.` },
    { title: 'Highly recommend', text: `Shipped quickly and arrived in perfect condition. The product is sturdy, well-designed, and looks great. Would buy again.` },
    { title: 'Best purchase this year', text: `I've bought many similar products but this one stands out. Superior quality and thoughtful design. Love it!` },
    { title: 'Amazing value', text: `For the price point, this is unbeatable. Looks and feels much more expensive than it is. Very satisfied customer.` },
    { title: 'Solid and well made', text: `The materials feel durable and the craftsmanship is excellent. This will last a long time. Great buy.` },
    { title: 'Quick delivery!', text: `Ordered on Monday and had it by Thursday. Product is exactly as pictured. Very pleased with the whole experience.` },
    { title: 'Better than expected', text: `I wasn't sure what to expect at this price but wow. The quality is genuinely impressive. Already recommended to friends.` },
    { title: 'Love the design', text: `Sleek, modern, and functional. This checks all the boxes. Arrived well-packaged and in perfect condition.` },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const reviews = [];
  for (let i = 0; i < count; i++) {
    const template = reviewTemplates[Math.floor(rng() * reviewTemplates.length)];
    const firstName = firstNames[Math.floor(rng() * firstNames.length)];
    const lastInit = lastInitials[Math.floor(rng() * lastInitials.length)];
    const location = locations[Math.floor(rng() * locations.length)];
    const rating = rng() > 0.15 ? 5 : 4;
    const month = months[Math.floor(rng() * 6) + 3]; // Mar–Aug 2026
    const day = Math.floor(rng() * 28) + 1;
    const helpful = Math.floor(rng() * 20);

    reviews.push({
      author: `${firstName} ${lastInit}.`,
      location,
      date: `${month} ${day}, 2026`,
      rating,
      title: template.title,
      text: template.text,
      helpful,
      unhelpful: Math.floor(rng() * 3),
      voted: null
    });
  }

  return reviews;
}


export default function ProductPage({ handle }) {
  const { navigate, goBack } = useRouter();
  const { addToCart, setIsCartOpen } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const [shareCopied, setShareCopied] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [reviewsState, setReviewsState] = useState([]);

  useEffect(() => {
    async function loadProductData() {
      try {
        setLoading(true);
        const fetchedProduct = await fetchProductByHandle(handle);
        if (!fetchedProduct) {
          throw new Error('Product not found');
        }
        setProduct(fetchedProduct);
        setActiveImage(fetchedProduct.images[0] || '');
        
        // Select first variant by default
        if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
          setSelectedVariant(fetchedProduct.variants[0]);
        }

        // Fetch related products (same product type)
        const allProducts = await fetchProducts(50);
        const related = allProducts
          .filter(p => p.id !== fetchedProduct.id && p.productType === fetchedProduct.productType)
          .slice(0, 4);
        
        // Fallback related if none in same type
        if (related.length === 0) {
          setRelatedProducts(allProducts.filter(p => p.id !== fetchedProduct.id).slice(0, 4));
        } else {
          setRelatedProducts(related);
        }

        // Generate reviews list
        const generated = generateReviews(fetchedProduct.handle, fetchedProduct.title);
        setReviewsState(generated);

        // Reset states
        setQuantity(1);
        setActiveTab('Description');
      } catch (err) {
        console.error('Failed to load product page:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    }

    if (handle) {
      loadProductData();
    }
  }, [handle]);

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    if (variant.image) {
      setActiveImage(variant.image);
    }
  };

  const handleAddToCart = () => {
    if (product && selectedVariant) {
      addToCart(product, selectedVariant, quantity);
    }
  };

  const handleBuyNow = async () => {
    if (!product || !selectedVariant) return;
    setBuyNowLoading(true);
    try {
      // Direct checkout for this item
      const checkoutUrl = await createCheckout([{ variantId: selectedVariant.id, quantity }]);
      if (checkoutUrl) {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const redirectUrl = isLocal 
          ? checkoutUrl + (checkoutUrl.includes('?') ? '&' : '?') + 'dev=true' 
          : checkoutUrl;
        window.location.href = redirectUrl;
      }
    } catch (err) {
      console.error('Buy Now Redirect Failed:', err);
      // Fallback
      addToCart(product, selectedVariant, quantity);
      setIsCartOpen(true);
    } finally {
      setBuyNowLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // Compute shipping delivery dates
  const getDeliveryRange = () => {
    const options = { month: 'short', day: 'numeric' };
    const today = new Date();
    const minDate = new Date();
    minDate.setDate(today.getDate() + 7);
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 15);
    return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  };

  if (loading || !product) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--color-accent)', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderWidth: '4px' }}></div>
        <p style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Loading Product Details...</p>
      </div>
    );
  }

  const handleHelpfulClick = (idx, isYes) => {
    setReviewsState(prev => prev.map((rev, i) => {
      if (i !== idx) return rev;
      
      if (rev.voted) {
        // Toggle off the same vote
        if ((rev.voted === 'yes' && isYes) || (rev.voted === 'no' && !isYes)) {
          return {
            ...rev,
            voted: null,
            helpful: rev.voted === 'yes' ? rev.helpful - 1 : rev.helpful,
            unhelpful: rev.voted === 'no' ? rev.unhelpful - 1 : rev.unhelpful
          };
        }
        
        // Swap votes
        return {
          ...rev,
          voted: isYes ? 'yes' : 'no',
          helpful: isYes ? rev.helpful + 1 : rev.helpful - 1,
          unhelpful: isYes ? rev.unhelpful - 1 : rev.unhelpful + 1
        };
      }
      
      // New vote
      return {
        ...rev,
        voted: isYes ? 'yes' : 'no',
        helpful: isYes ? rev.helpful + 1 : rev.helpful,
        unhelpful: !isYes ? rev.unhelpful + 1 : rev.unhelpful
      };
    }));
  };

  const averageRating = 4.8; // High-end rating
  
  // Calculate discount
  const currentPrice = selectedVariant ? selectedVariant.price : product.minPrice;
  const comparePrice = selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice;
  const savings = comparePrice && comparePrice > currentPrice ? (comparePrice - currentPrice).toFixed(2) : null;

  return (
    <div className="container product-page-container" style={{ padding: '30px 24px 80px' }}>

      {/* Back Button */}
      <button onClick={goBack} className="back-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Go Back
      </button>

      {/* Top Section */}
      <div className="product-detail-layout">
        {/* Left Column: Images */}
        <div className="gallery-container">
          <div className="gallery-main-wrapper">
            <img src={activeImage} alt={product.title} className="gallery-main-img" />
          </div>
          {product.images.length > 1 && (
            <div className="gallery-thumbnails">
              {product.images.map((imgUrl, i) => (
                <button
                  key={i}
                  className={`thumbnail-btn ${activeImage === imgUrl ? 'active' : ''}`}
                  onClick={() => setActiveImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="thumbnail-img" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="product-info-col">
          <h1 className="product-info-title">{product.title}</h1>
          
          {/* Star rating */}
          <div className="product-info-rating-row">
            <div className="star-rating" style={{ margin: 0 }}>
              {Array(5).fill().map((_, i) => (
                <span key={i} style={{ color: i < 5 ? '#FBBF24' : '#E2E8F0' }}>★</span>
              ))}
            </div>
            <span className="review-count-text">4.8 stars ({reviewsState.length} customer reviews)</span>
          </div>

          {/* Pricing */}
          <div className="product-info-price-row">
            <span className="price-current" style={{ fontSize: '2rem' }}>${currentPrice.toFixed(2)}</span>
            {comparePrice > currentPrice && (
              <span className="price-compare" style={{ fontSize: '1.25rem' }}>${comparePrice.toFixed(2)}</span>
            )}
            {savings && parseFloat(savings) > 0 && (
              <span className="price-savings-badge">Save ${savings}</span>
            )}
          </div>

          {/* Short description */}
          <p className="product-info-short-desc">
            {product.description 
              ? product.description.split('.').slice(0, 2).join('.') + '.'
              : 'A premium product curated with the highest standards of materials and craftsmanship.'}
          </p>

          {/* Variant Selector */}
          {product.variants.length > 1 && (
            <div className="variant-selector-box">
              <h3 className="variant-label">Select Color/Style:</h3>
              <div className="variant-options">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    className={`variant-pill-btn ${selectedVariant?.id === v.id ? 'active' : ''}`}
                    onClick={() => handleVariantSelect(v)}
                  >
                    {v.title.split(' / ')[0]} {/* Show color only */}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div style={{ marginBottom: '24px' }}>
            <h3 className="qty-label">Quantity:</h3>
            <div className="qty-selector" style={{ border: '1px solid var(--color-border)', borderRadius: '4px' }}>
              <button
                className="qty-btn"
                style={{ padding: '8px 16px' }}
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              >
                -
              </button>
              <span className="qty-val" style={{ padding: '0 16px', fontSize: '1rem' }}>{quantity}</span>
              <button
                className="qty-btn"
                style={{ padding: '8px 16px' }}
                onClick={() => setQuantity(prev => prev + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="product-actions-box">
            <button
              className="btn btn-accent btn-full"
              style={{ height: '52px', fontSize: '1.05rem' }}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            
            <button
              className="btn btn-outline btn-full"
              style={{ height: '52px', fontSize: '1.05rem', borderWidth: '2px' }}
              onClick={handleBuyNow}
              disabled={buyNowLoading}
            >
              {buyNowLoading ? (
                <>
                  <span className="spinner" style={{ borderTopColor: 'var(--color-primary)' }}></span>
                  Redirecting...
                </>
              ) : (
                'Buy It Now'
              )}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="detail-trust-row">
            <div className="detail-trust-item">
              <span className="detail-trust-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <span>Secure Checkout</span>
            </div>
            <div className="detail-trust-item">
              <span className="detail-trust-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                </svg>
              </span>
              <span>Free Returns</span>
            </div>
            <div className="detail-trust-item">
              <span className="detail-trust-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </span>
              <span>Fast Delivery</span>
            </div>
            <div className="detail-trust-item">
              <span className="detail-trust-icon" style={{ color: 'var(--color-success)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <span>In Stock</span>
            </div>
          </div>

          {/* Shipping Estimate */}
          <div className="shipping-estimate-box">
            <span className="shipping-estimate-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </span>
            <span>Order today, estimated delivery: <strong>{getDeliveryRange()}</strong></span>
          </div>

          {/* Share links */}
          <div className="share-box">
            <span>Share:</span>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="share-btn" aria-label="Share on Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="share-btn" aria-label="Share on Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
            <button className="share-btn" onClick={handleCopyLink} aria-label="Copy page link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>
            {shareCopied && <span style={{ color: 'var(--color-success)', fontSize: '0.8rem', fontWeight: '700' }}>Link Copied!</span>}
          </div>
        </div>
      </div>

      {/* Middle Section: Tabs */}
      <div className="tabs-container">
        <div className="tabs-headers">
          {['Description', 'Features', 'Specifications', 'Reviews'].map(tab => (
            <button
              key={tab}
              className={`tab-header-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} {tab === 'Reviews' && `(${reviewsState.length})`}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'Description' && (
            <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(product.description || '')
                  .split(/[.!?\n]+/)
                  .map(line => line.trim())
                  .filter(line => line.length > 5)
                  .map((line, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '-2px', userSelect: 'none' }}>✓</span>
                      <span style={{ lineHeight: '1.5' }}>{line}.</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {activeTab === 'Features' && (
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {product.features.map((feat, idx) => (
                <li key={idx} style={{ fontSize: '0.95rem' }}>{feat}</li>
              ))}
            </ul>
          )}

          {activeTab === 'Specifications' && (
            <table className="tab-spec-table">
              <tbody>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <tr key={key}>
                    <td className="tab-spec-name">{key}</td>
                    <td className="tab-spec-val">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'Reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {reviewsState.map((rev, i) => (
                <div key={i} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary)', marginRight: '10px' }}>{rev.author}</strong>
                      <span className="verified-badge" style={{ fontSize: '0.7rem' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Verified Buyer
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{rev.date}</span>
                  </div>
                  
                  <div className="star-rating" style={{ marginBottom: '8px' }}>
                    {Array(5).fill().map((_, starIdx) => (
                      <span key={starIdx} style={{ color: starIdx < rev.rating ? '#FBBF24' : '#E2E8F0' }}>★</span>
                    ))}
                  </div>
                  
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '6px' }}>{rev.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: '1.5', marginBottom: '10px' }}>{rev.text}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <span>Was this review helpful?</span>
                    <button 
                      onClick={() => handleHelpfulClick(i, true)} 
                      style={{ 
                        border: '1px solid var(--color-border)', 
                        padding: '4px 10px', 
                        borderRadius: '3px', 
                        fontWeight: '600',
                        backgroundColor: rev.voted === 'yes' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                        color: rev.voted === 'yes' ? '#fff' : 'var(--color-text)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                    >
                      Yes ({rev.helpful})
                    </button>
                    <button 
                      onClick={() => handleHelpfulClick(i, false)} 
                      style={{ 
                        border: '1px solid var(--color-border)', 
                        padding: '4px 10px', 
                        borderRadius: '3px', 
                        fontWeight: '600',
                        backgroundColor: rev.voted === 'no' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                        color: rev.voted === 'no' ? '#fff' : 'var(--color-text)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                    >
                      No ({rev.unhelpful})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '40px', borderTop: '1px solid var(--color-border)', paddingTop: '40px' }}>
          <h2 className="section-title" style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '30px' }}>You May Also Like</h2>
          <div className="product-grid">
            {relatedProducts.map(related => {
              const discount = (related.compareAtPrice && related.compareAtPrice > related.minPrice) 
                ? Math.round(((related.compareAtPrice - related.minPrice) / related.compareAtPrice) * 100)
                : 0;

              return (
                <div 
                  key={related.id} 
                  className="product-card"
                  onClick={() => navigate(`/products/${related.handle}`)}
                >
                  {discount > 0 && (
                    <span className="discount-badge">SAVE {discount}%</span>
                  )}
                  <div className="product-card-img-wrapper">
                    <img src={related.images[0]} alt={related.title} className="product-card-img" />
                  </div>
                  <div className="product-card-body">
                    <span className="product-card-type">{related.productType}</span>
                    <h3 className="product-card-title">{related.title}</h3>
                    <div className="product-card-price-row">
                      <span className="price-current">${related.minPrice.toFixed(2)}</span>
                      {related.compareAtPrice > related.minPrice && (
                        <span className="price-compare">${related.compareAtPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <button
                      className="btn btn-primary btn-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (related.variants && related.variants.length > 0) {
                          addToCart(related, related.variants[0], 1);
                        }
                      }}
                      style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
