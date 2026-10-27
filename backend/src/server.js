import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, disconnectDB } from './config/db.js';
import Product from './models/Product.js';
import { importData } from './seeder/seeder.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();

// Security and utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local development
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoints
const getHealthStatus = () => ({
  status: 'ok',
  service: 'ShopEZ E-Commerce API',
  uptime: `${Math.floor(process.uptime())}s`,
  timestamp: new Date().toISOString(),
  database:
    mongoose.connection.readyState === 1
      ? 'connected'
      : mongoose.connection.readyState === 2
      ? 'connecting'
      : 'disconnected',
});

app.get('/health', (req, res) => {
  res.status(200).json(getHealthStatus());
});

app.get('/api/health', (req, res) => {
  res.status(200).json(getHealthStatus());
});

app.get('/', (req, res) => {
  res.json({
    message: 'ShopEZ E-Commerce REST API is active',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      coupons: '/api/coupons',
      analytics: '/api/analytics',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/analytics', analyticsRoutes);

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server = null;

// Start server function
export const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database has no products
    try {
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        console.log('[ShopEZ Server] Database is empty. Seeding initial data...');
        await importData();
      }
    } catch (seedErr) {
      console.warn('[ShopEZ Server] Seed check warning:', seedErr.message);
    }

    if (!server) {
      server = app.listen(PORT, () => {
        console.log(
          `[ShopEZ Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
        );
      });
    }

    return server;
  } catch (error) {
    console.error(`[ShopEZ Server] Failed to start: ${error.message}`);
    process.exit(1);
  }
};

export const stopServer = async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
    console.log('[ShopEZ Server] HTTP server closed.');
  }
  await disconnectDB();
};

// Graceful shutdown
const handleShutdown = async (signal) => {
  console.log(`\n[ShopEZ Server] Received ${signal}. Shutting down gracefully...`);
  await stopServer();
  process.exit(0);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// If executed directly via `node src/server.js`, auto-start the server
const __filename = fileURLToPath(import.meta.url);
const isDirectlyExecuted =
  process.argv[1] &&
  (path.resolve(process.argv[1]) === path.resolve(__filename) ||
    process.argv[1].endsWith('server.js'));

if (isDirectlyExecuted && process.env.NODE_ENV !== 'test') {
  startServer();
}

export { server };
export default app;
