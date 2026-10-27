const API_BASE = '/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('shopez_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const api = {
  // Auth
  login: (credentials) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => apiFetch('/auth/profile'),
  updateProfile: (profileData) =>
    apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  getUsers: () => apiFetch('/auth/users'),

  // Products
  getProducts: (params = '') => apiFetch(`/products${params ? `?${params}` : ''}`),
  getProductById: (id) => apiFetch(`/products/${id}`),
  getCategories: () => apiFetch('/products/categories'),
  getTopProducts: () => apiFetch('/products/top'),
  createProduct: (data) =>
    apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) =>
    apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
  addReview: (productId, review) =>
    apiFetch(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    }),

  // Orders
  createOrder: (orderData) =>
    apiFetch('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrderById: (id) => apiFetch(`/orders/${id}`),
  getMyOrders: () => apiFetch('/orders/myorders'),
  getAllOrders: () => apiFetch('/orders'),
  payOrder: (id, paymentResult) =>
    apiFetch(`/orders/${id}/pay`, {
      method: 'PUT',
      body: JSON.stringify(paymentResult),
    }),
  updateOrderStatus: (id, statusData) =>
    apiFetch(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    }),

  // Coupons
  validateCoupon: (code, subtotal) =>
    apiFetch('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),
  getCoupons: () => apiFetch('/coupons'),
  createCoupon: (coupon) =>
    apiFetch('/coupons', { method: 'POST', body: JSON.stringify(coupon) }),
  deleteCoupon: (id) => apiFetch(`/coupons/${id}`, { method: 'DELETE' }),
  toggleCoupon: (id) => apiFetch(`/coupons/${id}/toggle`, { method: 'PATCH' }),

  // Analytics
  getAnalytics: () => apiFetch('/analytics/dashboard'),

  // Health
  checkHealth: () => apiFetch('/health'),
};
