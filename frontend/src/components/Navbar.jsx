import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  User,
  ShieldCheck,
  Package,
  LogOut,
  Menu,
  X,
  Tag,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export const Navbar = ({ currentView, setCurrentView, onSearch }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    setCurrentView('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            onClick={() => {
              setCurrentView('home');
              if (onSearch) onSearch('');
              setSearchQuery('');
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                ShopEZ
              </span>
              <span className="text-xs block text-slate-600 font-medium -mt-1 tracking-wider uppercase">
                Store
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-4 relative"
          >
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-sm rounded-full border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>
          </form>

          {/* Action Navigation */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Promo banner indicator */}
            <button
              onClick={() => {
                setCurrentView('cart');
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Use 'WELCOME10' for 10% OFF</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setCurrentView('cart')}
              className={`relative p-2.5 rounded-full transition-colors flex items-center justify-center ${
                currentView === 'cart'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* User Dropdown / Auth Link */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-600">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                          Administrator
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setCurrentView('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('orders');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      Order History
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCurrentView('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 font-medium flex items-center gap-2.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        setCurrentView('home');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => setCurrentView('register')}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-sm hover:shadow transition-all"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 text-sm rounded-full border border-transparent focus:border-indigo-500 outline-none"
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
};
