import axios from 'axios';

import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5002/api', // Updated port to 5002
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `Outgoing ${config.method.toUpperCase()} request to ${config.url}`,
      config.data || config.params || ''
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration or unauthorized access
api.interceptors.response.use(
  (response) => {
    console.log(
      `Incoming ${response.status} response from ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    console.error(
      `Error response from ${error.config?.url}:`,
      error.response?.status,
      error.response?.data || error.message
    );
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn(`Auth Error (${error.response.status}): Redirecting to login.`);
      localStorage.removeItem('token'); // Clear invalid token
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  // signup: (userData) => api.post('/signup', userData), // *** Removed public signup ***
  getProfile: () => api.get('/users/profile'), // Corrected path based on routes
  adminCreateUser: (userData) => api.post('/users', userData), // *** Added: Admin create user ***
};

// Users API 
export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  create: (userData) => api.post('/users', userData),
  delete: (id) => api.delete(`/users/${id}`), 
  exportUsers: (format = 'csv') =>
    api.get(`/users/export?format=${format}`, {
      responseType: 'blob', 
    }),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  search: (query) => api.get('/products/search', { params: { query } }),
  getLowStock: () => api.get('/products/low-stock'),
  updateStock: (id, stockData) => api.patch(`/products/${id}/stock`, stockData),
};

// Categories API 
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Suppliers API 
export const suppliersAPI = {
  getAll: () => api.get('/suppliers'),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (supplierData) => api.post('/suppliers', supplierData),
  update: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Loans API
export const loansAPI = {
  getAll: () => api.get('/loans'),
  getById: (id) => api.get(`/loans/${id}`),
  getByLoanNumber: (loanNumber) => api.get(`/loans/loan-number/${loanNumber}`),
  create: (loanData) => api.post('/loans', loanData),
  updateRepayment: (id, repaymentData) => api.put(`/loans/${id}/repayment`, repaymentData),
  delete: (id) => api.delete(`/loans/${id}`),
  validateLoan: (loanNumber) => api.post('/loans/validate-loan', { loanNumber }),
};

// Brands API 
export const brandsAPI = {
  getAll: () => api.get('/brands'),
  getById: (id) => api.get(`/brands/${id}`),
  create: (brandData) => api.post('/brands', brandData),
  update: (id, brandData) => api.put(`/brands/${id}`, brandData),
  delete: (id) => api.delete(`/brands/${id}`),
};

// Sales API
export const salesAPI = {
  getAll: (params = {}) => api.get('/sales', { params }), 
  create: (saleData) => api.post('/sales', saleData),
  getById: (id) => api.get(`/sales/${id}`),
  updatePayment: (id, paymentData) => api.put(`/sales/${id}/payment`, paymentData),
  getStats: (params = {}) => api.get('/sales/stats', { params }),
  getLastBillNumber: () => api.get('/sales/last-bill-number'),
  getLastTenSales: () => api.get('/sales/last-ten'),
  // Export sales to CSV or PDF
  exportSales: (format = 'csv', params = {}) =>
    api.get(`/sales/export`, {
      params: { format, ...params },
      responseType: 'blob',
    }),
  // Import sales from a file
  importSales: (formData) =>
    api.post('/import/sales', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    }),
};

// Purchases API 
export const purchasesAPI = {
  getAll: (params = {}) => api.get('/purchases', { params }),
  create: (purchaseData) => api.post('/purchases', purchaseData),
  getById: (id) => api.get(`/purchases/${id}`),
  exportPurchases: (format = 'csv') =>
    api.get(`/purchases/export?format=${format}`, {
      responseType: 'blob',
    }),
  // Add update/delete if needed
  // update: (id, purchaseData) => api.put(`/purchases/${id}`, purchaseData),
  // delete: (id) => api.delete(`/purchases/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  // getSummary: () => api.get('/dashboard/summary'),
};

// Settings API
export const settingsAPI = {
  getAll: () => api.get('/settings'),
  update: (settingsData) => api.put('/settings', settingsData),
  uploadLogo: (formData) => api.post('/settings/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  changePassword: (passwordData) => api.post('/settings/change-password', passwordData),
  
  // Methods for our specific settings pages that map to the backend endpoints
  getDisplaySettings: () => api.get('/settings'), 
  updateDisplaySettings: (displaySettings) => api.put('/settings', displaySettings),
  getGeneralSettings: () => api.get('/settings'), 
  updateGeneralSettings: (generalSettings) => api.put('/settings', generalSettings)
};

// User Profile API - Adding methods for user profile settings
export const userAPI = {
  getUserProfile: (userId) => api.get(`/users/${userId}/profile`),
  updateUserProfile: (userId, profileData) => api.put(`/users/${userId}/profile`, profileData),
  updateNotificationPreferences: (userId, preferences) => api.put(`/users/${userId}/notifications`, preferences)
};

export default api; // Export the configured instance

