import React from 'react';
import { useRouter } from '../Router';

export default function AboutUs() {
  const { navigate } = useRouter();

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '900px' }}>
      {/* Back Button */}
      <button onClick={() => window.history.back()} className="back-btn" style={{ marginBottom: '20px' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Go Back
      </button>

      <h1 className="policy-title" style={{ marginBottom: '24px', fontSize: '2rem' }}>About Northlane</h1>

      <section className="policy-section" style={{ marginBottom: '32px' }}>
        <h2 className="policy-sec-title" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Our Story</h2>
        <p className="policy-text" style={{ lineHeight: '1.6', color: 'var(--color-text-muted)' }}>
          Northlane started with a simple belief – premium everyday products should be designed with purpose, durability, and style. Our 40‑oz insulated tumbler is the result of countless hours of engineering, testing, and listening to our community. From the sleek double‑wall vacuum to the ergonomic handle, every detail is crafted to make your day smoother.
        </p>
      </section>

      <section className="policy-section" style={{ marginBottom: '32px' }}>
        <h2 className="policy-sec-title" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Why Trust Northlane?</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
          {/* Trust Badge 1 – Secure Checkout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-primary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>SSL Secure Checkout</span>
          </div>
          {/* Trust Badge 2 – Money‑Back Guarantee */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-primary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>30‑Day Money Back Guarantee</span>
          </div>
          {/* Trust Badge 3 – Free Shipping */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-primary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Free Shipping (US &amp; UK)</span>
          </div>
          {/* Trust Badge 4 – Customer Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-primary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>4.8 ★ Average Rating</span>
          </div>
        </div>
      </section>

      <section className="policy-section" style={{ marginBottom: '32px' }}>
        <h2 className="policy-sec-title" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Our Commitment</h2>
        <ul className="policy-list" style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--color-text-muted)' }}>
          <li>Premium materials – BPA‑free stainless steel, food‑grade silicone.</li>
          <li>Lifetime durability – tested for drops, leaks, and temperature extremes.</li>
          <li>Eco‑friendly – reusable, reduces single‑use plastic waste.</li>
          <li>Fast, tracked shipping – worldwide coverage with real‑time tracking.</li>
        </ul>
      </section>
    </div>
  );
}
