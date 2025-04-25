const mongoose = require('mongoose');

// Loan Item Schema
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

// Loan Schema
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
    email: {
      type: String,
      required: true,
      match: /.+\@.+\..+/ // Basic email validation
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
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
    enum: ['cash', 'card', 'loan'], 
    default: 'loan'
  },
  notes: String, // Optional notes about the loan
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  }
}, {
  timestamps: true // Automatically track createdAt and updatedAt
});

// Indexing for faster queries
LoanSchema.index({ loanNumber: 1 });
LoanSchema.index({ createdAt: -1 });
LoanSchema.index({ 'customer.name': 'text' });

let Loan;
try {
  Loan = mongoose.models.Loan || mongoose.model('Loan', LoanSchema);
} catch (error) {
  console.error(`Model Creation Error: ${error.message}`);
  Loan = mongoose.model('Loan', LoanSchema);
}

module.exports = Loan;