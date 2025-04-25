
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    trim: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minlength: [6, 'Password must be at least 6 characters long.']
  },
  role: {
    type: String,
    enum: {
        values: ['admin', 'manager', 'cashier'], // Updated roles
        message: '{VALUE} is not a supported role.'
    },
    default: 'cashier'
  },
  active: {
    type: Boolean,
    default: true
  },
  name: {
     type: String,
     trim: true,
  },
  phone: {
     type: String,
     trim: true,
  }
}, {
  timestamps: true
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
   try {
      return await bcrypt.compare(enteredPassword, this.password);
   } catch (error) {
     console.error("Error comparing password:", error);
     return false;
   }
};


let User;
try {
  User = mongoose.models.users || mongoose.model("users", UserSchema);
} catch (error) {
  console.error(`User Model Creation Error: ${error.message}`);
  User = mongoose.model("users", UserSchema);
}

module.exports = User;


