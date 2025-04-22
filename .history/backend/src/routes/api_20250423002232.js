
const express = require('express');
const router = express.Router();

// Controller Imports
const categoryController   = require('../controllers/categoryController');
const supplierController   = require('../controllers/supplierController');
const productController    = require('../controllers/productController');
const userController       = require('../controllers/userController');
const saleController       = require('../controllers/saleController');
const importController     = require('../controllers/importController');
const purchaseController   = require('../controllers/purchaseController');
const brandController      = require('../controllers/brandController');

// Middleware Imports
const auth                       = require('../middleware/auth');
const { isAdmin, isManager, isCashier } = require('../middleware/permissions');

// --- Public Routes ---
router.post('/login', userController.login);
// router.post('/signup', userController.register); // Keep commented out

// --- Apply Auth Middleware ---
router.use(auth); // Applied to all routes below

// --- Authenticated Routes (Minimum Role: Cashier) ---

// User profile (Self)
router.get('/users/profile',              userController.getProfile);
router.put('/users/me/password',         userController.updateMyPassword);

// General Read Operations
router.get('/categories',                isCashier, categoryController.getAllCategories);
router.get('/categories/:id',            isCashier, categoryController.getCategoryById);
router.get('/suppliers',                 isCashier, supplierController.getAllSuppliers);
router.get('/suppliers/:id',             isCashier, supplierController.getSupplierById);
router.get('/products',                  isCashier, productController.getAllProducts);
router.get('/products/search',           isCashier, productController.searchProducts);
router.get('/products/low-stock',        isCashier, productController.getLowStockProducts);
router.get('/products/:id',              isCashier, productController.getProductById);
router.get('/sales/last-bill-number',    isCashier, saleController.getLastBillNumber);
router.get('/purchases',                 isCashier, purchaseController.getAllPurchases);
router.get('/purchases/:id',             isCashier, purchaseController.getPurchaseById);
router.get('/brands',                    isCashier, brandController.getAllBrands);
router.get('/brands/:id',                isCashier, brandController.getBrandById);

// Sales Operations (Cashier+)
router.post('/sales',                    isCashier, saleController.createSale);
router.put('/sales/:id/payment',         isCashier, saleController.updatePaymentStatus);
router.get('/sales/:id',                 isCashier, saleController.getSaleById);

// --- Manager Level Routes (Minimum Role: Manager) ---

// Product Management
router.post('/products',                 isManager, productController.createProduct);
router.put('/products/:id',              isManager, productController.updateProduct);
router.delete('/products/:id',           isManager, productController.deleteProduct);
router.patch('/products/:id/stock',      isManager, productController.updateStock);

// Category Management
router.post('/categories',               isManager, categoryController.createCategory);
router.put('/categories/:id',            isManager, categoryController.updateCategory);
router.delete('/categories/:id',         isManager, categoryController.deleteCategory);

// Supplier Management
router.post('/suppliers',                isManager, supplierController.createSupplier);
router.put('/suppliers/:id',             isManager, supplierController.updateSupplier);
router.delete('/suppliers/:id',          isManager, supplierController.deleteSupplier);

// Brand Management
router.post('/brands',                   isManager, brandController.createBrand);
router.put('/brands/:id',                isManager, brandController.updateBrand);
router.delete('/brands/:id',             isManager, brandController.deleteBrand);

// Purchase Management
router.post('/purchases',                isManager, purchaseController.createPurchase);
router.get('/purchases/export',          isManager, purchaseController.exportPurchases);

// Reporting & Exports
router.get('/sales',                     isManager, saleController.getSales);
router.get('/sales/stats',               isManager, saleController.getSalesStats);
router.get('/sales/export',              isManager, saleController.exportSales);

// Import Routes (Manager+)
router.post(
  '/import/products',
   isManager,
   importController.uploadMiddleware,
   importController.importProducts
);
router.post(
  '/import/sales',
   isManager,
   importController.uploadSaleMiddleware,
   importController.importSales
);
router.get(
  '/import/sales/sample',
   isManager,
   importController.downloadSampleSaleTemplate
);

// --- Admin Only Routes (Role: Admin) ---

// User Management
router.get('/users',                     isAdmin, userController.getAllUsers);
router.post('/users',                    isAdmin, userController.adminCreateUser);
router.put('/users/:userId',             isAdmin, userController.updateUser);
router.delete('/users/:userId',          isAdmin, userController.deleteUser);
router.get('/users/export',              isAdmin, userController.exportUsers);

// --- Test Route ---
router.get('/test', (req, res) => {
  res.status(200).json({ success: true, message: 'Test route works!' });
});

module.exports = router;
