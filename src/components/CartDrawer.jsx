import React from 'react';
import { useCart } from '../CartContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    checkoutLoading,
    upsellProduct,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    getItemCount,
    handleCheckout,
    addToCart
  } = useCart();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  // Free shipping logic
  const usThreshold = 15;
  
  const usDiff = usThreshold - subtotal;

  const usPercent = Math.min((subtotal / usThreshold) * 100, 100);

  const handleAddUpsell = () => {
    if (upsellProduct) {
      // Add first variant of the upsell product
      addToCart(upsellProduct, upsellProduct.variants[0], 1);
    }
  };

  return (
    <>
      {/* Drawer Overlay */}
      <div
        className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Drawer Container */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <span className="cart-drawer-title">Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <button
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', textAlign: 'center', gap: '16px' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <p style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--color-primary)' }}>Your cart is empty</p>
              <p style={{ fontSize: '0.9rem', maxWidth: '280px' }}>Fill it with premium essentials and get free shipping across the US.</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '12px' }}
                onClick={() => setIsCartOpen(false)}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Shipping Goals */}
              <div className="shipping-progress-box">
                <div style={{ marginBottom: '0px' }}>
                  <p className="shipping-progress-text">
                    {usDiff > 0
                      ? `You are $${usDiff.toFixed(2)} away from Free US Shipping`
                      : 'You qualify for Free US Shipping'}
                  </p>
                  <div className="shipping-bar-bg">
                    <div className="shipping-bar-fill" style={{ width: `${usPercent}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="cart-items-list">
                {cart.map((item, idx) => (
                  <div className="cart-item" key={`${item.variant.id}-${idx}`}>
                    <img src={item.variant.image} alt={item.product.title} className="cart-item-img" />
                    <div className="cart-item-info">
                      <span className="cart-item-title">{item.product.title}</span>
                      <span className="cart-item-variant">{item.variant.title}</span>
                      <span className="cart-item-price">${(item.variant.price * item.quantity).toFixed(2)}</span>
                      
                      <div className="cart-item-controls">
                        <div className="qty-selector">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          className="cart-item-remove-btn"
                          onClick={() => removeFromCart(item.variant.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Suggested Upsell Product */}
          {cart.length > 0 && upsellProduct && (
            <div className="cart-upsell-box">
              <h4 className="cart-upsell-title">You might also like</h4>
              <div className="cart-upsell-item">
                <img src={upsellProduct.images[0]} alt={upsellProduct.title} className="cart-upsell-img" />
                <div className="cart-upsell-info">
                  <h5 className="cart-upsell-item-title">{upsellProduct.title}</h5>
                  <span className="cart-upsell-price">${upsellProduct.minPrice.toFixed(2)}</span>
                </div>
                <button
                  className="cart-upsell-btn"
                  onClick={handleAddUpsell}
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Subtotal & Checkout */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer" style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
            <div className="cart-subtotal-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', fontSize: '1rem' }}>
              <span className="subtotal-label" style={{ fontWeight: '600', color: 'var(--color-text-muted)' }}>Subtotal</span>
              <span className="subtotal-price" style={{ fontWeight: '800', color: 'var(--color-primary)', fontSize: '1.1rem' }}>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="cart-actions-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <button
                className="btn btn-accent btn-full"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                style={{ height: '44px', width: '100%', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '700' }}
              >
                {checkoutLoading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  'Secure Checkout'
                )}
              </button>
              
              <button
                className="cart-continue-link"
                onClick={() => setIsCartOpen(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--color-text-muted)', 
                  fontSize: '0.8rem', 
                  fontWeight: '600', 
                  textDecoration: 'underline', 
                  cursor: 'pointer', 
                  minHeight: '36px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Continue Shopping
              </button>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '6px', margin: '6px 0 0 0' }}>
              Shipping and taxes calculated at checkout. SSL Encrypted.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
