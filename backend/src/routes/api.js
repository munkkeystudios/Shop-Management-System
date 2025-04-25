const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const supplierController = require('../controllers/supplierController');
const productController = require('../controllers/productController');
const userController = require('../controllers/userController');
const saleController = require('../controllers/saleController');
const importController = require('../controllers/importController');
const purchaseController = require('../controllers/purchaseController');
const brandController = require('../controllers/brandController');
const notificationRoutes = require('./notificationRoutes');
const auth = require('../middleware/auth');

router.post('/login', userController.login);
// router.post('/signup', userController.register);

router.post('/products', productController.createProduct);
router.use(auth);

router.get('/users', userController.getAllUsers);
router.get('/users/profile', userController.getProfile);
router.get('/users/export', userController.exportUsers);
router.put('/users/:userId', userController.updateUser);

router.post('/users', userController.adminCreateUser);
router.delete('/users/:userId', userController.deleteUser);

router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

router.get('/suppliers', supplierController.getAllSuppliers);
router.get('/suppliers/:id', supplierController.getSupplierById);
router.post('/suppliers', supplierController.createSupplier);
router.put('/suppliers/:id', supplierController.updateSupplier);
router.delete('/suppliers/:id', supplierController.deleteSupplier);

router.get('/products', productController.getAllProducts);
router.get('/products/search', productController.searchProducts);
router.get('/products/low-stock', productController.getLowStockProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.patch('/products/:id/stock', productController.updateStock);


router.post('/sales', saleController.createSale);
router.get('/sales', saleController.getSales);
router.get('/sales/last-bill-number', saleController.getLastBillNumber); // Specific route first
router.get('/sales/stats', saleController.getSalesStats); // Another specific route
router.get('/sales/export', saleController.exportSales); // Export route
router.put('/sales/:id/payment', saleController.updatePaymentStatus); // More specific than :id
router.get('/sales/:id', saleController.getSaleById); // Generic route last



router.post('/purchases', purchaseController.createPurchase);
router.get('/purchases', purchaseController.getAllPurchases);
router.get('/purchases/export', purchaseController.exportPurchases);
router.get('/purchases/:id', purchaseController.getPurchaseById);

// Test route
router.get('/test', (req, res) => {
  res.status(200).json({ success: true, message: 'Test route works!' });
});

// Brands routes
router.get('/brands', brandController.getAllBrands);
router.get('/brands/:id', brandController.getBrandById);
router.post('/brands', brandController.createBrand);
router.put('/brands/:id', brandController.updateBrand);
router.delete('/brands/:id', brandController.deleteBrand);

// Notification routes
router.use('/notifications', notificationRoutes);

module.exports = router;
