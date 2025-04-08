require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Check for MongoDB URI
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.warn('Warning: MONGODB_URI environment variable not set. Using default connection string.');
}

// Connect to MongoDB
mongoose.connect(mongoURI || 'mongodb://localhost:27017/shop-management')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 