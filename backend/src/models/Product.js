import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const specSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price must be positive'],
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      index: true,
    },
    brand: {
      type: String,
      required: [true, 'Please provide product brand'],
    },
    countInStock: {
      type: Number,
      required: [true, 'Please provide count in stock'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one product image'],
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    badge: {
      type: String,
      default: '',
    },
    specs: [specSchema],
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

// Full text index on name, description, category, brand for search
productSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
