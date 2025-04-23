// ===== File: D:\Shop-Management-System-main\backend\src\models\user.js =====
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // *** ADDED: Import bcrypt ***

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'], // Added validation message
    trim: true,
    unique: true,
    lowercase: true // Ensure consistent casing for lookups
  },
  password: {
    type: String,
    required: [true, 'Password is required.'], // Added validation message
    minlength: [6, 'Password must be at least 6 characters long.'] // Added validation message
  },
  role: {
    type: String,
    enum: { // Added validation message for enum
        values: ['admin', 'cashier', 'manager', 'viewer'],
        message: '{VALUE} is not a supported role.'
    },
    default: 'cashier'
  },
  active: {
    type: Boolean,
    default: true
  },
  // *** ADDED: Optional new fields based on potential frontend form ***
  name: {
     type: String,
     trim: true,
  },
  phone: {
     type: String,
     trim: true,
     // Optional: Add validation for phone format if needed
     // match: [/^\+?[0-9]{10,15}$/, 'Please fill a valid phone number']
  }
}, {
  timestamps: true
});

// *** ADDED: Password hashing before saving ***
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const saltRounds = 10; // Store salt rounds in config/env ideally
    const salt = await bcrypt.genSalt(saltRounds); // Generate salt
    this.password = await bcrypt.hash(this.password, salt); // Hash password
    next();
  } catch (error) {
    console.error('Error hashing password:', error); // Log hashing errors
    next(error); // Pass error to the next middleware
  }
});

// *** ADDED: Method to compare entered password with hashed password ***
UserSchema.methods.matchPassword = async function (enteredPassword) {
   try {
      return await bcrypt.compare(enteredPassword, this.password);
   } catch (error) {
<<<<<<< HEAD
     // Handle potential bcrypt errors if necessary, though compare usually just returns false
=======
>>>>>>> 06cec42 (Adding employee management, create and import sale)
     console.error("Error comparing password:", error);
     return false;
   }
};


let User;
try {
<<<<<<< HEAD
  // Use 'users' consistently as the model name
  User = mongoose.models.users || mongoose.model("users", UserSchema);
} catch (error) {
  console.error(`User Model Creation Error: ${error.message}`);
  User = mongoose.model("users", UserSchema); // Fallback creation
}

module.exports = User;
=======
  User = mongoose.models.users || mongoose.model("users", UserSchema);
} catch (error) {
  console.error(`User Model Creation Error: ${error.message}`);
  User = mongoose.model("users", UserSchema);
}

module.exports = User;


>>>>>>> 06cec42 (Adding employee management, create and import sale)
