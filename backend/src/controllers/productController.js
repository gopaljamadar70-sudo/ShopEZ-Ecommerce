import Product from '../models/Product.js';

// @desc    Fetch all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    const filter = {};

    // Keyword search
    if (req.query.keyword && req.query.keyword.trim() !== '') {
      const keywordRegex = { $regex: req.query.keyword.trim(), $options: 'i' };
      filter.$or = [
        { name: keywordRegex },
        { brand: keywordRegex },
        { category: keywordRegex },
        { description: keywordRegex },
      ];
    }

    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    // Brand filter
    if (req.query.brand && req.query.brand !== 'All') {
      filter.brand = req.query.brand;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Rating filter
    if (req.query.minRating) {
      filter.rating = { $gte: Number(req.query.minRating) };
    }

    // In stock filter
    if (req.query.inStock === 'true') {
      filter.countInStock = { $gt: 0 };
    }

    // Sorting
    let sort = { createdAt: -1 }; // default newest
    if (req.query.sortBy === 'price-asc') {
      sort = { price: 1 };
    } else if (req.query.sortBy === 'price-desc') {
      sort = { price: -1 };
    } else if (req.query.sortBy === 'rating') {
      sort = { rating: -1 };
    } else if (req.query.sortBy === 'name') {
      sort = { name: 1 };
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      data: products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      price,
      originalPrice,
      description,
      images,
      brand,
      category,
      countInStock,
      badge,
      featured,
      specs,
    } = req.body;

    if (!name || !price || !description || !brand || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required product fields',
      });
    }

    const product = new Product({
      name,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      description,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
      brand,
      category,
      countInStock: countInStock ? Number(countInStock) : 0,
      badge: badge || '',
      featured: Boolean(featured),
      specs: specs || [],
    });

    const createdProduct = await product.save();
    res.status(201).json({
      success: true,
      data: createdProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const fields = [
      'name',
      'price',
      'originalPrice',
      'description',
      'images',
      'brand',
      'category',
      'countInStock',
      'badge',
      'featured',
      'specs',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();
    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.deleteOne({ _id: product._id });
    res.json({
      success: true,
      message: 'Product removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating and comment',
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Product already reviewed by you',
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
export const getTopProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(6);
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct categories with counts
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
        },
      },
      {
        $sort: { category: 1 },
      },
    ]);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
