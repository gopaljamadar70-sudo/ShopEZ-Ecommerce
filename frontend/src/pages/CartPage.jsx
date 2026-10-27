import React, { useState } from 'react';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Tag,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export const CartPage = ({ onNavigateCheckout, onContinueShopping }) => {
  const {
    cartItems,
    appliedCoupon,
    rawSubtotal,
    discountAmount,
    shippingPrice,
    taxPrice,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setApplyingCoupon(true);
    await applyCoupon(couponCode);
    setApplyingCoupon(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-10 shadow-sm space-y-5">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Explore our curated catalog for top electronics, gear, and more.
        </p>
        <button
          onClick={onContinueShopping}
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
        >
          Explore Catalog
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Shopping Cart ({cartItems.reduce((acc, i) => acc + i.qty, 0)} items)
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
            {cartItems.map((item) => (
              <div
                key={item.product}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Image & Title */}
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0 border border-slate-100"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      ${item.price.toFixed(2)} each
                    </p>
                    {item.countInStock <= 5 && (
                      <span className="text-[10px] text-amber-600 font-semibold">
                        Only {item.countInStock} left in stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Stepper + Item Total + Remove */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.product, item.qty - 1)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-800">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product, item.qty + 1)}
                      disabled={item.qty >= item.countInStock}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <span className="text-sm font-extrabold text-slate-900 min-w-[70px] text-right">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={onContinueShopping}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              &larr; Continue Shopping
            </button>
          </div>
        </div>

        {/* Order Summary & Coupon Column */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-indigo-600" />
              Promotional Discount Code
            </h2>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-emerald-800">
                    {appliedCoupon.code} applied!
                  </span>
                  <p className="text-[11px] text-emerald-600">
                    {appliedCoupon.discountPercentage}% discount active
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-rose-600 hover:underline font-bold text-[11px]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs uppercase font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={applyingCoupon}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            )}
            <p className="text-[11px] text-slate-600">
              Try <span className="font-semibold text-slate-700">WELCOME10</span> (10% off) or <span className="font-semibold text-slate-700">SAVE20</span> on orders over $100.
            </p>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ${rawSubtotal.toFixed(2)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shippingPrice === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `$${shippingPrice.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900">
                  ${taxPrice.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-extrabold text-slate-900">
                <span>Order Total</span>
                <span className="text-indigo-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onNavigateCheckout}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
