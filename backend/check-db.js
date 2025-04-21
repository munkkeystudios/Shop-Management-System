const mongoose = require('mongoose');
const Brand = require('./src/models/brand');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/shop-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
})
.then(async () => {
    console.log('Connected to MongoDB');
    
    try {
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:');
        collections.forEach(collection => {
            console.log(' - ' + collection.name);
        });
        
        // Check if brands collection exists
        const brandsCollectionExists = collections.some(collection => collection.name === 'brands');
        console.log('Brands collection exists:', brandsCollectionExists);
        
        // Try to find all brands
        const brands = await Brand.find({});
        console.log('Brands found:', brands.length);
        console.log('Brands data:', JSON.stringify(brands, null, 2));
        
        // Create a test brand if none exist
        if (brands.length === 0) {
            console.log('Creating test brand...');
            const newBrand = await Brand.create({
                name: 'Test Brand',
                description: 'This is a test brand created automatically',
                active: true
            });
            console.log('Test brand created:', newBrand);
            
            // Verify the brand was created
            const verifyBrands = await Brand.find({});
            console.log('Brands after creation:', verifyBrands.length);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the connection
        mongoose.connection.close();
        console.log('Connection closed');
    }
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});
