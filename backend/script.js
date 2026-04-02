require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const User = require('./src/models/user'); // Adjust the path to your User model

const createAdmin = async () => {
  try {
    // Connect to the database using .env or default
    const mongoURI = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB at:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if adminManager user already exists
    const existingAdminManager = await User.findOne({ username: 'adminManager' });
    if (existingAdminManager) {
      console.log('Admin Manager user already exists:', existingAdminManager.username);
    } else {
      // Create a new admin manager user
      const adminUser = new User({
        username: 'adminManager', 
        password: 'admin123456', // Plaintext password
        role: 'admin',
        active: true,
        name: 'Admin User6',
        phone: '1234567890',
      });

      await adminUser.save(); // Password will be hashed automatically
      console.log('Admin Manager user created successfully:', adminUser.username);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();

