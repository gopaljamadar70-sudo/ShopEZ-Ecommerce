import Coupon from '../models/Coupon.js';

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide coupon code' });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    const now = new Date();
    if (coupon.expiresAt < now) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (coupon.timesUsed >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
    }

    const amount = Number(subtotal) || 0;
    if (amount < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of $${coupon.minPurchaseAmount} required for this coupon`,
      });
    }

    const discountValue = Number(((amount * coupon.discountPercentage) / 100).toFixed(2));

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        discountAmount: discountValue,
        minPurchaseAmount: coupon.minPurchaseAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res, next) => {
  try {
    const { code, discountPercentage, minPurchaseAmount, expiresAt, usageLimit } = req.body;

    if (!code || !discountPercentage || !expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coupon code, discount percentage, and expiry date',
      });
    }

    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountPercentage: Number(discountPercentage),
      minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : 0,
      expiresAt: new Date(expiresAt),
      usageLimit: usageLimit ? Number(usageLimit) : 100,
    });

    res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    await Coupon.deleteOne({ _id: coupon._id });
    res.json({ success: true, message: 'Coupon removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle coupon active status
// @route   PATCH /api/coupons/:id/toggle
// @access  Private/Admin
export const toggleCouponActive = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};
