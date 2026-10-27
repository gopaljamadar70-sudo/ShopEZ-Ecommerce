# ShopEZ E-Commerce Application

ShopEZ is a modern full-stack e-commerce application built with React, Node.js, Express, and MongoDB. It features a complete shopping flow, authenticated order management, real-time discount coupon validation, and an administrative control panel.

---

## ⚡ Quick Start (Localhost Execution)

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

*(MongoDB is embedded in-memory by default via `mongodb-memory-server` for zero-configuration setup, or you can configure an external MongoDB cluster in `backend/.env`)*

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

## ☁️ Run Online via GitHub Codespaces (1-Click Cloud Localhost)

You can launch this entire full-stack project in an interactive cloud environment directly from your GitHub browser:
1. Click **Code** (green button) on GitHub.
2. Select the **Codespaces** tab.
3. Click **Create codespace on main**.
4. The devcontainer will automatically install dependencies, start both backend and frontend servers, and open port `5173` in a new browser tab.

---

## 🧪 Run Automated Tests

To run the backend integration test suite:
```bash
npm test
```

---

## 🔑 Pre-Configured Test Accounts & Coupons

### Accounts:
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@shopez.com` | `password123` |
| **Customer** | `john@example.com` | `password123` |

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
