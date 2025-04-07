const mongoose = require('mongoose');
const Product = require('./product');
const Category = require('./category');
const Supplier = require('./supplier');
const User = require('./user');
const Sale = require('./sale');

// This file just exports all models
// MongoDB connection is now handled in server.js

module.exports = {
  Product,
  Category,
  Supplier,
  User,
  Sale
}; 