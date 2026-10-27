import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Loader2,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { api } from '../services/api.js';

export const CheckoutPage = ({ onOrderPlaced, onNavigateLogin }) => {
  const { cartItems, appliedCoupon, totalPrice, shippingPrice, taxPrice, rawSubtotal, discountAmount, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotification();

  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address?.street || '123 Commerce St',
    city: user?.address?.city || 'San Francisco',
    state: user?.address?.state || 'CA',
    postalCode: user?.address?.postalCode || '94105',
    country: user?.address?.country || 'USA',
  });

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addNotification('Please log in or register to place your order', 'error');
      onNavigateLogin();
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      addNotification('Please complete your shipping address', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          qty: item.qty,
        })),
        shippingAddress,
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const res = await api.createOrder(orderPayload);
      if (res.success && res.data) {
        // Automatically simulate payment completion
        try {
          await api.payOrder(res.data._id, {
            id: `PAY_${Date.now()}_SIMULATED`,
            status: 'COMPLETED',
          });
        } catch (payErr) {
          console.warn('Payment simulation status:', payErr.message);
        }

        clearCart();
        addNotification('Order placed and confirmed successfully!', 'success');
        onOrderPlaced(res.data._id);
      }
    } catch (err) {
      addNotification(err.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl p-8 border border-slate-200">
        <p className="text-slate-600">No items to checkout.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Lock className="w-6 h-6 text-indigo-600" />
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your shipping information and finalize your payment.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
          <p className="text-xs text-amber-800">
            You must be logged in to complete your checkout and track orders.
          </p>
          <button
            onClick={onNavigateLogin}
            className="px-4 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors"
          >
            Log In / Sign Up
          </button>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Shipping & Payment Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              1. Shipping Address
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.street}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, street: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, state: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        postalCode: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        country: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Credit Card', 'PayPal'].map((method) => (
                <label
                  key={method}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === method
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-800">{method}</span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Review Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Review
            </h2>

            {/* Items summary */}
            <div className="max-h-48 overflow-y-auto space-y-3 pr-1 text-xs">
              {cartItems.map((item) => (
                <div key={item.product} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={item.image}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500">Qty: {item.qty}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${rawSubtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (8%)</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Due</span>
                <span className="text-indigo-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying & Placing Order...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Place Order & Pay
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
