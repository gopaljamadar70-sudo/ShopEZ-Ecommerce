import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import { users, products, coupons } from './seedData.js';

dotenv.config();

export const importData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await User.deleteMany({});

    // Create users individually to trigger bcrypt hashing pre-save hooks
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }

    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const customerUser = createdUsers.find((u) => u.role === 'customer');

    // Attach sample review user id
    const sampleProducts = products.map((product) => {
      if (product.reviews && product.reviews.length > 0 && customerUser) {
        return {
          ...product,
          reviews: product.reviews.map((r) => ({
            ...r,
            user: customerUser._id,
          })),
        };
      }
      return product;
    });

    await Product.insertMany(sampleProducts);
    await Coupon.insertMany(coupons);

    // Create a sample delivered order for analytics demonstration
    if (customerUser && sampleProducts.length > 0) {
      const firstProduct = await Product.findOne({});
      if (firstProduct) {
        await Order.create({
          user: customerUser._id,
          orderItems: [
            {
              product: firstProduct._id,
              name: firstProduct.name,
              qty: 1,
              image: firstProduct.images[0],
              price: firstProduct.price,
            },
          ],
          shippingAddress: customerUser.address,
          paymentMethod: 'Credit Card',
          itemsPrice: firstProduct.price,
          shippingPrice: 0,
          taxPrice: Number((firstProduct.price * 0.08).toFixed(2)),
          totalPrice: Number((firstProduct.price * 1.08).toFixed(2)),
          isPaid: true,
          paidAt: new Date(),
          status: 'Delivered',
          deliveredAt: new Date(),
        });
      }
    }

    console.log('[Seeder] Data imported successfully!');
  } catch (error) {
    console.error(`[Seeder] Error importing data: ${error.message}`);
    throw error;
  }
};

export const destroyData = async () => {
  try {
    await Order.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await User.deleteMany({});
    console.log('[Seeder] Data destroyed successfully!');
  } catch (error) {
    console.error(`[Seeder] Error destroying data: ${error.message}`);
    throw error;
  }
};

// If run directly from terminal: `node src/seeder/seeder.js`
if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
  (async () => {
    try {
      await connectDB();
      if (process.argv[2] === '-d') {
        await destroyData();
      } else {
        await importData();
      }
      await disconnectDB();
      process.exit(0);
    } catch (error) {
      console.error('[Seeder] Execution failed:', error);
      process.exit(1);
    }
  })();
}
