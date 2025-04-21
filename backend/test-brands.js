const mongoose = require('mongoose');

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
        
        // Try to access the brands collection directly
        if (brandsCollectionExists) {
            const brandsCollection = mongoose.connection.db.collection('brands');
            const brands = await brandsCollection.find({}).toArray();
            console.log('Brands found:', brands.length);
            console.log('Brands data:', JSON.stringify(brands, null, 2));
        }
        
        // Create a test brand
        console.log('Creating test brand...');
        const BrandSchema = new mongoose.Schema({
            name: String,
            description: String,
            active: Boolean
        });
        const Brand = mongoose.model('Brand', BrandSchema, 'brands');
        
        const testBrand = new Brand({
            name: 'Test Brand ' + Date.now(),
            description: 'This is a test brand created automatically',
            active: true
        });
        
        await testBrand.save();
        console.log('Test brand created successfully');
        
        // Verify the brand was created
        const brands = await Brand.find({});
        console.log('Brands after creation:', brands.length);
        console.log('Brands data:', JSON.stringify(brands, null, 2));
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
