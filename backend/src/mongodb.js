const mongoose = require('mongoose');

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://khanmuhammadrayyan17:nBJPFX5JhtdlN0B6@cluster0.aowkj.mongodb.net/POS?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

// Connect before exporting
connectDB();

// Schema
const LogInSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// Model with error handling
let collection;
try {
  // Check if model already exists to prevent overwrite error
  collection = mongoose.models.users || mongoose.model("users", LogInSchema);
} catch (error) {
  console.error(`Model Creation Error: ${error.message}`);
  collection = mongoose.model("users", LogInSchema);
}

module.exports = collection;