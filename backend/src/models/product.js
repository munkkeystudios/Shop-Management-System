const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  barcode: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  lastStocked: {
    type: Date,
    default: Date.now
  },
  images: {
    type: [String], // Array of image URLs/paths
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'discontinued', 'out_of_stock'],
    default: 'active'
  },
  costPrice: {
    type: Number,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 5,
    min: 0
  }
}, {
  timestamps: true //to automatically add createdat and updatedat
});

// Create indexes for faster queries
ProductSchema.index({ name: 'text', barcode: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ supplier: 1 });
ProductSchema.index({ status: 1 });

//checks if product is low on stock
ProductSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minStockLevel;
});

// Pre-save hook for additional validations or transformations undertand this
ProductSchema.pre('save', function(next) {
  // You can add custom logic here
  // For example, if price is updated, log the change, etc.
  next();
});

let Product;
try {
  Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
} catch (error) {
  Product = mongoose.model('Product', ProductSchema);
}

module.exports = Product; 