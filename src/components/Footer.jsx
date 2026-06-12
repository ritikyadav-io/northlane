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
    <footer id="footer" className="dtc-footer">
      <style>{`
        .dtc-footer {
          background-color: #FCF8F5; /* Matches warm background theme */
          border-top: 1px solid #E9ECEF;
          padding: 60px 0 40px;
          font-family: 'Manrope', sans-serif;
          color: #1B2A4A;
        }
        .footer-dtc-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          text-align: center;
        }
        .footer-logo {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #1B2A4A;
        }
        .footer-dtc-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px 32px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-dtc-link {
          font-size: 0.9rem;
          font-weight: 600;
          color: #4A5568;
          transition: color 0.2s;
        }
        .footer-dtc-link:hover {
          color: #C9A84C;
        }
        .footer-dtc-bottom {
          width: 100%;
          border-top: 1px solid #E9ECEF;
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .footer-dtc-copy {
          font-size: 0.8rem;
          color: #718096;
        }
        .footer-dtc-payments {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .payment-pill {
          font-size: 0.75rem;
          font-weight: 700;
          color: #1B2A4A;
          background-color: #FFFFFF;
          padding: 4px 10px;
          border-radius: 4px;
          border: 1px solid #E9ECEF;
        }
        @media (max-width: 768px) {
          .footer-dtc-links {
            flex-direction: column;
            gap: 16px;
          }
          .footer-dtc-bottom {
            flex-direction: column;
            text-align: center;
            justify-content: center;
          }
        }
      `}</style>

      <div className="container footer-dtc-container">
        {/* Brand Logo */}
        <span className="footer-logo">NORTHLANE</span>

        {/* Minimal Links */}
        <ul className="footer-dtc-links">
          <li>
            <Link to="/" className="footer-dtc-link">Home</Link>
          </li>
          <li>
            <Link to="/collections/all" className="footer-dtc-link">Shop</Link>
          </li>
          <li>
            <a 
              href="#best-sellers" 
              className="footer-dtc-link"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection('best-sellers');
              }}
            >
              Best Sellers
            </a>
          </li>
          <li>
            <Link to="/pages/contact" className="footer-dtc-link">Contact</Link>
          </li>
          <li>
            <Link to="/policies/privacy" className="footer-dtc-link">Privacy Policy</Link>
          </li>
          <li>
            <Link to="/policies/terms" className="footer-dtc-link">Terms of Service</Link>
          </li>
        </ul>

        {/* Bottom copyright and payments */}
        <div className="footer-dtc-bottom">
          <p className="footer-dtc-copy">
            &copy; 2026 Northlane. All rights reserved. Secure SSL checkout.
          </p>

          <div className="footer-dtc-payments">
            {['Visa', 'Mastercard', 'PayPal', 'Amex', 'Shop Pay'].map(name => (
              <span key={name} className="payment-pill">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
