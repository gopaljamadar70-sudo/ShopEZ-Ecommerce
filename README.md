# ShopEZ E-Commerce Application

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=gopaljamadar70-sudo/ShopEZ-Ecommerce)

ShopEZ is a modern full-stack e-commerce application built with React, Node.js, Express, and MongoDB. It features a complete shopping flow, authenticated order management, real-time discount coupon validation, and an administrative control panel.

---

## 🚀 1-Click Run on Localhost via GitHub (Instant Cloud Preview)

Click the badge above or use the link below to run the app directly in your browser:

👉 **[Launch ShopEZ on GitHub Codespaces](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=gopaljamadar70-sudo/ShopEZ-Ecommerce)**

The pre-configured [`.devcontainer`](.devcontainer/devcontainer.json) will automatically:
1. Initialize the Node container
2. Run `npm run install:all`
3. Launch `npm run dev`
4. Automatically forward and open **`http://localhost:5173`** in your browser!

---

## ⚡ Quick Start on Your Local Machine

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

*(MongoDB runs in-memory by default via `mongodb-memory-server` for zero-configuration setup, or you can configure an external MongoDB cluster in `backend/.env`)*

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Run Both Frontend and Backend
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Run Automated Tests

To run the backend integration and QA test suite:
```bash
npm test
```

---

## 🔑 Pre-Configured Test Accounts & Coupons

### Accounts:
| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@shopez.com` | `password123` | Storefront & Admin Management Console |
| **Customer** | `john@example.com` | `password123` | Storefront, Checkout & Order History |

### Promotional Coupons:
- `WELCOME10`: 10% discount on purchases over $20
- `SAVE20`: 20% discount on purchases over $100

---

## 📂 Project Architecture

```text
ShopEZ/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection (with in-memory fallback)
│   │   ├── controllers/     # Auth, Products, Orders, Coupons, Analytics
│   │   ├── middleware/      # JWT auth, Role authorization, Error handler
│   │   ├── models/          # User, Product, Order, Coupon schemas
│   │   ├── routes/          # Express API route endpoints
│   │   ├── seeder/          # Database seeding scripts & mock data
│   │   └── server.js        # Express application entry point
│   ├── tests/               # Vitest & Supertest automated test suite
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ProductCard, Footer
│   │   ├── context/         # AuthContext, CartContext, NotificationContext
│   │   ├── pages/           # Home, ProductDetail, Cart, Checkout, Success, Admin
│   │   ├── services/        # Centralized fetch API client
│   │   ├── App.jsx          # SPA view routing
│   │   └── main.jsx         # React DOM root
│   ├── index.html
│   ├── vite.config.js       # Vite build & API proxy setup
│   └── package.json
├── .devcontainer/           # GitHub Codespaces automated launch configuration
├── .gitignore
├── package.json             # Root orchestration scripts
└── README.md
```
