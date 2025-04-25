const mongoose = require('mongoose');

const LoanItemSchema = new mongoose.Schema({
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
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const LoanSchema = new mongoose.Schema({
  loanNumber: {
    type: Number,
    required: true,
    unique: true
  },
  customer: {
    name: {
      type: String,
      required: true
    },
    phone: String,
    email: String
  },
  items: [LoanItemSchema], // Items associated with the loan
  loanAmount: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingBalance: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card'],
    default: 'cash'
  },
  notes: String, // Optional notes about the loan
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  }
}, {
  timestamps: true // Automatically track createdAt and updatedAt
});

// Indexing for faster queries
LoanSchema.index({ loanNumber: 1 });
LoanSchema.index({ createdAt: -1 });
LoanSchema.index({ 'customer.name': 'text', 'customer.phone': 'text' });

module.exports = mongoose.model('Loan', LoanSchema);