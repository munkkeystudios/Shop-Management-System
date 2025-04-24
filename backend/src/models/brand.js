const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // to add createdAt and updatedAt
});

// Add indexes to improve query performance
BrandSchema.index({ name: 'text' });

let Brand;
try {
  // Explicitly use lowercase 'brands' collection
  Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema, 'brands');
  console.log('Brand model created with collection: brands');
} catch (error) {
  console.error(`Brand Model Creation Error: ${error.message}`);
  Brand = mongoose.model('Brand', BrandSchema, 'brands');
}

module.exports = Brand;