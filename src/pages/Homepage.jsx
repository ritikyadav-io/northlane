import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../Router';
import { useCart } from '../CartContext';
import { fetchProducts } from '../shopify';
import heroImage from '../assets/beauty_hero_lifestyle.png';
import beforeImage from '../assets/hairy_arm_before.png';
import afterImage from '../assets/clean_arm_after.png';

const renderStars = (rating) => {
  const rounded = Math.round(rating);
  return (
    <div className="star-rating-row">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className="star-char">{star <= rounded ? '★' : '☆'}</span>
      ))}
    </div>
  );
};

export default function Homepage() {
  const { navigate } = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // FAQ accordion state
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

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

  // Filter active products from the Shopify store
  const activeProducts = products.filter(p => p.available);

  // 1. Get Best Sellers (Filter specifically for Hair Removal Foam Spray, Electric Makeup Brush Cleaner, Hair Removal Identifying Spray)
  const getDTCBestSellers = () => {
    // Find matching active products in the store
    const foam = activeProducts.find(p => p.handle.includes('hair-removal-spray') || p.handle.includes('depilatory') || p.title.toLowerCase().includes('foam spray'));
    const brush = activeProducts.find(p => p.handle.includes('brush-cleaner') || p.title.toLowerCase().includes('brush cleaner'));
    const id = activeProducts.find(p => p.handle.includes('hair-identifier') || p.handle.includes('identifying-spray') || p.title.toLowerCase().includes('identifying'));

    const list = [];
    if (foam) list.push(foam);
    if (brush) list.push(brush);
    if (id) list.push(id);

    // Fallback mocks only if store is completely empty / initial load
    if (list.length === 0 && products.length === 0) {
      return [
        {
          id: 'mock-foam-spray',
          title: 'Gentle Hair Removal Foam Spray',
          handle: '30ml-100ml-hair-removal-spray-depilatory-armpit-hair-and-legs-hair-foam-mousse-and-removal-is-gentle-hair-cream-spray-non-irritating',
          price: 18.99,
          compareAtPrice: 24.99,
          images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'],
          productType: 'Body Care',
          rating: 4.9,
          reviewCount: 184
        },
        {
          id: 'mock-brush-cleaner',
          title: 'Electric Makeup Brush Cleaner',
          handle: 'electric-makeup-brush-cleaner-dryer',
          price: 29.99,
          compareAtPrice: 39.99,
          images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'],
          productType: 'Beauty Tools',
          rating: 4.8,
          reviewCount: 142
        },
        {
          id: 'mock-id-spray',
          title: 'Hair Removal Identifying Spray',
          handle: 'hair-identifier-spray-for-face-shaving-skin-body-hair-identifying-spray-moisturizing-and-skin-care-set',
          price: 16.99,
          compareAtPrice: 22.99,
          images: ['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80'],
          productType: 'Skin Care',
          rating: 4.7,
          reviewCount: 96
        }
      ];
    }

    return list;
  };

  // 2. Get Beauty Tools (Filter specifically for Electric Makeup Brush Cleaner, Mascara)
  const getDTCBeautyTools = () => {
    const brush = activeProducts.find(p => p.handle.includes('brush-cleaner') || p.title.toLowerCase().includes('brush cleaner'));
    const masc = activeProducts.find(p => p.handle.includes('mascara') || p.title.toLowerCase().includes('mascara'));

    const list = [];
    if (brush) list.push(brush);
    if (masc) list.push(masc);

    // Fallback mocks only if store is completely empty / initial load
    if (list.length === 0 && products.length === 0) {
      return [
        {
          id: 'mock-brush-cleaner',
          title: 'Electric Makeup Brush Cleaner',
          handle: 'electric-makeup-brush-cleaner-dryer',
          price: 29.99,
          compareAtPrice: 39.99,
          images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'],
          productType: 'Beauty Tools',
          rating: 4.8,
          reviewCount: 142
        },
        {
          id: 'mock-mascara',
          title: 'Waterproof Volumizing Mascara',
          handle: 'colorful-volumizing-waterproof-mascara',
          price: 14.99,
          compareAtPrice: 19.99,
          images: ['https://images.unsplash.com/photo-1591017403046-6fec00799763?w=600&auto=format&fit=crop&q=80'],
          productType: 'Makeup Accessories',
          rating: 4.9,
          reviewCount: 208
        }
      ];
    }

    return list;
  };

  // 3. Hair Removal Product - check if active in the store
  const getHairRemovalProduct = () => {
    // Find the real active foam spray
    const realFoam = activeProducts.find(p => p.handle.includes('hair-removal-spray') || p.handle.includes('depilatory') || p.title.toLowerCase().includes('foam spray'));
    if (realFoam) return realFoam;

    // Fallback mock only if store is completely empty / initial load
    if (products.length === 0) {
      return {
        id: 'mock-foam-spray',
        title: 'Gentle Hair Removal Foam Spray',
        handle: '30ml-100ml-hair-removal-spray-depilatory-armpit-hair-and-legs-hair-foam-mousse-and-removal-is-gentle-hair-cream-spray-non-irritating',
        price: 18.99,
        compareAtPrice: 24.99,
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'],
        productType: 'Body Care',
        rating: 4.9,
        reviewCount: 184
      };
    }

    return null; // Do not render if the store has active products but foam spray is not active
  };

  const bestSellers = getDTCBestSellers();
  const beautyTools = getDTCBeautyTools();
  const foamSpray = getHairRemovalProduct();

  const handleAddProduct = (e, product) => {
    e.stopPropagation();
    const variant = product.variants && product.variants.length > 0 
      ? product.variants[0] 
      : { id: product.id, title: 'Default Title', price: product.price || product.minPrice };
    addToCart(product, variant, 1);
    setIsCartOpen(true);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon-box">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div className="error-text-box">
          <h2>Connection Error</h2>
          <p>We're unable to connect to the Shopify storefront at the moment. Please verify your internet connection or try again later.</p>
        </div>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Retry Connection
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Northlane Storefront...</p>
      </div>
    );
  }

  return (
    <div className="homepage-root">
      {/* CUSTOM SCOPED STYLES FOR PREMIUM DTC BEAUTY EXPERIENCE */}
      <style>{`
        .homepage-root {
          font-family: 'Manrope', sans-serif;
          color: #1B2A4A;
          background-color: #FFFFFF;
          overflow-x: hidden;
        }

        /* HERO SECTION */
        .beauty-hero {
          background-color: #FCF8F5; /* Soft warm tone background */
          padding: 80px 0;
          display: flex;
          align-items: center;
        }
        .hero-split {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .hero-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .hero-trust-banner {
          display: flex;
          flex-wrap: wrap;
          gap: 16px 24px;
          margin-bottom: 24px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #C9A84C; /* Soft gold accent */
        }
        .trust-tag {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .hero-title-dtc {
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -1px;
          color: #1B2A4A;
          margin-bottom: 20px;
        }
        .hero-desc-dtc {
          font-size: 1.15rem;
          line-height: 1.6;
          color: #4A5568;
          margin-bottom: 32px;
          max-width: 580px;
        }
        .hero-buttons {
          display: flex;
          gap: 16px;
          width: 100%;
        }
        .hero-right {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .hero-img-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(27, 42, 74, 0.08);
          aspect-ratio: 4 / 5;
          width: 100%;
          max-width: 440px;
        }
        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* SECTION HEADER */
        .beauty-sec-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 48px;
        }
        .beauty-sec-title {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #1B2A4A;
          margin-bottom: 12px;
        }
        .beauty-sec-subtitle {
          font-size: 1.05rem;
          color: #6C757D;
          line-height: 1.5;
        }

        /* BEST SELLERS GRID */
        .best-sellers-section {
          padding: 80px 0;
          background-color: #FFFFFF;
        }
        .best-sellers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .dtc-card {
          background-color: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #F1F3F5;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          position: relative;
        }
        .dtc-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(27, 42, 74, 0.06);
        }
        .card-img-wrapper {
          position: relative;
          background-color: #FAF8F6;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .dtc-card:hover .card-img {
          transform: scale(1.05);
        }
        .card-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background-color: #C9A84C;
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 30px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .card-category {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 1px;
          color: #C9A84C;
          margin-bottom: 8px;
        }
        .card-title {
          font-size: 1.15rem;
          font-weight: 700;
          line-height: 1.4;
          color: #1B2A4A;
          margin-bottom: 8px;
          min-height: 48px;
        }
        .star-rating-row {
          display: flex;
          color: #F59E0B;
          font-size: 0.85rem;
          gap: 2px;
          align-items: center;
        }
        .review-count-text {
          font-size: 0.75rem;
          color: #6C757D;
          font-weight: 500;
          margin-left: 6px;
        }
        .card-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 12px 0 20px;
        }
        .price-curr {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1B2A4A;
        }
        .price-orig {
          font-size: 0.95rem;
          color: #A0AEC0;
          text-decoration: line-through;
        }
        .btn-card-add {
          width: 100%;
          padding: 12px;
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-radius: 6px;
          background-color: #1B2A4A;
          color: #FFFFFF;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: auto;
        }
        .btn-card-add:hover {
          background-color: #C9A84C;
        }

        /* WHY CHOOSE NORTHLANE */
        .why-section {
          padding: 80px 0;
          background-color: #FCF8F5;
        }
        .why-dtc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .why-dtc-card {
          background-color: #FFFFFF;
          padding: 30px 24px;
          border-radius: 12px;
          border: 1px solid #F1F3F5;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .why-dtc-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: #FCF8F5;
          color: #C9A84C;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .why-dtc-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 10px;
          color: #1B2A4A;
        }
        .why-dtc-text {
          font-size: 0.88rem;
          color: #6C757D;
          line-height: 1.5;
        }

        /* HAIR REMOVAL FEATURE SECTION */
        .hair-removal-section {
          padding: 90px 0;
          background-color: #FFFFFF;
        }
        .feature-split {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 60px;
          align-items: center;
        }
        .feature-content {
          text-align: left;
        }
        .feature-tag {
          font-size: 0.8rem;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #C9A84C;
          margin-bottom: 12px;
          display: block;
        }
        .feature-title {
          font-size: 2.6rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1.2;
          color: #1B2A4A;
          margin-bottom: 24px;
        }
        .benefit-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 36px;
        }
        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .benefit-icon {
          color: #C9A84C;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .benefit-text {
          font-size: 1.05rem;
          font-weight: 600;
          color: #344054;
        }
        .before-after-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .ba-card {
          background-color: #FAF8F6;
          border-radius: 12px;
          border: 1px solid #F1F3F5;
          overflow: hidden;
          text-align: center;
          box-shadow: 0 4px 12px rgba(27, 42, 74, 0.02);
        }
        .ba-label {
          background-color: #1B2A4A;
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 8px;
        }
        .ba-label.after {
          background-color: #C9A84C;
        }
        .ba-img-wrapper {
          aspect-ratio: 4 / 3;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #FFF;
          font-size: 0.9rem;
          font-weight: 700;
          color: #6C757D;
        }
        .ba-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .ba-desc {
          padding: 14px;
          font-size: 0.85rem;
          color: #6C757D;
          font-weight: 500;
        }

        /* BEAUTY TOOLS SECTION */
        .beauty-tools-section {
          padding: 80px 0;
          background-color: #FCF8F5;
        }
        .horizontal-tools-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        .horizontal-card {
          background-color: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #F1F3F5;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .horizontal-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(27, 42, 74, 0.05);
        }
        .h-img-wrapper {
          background-color: #FAF8F6;
          aspect-ratio: 1 / 1;
          height: 100%;
        }
        .h-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .h-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .h-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1B2A4A;
          margin-bottom: 8px;
        }
        .h-price {
          font-size: 1.15rem;
          font-weight: 800;
          color: #1B2A4A;
          margin-bottom: 16px;
        }

        /* CUSTOMER REVIEWS */
        .reviews-section {
          padding: 80px 0;
          background-color: #FFFFFF;
        }
        .compact-reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .compact-review-card {
          background-color: #FFFFFF;
          border: 1px solid #E9ECEF;
          border-radius: 10px;
          padding: 24px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.01);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .stars-yellow {
          color: #F59E0B;
          font-size: 1rem;
          margin-bottom: 12px;
        }
        .review-quote {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #344054;
          margin-bottom: 16px;
          font-style: italic;
          font-weight: 500;
        }
        .reviewer-info {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1B2A4A;
          display: flex;
          flex-direction: column;
        }
        .reviewer-loc-dtc {
          font-weight: 500;
          color: #6C757D;
          font-size: 0.75rem;
          margin-top: 2px;
        }

        /* FAQ SECTION */
        .faq-section-dtc {
          padding: 80px 0;
          background-color: #FCF8F5;
        }
        .faq-dtc-container {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .faq-card {
          background-color: #FFFFFF;
          border: 1px solid #E9ECEF;
          border-radius: 8px;
          overflow: hidden;
        }
        .faq-trigger {
          width: 100%;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          text-align: left;
          font-size: 1rem;
          font-weight: 700;
          color: #1B2A4A;
          cursor: pointer;
        }
        .faq-icon-svg {
          transition: transform 0.2s;
          color: #C9A84C;
        }
        .faq-card.open .faq-icon-svg {
          transform: rotate(180deg);
        }
        .faq-content-box {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
          padding: 0 24px;
        }
        .faq-card.open .faq-content-box {
          max-height: 200px;
          padding: 0 24px 20px;
        }
        .faq-ans-text {
          font-size: 0.92rem;
          line-height: 1.6;
          color: #4A5568;
        }

        /* UTILITIES & BUTTONS */
        .btn-dtc-primary {
          background-color: #1B2A4A;
          color: #FFFFFF;
          padding: 14px 28px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
          display: inline-block;
          text-align: center;
        }
        .btn-dtc-primary:hover {
          background-color: #C9A84C;
          color: #FFFFFF;
        }
        .btn-dtc-secondary {
          background-color: transparent;
          color: #1B2A4A;
          padding: 14px 28px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid #1B2A4A;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-block;
          text-align: center;
        }
        .btn-dtc-secondary:hover {
          background-color: #1B2A4A;
          color: #FFFFFF;
        }

        /* CONNECTION ERROR & LOADING */
        .loading-container, .error-container {
          min-height: 50vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 40px;
          text-align: center;
        }
        .spinner {
          width: 44px;
          height: 44px;
          border: 4px solid rgba(27, 42, 74, 0.1);
          border-top-color: #C9A84C;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* RESPONSIVENESS */
        @media (max-width: 1024px) {
          .hero-title-dtc {
            font-size: 2.8rem;
          }
          .why-dtc-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .hero-split {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .hero-right {
            order: -1; /* Image first on mobile */
          }
          .hero-img-container {
            max-width: 320px;
            margin: 0 auto;
          }
          .hero-left {
            align-items: center;
            text-align: center;
          }
          .hero-title-dtc {
            font-size: 2.2rem;
          }
          .hero-desc-dtc {
            font-size: 1.05rem;
          }
          .hero-buttons {
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }
          .hero-trust-banner {
            justify-content: center;
          }
          .best-sellers-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            max-width: 380px;
            margin: 0 auto;
          }
          .why-dtc-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            max-width: 380px;
            margin: 0 auto;
          }
          .feature-split {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .before-after-box {
            grid-template-columns: 1fr;
            gap: 16px;
            max-width: 320px;
            margin: 0 auto;
          }
          .horizontal-tools-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            max-width: 440px;
            margin: 0 auto;
          }
          .horizontal-card {
            grid-template-columns: 1fr;
          }
          .compact-reviews-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            max-width: 380px;
            margin: 0 auto;
          }
          .beauty-hero {
            padding: 40px 0 60px;
          }
          .beauty-sec-title {
            font-size: 1.8rem;
          }
          .feature-title {
            font-size: 2rem;
          }
        }
      `}</style>

      {/* SECTION 1: HERO SECTION */}
      <section className="beauty-hero">
        <div className="container">
          <div className="hero-split">
            {/* Left Column: Copy & Actions */}
            <div className="hero-left">
              <div className="hero-trust-banner">
                <div className="trust-tag">
                  <span>✓</span> Free US Shipping
                </div>
                <div className="trust-tag">
                  <span>✓</span> Secure Checkout
                </div>
                <div className="trust-tag">
                  <span>✓</span> Easy Returns
                </div>
                <div className="trust-tag">
                  <span>✓</span> Customer Support
                </div>
              </div>
              <h1 className="hero-title-dtc">
                Beauty Essentials That Simplify Your Routine
              </h1>
              <p className="hero-desc-dtc">
                Discover women's beauty tools, hair removal essentials, and self-care products designed to help you look and feel your best every day.
              </p>
              <div className="hero-buttons">
                <button 
                  onClick={() => scrollToSection('best-sellers')} 
                  className="btn-dtc-primary"
                  style={{ flex: 1 }}
                >
                  Shop Best Sellers
                </button>
                <Link 
                  to="/collections/all" 
                  className="btn-dtc-secondary"
                  style={{ flex: 1 }}
                >
                  Explore Collection
                </Link>
              </div>
            </div>

            {/* Right Column: Premium Lifestyle Image */}
            <div className="hero-right">
              <div className="hero-img-container">
                <img 
                  src={heroImage} 
                  alt="Confident modern woman with glowing skin" 
                  className="hero-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: BEST SELLERS */}
      <section id="best-sellers" className="best-sellers-section">
        <div className="container">
          <div className="beauty-sec-header">
            <h2 className="beauty-sec-title">Most Loved by Our Customers</h2>
            <p className="beauty-sec-subtitle">
              Our absolute best-selling hair removal and beauty accessories, rated for high performance and everyday ease.
            </p>
          </div>

          <div className="best-sellers-grid">
            {bestSellers.map(product => {
              const price = product.price || product.minPrice;
              const compareAt = product.compareAtPrice;
              const discount = (compareAt && compareAt > price) 
                ? Math.round(((compareAt - price) / compareAt) * 100)
                : 0;

              return (
                <div 
                  key={product.id} 
                  className="dtc-card"
                  onClick={() => navigate(`/products/${product.handle}`)}
                >
                  {discount > 0 && <span className="card-badge">Save {discount}%</span>}
                  <div className="card-img-wrapper">
                    <img 
                      src={product.images[0]} 
                      alt={product.title} 
                      className="card-img"
                    />
                  </div>
                  <div className="card-body">
                    <span className="card-category">{product.productType || 'Body Care'}</span>
                    <h3 className="card-title">{product.title}</h3>
                    <div className="star-rating-row">
                      {renderStars(product.rating || 4.8)}
                      <span className="review-count-text">({product.reviewCount || 120})</span>
                    </div>
                    <div className="card-price-row">
                      <span className="price-curr">${price.toFixed(2)}</span>
                      {compareAt > price && (
                        <span className="price-orig">${compareAt.toFixed(2)}</span>
                      )}
                    </div>
                    <button 
                      className="btn-card-add"
                      onClick={(e) => handleAddProduct(e, product)}
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: WHY CHOOSE NORTHLANE */}
      <section className="why-section">
        <div className="container">
          <div className="beauty-sec-header">
            <h2 className="beauty-sec-title">Designed For Everyday Confidence</h2>
            <p className="beauty-sec-subtitle">
              Every item is designed to simplify your daily beauty routines, offering premium results with no hassle.
            </p>
          </div>

          <div className="why-dtc-grid">
            {/* Card 1: Beauty Essentials */}
            <div className="why-dtc-card">
              <span className="why-dtc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </span>
              <h3 className="why-dtc-title">Beauty Essentials</h3>
              <p className="why-dtc-text">Carefully selected products women use daily.</p>
            </div>

            {/* Card 2: Fast Shipping */}
            <div className="why-dtc-card">
              <span className="why-dtc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </span>
              <h3 className="why-dtc-title">Fast Shipping</h3>
              <p className="why-dtc-text">Quick delivery across the United States.</p>
            </div>

            {/* Card 3: Trusted Quality */}
            <div className="why-dtc-card">
              <span className="why-dtc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </span>
              <h3 className="why-dtc-title">Trusted Quality</h3>
              <p className="why-dtc-text">Products selected for performance and value.</p>
            </div>

            {/* Card 4: Customer First */}
            <div className="why-dtc-card">
              <span className="why-dtc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </span>
              <h3 className="why-dtc-title">Customer First</h3>
              <p className="why-dtc-text">Responsive support and secure checkout.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HAIR REMOVAL FEATURE SECTION (ONLY RENDER IF ACTIVE IN STORE) */}
      {foamSpray && (
        <section className="hair-removal-section">
          <div className="container">
            <div className="feature-split">
              {/* Left Column: Benefits */}
              <div className="feature-content">
                <span className="feature-tag">Best Seller</span>
                <h2 className="feature-title">Smooth Skin Made Simple</h2>
                
                <div className="benefit-list">
                  <div className="benefit-item">
                    <span className="benefit-icon">✓</span>
                    <span className="benefit-text">Fast application</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">✓</span>
                    <span className="benefit-text">Gentle on skin</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">✓</span>
                    <span className="benefit-text">Easy at-home use</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">✓</span>
                    <span className="benefit-text">Designed for everyday confidence</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/products/${foamSpray.handle}`)}
                  className="btn-dtc-primary"
                >
                  Get Smooth Skin Now
                </button>
              </div>

              {/* Right Column: Before / After Comparison */}
              <div className="before-after-box">
                <div className="ba-card">
                  <div className="ba-label">Before</div>
                  <div className="ba-img-wrapper">
                    <img 
                      src={beforeImage} 
                      alt="Skin before hair removal spray application"
                    />
                  </div>
                  <div className="ba-desc">Unwanted body hair</div>
                </div>
                <div className="ba-card">
                  <div className="ba-label after">After</div>
                  <div className="ba-img-wrapper">
                    <img 
                      src={afterImage} 
                      alt="Smooth skin after hair removal spray application"
                    />
                  </div>
                  <div className="ba-desc">Perfectly smooth & soft</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: BEAUTY TOOLS SECTION */}
      <section className="beauty-tools-section">
        <div className="container">
          <div className="beauty-sec-header">
            <h2 className="beauty-sec-title">Beauty Tools That Work Harder</h2>
            <p className="beauty-sec-subtitle">
              Smarter devices and makeup essentials that give you studio-level results right in your bathroom mirror.
            </p>
          </div>

          <div className="horizontal-tools-grid">
            {beautyTools.map(product => {
              const price = product.price || product.minPrice;
              return (
                <div 
                  key={product.id}
                  className="horizontal-card"
                  onClick={() => navigate(`/products/${product.handle}`)}
                >
                  <div className="h-img-wrapper">
                    <img 
                      src={product.images[0]} 
                      alt={product.title} 
                      className="h-img"
                    />
                  </div>
                  <div className="h-body">
                    <h3 className="h-title">{product.title}</h3>
                    <div className="star-rating-row" style={{ marginBottom: '8px' }}>
                      {renderStars(product.rating || 4.8)}
                    </div>
                    <span className="h-price">${price.toFixed(2)}</span>
                    <button 
                      className="btn-dtc-primary"
                      style={{ padding: '10px 16px', fontSize: '0.8rem' }}
                      onClick={(e) => handleAddProduct(e, product)}
                    >
                      Shop Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6: CUSTOMER REVIEWS */}
      <section className="reviews-section">
        <div className="container">
          <div className="beauty-sec-header">
            <h2 className="beauty-sec-title">Loved by Women Everywhere</h2>
            <p className="beauty-sec-subtitle">Real experiences from verified Northlane customers.</p>
          </div>

          <div className="compact-reviews-grid">
            {/* Review 1 */}
            <div className="compact-review-card">
              <div className="stars-yellow">★★★★★</div>
              <p className="review-quote">"Exactly what I needed. Fast shipping and great quality."</p>
              <div className="reviewer-info">
                <span>Jessica L.</span>
                <span className="reviewer-loc-dtc">Miami, USA</span>
              </div>
            </div>

            {/* Review 2 */}
            <div className="compact-review-card">
              <div className="stars-yellow">★★★★★</div>
              <p className="review-quote">"The brush cleaner saves me so much time."</p>
              <div className="reviewer-info">
                <span>Ashley P.</span>
                <span className="reviewer-loc-dtc">Boston, USA</span>
              </div>
            </div>

            {/* Review 3 */}
            <div className="compact-review-card">
              <div className="stars-yellow">★★★★★</div>
              <p className="review-quote">"The hair removal products became part of my weekly routine."</p>
              <div className="reviewer-info">
                <span>Chloe M.</span>
                <span className="reviewer-loc-dtc">Los Angeles, USA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FAQ SECTION */}
      <section className="faq-section-dtc">
        <div className="container">
          <div className="beauty-sec-header">
            <h2 className="beauty-sec-title">Frequently Asked Questions</h2>
            <p className="beauty-sec-subtitle">Got questions? We have answers.</p>
          </div>

          <div className="faq-dtc-container">
            {[
              {
                q: 'How long does shipping take?',
                a: 'Standard shipping takes 7 to 15 business days across the United States. All orders include full online tracking so you can monitor your package from dispatch to delivery.'
              },
              {
                q: 'Are returns accepted?',
                a: 'Yes, we want you to love your purchase. We offer a 7-day hassle-free return policy for any unused products in their original packaging. Just contact support@northlane.com to start a return.'
              },
              {
                q: 'Is checkout secure?',
                a: 'Absolutely. We use industry-standard 256-bit SSL encryption to protect your billing credentials. All transactions are securely routed and processed through Shopify Checkout.'
              },
              {
                q: 'How can I contact support?',
                a: 'Our dedicated customer care team is here to help. You can reach us anytime by emailing support@northlane.com, and we will get back to you within 24 hours.'
              }
            ].map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className={`faq-card ${isOpen ? 'open' : ''}`}>
                  <button 
                    className="faq-trigger"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  >
                    <span>{item.q}</span>
                    <span className="faq-icon-svg">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </button>
                  <div className="faq-content-box">
                    <p className="faq-ans-text">{item.a}</p>
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
