const mongoose = require('mongoose');
const User = require('./src/models/user'); // Adjust the path to your User model

const createAdmin = async () => {
  try {
    // Connect to the database
    await mongoose.connect('mongodb://localhost:27017/shop-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if an admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.username);
      return;
    }

    // Create a new admin user
    const adminUser = new User({
      username: 'adminManager', 
      password: 'admin123456', // Plaintext password
      role: 'admin',
      active: true,
      name: 'Admin User6',
      phone: '1234567890',
    });

    await adminUser.save(); // Password will be hashed automatically
    console.log('Admin user created successfully:', adminUser.username);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();

