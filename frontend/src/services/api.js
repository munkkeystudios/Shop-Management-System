<<<<<<< HEAD
=======

>>>>>>> 06cec42 (Adding employee management, create and import sale)
import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
<<<<<<< HEAD
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5002/api', // Updated port to 5002
=======
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5002/api',
>>>>>>> 06cec42 (Adding employee management, create and import sale)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
<<<<<<< HEAD
=======
// and log outgoing requests for debugging
>>>>>>> 06cec42 (Adding employee management, create and import sale)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
<<<<<<< HEAD
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration or unauthorized access
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
=======
    console.log(
      `Outgoing ${config.method.toUpperCase()} request to ${config.url}`,
      config.data || config.params || ''
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration or unauthorized access
// and log incoming responses/errors
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
>>>>>>> 06cec42 (Adding employee management, create and import sale)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Token expired or invalid, or insufficient permissions
      console.warn(`Auth Error (${error.response.status}): Redirecting to login.`);
      localStorage.removeItem('token'); // Clear invalid token
      // Prevent redirect loops if already on login page
      if (window.location.pathname !== '/login') {
<<<<<<< HEAD
         window.location.href = '/login';
=======
        window.location.href = '/login';
>>>>>>> 06cec42 (Adding employee management, create and import sale)
      }
    }
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
=======
// --- API Definitions ---

>>>>>>> 06cec42 (Adding employee management, create and import sale)
// Auth API
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  // signup: (userData) => api.post('/signup', userData), // *** Removed public signup ***
  getProfile: () => api.get('/users/profile'), // Corrected path based on routes
  adminCreateUser: (userData) => api.post('/users', userData), // *** Added: Admin create user ***
};

// Users API Group *** ADDED/MODIFIED ***
export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  create: (userData) => api.post('/users', userData), // Call adminCreateUser endpoint
  delete: (id) => api.delete(`/users/${id}`), // Add delete method
<<<<<<< HEAD
  exportUsers: (format = 'csv') => api.get(`/users/export?format=${format}`, {
    responseType: 'blob', // Important for handling file download
  }),
=======
  exportUsers: (format = 'csv') =>
    api.get(`/users/export?format=${format}`, {
      responseType: 'blob', // Important for handling file download
    }),
>>>>>>> 06cec42 (Adding employee management, create and import sale)
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }), // Allow passing query params
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  search: (query) => api.get('/products/search', { params: { query } }),
  getLowStock: () => api.get('/products/low-stock'),
  updateStock: (id, stockData) => api.patch(`/products/${id}/stock`, stockData),
};

// Categories API *** ADDED ***
export const categoriesAPI = {
<<<<<<< HEAD
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (categoryData) => api.post('/categories', categoryData),
    update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    delete: (id) => api.delete(`/categories/${id}`),
=======
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
>>>>>>> 06cec42 (Adding employee management, create and import sale)
};

// Suppliers API *** ADDED ***
export const suppliersAPI = {
<<<<<<< HEAD
    getAll: () => api.get('/suppliers'),
    getById: (id) => api.get(`/suppliers/${id}`),
    create: (supplierData) => api.post('/suppliers', supplierData),
    update: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
    delete: (id) => api.delete(`/suppliers/${id}`),
};


// Inventory API (Note: May overlap with product stock updates, clarify usage)
export const inventoryAPI = {
  // Assuming '/inventory' might provide a summary or specific inventory view
  // If it's just product stock, use productsAPI.updateStock
  // getAll: () => api.get('/inventory'),
  // updateStock: (id, quantity) => api.put(`/inventory/${id}`, { quantity }), // Likely handled by product patch

  // i think this is just more just product stock, i dont think we are doing another inventory schema - Walid
=======
  getAll: () => api.get('/suppliers'),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (supplierData) => api.post('/suppliers', supplierData),
  update: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Inventory API (Note: May overlap with product stock updates, clarify usage)
// export const inventoryAPI = {
//   // Assuming '/inventory' might provide a summary or specific inventory view
//   // If it's just product stock, use productsAPI.updateStock
//   // getAll: () => api.get('/inventory'),
//   // updateStock: (id, quantity) => api.put(`/inventory/${id}`, { quantity }), // Likely handled by product patch
//
//   // i think this is just more just product stock, i dont think we are doing another inventory schema - Walid
// };

// Brands API (Assuming you might need this later)
export const brandsAPI = {
  getAll: () => api.get('/brands'),
  getById: (id) => api.get(`/brands/${id}`),
  create: (brandData) => api.post('/brands', brandData),
  update: (id, brandData) => api.put(`/brands/${id}`, brandData),
  delete: (id) => api.delete(`/brands/${id}`),
>>>>>>> 06cec42 (Adding employee management, create and import sale)
};

// Sales API
export const salesAPI = {
  getAll: (params = {}) => api.get('/sales', { params }), // Allow passing query params
  create: (saleData) => api.post('/sales', saleData),
  getById: (id) => api.get(`/sales/${id}`),
  updatePayment: (id, paymentData) => api.put(`/sales/${id}/payment`, paymentData),
  getStats: (params = {}) => api.get('/sales/stats', { params }), // Allow date range params
  // *** ADDED BACK from user's version, required by pos.js ***
  getLastBillNumber: () => api.get('/sales/last-bill-number'),
  // Export sales to CSV or PDF
<<<<<<< HEAD
  exportSales: (format = 'csv', params = {}) => api.get(`/sales/export`, {
    params: { format, ...params },
    responseType: 'blob', // Important for handling file download
  }),
=======
  exportSales: (format = 'csv', params = {}) =>
    api.get(`/sales/export`, {
      params: { format, ...params },
      responseType: 'blob', // Important for handling file download
    }),
  // <-- NEW IMPORT FUNCTION -->
  importSales: (formData) =>
    api.post('/import/sales', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
    }),
>>>>>>> 06cec42 (Adding employee management, create and import sale)
};

// Purchases API *** ADDED ***
export const purchasesAPI = {
<<<<<<< HEAD
    getAll: (params = {}) => api.get('/purchases', { params }),
    create: (purchaseData) => api.post('/purchases', purchaseData),
    getById: (id) => api.get(`/purchases/${id}`),
    exportPurchases: (format = 'csv') => api.get(`/purchases/export?format=${format}`, {
        responseType: 'blob', // Important for file download
    }),
     // Add update/delete if needed
    // update: (id, purchaseData) => api.put(`/purchases/${id}`, purchaseData),
    // delete: (id) => api.delete(`/purchases/${id}`),
};


=======
  getAll: (params = {}) => api.get('/purchases', { params }),
  create: (purchaseData) => api.post('/purchases', purchaseData),
  getById: (id) => api.get(`/purchases/${id}`),
  exportPurchases: (format = 'csv') =>
    api.get(`/purchases/export?format=${format}`, {
      responseType: 'blob', // Important for file download
    }),
  // Add update/delete if needed
  // update: (id, purchaseData) => api.put(`/purchases/${id}`, purchaseData),
  // delete: (id) => api.delete(`/purchases/${id}`),
};

>>>>>>> 06cec42 (Adding employee management, create and import sale)
// Dashboard API
export const dashboardAPI = {
  // getSummary: () => api.get('/dashboard/summary'),
};

<<<<<<< HEAD
export default api; // Export the configured instance
=======
export default api;

>>>>>>> 06cec42 (Adding employee management, create and import sale)
