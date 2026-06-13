import React from 'react';
import { useRouter, Link } from '../Router';

export default function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="pro-footer">
      <div className="container">
        {/* Top Section: 4-column grid */}
        <div className="pro-footer-grid">
          {/* Brand Column */}
          <div className="pro-footer-brand">
            <span className="pro-footer-logo">NORTHLANE</span>
            <p className="pro-footer-tagline">
              Premium beauty, self-care &amp; lifestyle essentials. Curated for women who value quality.
            </p>
            <div className="pro-footer-social">
              <a href="#" aria-label="Instagram" className="pro-social-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="Twitter" className="pro-social-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
              <a href="mailto:support@northlane.com" aria-label="Email" className="pro-social-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="pro-footer-col">
            <h4 className="pro-footer-heading">Shop</h4>
            <ul className="pro-footer-links">
              <li><Link to="/collections/all" className="pro-footer-link">All Products</Link></li>
              <li><Link to="/collections/beauty-tools" className="pro-footer-link">Face Care Tools</Link></li>
              <li><Link to="/collections/makeup-essentials" className="pro-footer-link">Eye Brushes</Link></li>
              <li><Link to="/collections/nail-care" className="pro-footer-link">Nails</Link></li>
              <li><Link to="/collections/self-care" className="pro-footer-link">Wellness &amp; Self-Care</Link></li>
            </ul>
          </div>

          {/* Help Column */}
          <div className="pro-footer-col">
            <h4 className="pro-footer-heading">Help</h4>
            <ul className="pro-footer-links">
              <li><Link to="/pages/contact" className="pro-footer-link">Contact Us</Link></li>
              <li><Link to="/policies/shipping" className="pro-footer-link">Shipping &amp; Returns</Link></li>
              <li><Link to="/policies/privacy" className="pro-footer-link">Privacy Policy</Link></li>
              <li><Link to="/policies/terms" className="pro-footer-link">Terms of Service</Link></li>
              <li><Link to="/pages/about" className="pro-footer-link">About Us</Link></li>
            </ul>
          </div>

          {/* Newsletter / Trust Column */}
          <div className="pro-footer-col">
            <h4 className="pro-footer-heading">Why Northlane</h4>
            <ul className="pro-footer-trust-list">
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Free US Shipping</span>
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>Secure SSL Checkout</span>
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"></path></svg>
                <span>7-Day Easy Returns</span>
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Quality Guaranteed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pro-footer-bottom">
          <p className="pro-footer-copy">&copy; 2026 Northlane. All rights reserved.</p>
          <div className="pro-footer-payments">
            {['Visa', 'Mastercard', 'PayPal', 'Amex', 'Apple Pay'].map(name => (
              <span key={name} className="pro-payment-pill">{name}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
