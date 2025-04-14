const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const supplierController = require('../controllers/supplierController');
const productController = require('../controllers/productController');
const userController = require('../controllers/userController');
const saleController = require('../controllers/saleController');
const importController = require('../controllers/importController');
const auth = require('../middleware/auth');


if (!productController || typeof productController.createProduct !== 'function') {
    console.error("FATAL ERROR: productController.createProduct is not available! Check controller export.");
    process.exit(1);
}


router.post('/login', userController.login);
router.post('/signup', userController.register);


router.post('/products', productController.createProduct);
console.log("INFO: Product creation route POST /api/products is temporarily bypassing auth.");


router.use(auth);


router.get('/users', userController.getAllUsers);
router.get('/users/profile', userController.getProfile);
router.put('/users/:userId', userController.updateUser);


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
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.patch('/products/:id/stock', productController.updateStock);

router.post('/products/import', importController.uploadMiddleware, importController.importProducts);


router.post('/sales', saleController.createSale);
router.get('/sales', saleController.getSales);
router.get('/sales/:id', saleController.getSaleById);
router.put('/sales/:id/payment', saleController.updatePaymentStatus);
router.get('/sales/stats', saleController.getSalesStats);

module.exports = router;
