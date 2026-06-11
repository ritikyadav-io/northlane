import React, { createContext, useContext, useState, useEffect } from 'react';
import { createCheckout, fetchProducts } from './shopify';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const localData = localStorage.getItem('northlane_cart');
    return localData ? JSON.parse(localData) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [upsellProduct, setUpsellProduct] = useState(null);

  useEffect(() => {
    localStorage.setItem('northlane_cart', JSON.stringify(cart));
  }, [cart]);

  // Open cart drawer if redirected back with open_cart=true or pathname is /cart
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isCartPath = window.location.pathname === '/cart' || window.location.pathname === '/cart/';
    if (params.get('open_cart') === 'true' || isCartPath) {
      setIsCartOpen(true);
      // Clean up the URL so it doesn't pop open on reload, redirect /cart to /
      const cleanUrl = isCartPath ? '/' : window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // Load a suggested upsell product (not already in cart)
  useEffect(() => {
    async function loadUpsell() {
      try {
        const products = await fetchProducts(8);
        if (products.length > 0) {
          // Find first product that is not already in the cart
          const inCartIds = cart.map(item => item.product.id);
          const upsellCandidate = products.find(p => !inCartIds.includes(p.id)) || products[0];
          setUpsellProduct(upsellCandidate);
        }
      } catch (err) {
        console.error('Failed to load upsell product:', err);
      }
    }
    loadUpsell();
  }, [cart]);

  const addToCart = (product, variant, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.variant.id === variant.id);
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, { product, variant, quantity }];
      }
    });
    // Open the drawer automatically on add
    setIsCartOpen(true);
  };

  const updateQuantity = (variantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.variant.id === variantId ? { ...item, quantity: parseInt(quantity, 10) } : item
      )
    );
  };

  const removeFromCart = (variantId) => {
    setCart(prevCart => prevCart.filter(item => item.variant.id !== variantId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      const lineItems = cart.map(item => ({
        variantId: item.variant.id,
        quantity: item.quantity
      }));
      const checkoutUrl = await createCheckout(lineItems);
      if (checkoutUrl) {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const redirectUrl = isLocal 
          ? checkoutUrl + (checkoutUrl.includes('?') ? '&' : '?') + 'dev=true' 
          : checkoutUrl;
        window.location.href = redirectUrl;
      } else {
        throw new Error('Checkout URL not generated');
      }
    } catch (error) {
      console.error('Checkout Redirection Failed, falling back to cart permalink:', error);
      // Fallback permalink in case checkout mutation fails
      const domain = 'northlanesite.myshopify.com';
      const itemsString = cart.map(item => {
        // Extract raw numeric ID from GraphQL variant GID
        const variantIdMatch = item.variant.id.match(/\/ProductVariant\/(\d+)/);
        const rawId = variantIdMatch ? variantIdMatch[1] : item.variant.id;
        return `${rawId}:${item.quantity}`;
      }).join(',');
      window.location.href = `https://${domain}/cart/${itemsString}`;
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        checkoutLoading,
        upsellProduct,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getSubtotal,
        getItemCount,
        handleCheckout
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
