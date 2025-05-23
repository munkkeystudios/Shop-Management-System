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
const settingsRoutes = require('./settingsRoutes');
const notificationRoutes = require('./notificationRoutes');
const loanController = require('../controllers/loanController'); // Add loanController
const { auth } = require('../middleware/auth');

router.post('/login', userController.login);

router.post('/products', productController.createProduct);
router.use(auth);

// Settings routes
router.use('/settings', settingsRoutes);

router.get('/users', userController.getAllUsers);
router.get('/users/profile', userController.getProfile);
router.get('/users/export', userController.exportUsers);
router.put('/users/:userId', userController.updateUser);

router.post('/users', userController.adminCreateUser);
router.delete('/users/:userId', userController.deleteUser);

// User profile settings routes
router.get('/users/:id/profile', userController.getUserProfile);
router.put('/users/:id/profile', userController.updateUserProfile);
router.put('/users/:id/notifications', userController.updateNotificationPreferences);

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
router.get('/sales/recent', saleController.getRecentSales);
router.get('/sales/last-bill-number', saleController.getLastBillNumber); 
router.get('/sales/last-ten', saleController.getLastTenSales); 
router.get('/sales/stats', saleController.getSalesStats); 
router.get('/sales/export', saleController.exportSales); 
router.put('/sales/:id/payment', saleController.updatePaymentStatus); 
router.get('/sales/:id', saleController.getSaleById); 

router.post('/purchases', purchaseController.createPurchase);
router.get('/purchases', purchaseController.getAllPurchases);
router.get('/purchases/export', purchaseController.exportPurchases);
router.get('/purchases/:id', purchaseController.getPurchaseById);
router.delete('/purchases/:id', purchaseController.deletePurchase);
router.patch('/purchases/:id/status', purchaseController.updatePurchaseStatus);

// Loan routes
router.post('/loans', loanController.createLoan); 
router.get('/loans', loanController.getAllLoans); 
router.get('/loans/loan-number/:loanNumber', loanController.getLoanByLoanNumber); 
router.get('/loans/export', loanController.exportLoans); // Add this new export route
router.get('/loans/:id', loanController.getLoanById); 
router.put('/loans/:id/repayment', loanController.updateLoanRepayment); 
router.put('/loans/:loanId/add-items', loanController.addLoanItems); 
router.put('/loans/:id/pay', loanController.payLoan); 
router.post('/loans/validate-loan', loanController.validateLoan); 

// TODO:: delete this: Test route
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
