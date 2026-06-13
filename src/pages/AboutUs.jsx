import React from 'react';
import { useRouter } from '../Router';

export default function AboutUs() {
  const { navigate } = useRouter();

  return (
    <div className="container" style={{ padding: '40px 24px 80px', maxWidth: '900px' }}>


      <div className="policy-card-box" style={{ padding: '40px' }}>
        <h1 className="policy-title" style={{ marginBottom: '10px', fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>Our Story</h1>
        <p className="policy-updated" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '30px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
          Celebrating Women, Beauty, & Self-Care
        </p>

        <section className="policy-section" style={{ marginBottom: '32px' }}>
          <h2 className="policy-sec-title" style={{ fontSize: '1.5rem', marginBottom: '12px', fontWeight: '700', color: 'var(--color-primary)' }}>The Northlane Vision</h2>
          <p className="policy-text" style={{ lineHeight: '1.7', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Northlane began with a singular mission: to curate a premium space where modern women can discover high-quality beauty, luxury lingerie, and advanced self-care tools that elevate their daily routines. We believe that self-care is not a luxury, but a necessity. Every product in our catalog is carefully sourced, tested, and vetted to ensure it meets our rigorous standards of safety, comfort, and performance.
          </p>
        </section>

        <section className="policy-section" style={{ marginBottom: '32px' }}>
          <h2 className="policy-sec-title" style={{ fontSize: '1.5rem', marginBottom: '12px', fontWeight: '700', color: 'var(--color-primary)' }}>Skincare & Cosmetic Excellence</h2>
          <p className="policy-text" style={{ lineHeight: '1.7', color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '12px' }}>
            We understand that your skin deserves only the best. That's why our skincare range is chosen with a focus on skin-safe, active ingredients. 
          </p>
          <ul className="policy-list" style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--color-text-muted)', lineHeight: '1.7', fontSize: '0.95rem' }}>
            <li><strong>Dermatologist-Friendly Formulations:</strong> Cruelty-free ingredients, zero parabens, and zero harsh chemicals.</li>
            <li><strong>Targeted Results:</strong> Whether you're looking for deep hydration, brightening serums, or non-irritating cosmetics, our formulations are optimized for visible efficacy.</li>
            <li><strong>Ethically Sourced:</strong> We partner with trusted laboratories that prioritize clean beauty and environmental responsibility.</li>
          </ul>
        </section>

        <section className="policy-section" style={{ marginBottom: '32px' }}>
          <h2 className="policy-sec-title" style={{ fontSize: '1.5rem', marginBottom: '12px', fontWeight: '700', color: 'var(--color-primary)' }}>Lingerie & Nightwear Craftsmanship</h2>
          <p className="policy-text" style={{ lineHeight: '1.7', color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '12px' }}>
            Lingerie is the closest layer to your skin, and we believe it should feel like a second skin. Our nightwear and lingerie sets combine intricate aesthetic detail with superior comfort.
          </p>
          <ul className="policy-list" style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--color-text-muted)', lineHeight: '1.7', fontSize: '0.95rem' }}>
            <li><strong>Premium Fabrics:</strong> Soft stretch lace, lightweight breathable modal, and flexible spandex blends that hug and flatter every curve.</li>
            <li><strong>Everyday Support:</strong> Comfortable underwires, adjustable shoulder straps, and soft linings that provide beautiful lift without pinching.</li>
            <li><strong>Aesthetic Variety:</strong> From classic elegance to sultry silhouettes, discover pieces designed to make you feel confident and alluring.</li>
          </ul>
        </section>

        <section className="policy-section" style={{ marginBottom: '32px' }}>
          <h2 className="policy-sec-title" style={{ fontSize: '1.5rem', marginBottom: '12px', fontWeight: '700', color: 'var(--color-primary)' }}>Our Discretion & Trust Guarantee</h2>
          <p className="policy-text" style={{ lineHeight: '1.7', color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
            Your confidence is our top priority. We go the extra mile to provide a seamless, secure, and completely private shopping experience:
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {/* Badge 1 */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--color-accent)', fontSize: '1.25rem', fontWeight: 'bold' }}>🔒</div>
              <div>
                <h4 style={{ color: 'var(--color-primary)', fontSize: '0.95rem', fontWeight: '700', margin: '0 0 4px' }}>Discreet Packaging</h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>All lingerie and personal wellness orders are shipped in plain, unbranded boxes to maintain absolute privacy.</p>
              </div>
            </div>

            {/* Badge 2 */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--color-accent)', fontSize: '1.25rem', fontWeight: 'bold' }}>🛡️</div>
              <div>
                <h4 style={{ color: 'var(--color-primary)', fontSize: '0.95rem', fontWeight: '700', margin: '0 0 4px' }}>Secure Shopify Payments</h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>All transactions are 100% encrypted using industry-standard SSL verified checkout protocols.</p>
              </div>
            </div>

            {/* Badge 3 */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--color-accent)', fontSize: '1.25rem', fontWeight: 'bold' }}>✈️</div>
              <div>
                <h4 style={{ color: 'var(--color-primary)', fontSize: '0.95rem', fontWeight: '700', margin: '0 0 4px' }}>Tracked Shipping</h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>Free tracked shipping to the United States on all qualified orders.</p>
              </div>
            </div>

            {/* Badge 4 */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--color-accent)', fontSize: '1.25rem', fontWeight: 'bold' }}>💝</div>
              <div>
                <h4 style={{ color: 'var(--color-primary)', fontSize: '0.95rem', fontWeight: '700', margin: '0 0 4px' }}>7-Day Happiness</h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>If you aren't completely in love with your purchase, return it within 7 days for a full refund or exchange.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="policy-section" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1.1rem', fontWeight: '700' }}>Have questions?</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Our specialized beauty and sizing support team is here for you.</p>
          </div>
          <button 
            onClick={() => navigate('/pages/contact')} 
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            Get In Touch
          </button>
        </section>
      </div>
    </div>
  );
}
