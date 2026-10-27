import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

// @desc    Create new order with server-side price validation & stock reduction
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items specified' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Incomplete shipping address' });
    }

    // Server-side price calculation and stock verification (Tamper-proof security)
    const verifiedOrderItems = [];
    let calculatedItemsPrice = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name || item.product}`,
        });
      }

      if (product.countInStock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.countInStock}, requested: ${item.qty}`,
        });
      }

      const itemTotal = Number((product.price * item.qty).toFixed(2));
      calculatedItemsPrice += itemTotal;

      verifiedOrderItems.push({
        product: product._id,
        name: product.name,
        qty: item.qty,
        image: product.images[0] || '',
        price: product.price, // Uses real verified database price
      });
    }

    calculatedItemsPrice = Number(calculatedItemsPrice.toFixed(2));

    // Handle coupon verification if provided
    let discountAmount = 0;
    let couponApplied = null;

    if (couponCode && couponCode.trim() !== '') {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
      });

      if (coupon) {
        const now = new Date();
        if (coupon.expiresAt > now && coupon.timesUsed < coupon.usageLimit) {
          if (calculatedItemsPrice >= coupon.minPurchaseAmount) {
            discountAmount = Number(
              ((calculatedItemsPrice * coupon.discountPercentage) / 100).toFixed(2)
            );
            couponApplied = {
              code: coupon.code,
              discountPercentage: coupon.discountPercentage,
            };
            // Increment coupon usage
            coupon.timesUsed += 1;
            await coupon.save();
          }
        }
      }
    }

    const discountedSubtotal = Math.max(0, calculatedItemsPrice - discountAmount);
    // Free shipping on subtotal > $50
    const shippingPrice = discountedSubtotal > 50 || discountedSubtotal === 0 ? 0 : 10;
    // 8% tax
    const taxPrice = Number((0.08 * discountedSubtotal).toFixed(2));
    const totalPrice = Number((discountedSubtotal + shippingPrice + taxPrice).toFixed(2));

    const order = new Order({
      user: req.user._id,
      orderItems: verifiedOrderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Credit Card',
      itemsPrice: calculatedItemsPrice,
      shippingPrice,
      taxPrice,
      discountAmount,
      couponApplied,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Decrement stock for ordered products
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.qty },
      });
    }

    res.status(201).json({
      success: true,
      data: createdOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Access control: only owner or admin can view order
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to paid (payment simulation/mock webhook)
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Access control: only owner or admin can pay for order
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order',
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id || `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      status: req.body.status || 'COMPLETED',
      update_time: req.body.update_time || new Date().toISOString(),
      email_address: req.body.email_address || req.user.email,
    };

    const updatedOrder = await order.save();
    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Shipped, Delivered, etc.)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) {
      order.status = status;
      if (status === 'Delivered') {
        order.deliveredAt = Date.now();
      }
    }
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    const updatedOrder = await order.save();
    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;
    const filter = {};

    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }

    const count = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'id name email')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      data: orders,
      page,
      pages: Math.ceil(count / pageSize),
      totalOrders: count,
    });
  } catch (error) {
    next(error);
  }
};
