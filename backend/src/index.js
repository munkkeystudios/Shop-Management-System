const express = require("express");
const cors = require("cors");
const app = express();
const apiRoutes = require('./routes/api');

// Connect to MongoDB
require('./models');

// JWT Secret
const JWT_SECRET = "your-secret-key-for-jwt-tokens";//store in env variable for deployment

app.use(express.json());
app.use(cors()); //enable CORS for all routes
app.use(express.urlencoded({ extended: false }));

// API routes
app.use('/api', apiRoutes);

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server error",
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
