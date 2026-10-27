import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useNotification } from './NotificationContext.jsx';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('shopez_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('shopez_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const { addNotification } = useNotification();

  useEffect(() => {
    localStorage.setItem('shopez_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('shopez_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('shopez_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product, qty = 1) => {
    const existing = cartItems.find((item) => item.product === product._id);
    const newQty = existing ? existing.qty + qty : qty;

    if (newQty > product.countInStock) {
      addNotification(
        `Only ${product.countInStock} items available in stock`,
        'error'
      );
      return false;
    }

    if (existing) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product === product._id ? { ...item, qty: newQty } : item
        )
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          product: product._id,
          name: product.name,
          image: product.images[0],
          price: product.price,
          countInStock: product.countInStock,
          qty: newQty,
        },
      ]);
    }

    addNotification(`Added "${product.name}" to your cart!`, 'success');
    return true;
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product === productId) {
          if (qty > item.countInStock) {
            addNotification(`Cannot exceed ${item.countInStock} in stock`, 'error');
            return item;
          }
          return { ...item, qty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product !== productId));
    addNotification('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code) => {
    if (!code || code.trim() === '') {
      addNotification('Please enter a coupon code', 'error');
      return false;
    }

    try {
      const res = await api.validateCoupon(code.trim().toUpperCase(), rawSubtotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        addNotification(
          `Coupon "${res.data.code}" applied! You saved ${res.data.discountPercentage}%`,
          'success'
        );
        return true;
      }
    } catch (err) {
      addNotification(err.message || 'Invalid or expired coupon code', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addNotification('Coupon removed', 'info');
  };

  // Calculations
  const rawSubtotal = Number(
    cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
  );

  const discountAmount = appliedCoupon
    ? Number(((rawSubtotal * appliedCoupon.discountPercentage) / 100).toFixed(2))
    : 0;

  const discountedSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const shippingPrice = discountedSubtotal > 50 || discountedSubtotal === 0 ? 0 : 10;
  const taxPrice = Number((0.08 * discountedSubtotal).toFixed(2));
  const totalPrice = Number((discountedSubtotal + shippingPrice + taxPrice).toFixed(2));
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        appliedCoupon,
        rawSubtotal,
        discountAmount,
        shippingPrice,
        taxPrice,
        totalPrice,
        totalItemsCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
