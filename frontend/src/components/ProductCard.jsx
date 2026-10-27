import React from 'react';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export const ProductCard = ({ product, onSelectProduct }) => {
  const { addToCart, cartItems } = useCart();
  const inCartItem = cartItems.find((i) => i.product === product._id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div
      onClick={() => onSelectProduct(product._id)}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.badge && (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-500 text-white tracking-wide uppercase shadow-sm">
            {product.badge}
          </span>
        )}
        {product.countInStock <= 5 && product.countInStock > 0 && (
          <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800">
            Only {product.countInStock} left
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.countInStock === 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span className="font-semibold text-indigo-600 uppercase tracking-wider text-[11px]">
              {product.brand}
            </span>
            <span>{product.category}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-700">
              {product.rating ? product.rating.toFixed(1) : 'New'}
            </span>
            <span className="text-xs text-slate-600">
              ({product.numReviews || 0})
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-600 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              Free delivery over $50
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              product.countInStock === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : inCartItem
                ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-md active:scale-95'
            }`}
            title={inCartItem ? `In Cart (${inCartItem.qty})` : 'Add to Cart'}
          >
            {inCartItem ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
