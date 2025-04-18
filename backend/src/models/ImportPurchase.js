const mongoose = require('mongoose');

const ImportItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
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
  }
}, { _id: false });

const ImportPurchaseSchema = new mongoose.Schema({
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
  items: [ImportItemSchema],
  totalAmount: {
    type: Number,
    required: true,
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

ImportPurchaseSchema.index({ supplier: 1 });
ImportPurchaseSchema.index({ purchaseDate: -1 });
ImportPurchaseSchema.index({ createdBy: 1 });

let ImportPurchase;
try {
  ImportPurchase = mongoose.models.ImportPurchase || mongoose.model('ImportPurchase', ImportPurchaseSchema);
} catch (e) {
  ImportPurchase = mongoose.model('ImportPurchase', ImportPurchaseSchema);
}

module.exports = ImportPurchase;
