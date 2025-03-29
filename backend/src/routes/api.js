const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const supplierController = require('../controllers/supplierController');
const productController = require('../controllers/productController');
const userController = require('../controllers/userController');

//auth routes
router.post('/login', userController.login);
router.post('/signup', userController.register);

//user routes
router.get('/users', userController.verifyToken, userController.getAllUsers);
router.get('/users/profile', userController.verifyToken, userController.getProfile);
router.put('/users/:userId', userController.verifyToken, userController.updateUser);

//category routes
router.get('/categories', userController.verifyToken, categoryController.getAllCategories);
router.get('/categories/:id', userController.verifyToken, categoryController.getCategoryById);
router.post('/categories', userController.verifyToken, categoryController.createCategory);
router.put('/categories/:id', userController.verifyToken, categoryController.updateCategory);
router.delete('/categories/:id', userController.verifyToken, categoryController.deleteCategory);

//supplier routes
router.get('/suppliers', userController.verifyToken, supplierController.getAllSuppliers);
router.get('/suppliers/:id', userController.verifyToken, supplierController.getSupplierById);
router.post('/suppliers', userController.verifyToken, supplierController.createSupplier);
router.put('/suppliers/:id', userController.verifyToken, supplierController.updateSupplier);
router.delete('/suppliers/:id', userController.verifyToken, supplierController.deleteSupplier);

//product routes
router.get('/products', userController.verifyToken, productController.getAllProducts);
router.get('/products/search', userController.verifyToken, productController.searchProducts);
router.get('/products/low-stock', userController.verifyToken, productController.getLowStockProducts);
router.get('/products/:id', userController.verifyToken, productController.getProductById);
router.post('/products', userController.verifyToken, productController.createProduct);
router.put('/products/:id', userController.verifyToken, productController.updateProduct);
router.delete('/products/:id', userController.verifyToken, productController.deleteProduct);
router.patch('/products/:id/stock', userController.verifyToken, productController.updateStock);

module.exports = router; 