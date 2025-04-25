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

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Check for MongoDB URI
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.warn('Warning: MONGODB_URI environment variable not set. Using default connection string.');
}

// Connect to MongoDB
mongoose.connect(mongoURI || 'mongodb://localhost:27017/shop-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
})
    .then(() => {
        console.log('Connected to MongoDB');

        // List all collections in the database
        mongoose.connection.db.listCollections().toArray(function(err, collections) {
            if (err) {
                console.error('Error listing collections:', err);
                return;
            }

            console.log('Collections in database:');
            collections.forEach(collection => {
                console.log(' - ' + collection.name);
            });

            // Check if brands collection exists
            const brandsCollectionExists = collections.some(collection => collection.name === 'brands');
            console.log('Brands collection exists:', brandsCollectionExists);

            // If brands collection doesn't exist, create a test brand
            if (!brandsCollectionExists) {
                console.log('Creating test brand...');
                const Brand = require('./models/brand');
                Brand.create({
                    name: 'Test Brand',
                    description: 'This is a test brand created automatically',
                    active: true
                })
                .then(brand => console.log('Test brand created:', brand))
                .catch(err => console.error('Error creating test brand:', err));
            }
        });
    })
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