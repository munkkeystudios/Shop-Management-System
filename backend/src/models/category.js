const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
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
  timestamps: true //to add createdAt and updatedAt
});

let Category;
try {
  Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
} catch (error) {
  Category = mongoose.model('Category', CategorySchema);
}

module.exports = Category; 