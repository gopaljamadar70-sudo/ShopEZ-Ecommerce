import express from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
  toggleCouponActive,
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate', validateCoupon);

router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.route('/:id')
  .delete(protect, admin, deleteCoupon);

router.patch('/:id/toggle', protect, admin, toggleCouponActive);

export default router;
