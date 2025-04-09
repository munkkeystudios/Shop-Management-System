const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'cashier', 'manager'],
    default: 'cashier'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

let User;
try {
  User = mongoose.models.users || mongoose.model("users", UserSchema);
} catch (error) {
  console.error(`Model Creation Error: ${error.message}`);
  User = mongoose.model("users", UserSchema);
}

module.exports = User; 