const { Brand } = require('../models');
const mongoose = require('mongoose');

// Get all brands
exports.getAllBrands = async (req, res) => {
  try {
    console.log('getAllBrands called');

    // Check if Brand model is properly defined
    console.log('Brand model:', typeof Brand);
    console.log('Brand model value:', Brand);
    console.log('Brand schema:', Brand && Brand.schema ? 'Exists' : 'Not found');

    // Check if the brands collection exists in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(' - ' + collection.name);
    });

    const brandsCollectionExists = collections.some(collection => collection.name === 'brands');
    console.log('Brands collection exists (controller):', brandsCollectionExists);

    // If brands collection doesn't exist, create it
    if (!brandsCollectionExists) {
      console.log('Creating brands collection...');
      try {
        // Create a test brand to initialize the collection
        const testBrand = new Brand({
          name: 'Test Brand',
          description: 'This is a test brand created automatically',
          active: true
        });
        await testBrand.save();
        console.log('Test brand created successfully');
      } catch (err) {
        console.error('Error creating test brand:', err);
      }
    }

    // Try to find all brands
    console.log('Attempting to find brands...');
    const brands = await Brand.find({}).sort({ name: 1 });
    console.log('Brands found:', brands.length);
    console.log('Brands data:', JSON.stringify(brands));

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get brand by ID
exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new brand
exports.createBrand = async (req, res) => {
  try {
    const { name, description, active, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a brand name'
      });
    }

    // Check if brand with same name exists
    const existingBrand = await Brand.findOne({ name });

    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: 'A brand with this name already exists'
      });
    }

    const brand = await Brand.create({
      name,
      description,
      image,
      active
    });

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand
    });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update brand
exports.updateBrand = async (req, res) => {
  try {
    const { name, description, active, image } = req.body;

    let brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Check if name exists when updating name
    if (name && name !== brand.name) {
      const existingBrand = await Brand.findOne({ name });

      if (existingBrand) {
        return res.status(400).json({
          success: false,
          message: 'A brand with this name already exists'
        });
      }
    }

    // Update brand
    brand = await Brand.findByIdAndUpdate(
      req.params.id,
      {
        name: name || brand.name,
        description: description !== undefined ? description : brand.description,
        image: image !== undefined ? image : brand.image,
        active: active !== undefined ? active : brand.active
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: brand
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete brand
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    await Brand.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};