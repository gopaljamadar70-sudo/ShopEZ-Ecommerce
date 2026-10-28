import React, { useState, useEffect } from 'react';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ProductDetailPage } from './pages/ProductDetailPage.jsx';
import { CartPage } from './pages/CartPage.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { OrderSuccessPage } from './pages/OrderSuccessPage.jsx';
import { UserProfilePage } from './pages/UserProfilePage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';
import { api } from './services/api.js';

export function ShopEZApp() {
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      return hash || 'home';
    }
    return 'home';
  };

  const [currentView, setViewInternal] = useState(getInitialView);
  const [selectedProductId, setSelectedProductId] = useState(() => {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('shopez_selected_product') : null;
  });
  const [lastOrderId, setLastOrderId] = useState(() => {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('shopez_last_order') : null;
  });
  const [searchQuery, setSearchQuery] = useState('');

  const setCurrentView = (view) => {
    setViewInternal(view);
    if (typeof window !== 'undefined') {
      window.location.hash = `#/${view}`;
    }
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) setViewInternal(hash);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Ensure selectedProductId has a fallback if viewing product-detail directly
  useEffect(() => {
    if (currentView === 'product-detail' && !selectedProductId) {
      api.getProducts().then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setSelectedProductId(res.data[0]._id);
        }
      }).catch(() => {});
    }
  }, [currentView, selectedProductId]);

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('shopez_selected_product', productId);
    }
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderPlaced = (orderId) => {
    setLastOrderId(orderId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('shopez_last_order', orderId);
    }
    setCurrentView('order-success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onSearch={handleSearch}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <HomePage
            onSelectProduct={handleSelectProduct}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        )}

        {currentView === 'product-detail' && (
          <ProductDetailPage
            productId={selectedProductId}
            onBack={() => setCurrentView('home')}
            onNavigateLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'cart' && (
          <CartPage
            onNavigateCheckout={() => setCurrentView('checkout')}
            onContinueShopping={() => setCurrentView('home')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onOrderPlaced={handleOrderPlaced}
            onNavigateLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'order-success' && (
          <OrderSuccessPage
            orderId={lastOrderId}
            onContinueShopping={() => setCurrentView('home')}
            onViewOrders={() => setCurrentView('orders')}
          />
        )}

        {currentView === 'profile' && <UserProfilePage defaultTab="profile" />}

        {currentView === 'orders' && <UserProfilePage defaultTab="orders" />}

        {currentView === 'login' && (
          <LoginPage
            onNavigateRegister={() => setCurrentView('register')}
            onLoginSuccess={() => setCurrentView('home')}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onNavigateLogin={() => setCurrentView('login')}
            onRegisterSuccess={() => setCurrentView('home')}
          />
        )}

        {currentView === 'admin' && <AdminDashboardPage />}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <ShopEZApp />
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
