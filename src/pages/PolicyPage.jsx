import React, { useState } from 'react';
import { useRouter } from '../Router';

export default function PolicyPage({ type }) {
  const { navigate } = useRouter();
  
  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', order: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', email: '', order: '', message: '' });
    }
  };

  const renderPolicyContent = () => {
    switch (type) {
      case 'privacy':
        return (
          <>
            <h1 className="policy-title">Privacy Policy</h1>
            <p className="policy-updated">Last Updated: June 11, 2026</p>
            
            <section className="policy-section">
              <h2 className="policy-sec-title">1. Information We Collect</h2>
              <p>When you visit the Northlane storefront, we automatically collect certain information about your device, including details about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site.</p>
              <p>When you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number. We refer to this information as "Order Information."</p>
            </section>

            <section className="policy-section">
              <h2 className="policy-sec-title">2. How Do We Use Your Personal Information?</h2>
              <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:</p>
              <ul className="policy-list">
                <li>Communicate with you regarding shipping updates and support.</li>
                <li>Screen our orders for potential risk or fraud.</li>
                <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2 className="policy-sec-title">3. Sharing Your Personal Information</h2>
              <p>We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use Shopify to power our online store — you can read more about how Shopify uses your Personal Information on Shopify's privacy portal. We also use Google Analytics to help us understand how our customers use the Site.</p>
            </section>

            <section className="policy-section">
              <h2 className="policy-sec-title">4. SSL and Transaction Security</h2>
              <p>Your transaction security is our priority. All payments are processed through Shopify's secure PCI-DSS compliant checkout system. We do not store or have access to your credit card numbers or billing credentials.</p>
            </section>

            <section className="policy-section">
              <h2 className="policy-sec-title">5. Contact Us</h2>
              <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <strong>support@northlane.com</strong>.</p>
            </section>
          </>
        );
      
      case 'refund':
        return (
          <>
            <h1 className="policy-title">Return & Refund Policy</h1>
            <p className="policy-updated">Last Updated: June 11, 2026</p>

            <section className="policy-section">
              <h2 className="policy-sec-title">1. 30-Day Money Back Guarantee</h2>
              <p>We want you to be absolutely satisfied with your purchase. If you are not happy with your order, you can return it within <strong>30 days</strong> of receiving it for a full refund or replacement. No hassle, no questions asked.</p>
              <p>To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.</p>
            </section>

            <section className="policy-section">
              <h2 className="policy-sec-title">2. How to Start a Return</h2>
              <p>To start a return, you can contact us at <strong>support@northlane.com</strong>. If your return is accepted, we will send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.</p>
            </section>

            <section className="policy-section">
              <h2 className="policy-sec-title">3. Damaged or Defective Items</h2>
              <p>Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right immediately with a replacement unit at no extra charge.</p>
            </section>

            <section className="policy-section">
              <h2 className="policy-sec-title">4. Refunds Process</h2>
              <p>We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method within 5-7 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.</p>
            </section>
          </>
        );

      case 'shipping':
        return (
          <>
            <h1 className="policy-title">Shipping Policy</h1>
            <p className="policy-updated">Last Updated: June 11, 2026</p>

            <section className="policy-section">
              <h2 className="policy-sec-title">1. Shipping Coverage & Pricing</h2>
              <p>We proudly offer tracked shipping to the <strong>United States</strong> and <strong>United Kingdom</strong>. We believe in honest pricing, which is why we offer low shipping thresholds:</p>
              <ul className="policy-list">
                <li><strong>United States</strong>: Free Standard Shipping on all orders over <strong>$15.00</strong>. Orders under $15.00 are charged a flat shipping rate of $3.99.</li>
                <li><strong>United Kingdom</strong>: Free Standard Shipping on all orders over <strong>$20.00</strong>. Orders under $20.00 are charged a flat shipping rate of $4.99.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2 className="policy-sec-title">2. Delivery Timelines</h2>
              <p>Every product is handpicked, inspected for quality, and packaged carefully. Timelines are divided into two parts:</p>
              <ul className="policy-list">
                <li><strong>Processing Time</strong>: 1 to 3 business days. This includes order verification, product inspection, quality checking, and packaging.</li>
                <li><strong>Shipping Times</strong>:
                  <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                    <li><strong>US Delivery</strong>: 7 to 15 business days (fully tracked).</li>
                    <li><strong>UK Delivery</strong>: 10 to 18 business days (fully tracked).</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section className="policy-section">
              <h2 className="policy-sec-title">3. Live Tracking Information</h2>
              <p>Once your order is shipped, you will automatically receive an email confirmation containing a unique tracking link and number. You can monitor your package status via standard postal tracking websites (such as USPS, Royal Mail, or global platforms like 17track.net).</p>
            </section>
          </>
        );

      case 'terms':
        return (
          <>
            <h1 className="policy-title">Terms of Service</h1>
            <p className="policy-updated">Last Updated: June 11, 2026</p>

            <section className="policy-section">
              <h2 className="policy-sec-title">1. Overview</h2>
              <p>This website is operated by Northlane. Throughout the site, the terms "we", "us" and "our" refer to Northlane. Northlane offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.</p>
              <p>By visiting our site and/or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service", "Terms"), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site.</p>
            </section>

            <section className="policy-section">
              <h2 className="policy-sec-title">2. Online Store Terms</h2>
              <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.</p>
              <p>You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).</p>
            </section>

            <section className="policy-section">
              <h2 className="policy-sec-title">3. Billing & Shopify Processing</h2>
              <p>All payments are securely routed and processed through Shopify Checkout. Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</p>
              <p>We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order.</p>
            </section>

            <section className="policy-section">
              <h2 className="policy-sec-title">4. Governing Law</h2>
              <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the United States and the United Kingdom.</p>
            </section>
          </>
        );

      case 'contact':
      default:
        return (
          <div className="contact-layout">
            <div className="contact-info-side">
              <h1 className="policy-title" style={{ marginBottom: '16px' }}>Contact Us</h1>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>
                Have a question about your order, shipping, or returns? We are here to help. Get in touch and we will reply within 12 to 24 hours.
              </p>

              <div className="contact-details-list">
                <div className="contact-detail-card">
                  <span className="contact-card-icon">✉</span>
                  <div>
                    <h3 className="contact-card-title">Email Support</h3>
                    <p className="contact-card-text"><a href="mailto:support@northlane.com">support@northlane.com</a></p>
                  </div>
                </div>

                <div className="contact-detail-card">
                  <span className="contact-card-icon">⏰</span>
                  <div>
                    <h3 className="contact-card-title">Response Hours</h3>
                    <p className="contact-card-text">Monday - Friday: 9 AM - 6 PM EST</p>
                  </div>
                </div>

                <div className="contact-detail-card">
                  <span className="contact-card-icon">📍</span>
                  <div>
                    <h3 className="contact-card-title">Fulfillment Warehouses</h3>
                    <p className="contact-card-text">Atlanta, Georgia, USA | London, UK</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '30px', padding: '16px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                <h4 style={{ color: 'var(--color-primary)', fontSize: '0.9rem', marginBottom: '6px', fontWeight: '700' }}>SSL Secure Checkout Guaranteed</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Every transaction on our site is encrypted with SSL and verified by Shopify security protocols.</p>
              </div>
            </div>

            <div className="contact-form-side">
              <h2 className="policy-sec-title" style={{ marginBottom: '20px' }}>Send Us a Message</h2>
              {submitted ? (
                <div style={{ padding: '24px', backgroundColor: 'var(--color-success)', color: '#fff', borderRadius: '6px', textAlign: 'center', fontWeight: '600' }}>
                  <p style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Message Sent!</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>Thank you. A customer care representative will get back to you at your email address shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary)' }}>Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      className="contact-input-field"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary)' }}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      className="contact-input-field"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary)' }}>Order Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. #NL1024"
                      className="contact-input-field"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary)' }}>Your Message *</label>
                    <textarea
                      required
                      rows="5"
                      placeholder="How can we help you?"
                      className="contact-input-field"
                      style={{ resize: 'vertical' }}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px' }}>
                    Submit Message
                  </button>
                </form>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px', maxWidth: '900px' }}>
      
      {/* Back Button */}
      <button onClick={() => window.history.back()} className="back-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Go Back
      </button>

      <div className="policy-card-box">
        {renderPolicyContent()}
      </div>
    </div>
  );
}
