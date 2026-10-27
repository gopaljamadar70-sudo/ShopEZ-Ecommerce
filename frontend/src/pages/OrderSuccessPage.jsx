import React, { useState, useEffect } from 'react';
import { CheckCircle2, Package, ArrowRight, Loader2, Truck } from 'lucide-react';
import { api } from '../services/api.js';

export const OrderSuccessPage = ({ orderId, onContinueShopping, onViewOrders }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.getOrderById(orderId);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error('Failed to load order receipt:', err);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm">Generating order receipt...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* Confirmation Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-3">
        <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Order Successfully Placed!
        </h1>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Thank you for choosing ShopEZ. Your payment has been processed, and your order is currently being prepared for dispatch.
        </p>
        <div className="inline-block px-3 py-1 bg-white border border-emerald-200 rounded-full text-xs font-mono font-bold text-emerald-800">
          Order ID: #{orderId}
        </div>
      </div>

      {/* Order Details Receipt */}
      {order && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                {order.status} &bull; {order.isPaid ? 'Paid' : 'Pending Payment'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total Amount</p>
              <span className="text-lg font-extrabold text-slate-900">
                ${order.totalPrice?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Purchased Items
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-[11px] text-slate-500">Qty: {item.qty}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping destination */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
              Delivery Destination
            </h4>
            <p className="text-slate-600">
              {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
              {order.shippingAddress?.state} {order.shippingAddress?.postalCode},{' '}
              {order.shippingAddress?.country}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onContinueShopping}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onViewOrders}
          className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" />
          View All My Orders
        </button>
      </div>
    </div>
  );
};
