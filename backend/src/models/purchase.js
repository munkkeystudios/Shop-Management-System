// const mongoose = require('mongoose');

// const PurchaseItemSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   price: { 
//     type: Number,
//     required: true,
//     min: 0
//   },
// }, { _id: false }); 

// const PurchaseSchema = new mongoose.Schema({
//   supplier: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Supplier',
//     required: true
//   },
//   purchaseDate: {
//     type: Date,
//     default: Date.now,
//     required: true
//   },
//   items: [PurchaseItemSchema],
//   totalAmount: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['paid', 'pending', 'partial'],
//     default: 'pending'
//   },
//   notes: String,
//   createdBy: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'users', 
//     required: true
//   }
// }, {
//   timestamps: true 
// });


// PurchaseSchema.index({ supplier: 1 });
// PurchaseSchema.index({ purchaseDate: -1 });
// PurchaseSchema.index({ createdBy: 1 });

// let Purchase;
// try {
  
//   Purchase = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
// } catch (error) {
//   console.error(`Purchase Model Creation Error: ${error.message}`);
//   Purchase = mongoose.model('Purchase', PurchaseSchema);
// }

// module.exports = Purchase;


// Modifications to add to your existing Purchase model if needed
// You can incorporate these changes into your existing model

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
  // Added for consistency with import UI
  subtotal: {
    type: Number,
    get: function() {
      return this.price * this.quantity;
    }
  }
}, { _id: false, toJSON: { getters: true } });

const PurchaseSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  // Renamed from purchaseDate to match the import UI
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  // Optional - matches the UI but not in your current model
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
  },
  items: [PurchaseItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  // Optional fields to match the UI
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  // For consistency with your UI
  status: {
    type: String,
    enum: ['received', 'pending', 'ordered', 'cancelled'],
    default: 'pending'
  },
  // Existing fields
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

// Keep your existing indexes
PurchaseSchema.index({ supplier: 1 });
PurchaseSchema.index({ date: -1 });
PurchaseSchema.index({ createdBy: 1 });

// Optional - Add new index for warehouse if you add it
PurchaseSchema.index({ warehouse: 1 });

let Purchase;
try {
  Purchase = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
} catch (error) {
  console.error(`Purchase Model Creation Error: ${error.message}`);
  Purchase = mongoose.model('Purchase', PurchaseSchema);
}

module.exports = Purchase;