const { User } = require('../models');
const jwt = require('jsonwebtoken');

//(make this an env var?
const JWT_SECRET = "your-secret-key-for-jwt-tokens";

//login logic
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }
    
    const user = await User.findOne({ username });
    
    if (user && user.password === password) {
      //generate token
      const token = jwt.sign({ 
        userId: user._id, 
        username: user.username,
        role: user.role 
      }, JWT_SECRET, { expiresIn: '24h' });
      
      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
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
};

//register logic
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

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

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Username already exists"
      });
    }

    //create new user
    const user = await User.create({
      username,
      password,
      role: role || 'cashier'//default with least priveleges
    });

    //generate token
    const token = jwt.sign({ 
      userId: user._id,
      username: user.username,
      role: user.role
    }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message
    });
  }
};

//get all users (admin access)
exports.getAllUsers = async (req, res) => {
  try {
    //check if requesting user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    
    const users = await User.find({}).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//update user (admin can update anyone, users can only update themselves)
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, password, role, active } = req.body;
    
    //check to ensure no unauthorized changes
    if (req.user.role !== 'admin' && req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update your own profile'
      });
    }
    
    //find user
    let user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    //allow role change if admin 
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only admins can change user roles'
      });
    }
    
    //make sure username is unique
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }
    
    //applying updates
    const updateData = {};
    if (username) updateData.username = username;
    if (password) updateData.password = password;
    if (role && req.user.role === 'admin') updateData.role = role;
    if (active !== undefined && req.user.role === 'admin') updateData.active = active;
    
    user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//middleware to verify token
exports.verifyToken = (req, res, next) => {
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