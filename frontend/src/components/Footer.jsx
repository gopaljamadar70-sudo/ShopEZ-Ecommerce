import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      {/* Value propositions */}
      <div className="border-b border-slate-800 py-8 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Free Fast Shipping</p>
              <p className="text-xs text-slate-400">On all orders over $50</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Secure Checkout</p>
              <p className="text-xs text-slate-400">100% Protected Payments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">30 Days Return</p>
              <p className="text-xs text-slate-400">Money back guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">24/7 Dedicated Support</p>
              <p className="text-xs text-slate-400">Always here to help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold text-white">ShopEZ E-Commerce</span>
        </div>
        <p className="text-xs text-slate-500 text-center md:text-right">
          &copy; {new Date().getFullYear()} ShopEZ Inc. Full-stack Node/Express, React, MongoDB application.
        </p>
      </div>
    </footer>
  );
};
