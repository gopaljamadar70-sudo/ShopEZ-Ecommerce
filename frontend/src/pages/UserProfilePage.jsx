import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const UserProfilePage = ({ defaultTab = 'profile' }) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'USA',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const res = await api.getMyOrders();
          if (res.success && res.data) {
            setOrders(res.data);
          }
        } catch (err) {
          console.error('Error fetching orders:', err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      name: formData.name,
      phone: formData.phone,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
    });
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Profile card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
          alt={user?.name}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
        />
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-600">{user?.email}</p>
          <p className="text-xs text-slate-600">
            ShopEZ Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-6 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Personal Details
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-6 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          Order History ({orders.length})
        </button>
      </div>

      {/* Tab 1: Profile Edit */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleProfileSubmit}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5"
        >
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Edit Profile Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-0100"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-medium mb-1">Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="100 Main St"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
              <p className="text-xs">Fetching past orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">No past orders yet</p>
              <p className="text-xs text-slate-500">
                When you make a purchase, your invoices and tracking information will appear here.
              </p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-600">
                      #{ord._id}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                      {new Date(ord.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700'
                          : ord.status === 'Shipped'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      ${ord.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-2">
                  {ord.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover bg-slate-100"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-slate-400">Qty: {item.qty}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-700">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
