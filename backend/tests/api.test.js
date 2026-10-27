import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { importData } from '../src/seeder/seeder.js';

describe('ShopEZ E-Commerce Backend Test Suite', () => {
  let userToken = '';
  let adminToken = '';
  let testProductId = '';
  let createdOrderId = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
    await importData();
  }, 30000);

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Health Check & Root Endpoints', () => {
    it('GET / should return API information', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('ShopEZ');
      expect(res.body.endpoints).toBeDefined();
    });

    it('GET /health should return 200 OK and health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.database).toBe('connected');
    });

    it('GET /api/health should return 200 OK and health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('2. Authentication & Authorization', () => {
    it('POST /api/auth/register should register a new customer', async () => {
      const uniqueEmail = `testuser_${Date.now()}@example.com`;
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test Customer',
        email: uniqueEmail,
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.email).toBe(uniqueEmail);
      userToken = res.body.data.token;
    });

    it('POST /api/auth/register should fail on duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Admin Duplicate',
        email: 'admin@shopez.com',
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('POST /api/auth/login should authenticate seeded admin user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@shopez.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('admin');
      expect(res.body.data.token).toBeDefined();
      adminToken = res.body.data.token;
    });

    it('POST /api/auth/login should reject invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@shopez.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/profile should return current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Customer');
    });

    it('GET /api/auth/profile should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/users should be forbidden for regular customer', async () => {
      const res = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('GET /api/auth/users should return users list for admin', async () => {
      const res = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('3. Products Catalog', () => {
    it('GET /api/products should return list of products', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      testProductId = res.body.data[0]._id;
    });

    it('GET /api/products/:id should return single product details', async () => {
      const res = await request(app).get(`/api/products/${testProductId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(testProductId);
    });

    it('GET /api/products/categories should return category aggregations', async () => {
      const res = await request(app).get('/api/products/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/products?keyword=headphones should filter results', async () => {
      const res = await request(app).get('/api/products?keyword=headphones');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/products should allow admin to create a product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Test Product',
          price: 29.99,
          description: 'A product created during automated QA tests',
          category: 'Electronics',
          brand: 'TestBrand',
          countInStock: 10,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Test Product');
    });
  });

  describe('4. Coupons', () => {
    it('POST /api/coupons/validate should validate existing coupon WELCOME10', async () => {
      const res = await request(app).post('/api/coupons/validate').send({
        code: 'WELCOME10',
        subtotal: 50,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.discountPercentage).toBe(10);
      expect(res.body.data.discountAmount).toBe(5);
    });

    it('POST /api/coupons/validate should reject non-existent coupon', async () => {
      const res = await request(app).post('/api/coupons/validate').send({
        code: 'INVALIDCODE999',
        subtotal: 50,
      });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. Orders & Checkout Security', () => {
    it('POST /api/orders should create an order with server-verified prices', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderItems: [
            {
              product: testProductId,
              qty: 1,
            },
          ],
          shippingAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'CA',
            postalCode: '90001',
            country: 'USA',
          },
          paymentMethod: 'Credit Card',
          couponCode: 'WELCOME10',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalPrice).toBeGreaterThan(0);
      expect(res.body.data.couponApplied.code).toBe('WELCOME10');
      createdOrderId = res.body.data._id;
    });

    it('GET /api/orders/:id should retrieve the created order', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(createdOrderId);
    });

    it('PUT /api/orders/:id/pay should mark the order as paid', async () => {
      const res = await request(app)
        .put(`/api/orders/${createdOrderId}/pay`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          id: 'TEST_PAY_TXN_001',
          status: 'COMPLETED',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isPaid).toBe(true);
    });

    it('GET /api/orders/myorders should return customer orders', async () => {
      const res = await request(app)
        .get('/api/orders/myorders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('6. Admin Dashboard Analytics', () => {
    it('GET /api/analytics/dashboard should return dashboard statistics for admin', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRevenue).toBeDefined();
      expect(res.body.data.totalOrders).toBeDefined();
      expect(res.body.data.totalProducts).toBeDefined();
    });
  });

  describe('7. Centralized Error Handling', () => {
    it('should return standardized 404 JSON for non-existent route', async () => {
      const res = await request(app).get('/api/non-existent-endpoint');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Resource Not Found');
    });
  });
});
