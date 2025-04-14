const mongoose = require('mongoose');

const PurchaseItemSchema = new mongoose.Schema({
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
}, { _id: false }); 

const PurchaseSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  items: [PurchaseItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial'],
    default: 'pending'
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


PurchaseSchema.index({ supplier: 1 });
PurchaseSchema.index({ purchaseDate: -1 });
PurchaseSchema.index({ createdBy: 1 });

let Purchase;
try {
  
  Purchase = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
} catch (error) {
  console.error(`Purchase Model Creation Error: ${error.message}`);
  Purchase = mongoose.model('Purchase', PurchaseSchema);
}

module.exports = Purchase;
