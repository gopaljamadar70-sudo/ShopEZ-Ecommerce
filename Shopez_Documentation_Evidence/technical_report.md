# ShopEZ E-Commerce Application — Verified Technical Documentation Report

**Document Title:** Technical Architecture, Implementation Audit, and Evidence Report  
**Target Project:** ShopEZ — Full-Stack E-Commerce Web Application  
**Auditor:** Antigravity Autonomous Coding Agent  
**Repository Source:** [https://github.com/gopaljamadar70-sudo/ShopEZ-Ecommerce](https://github.com/gopaljamadar70-sudo/ShopEZ-Ecommerce)  
**Local Codebase Location:** `C:\ShopEZ`  
**Report Date:** October 28, 2026  

---

## 1. Project Title & Summary

- **Project Title:** **ShopEZ — Full-Stack E-Commerce Web Application**
- **Executive Summary:**  
  ShopEZ is a modern, responsive, and component-driven electronic commerce platform engineered on the MERN technology stack (MongoDB, Express.js, React 18, and Node.js). The application delivers a unified digital marketplace where consumers can browse diverse product categories, perform real-time keyword search, manage shopping carts, apply multi-tier promotional discounts, and complete a simulated checkout lifecycle with parcel tracking. In parallel, platform administrators are equipped with a secured management console offering real-time sales KPI analytics, catalog inventory CRUD operations, and order status fulfillment dispatching.

---

## 2. Problem Statement & Objectives

### 2.1. Problem Statement
Traditional retail channels and legacy e-commerce portals often suffer from rigid page-reloading architectures, fragmented inventory controls, and cumbersome checkout workflows. Modern consumers expect instantaneous single-page navigation, mobile-first responsive interactions, transparent pricing calculations, and real-time delivery visibility. Small-to-medium retail operations require accessible, lightweight, and scalable platforms that simplify catalog administration without requiring complex cloud infrastructure during initial evaluation.

### 2.2. Objectives Supported by Implementation
1. **Responsive Single-Page Application (SPA):** Provide zero-reload browsing, dynamic client-side routing, and real-time category filtering.
2. **Stateless Secure Authentication:** Implement industry-standard JSON Web Token (JWT) authentication paired with salted bcrypt password hashing for data protection.
3. **Dynamic Pricing & Coupon Engine:** Accurately compute item subtotals, free-shipping thresholds, tax rates, and percentage-based promotional voucher deductions.
4. **End-to-End Transaction Ledger:** Persist customer purchases to a document database, assign tracking identifiers, and provide chronological order tracking.
5. **Administrative Governance & Analytics:** Supply store managers with high-level KPI cards (gross revenue, order counts, customer volume) and granular inventory management controls.
6. **Zero-Config Developer Portability:** Integrate an automated embedded in-memory MongoDB fallback to allow instant evaluation on any developer workstation without external database dependencies.

---

## 3. Technologies & Tools Actually Used

### Frontend Tier
- **Library / Core:** React 18.3.1 (Component architecture, Hooks: `useState`, `useEffect`, `useContext`)
- **Build Tool / Bundler:** Vite 6.0.7 / 6.4.4 (Native ES modules, Hot Module Replacement)
- **Styling Framework:** Tailwind CSS 3.4.17 with PostCSS and Autoprefixer
- **Vector Icons:** `lucide-react` 0.469.0
- **State Management:** React Context API (`AuthContext`, `CartContext`, `NotificationContext`)
- **Routing Engine:** Client-Side Hash Router (`#/home`, `#/cart`, `#/checkout`, `#/admin`, etc.)

### Backend API Tier
- **Runtime Environment:** Node.js v24.22.0 (LTS, win32 x64)
- **Web Application Framework:** Express.js 4.21.2
- **Database Engine & ODM:** MongoDB with Mongoose 8.9.5 Object-Document Mapper
- **Embedded Database Engine:** `mongodb-memory-server` 10.1.4 (Zero-config local fallback)
- **Security Middlewares:** `helmet` 8.0.0, `cors` 2.8.5, `bcryptjs` 2.4.3, `jsonwebtoken` 9.0.2
- **HTTP Logger & Config:** `morgan` 1.10.0, `dotenv` 16.4.7

### Testing & Developer Tooling
- **Test Framework:** Vitest 3.2.7 (24 automated backend integration tests)
- **Browser Automation:** Headless Chromium with Chrome DevTools Protocol (CDP) WebSocket client
- **Version Control:** MinGit 2.47.1

---

## 4. Software & Hardware Requirements

### 4.1. Verified Minimum Execution Requirements
- **Operating System:** Windows 10/11 (x64), macOS 12+, or modern Linux (Ubuntu 20.04+)
- **Runtime:** Node.js >= 18.0.0 (Node 24 LTS verified)
- **NPM Package Manager:** NPM >= 9.0.0
- **Memory (RAM):** 2 GB available RAM (sufficient to run Node backend, Vite dev server, and in-memory MongoDB)
- **Storage:** 500 MB free disk space (including dependencies and database cache)
- **Browser:** Any modern evergreen browser (Chrome, Edge, Firefox, Safari)

### 4.2. Recommended Production Specifications
- **Runtime:** Node.js LTS 20.x or 22.x in Linux Docker container
- **Database:** Dedicated MongoDB Atlas Cluster (Tier M10+) or self-hosted MongoDB 7.0+
- **Reverse Proxy / CDN:** Nginx or AWS CloudFront handling SSL/TLS termination
- **Memory (RAM):** 4 GB RAM minimum for high-concurrency environments

---

## 5. System Architecture & Data Flow

ShopEZ is architected according to a **Decoupled 3-Tier Client-Server Architecture**:

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|  React 18 SPA (Vite Bundler, Tailwind CSS, Lucide Icons, Hash Router)   |
|  Context State: AuthContext (JWT) | CartContext | NotificationContext   |
+------------------------------------+------------------------------------+
                                     |
                         HTTP / REST API (JSON)
                                     |
+------------------------------------+------------------------------------+
|                           APPLICATION TIER                              |
|  Node.js & Express REST API Server (Port 5000)                          |
|  Security Middleware: Helmet, CORS, JWT Auth, Admin RBAC, Error Handler |
|  Controllers: Auth, Products, Orders, Coupons, Analytics                |
+------------------------------------+------------------------------------+
                                     |
                          Mongoose 8.9.5 ODM
                                     |
+------------------------------------+------------------------------------+
|                              DATA TIER                                  |
|  MongoDB Database / MongoDB Memory Server Fallback                      |
|  Collections: Users, Products, Orders, Coupons                          |
+-------------------------------------------------------------------------+
```

### Data Flow Scenario: Customer Checkout
1. The authenticated customer adds catalog items to `CartContext` (persisted to `localStorage`).
2. Optional coupon code (`WELCOME10`) is validated via `POST /api/coupons/validate`.
3. Customer navigates to `#/checkout` and submits delivery destination and payment details.
4. Client issues `POST /api/orders` accompanied by the customer's Bearer JWT.
5. Express `authMiddleware` decodes and verifies the JWT, attaching the user identity to `req.user`.
6. `orderController` confirms item pricing and stock levels against the `Product` collection.
7. A new document is written to the `Order` collection with status `Pending` and total price.
8. Payment confirmation updates `isPaid: true` and shifts fulfillment status to `Processing`.
9. The server returns HTTP 201 Created with the saved order document; the frontend transitions to `#/order-success`.

---

## 6. Existing Database Structure & Relationships

The database utilizes Mongoose schemas mapping to MongoDB collections with relational referencing:

### 6.1. Entity Relationship Overview
- **User (1) ────< Orders (Many):** Each `Order` document references a parent `User` via `user: { type: ObjectId, ref: 'User' }`.
- **Product (1) ────< Order Items (Many):** Each sub-document in `orderItems` references a `Product` via `product: { type: ObjectId, ref: 'Product' }`.
- **Coupons (Independent):** Validated dynamically against total order value without altering schema integrity.

### 6.2. Document Schema Summary

#### `User` Collection
- `_id`: ObjectId (Primary key)
- `name`: String (Required)
- `email`: String (Required, Unique, Lowercase, Indexed)
- `password`: String (Required, Salted bcrypt hash, 10 rounds)
- `role`: String (Enum: `customer`, `admin`; Default: `customer`)
- `avatar`: String
- `createdAt`: Date (Timestamp)

#### `Product` Collection
- `_id`: ObjectId (Primary key)
- `name`: String (Required, Trimmed)
- `description`: String (Required)
- `price`: Number (Required, Min: 0)
- `category`: String (Required, e.g. "Electronics", "Fashion", "Audio")
- `brand`: String (Default: "ShopEZ")
- `images`: Array of Strings (Image URLs)
- `countInStock`: Number (Required, Min: 0)
- `rating`: Number (Default: 4.5)
- `numReviews`: Number (Default: 0)
- `isFeatured`: Boolean (Default: false)

#### `Order` Collection
- `_id`: ObjectId (Primary key)
- `user`: ObjectId (Ref: `User`, Required)
- `orderItems`: Array of Subdocuments (`product`, `name`, `qty`, `price`, `image`)
- `shippingAddress`: Object (`street`, `city`, `state`, `postalCode`, `country`)
- `paymentMethod`: String (e.g. "Credit Card", "PayPal")
- `paymentResult`: Object (`id`, `status`, `update_time`, `email_address`)
- `itemsPrice`: Number
- `taxPrice`: Number
- `shippingPrice`: Number
- `discountAmount`: Number
- `totalPrice`: Number
- `isPaid`: Boolean (Default: false)
- `paidAt`: Date
- `status`: String (Enum: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`)
- `trackingNumber`: String
- `deliveredAt`: Date

#### `Coupon` Collection
- `_id`: ObjectId (Primary key)
- `code`: String (Required, Unique, Uppercase)
- `discountPercentage`: Number (Required, 1-100)
- `minPurchaseAmount`: Number (Default: 0)
- `expiresAt`: Date (Required)
- `usageLimit`: Number (Default: 1000)
- `timesUsed`: Number (Default: 0)
- `isActive`: Boolean (Default: true)

---

## 7. Implemented Features Inventory

### Fully Implemented & Verified
- **Storefront & Catalog Browsing:** 8 responsive products with dynamic category pills ("All", "Electronics", "Fashion", "Audio", "Wearables", "Gaming").
- **Real-Time Catalog Search:** Immediate substring searching on product titles and descriptions.
- **Granular Product Inspection:** Multi-image carousel, stock badge, pricing, ratings, and Add to Cart action.
- **Interactive Shopping Cart:** Live quantity steppers, item deletion, subtotal calculations, free shipping progress indicator.
- **Promotional Coupon Discounting:** Validation engine for codes (`WELCOME10`, `SAVE20`) computing deductions.
- **User Authentication & Session Handling:** JWT issuance, bcrypt password hashing, persistent sessions via browser storage.
- **Multi-Step Checkout:** Address validation, payment method selection, order placement.
- **Order Tracking & History:** Customer history ledger displaying fulfillment progress and tracking codes.
- **User Profile Management:** Edit personal details, phone number, and default delivery address.
- **Administrator Management Console:** Executive KPI revenue dashboard, product CRUD modal, and order dispatch workflow.
- **Zero-Config Database Fallback:** Automatic boot of `mongodb-memory-server` when no external URI is provided.

### Partially Implemented / Simulated
- **Payment Processing:** Uses simulated transaction receipts (`TXN_<timestamp>_CONFIRMED`) rather than live payment gateways (Stripe/Razorpay).
- **Email Notifications:** Order confirmations and password resets are logged to console rather than dispatched via SMTP.

---

## 8. User Roles & Responsibilities

| Role | Access Privileges | Restrictions |
| :--- | :--- | :--- |
| **Guest / Anonymous** | Browse catalog, search items, view product details, add to cart, register, login. | Cannot checkout or access admin dashboard. |
| **Customer (`customer`)** | All Guest privileges, place orders, apply coupons, view order history, edit personal profile. | Cannot access `/api/admin` or administrative management tools. |
| **Administrator (`admin`)** | All Customer privileges, access Admin Management Console, view revenue KPIs, create/edit/delete products, update order status and tracking. | N/A (Full operational authority). |

---

## 9. User Workflow

```
[Storefront Landing] ──> [Filter / Search Catalog] ──> [Product Details]
                                                               │
                                                       [Add to Cart]
                                                               │
                                                       [Shopping Cart]
                                                               │ (Apply Coupon)
                                                      [Checkout View]
                                                               │
                                               [Login / Authenticate]
                                                               │
                                                [Submit Order & Pay]
                                                               │
                                             [Order Confirmation Receipt]
                                                               │
                                                [Order History Ledger]
```

---

## 10. Architectural Pattern: Decoupled RESTful Client-Server

The application does **not** employ a monolithic Model-View-Controller (MVC) server-side template engine (such as Pug or EJS). Instead, it adopts a **modern decoupled Single-Page Application (SPA) architecture**:
- **View Layer:** Fully offloaded to the client browser via React 18 and Tailwind CSS.
- **Controller Layer:** Express controllers (`authController`, `productController`, `orderController`, etc.) processing incoming REST requests and emitting standardized JSON payloads.
- **Model Layer:** Mongoose schemas defining MongoDB document structure, business constraints, and lifecycle hooks.
- **Communication:** Asynchronous HTTP/HTTPS REST API calls carrying JSON request/response bodies and Bearer JWT authentication headers.

---

## 11. Verified Folder Structure

```
C:\ShopEZ\
├── package.json
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── tests/
│   │   └── api.test.js
│   └── src/
│       ├── server.js
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── productController.js
│       │   ├── orderController.js
│       │   ├── couponController.js
│       │   └── analyticsController.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── authMiddleware.js
│       │   ├── admin.js
│       │   └── errorMiddleware.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Product.js
│       │   ├── Order.js
│       │   └── Coupon.js
│       └── seeder/
│           ├── products.js
│           ├── users.js
│           └── seeder.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── CartContext.jsx
│       │   └── NotificationContext.jsx
│       ├── services/
│       │   └── api.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   └── ProductCard.jsx
│       └── pages/
│           ├── HomePage.jsx
│           ├── ProductDetailPage.jsx
│           ├── CartPage.jsx
│           ├── CheckoutPage.jsx
│           ├── OrderSuccessPage.jsx
│           ├── UserProfilePage.jsx
│           ├── AdminDashboardPage.jsx
│           ├── LoginPage.jsx
│           └── RegisterPage.jsx
└── Shopez_Documentation_Evidence/
    ├── technical_report.md
    ├── source_code_structure.txt
    ├── screenshot_index.md
    ├── test_results.md
    ├── run_instructions.txt
    └── screenshots/
        ├── 01_Homepage.png
        ├── 02_Product_Listing.png
        ├── 03_Search_and_Filtering.png
        ├── 04_Product_Details.png
        ├── 05_Registration_Page.png
        ├── 06_Login_Page.png
        ├── 07_Shopping_Cart.png
        ├── 08_Checkout_and_Address.png
        ├── 09_Order_Confirmation.png
        ├── 10_Order_History.png
        ├── 11_User_Profile.png
        ├── 12_Admin_Dashboard.png
        ├── 13_Admin_Product_Management.png
        ├── 14_Admin_Order_Management.png
        └── 15_Responsive_Mobile.png
```

---

## 12. Installation & Setup Instructions

```bash
# 1. Clone repository
git clone https://github.com/gopaljamadar70-sudo/ShopEZ-Ecommerce.git
cd ShopEZ

# 2. Install backend dependencies
cd backend
npm install
cd ..

# 3. Install frontend dependencies
cd frontend
npm install
cd ..

# 4. Start backend server (Port 5000)
cd backend
npm run dev

# 5. Start frontend server (Port 5173) in a second terminal
cd frontend
npm run dev
```

---

## 13. Frontend Implementation Details

The frontend is built with React 18, utilizing functional components and React Hooks:
- **`App.jsx`:** Orchestrates top-level application layout, hash routing event bus, and global notification toasts.
- **`AuthContext.jsx`:** Provides centralized authentication state, automatically restoring tokens from `localStorage` on initial mount.
- **`CartContext.jsx`:** Manages the active shopping cart ledger, quantity calculations, and coupon application logic.
- **`api.js`:** Abstracted HTTP client using native `fetch`, automatically injecting `Authorization: Bearer <token>` into outbound requests.
- **Responsive Layout:** Engineered using Tailwind CSS utility classes (`hidden md:flex`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) to ensure fluid presentation across desktop, tablet, and mobile displays.

---

## 14. Backend Implementation Details

The backend is built with Express.js 4 on Node.js 24:
- **`server.js`:** Root entry point mounting security middlewares (Helmet for security headers, CORS for origin filtering), request logging (Morgan), and centralized error handling (404 and 500 handlers).
- **`authMiddleware.js`:** Intercepts protected routes, verifies JWT signatures via `jsonwebtoken`, and extracts user entities from MongoDB.
- **`admin.js`:** Route guard validating that `req.user.role === 'admin'`.
- **Controllers:** Modular functions encapsulating database operations and responding with standardized JSON envelopes (`{ success: true, data: ... }` or `{ success: false, message: ... }`).

---

## 15. Database Implementation Details

- **Mongoose ODM:** Provides strict schema validation, type casting, default values, and lifecycle middleware (e.g. pre-save password encryption).
- **Embedded In-Memory Fallback:** The database connector (`db.js`) detects whether an external `MONGO_URI` is provided; if absent, it spins up an isolated `mongodb-memory-server` daemon, enabling zero-configuration development and automated testing.
- **Automatic Seeding:** On startup, if the database collections are empty, the application seeds 8 catalog products and 2 demo accounts automatically.

---

## 16. Testing Performed & Verification Results

- **Automated Vitest Test Suite:** 24 unit and integration tests executed in `backend/tests/api.test.js`.
- **Result:** **24 passed of 24 (100% pass rate)** in 2.13 seconds.
- **Live HTTP Verification:** Endpoints `/api/health`, `/api/products`, `/api/auth/login`, `/api/coupons/validate`, and `/api/orders/myorders` tested with HTTP 200 OK responses.
- **Frontend Production Build:** Verified via `npm run build` with zero errors.

---

## 17. Screenshot Index Summary

All 15 screenshots are stored in `Shopez_Documentation_Evidence/screenshots/`:
1. `01_Homepage.png` — Storefront landing page and promo banner
2. `02_Product_Listing.png` — Category filtered product catalog ("Electronics")
3. `03_Search_and_Filtering.png` — Live real-time search filtering ("Wireless")
4. `04_Product_Details.png` — Detailed product specifications and stock
5. `05_Registration_Page.png` — Customer registration form
6. `06_Login_Page.png` — User login form with demo credentials
7. `07_Shopping_Cart.png` — Shopping cart ledger with coupon code applied
8. `08_Checkout_and_Address.png` — Checkout shipping address and payment form
9. `09_Order_Confirmation.png` — Order receipt view with generated Order ID
10. `10_Order_History.png` — Customer order history ledger with tracking codes
11. `11_User_Profile.png` — Customer profile management view
12. `12_Admin_Dashboard.png` — Administrator dashboard with revenue KPI cards
13. `13_Admin_Product_Management.png` — Admin catalog inventory table and Add Product modal
14. `14_Admin_Order_Management.png` — Admin order fulfillment management hub
15. `15_Responsive_Mobile.png` — Responsive mobile viewport layout (390×844)

---

## 18. Limitations & Unverified Features

1. **Third-Party Payment Gateways:** Live transaction processing through Stripe or PayPal webhooks is simulated via mock transaction payloads.
2. **Transactional Email Server:** Order dispatch confirmation emails and password reset links are logged to server console rather than sent via SMTP.
3. **Product Image Storage:** Catalog items reference external CDN/Unsplash URLs rather than local multipart file upload handling (such as Multer/AWS S3).
