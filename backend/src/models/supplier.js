const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  contactPerson: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

let Supplier;
try {
  Supplier = mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);
} catch (error) {
  Supplier = mongoose.model('Supplier', SupplierSchema);
}

module.exports = Supplier; 