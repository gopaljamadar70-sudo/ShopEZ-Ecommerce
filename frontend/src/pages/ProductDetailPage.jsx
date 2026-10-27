import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ShoppingCart,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

export const ProductDetailPage = ({ productId, onBack, onNavigateLogin }) => {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart, cartItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotification();

  const inCart = cartItems.find((i) => i.product === productId);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.getProductById(productId);
        if (res.success && res.data) {
          setProduct(res.data);
        }
      } catch (err) {
        addNotification(err.message || 'Product not found', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, qty);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      addNotification('Please enter a review comment', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.addReview(productId, { rating: Number(rating), comment });
      if (res.success && res.data) {
        setProduct(res.data);
        setComment('');
        addNotification('Thank you! Your review has been added.', 'success');
      }
    } catch (err) {
      addNotification(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
        <p className="text-lg font-semibold text-slate-800">Product not found</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </button>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
        {/* Images Column */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 relative">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnail list */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === idx
                      ? 'border-indigo-600 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Brand */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                {product.brand}
              </span>
              <span className="text-xs text-slate-600">&bull;</span>
              <span className="text-xs font-medium text-slate-600">
                {product.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating || 0)
                        ? 'fill-amber-400 stroke-amber-400'
                        : 'stroke-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-800">
                {product.rating ? product.rating.toFixed(1) : '5.0'}
              </span>
              <span className="text-xs text-slate-600">
                ({product.numReviews || product.reviews?.length || 0} customer reviews)
              </span>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-extrabold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-slate-600 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.originalPrice > product.price && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed pt-2">
              {product.description}
            </p>

            {/* Stock indicator */}
            <div className="pt-2">
              {product.countInStock > 0 ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  In Stock ({product.countInStock} units ready to ship)
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  Currently Out of Stock
                </div>
              )}
            </div>
          </div>

          {/* Action Row: Quantity + Add to Cart */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            {product.countInStock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-bold disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-semibold text-slate-800">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                    disabled={qty >= product.countInStock}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  product.countInStock === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-lg active:scale-98'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart ({qty})
              </button>
            </div>

            {/* Value Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 text-center border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Free delivery over $50</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>2 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-indigo-600" />
                <span>30 Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Specs Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Technical Specifications</h2>
          {product.specs && product.specs.length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs">
              {product.specs.map((s, idx) => (
                <div key={idx} className="py-2.5 flex justify-between gap-4">
                  <span className="font-medium text-slate-600">{s.key}</span>
                  <span className="font-semibold text-slate-900 text-right">{s.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600">Standard manufacturer specifications apply.</p>
          )}
        </div>

        {/* Customer Reviews & Add Review */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Verified Customer Reviews
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Feedback from verified ShopEZ shoppers
              </p>
            </div>
            <span className="text-sm font-extrabold text-indigo-600">
              {product.reviews?.length || 0} Reviews
            </span>
          </div>

          {/* Add Review Form */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Write a Product Review
            </h3>
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Your Rating:</span>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold outline-none"
                  >
                    <option value="5">5 Stars - Outstanding</option>
                    <option value="4">4 Stars - Very Good</option>
                    <option value="3">3 Stars - Average</option>
                    <option value="2">2 Stars - Below Average</option>
                    <option value="1">1 Star - Poor</option>
                  </select>
                </div>
                <textarea
                  rows="2"
                  placeholder="Share your experience with this item..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none resize-none bg-white"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Please log in to share your customer feedback.</span>
                <button
                  onClick={onNavigateLogin}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Log In
                </button>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{rev.name}</span>
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= rev.rating
                              ? 'fill-amber-400 stroke-amber-400'
                              : 'stroke-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-600 text-center py-4">
                Be the first to leave a review for this product!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
