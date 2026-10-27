import React, { useState, useEffect } from 'react';
import { Sparkles, SlidersHorizontal, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.jsx';

export const HomePage = ({ onSelectProduct, searchQuery, onClearSearch }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products with active filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('keyword', searchQuery);
        if (selectedCategory && selectedCategory !== 'All') {
          params.append('category', selectedCategory);
        }
        if (sortBy) params.append('sortBy', sortBy);

        const res = await api.getProducts(params.toString());
        if (res.success && res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      {!searchQuery && selectedCategory === 'All' && (
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white shadow-xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative max-w-3xl px-6 py-12 sm:px-12 sm:py-16 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Special Autumn Collection 2026
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Curated Essentials for Modern Living.
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
              Explore premium electronics, outdoor gear, and sustainable home essentials crafted for longevity. Enjoy free shipping on orders over $50.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('Electronics')}
                className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 shadow-sm transition-all flex items-center gap-2 group"
              >
                Shop Electronics
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Filter and Control Bar */}
      <section className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.category
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.category}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.category
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Results & Sort Select */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="text-sm text-slate-600 font-medium">
            {searchQuery ? (
              <span className="flex items-center gap-2">
                Showing results for <strong className="text-slate-900">"{searchQuery}"</strong>
                <button
                  onClick={onClearSearch}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Clear search
                </button>
              </span>
            ) : (
              <span>
                Found <strong className="text-slate-900">{products.length}</strong> items in{' '}
                {selectedCategory}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm">Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-base font-semibold text-slate-700">No products found</p>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Try adjusting your search criteria, switching categories, or clearing filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              if (onClearSearch) onClearSearch();
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
