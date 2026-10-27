import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const LoginPage = ({ onNavigateRegister, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@shopez.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      onLoginSuccess();
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome to ShopEZ</h1>
          <p className="text-xs text-slate-500">Sign in to manage your orders and account</p>
        </div>

        {/* Demo credentials hint */}
        <div className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-2xl text-[11px] text-indigo-900 space-y-1">
          <p className="font-bold">Quick Demo Login Options:</p>
          <div className="flex justify-between">
            <span>Admin: <code>admin@shopez.com</code></span>
            <span><code>password123</code></span>
          </div>
          <div className="flex justify-between">
            <span>Customer: <code>john@example.com</code></span>
            <span><code>password123</code></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          <span>Don't have an account yet? </span>
          <button
            onClick={onNavigateRegister}
            className="text-indigo-600 font-bold hover:underline"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};
