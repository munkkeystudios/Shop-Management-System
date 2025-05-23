const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  productDiscountRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  effectivePrice: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const SaleSchema = new mongoose.Schema({
  billNumber: {
    type: Number,
    required: true,
    unique: true
  },
  customer: {
    name: {
      type: String,
      default: 'Walk-in Customer'
    },
    phone: String,
    email: String
  },
  items: [SaleItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile_payment', 'credit', 'loan'], // Merged both changes
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial','unpaid'],
    default: 'paid'
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  change: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  }
}, {
  timestamps: true
});

// Indexing to speed up queries
SaleSchema.index({ billNumber: 1 });
SaleSchema.index({ createdAt: -1 });
SaleSchema.index({ createdBy: 1 });
SaleSchema.index({ 'customer.name': 'text', 'customer.phone': 'text' });

let Sale;
try {
  Sale = mongoose.models.Sale || mongoose.model('Sale', SaleSchema);
} catch (error) {
  console.error(`Model Creation Error: ${error.message}`);
  Sale = mongoose.model('Sale', SaleSchema);
}

module.exports = Sale;