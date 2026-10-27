import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useNotification } from '../context/NotificationContext.jsx';

export const AdminDashboardPage = () => {
  const [tab, setTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // New product form modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    category: 'Electronics',
    brand: '',
    countInStock: 20,
    badge: 'New',
    images: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  });

  // New coupon form state
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercentage: 15,
    minPurchaseAmount: 50,
    expiresInDays: 30,
  });

  const { addNotification } = useNotification();

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsRes, prodsRes, ordersRes, couponsRes] = await Promise.all([
        api.getAnalytics(),
        api.getProducts('limit=100'),
        api.getAllOrders(),
        api.getCoupons(),
      ]);

      if (metricsRes.success) setMetrics(metricsRes.data);
      if (prodsRes.success) setProducts(prodsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (couponsRes.success) setCoupons(couponsRes.data);
    } catch (err) {
      addNotification(err.message || 'Error loading admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createProduct({
        ...newProduct,
        price: Number(newProduct.price),
        originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : Number(newProduct.price),
        countInStock: Number(newProduct.countInStock),
        images: [newProduct.images],
      });
      if (res.success) {
        addNotification(`Product "${newProduct.name}" created!`, 'success');
        setShowAddProductModal(false);
        setNewProduct({
          name: '',
          price: '',
          originalPrice: '',
          description: '',
          category: 'Electronics',
          brand: '',
          countInStock: 20,
          badge: 'New',
          images: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        });
        loadData();
      }
    } catch (err) {
      addNotification(err.message || 'Failed to create product', 'error');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      addNotification(`Deleted "${name}"`, 'info');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      addNotification(err.message || 'Error deleting product', 'error');
    }
  };

  const handleOrderStatusChange = async (id, status) => {
    try {
      await api.updateOrderStatus(id, { status });
      addNotification(`Order status updated to ${status}`, 'success');
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );
    } catch (err) {
      addNotification(err.message || 'Error updating status', 'error');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const expiresAt = new Date(Date.now() + newCoupon.expiresInDays * 24 * 60 * 60 * 1000);
      const res = await api.createCoupon({
        code: newCoupon.code,
        discountPercentage: Number(newCoupon.discountPercentage),
        minPurchaseAmount: Number(newCoupon.minPurchaseAmount),
        expiresAt,
      });
      if (res.success) {
        addNotification(`Coupon ${newCoupon.code} created!`, 'success');
        setNewCoupon({ code: '', discountPercentage: 15, minPurchaseAmount: 50, expiresInDays: 30 });
        loadData();
      }
    } catch (err) {
      addNotification(err.message || 'Error creating coupon', 'error');
    }
  };

  const handleToggleCoupon = async (id) => {
    try {
      const res = await api.toggleCoupon(id);
      if (res.success) {
        setCoupons((prev) =>
          prev.map((c) => (c._id === id ? res.data : c))
        );
        addNotification('Coupon status toggled', 'info');
      }
    } catch (err) {
      addNotification(err.message || 'Error toggling coupon', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm">Loading administrator portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Admin Management Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time store metrics, inventory control, and fulfillment tracking
          </p>
        </div>

        <button
          onClick={() => setShowAddProductModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              ${metrics?.totalRevenue?.toFixed(2) || '0.00'}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Orders Processed
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {metrics?.totalOrders || orders.length}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Catalog Items
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {metrics?.totalProducts || products.length}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Customer Accounts
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {metrics?.totalUsers || 2}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setTab('overview')}
          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 ${
            tab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Inventory & Products ({products.length})
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 ${
            tab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setTab('coupons')}
          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 ${
            tab === 'coupons'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Promotions & Coupons ({coupons.length})
        </button>
      </div>

      {/* Tab 1: Products */}
      {tab === 'overview' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                        <span className="text-[10px] text-indigo-600 font-semibold uppercase">
                          {p.brand}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{p.category}</td>
                    <td className="p-4 font-bold text-slate-900">${p.price.toFixed(2)}</td>
                    <td className="p-4">
                      {p.countInStock <= 5 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                          Low: {p.countInStock}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">{p.countInStock}</span>
                      )}
                    </td>
                    <td className="p-4">{p.rating?.toFixed(1) || '5.0'} ★</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p._id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders */}
      {tab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <p className="font-mono font-bold text-indigo-600">#{o._id.slice(-8)}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{o.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-400">{o.user?.email}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-900">${o.totalPrice?.toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {o.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          o.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700'
                            : o.status === 'Shipped'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleOrderStatusChange(o._id, e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Coupons */}
      {tab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Coupon Form */}
          <form
            onSubmit={handleCreateCoupon}
            className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 text-xs"
          >
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Create Promo Coupon
            </h2>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Coupon Code</label>
              <input
                type="text"
                required
                placeholder="e.g. FLASH25"
                value={newCoupon.code}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                min="1"
                max="99"
                required
                value={newCoupon.discountPercentage}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, discountPercentage: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Min Purchase Amount ($)
              </label>
              <input
                type="number"
                min="0"
                value={newCoupon.minPurchaseAmount}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, minPurchaseAmount: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
            >
              Add Coupon
            </button>
          </form>

          {/* Existing Coupons Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 uppercase font-bold text-slate-500">
                  <tr>
                    <th className="p-4">Code</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Min Spend</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/60">
                      <td className="p-4 font-mono font-bold text-indigo-600">{c.code}</td>
                      <td className="p-4 font-bold">{c.discountPercentage}% OFF</td>
                      <td className="p-4">${c.minPurchaseAmount}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleCoupon(c._id)}
                          className="text-xs text-indigo-600 font-bold hover:underline"
                        >
                          {c.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Product */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Catalog Product</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. UltraHD 4K Action Camera"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="99.99"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={newProduct.countInStock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, countInStock: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Health & Personal Care">Health & Personal Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="e.g. Sony, Apex"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={newProduct.images}
                  onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Detailed specifications and features..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
