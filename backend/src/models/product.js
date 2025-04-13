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
  discountRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 100;
      },
      message: 'Discount rate must be between 0 and 100'
    }
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
    type: [String], //array of img urls or paths
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

ProductSchema.virtual('discountedPrice').get(function() {
  if (!this.discountRate || this.discountRate === 0) {
    return this.price;
  }
  const discountAmount = (this.price * this.discountRate) / 100;
  return parseFloat((this.price - discountAmount).toFixed(2));
});

ProductSchema.index({ name: 'text', barcode: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ supplier: 1 });
ProductSchema.index({ status: 1 });

//checks if product is low on stock
ProductSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minStockLevel;
});

ProductSchema.pre('save', function(next) {
  next();
});

let Product;
try {
  Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
} catch (error) {
  Product = mongoose.model('Product', ProductSchema);
}

module.exports = Product; 