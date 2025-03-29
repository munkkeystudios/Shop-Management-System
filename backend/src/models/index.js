const mongoose = require('mongoose');
const Product = require('./product');
const Category = require('./category');
const Supplier = require('./supplier');
const User = require('./user');
const Sale = require('./sale');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://khanmuhammadrayyan17:nBJPFX5JhtdlN0B6@cluster0.aowkj.mongodb.net/POS?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

// Connect to MongoDB
connectDB();

module.exports = {
  Product,
  Category,
  Supplier,
  User,
  Sale
}; 