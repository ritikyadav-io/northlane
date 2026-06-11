import React from 'react';
import { useRouter, Link } from '../Router';

export default function Footer() {
  const { navigate } = useRouter();

  const handleScrollToSection = (elementId) => {
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById(elementId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer id="footer" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg-secondary)', padding: '60px 0 30px', borderTop: '1px solid var(--color-border)' }}>
      <div className="container">
        
        {/* Row 1: Logo and Short description */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '30px', marginBottom: '40px', gap: '20px' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--color-bg)' }}>NORTHLANE</span>
          <p style={{ fontSize: '0.95rem', color: '#CBD5E1', maxWidth: '500px', margin: '0' }}>
            Premium everyday products for modern living, delivered to the US and UK.
          </p>
        </div>

        {/* Row 2: Four Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          
          {/* Col 1: Shop */}
          <div>
            <h4 style={{ color: 'var(--color-bg)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', fontWeight: '700' }}>Shop</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
              <li><Link to="/collections/all" style={{ fontSize: '0.9rem', color: '#94A3B8' }} className="footer-link">All Products</Link></li>
              <li><a href="#best-sellers" onClick={(e) => { e.preventDefault(); handleScrollToSection('best-sellers'); }} style={{ fontSize: '0.9rem', color: '#94A3B8' }} className="footer-link">Best Sellers</a></li>
              <li><Link to="/collections/all" style={{ fontSize: '0.9rem', color: '#94A3B8' }} className="footer-link">Home Decor</Link></li>
              <li><Link to="/collections/all" style={{ fontSize: '0.9rem', color: '#94A3B8' }} className="footer-link">Kitchen and Lifestyle</Link></li>
              <li><Link to="/collections/all" style={{ fontSize: '0.9rem', color: '#94A3B8' }} className="footer-link">Health and Wellness</Link></li>
            </ul>
          </div>

          {/* Col 2: Help */}
          <div>
            <h4 style={{ color: 'var(--color-bg)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', fontWeight: '700' }}>Help</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); handleScrollToSection('faq'); }} style={{ fontSize: '0.9rem', color: '#94A3B8' }} className="footer-link">FAQ</a></li>
              <li><Link to="/pages/contact" style={{ fontSize: '0.9rem', color: '#94A3B8' }} className="footer-link">Track My Order</Link></li>
              <li><Link to="/pages/contact" style={{ fontSize: '0.9rem', color: '#94A3B8' }} className="footer-link">Contact Us</Link></li>
              <li><Link to="/policies/shipping" style={{ fontSize: '0.9rem', color: '#94A3B8' }} className="footer-link">Shipping Policy</Link></li>
              <li><Link to="/policies/refund" style={{ fontSize: '0.9rem', color: '#94A3B8' }} className="footer-link">Return Policy</Link></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 style={{ color: 'var(--color-bg)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', fontWeight: '700' }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
              <li><a href="#why-choose" onClick={(e) => { e.preventDefault(); handleScrollToSection('why-choose'); }} style={{ fontSize: '0.9rem', color: '#94A3B8' }} className="footer-link">About Us</a></li>
              <li><Link to="/policies/privacy" style={{ fontSize: '0.9rem', color: '#94A3B8' }} className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/policies/terms" style={{ fontSize: '0.9rem', color: '#94A3B8' }} className="footer-link">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Col 4: Connect */}
          <div>
            <h4 style={{ color: 'var(--color-bg)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', fontWeight: '700' }}>Connect</h4>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <a href="#" aria-label="Facebook" style={{ display: 'flex', padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff' }} className="footer-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" style={{ display: 'flex', padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff' }} className="footer-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: 0 }}>
              Email: <a href="mailto:support@northlane.com" style={{ color: '#fff', fontWeight: '600' }}>support@northlane.com</a>
            </p>
          </div>

        </div>

        {/* Row 3: Bottom Copyright & Payments */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px', gap: '20px' }}>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
            Copyright 2026 Northlane. All rights reserved.
          </p>
          
          {/* Payment Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', marginRight: '4px', fontWeight: '500' }}>Accepted Payments:</span>
            {['Visa', 'Mastercard', 'PayPal', 'Amex', 'Shop Pay'].map(name => (
              <span key={name} style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary)', backgroundColor: 'var(--color-bg-secondary)', padding: '4px 10px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.2)' }}>
                {name}
              </span>
            ))}
          </div>
        </div>

      </div>
      
      {/* Styles for hover states in footer */}
      <style>{`
        .footer-link:hover {
          color: var(--color-accent) !important;
          padding-left: 2px;
        }
        .footer-social-btn:hover {
          background-color: var(--color-accent) !important;
          color: var(--color-primary) !important;
        }
      `}</style>
    </footer>
  );
}
