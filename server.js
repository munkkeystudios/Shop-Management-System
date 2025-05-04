require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
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
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api', apiRoutes);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'frontend/build')));

// All remaining requests return the React app, so it can handle routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 