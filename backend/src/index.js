const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const hbs = require("hbs");
const collection = require("./mongodb");

const jwt = require("jsonwebtoken");

const JWT_SECRET = "your-secret-key-for-jwt-tokens";//store in env variable for deployment

const templatePath = path.join(__dirname, "../templates");

app.use(express.json());
app.use(cors()); //enable CORS for all routes
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.urlencoded({ extended: false }));

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server error",
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/api/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long."
      });
    }

    const existingUser = await collection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Username already exists."
      });
    }

    const data = { username, password };
    await collection.insertMany([data]);

    // Generate JWT token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }
    
    const user = await collection.findOne({ username });

    if (user && user.password === password) {
      // Generate JWT token
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
      
      res.status(200).json({
        success: true,
        message: "Login successful",
        token
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message
    });
  }
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ 
      success: false, 
      message: "Invalid token" 
    });
  }
};

// Protected route example
app.get("/api/dashboard", verifyToken, (req, res) => {
  res.json({ 
    success: true, 
    message: "Protected data", 
    user: req.user.username 
  });
});

// Keep the original routes for backward compatibility
app.all("/login", async (req, res) => {
  if (req.method === "GET") {
    res.render("login");
  } else if (req.method === "POST") {
    try {
      const check = await collection.findOne({ username: req.body.username });

      if (check && check.password === req.body.password) {
        res.render("home");
      } else {
        res.send("Incorrect Password or Username");
      }
    } catch (error) {
      console.error("Traditional login error:", error);
      res.send("Error during login!");
    }
  }
});

app.get("/logout", (req, res) => {
  res.redirect("/login");
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
