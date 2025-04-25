
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // *** ADDED: Import bcrypt ***

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

    // *** MODIFIED: Use password comparison method ***
    if (user && (await user.matchPassword(password))) {
      // *** Check if user is active ***
      if (!user.active) {
         return res.status(403).json({
            success: false,
            message: "Account is inactive. Please contact an administrator."
         });
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.warn('Warning: JWT_SECRET environment variable not set. Using insecure default value.');
      }

      //generate token
      const token = jwt.sign({
        userId: user._id,
        username: user.username,
        role: user.role
      }, jwtSecret || 'your-secret-key-for-jwt-tokens', { expiresIn: '24h' });

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

// *** REMOVED/COMMENTED OUT: Public registration logic ***
/*
exports.register = async (req, res) => {
  // ... (original registration code removed as per requirement) ...
};
*/

// *** ADDED: Admin creates user ***
exports.adminCreateUser = async (req, res) => {
    try {
        // 1. Check if requesting user is admin
        if (!req.user || req.user.role !== 'admin') { // Added check for req.user existence
            return res.status(403).json({
                success: false,
                message: 'Access denied: Only admins can create users.'
            });
        }

        // 2. Get user data from request body
        const { username, password, role, active, name, phone } = req.body;

        // 3. Validate required fields
        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Username, password, and role are required."
            });
        }

        // 4. Validate password length (optional here, model enforces too)
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        // 5. Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Username already exists."
            });
        }

        // 6. Create the new user (password will be hashed by pre-save hook)
        const user = await User.create({
            username,
            password,
            role,
            active: active !== undefined ? active : true, // Default to active if not provided
            name, // Include new fields
            phone
        });

        // 7. Return success response (don't return password)
         const userResponse = user.toObject();
         delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "User created successfully by admin.",
            data: userResponse
        });

    } catch (error) {
        console.error("Admin create user error:", error);
         // Handle potential validation errors from Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({
            success: false,
            message: "Error creating user",
            error: error.message
        });
    }
};


<<<<<<< HEAD
//get all users (admin access)
exports.getAllUsers = async (req, res) => {
  try {
    //check if requesting user is admin
    if (!req.user || req.user.role !== 'admin') { // Added check for req.user existence
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }

    const users = await User.find({}).select('-password'); // Ensure password exclusion
=======
exports.getAllUsers = async (req, res) => {
  try {

    const users = await User.find({}).select('-password');
>>>>>>> 06cec42 (Adding employee management, create and import sale)

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
<<<<<<< HEAD
      message: 'Server Error fetching users', // More specific message
=======
      message: 'Server Error fetching users',
>>>>>>> 06cec42 (Adding employee management, create and import sale)
      error: error.message
    });
  }
};

<<<<<<< HEAD
// Get current user's profile
=======
>>>>>>> 06cec42 (Adding employee management, create and import sale)
exports.getProfile = async (req, res) => {
  try {
     if (!req.user || !req.user._id) {
         return res.status(401).json({ success: false, message: 'Authentication required.' });
     }
<<<<<<< HEAD
    const user = await User.findById(req.user._id).select('-password'); // Ensure password exclusion
=======
    const user = await User.findById(req.user._id).select('-password');
>>>>>>> 06cec42 (Adding employee management, create and import sale)

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
<<<<<<< HEAD
      message: 'Server Error fetching profile', // More specific message
=======
      message: 'Server Error fetching profile',
>>>>>>> 06cec42 (Adding employee management, create and import sale)
      error: error.message
    });
  }
};

<<<<<<< HEAD

//update user (admin can update anyone, users can only update themselves)
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // *** MODIFIED: Include new fields ***
    const { username, password, role, active, name, phone } = req.body;

    if (!req.user || !req.user._id) {
       return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    //check to ensure no unauthorized changes
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update your own profile or require admin privileges.'
      });
    }

    //find user
=======
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, password, role, active, name, phone } = req.body;

>>>>>>> 06cec42 (Adding employee management, create and import sale)
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

<<<<<<< HEAD
    //allow role change only if admin
    if (role && role !== user.role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only admins can change user roles'
      });
    }
     // Allow active status change only if admin and status is different
    if (active !== undefined && active !== user.active && req.user.role !== 'admin') {
         return res.status(403).json({
            success: false,
            message: 'Access denied: Only admins can change user active status'
         });
    }


    //make sure username is unique if changed
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId) { // Ensure it's not the same user
=======
    if (role && role !== user.role) {
        if (!['manager', 'cashier'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role specified. Can only assign 'manager' or 'cashier'."
            });
        }
        user.role = role;
    }

     if (active !== undefined && active !== user.active) {
         user.active = active;
    }


    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId) {
>>>>>>> 06cec42 (Adding employee management, create and import sale)
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
<<<<<<< HEAD
      user.username = username; // Update username
    }

    // *** ADDED: Update optional fields ***
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    // Update role if admin and provided and different
    if (role && role !== user.role && req.user.role === 'admin') {
        user.role = role;
    }

    // Update active status if admin and provided and different
    if (active !== undefined && active !== user.active && req.user.role === 'admin') {
        user.active = active;
    }

    // *** MODIFIED: Update password only if provided (hashing handled by pre-save hook) ***
=======
      user.username = username;
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;


>>>>>>> 06cec42 (Adding employee management, create and import sale)
    if (password) {
      if (password.length < 6) {
         return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
      }
<<<<<<< HEAD
      user.password = password; // Set the new password, hook will hash
    }

    // Save the updated user (pre-save hook handles hashing if password changed)
    const updatedUser = await user.save();

    // Return updated user data (excluding password)
    const userResponse = updatedUser.toObject(); // Convert to plain object to delete password
=======
      user.password = password;
    }

    const updatedUser = await user.save();

    const userResponse = updatedUser.toObject();
>>>>>>> 06cec42 (Adding employee management, create and import sale)
    delete userResponse.password;


    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
<<<<<<< HEAD
    // Handle potential validation errors from Mongoose
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: error.message });
    }
     // Handle potential duplicate key errors (e.g., username)
=======
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: error.message });
    }
>>>>>>> 06cec42 (Adding employee management, create and import sale)
     if (error.code === 11000) {
         return res.status(400).json({ success: false, message: 'Username already exists.' });
     }
    res.status(500).json({
      success: false,
<<<<<<< HEAD
      message: 'Server Error updating user', // More specific
=======
      message: 'Server Error updating user',
>>>>>>> 06cec42 (Adding employee management, create and import sale)
      error: error.message
    });
  }
};

<<<<<<< HEAD
// Delete user (admin only)
=======

exports.updateMyPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
             return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ success: false, message: 'Incorrect current password.' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error updating own password:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error updating password',
            error: error.message
        });
    }
};


>>>>>>> 06cec42 (Adding employee management, create and import sale)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

<<<<<<< HEAD
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only admins can delete users'
      });
    }
=======
>>>>>>> 06cec42 (Adding employee management, create and import sale)

    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
<<<<<<< HEAD
=======
     if (user.role === 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Cannot delete an admin account.'
        });
    }

>>>>>>> 06cec42 (Adding employee management, create and import sale)

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when deleting user',
      error: error.message
    });
  }
};

<<<<<<< HEAD
// *** ADDED: Export users function ***
exports.exportUsers = async (req, res) => {
  try {
    // Ensure requesting user is admin
    if (!req.user || req.user.role !== 'admin') { // Added check for req.user
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required for export'
      });
    }

    const { format = 'csv' } = req.query; // Default to CSV

    // Fetch users, explicitly excluding password
    const users = await User.find({}).select('-password').lean();

    if (format.toLowerCase() === 'csv') {
      // --- CSV Export Logic ---
=======
exports.exportUsers = async (req, res) => {
  try {

    const { format = 'csv' } = req.query;

    const users = await User.find({}).select('-password').lean();

    if (format.toLowerCase() === 'csv') {
>>>>>>> 06cec42 (Adding employee management, create and import sale)
      if (users.length === 0) {
        return res.status(200).send('No user data to export.');
      }

<<<<<<< HEAD
      const { Parser } = require('json2csv'); // npm install json2csv

      // Define fields to include in the CSV
      const fields = ['_id', 'username', 'role', 'name', 'phone', 'active', 'createdAt', 'updatedAt']; // Added name, phone
=======
      const { Parser } = require('json2csv');

      const fields = ['_id', 'username', 'role', 'name', 'phone', 'active', 'createdAt', 'updatedAt'];
>>>>>>> 06cec42 (Adding employee management, create and import sale)
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(users);

      res.header('Content-Type', 'text/csv');
      res.attachment('users.csv');
      res.status(200).send(csv);

    } else if (format.toLowerCase() === 'pdf') {
<<<<<<< HEAD
      // --- PDF Export Logic ---
      const PDFDocument = require('pdfkit'); // npm install pdfkit
=======
      const PDFDocument = require('pdfkit');
>>>>>>> 06cec42 (Adding employee management, create and import sale)
      const doc = new PDFDocument({ margin: 50, layout: 'landscape' });

      res.header('Content-Type', 'application/pdf');
      res.attachment('users.pdf');
      doc.pipe(res);

      doc.fontSize(18).text('User Report', { align: 'center' }).moveDown();

       if (users.length === 0) {
         doc.fontSize(12).text('No user data to export.');
         doc.end();
         return;
      }

      const tableTop = doc.y;
      const headers = ['ID', 'Username', 'Name', 'Phone', 'Role', 'Active', 'Created At'];
<<<<<<< HEAD
      const colWidths = [120, 100, 120, 100, 80, 50, 90]; // Adjust widths
      let x = doc.page.margins.left;

      // Draw headers
=======
      const colWidths = [120, 100, 120, 100, 80, 50, 90];
      let x = doc.page.margins.left;

>>>>>>> 06cec42 (Adding employee management, create and import sale)
      headers.forEach((header, i) => {
        doc.fontSize(9).text(header, x, tableTop, { width: colWidths[i], align: 'left', underline: true });
        x += colWidths[i];
      });

      let y = tableTop + 20;
      users.forEach(user => {
        x = doc.page.margins.left;
        const row = [
          user._id.toString(),
          user.username,
<<<<<<< HEAD
          user.name || '', // Handle optional fields
          user.phone || '', // Handle optional fields
=======
          user.name || '',
          user.phone || '',
>>>>>>> 06cec42 (Adding employee management, create and import sale)
          user.role,
          user.active ? 'Yes' : 'No',
          user.createdAt.toDateString()
        ];

<<<<<<< HEAD
        // Draw row
=======
>>>>>>> 06cec42 (Adding employee management, create and import sale)
        row.forEach((cell, i) => {
          doc.fontSize(8).text(cell, x, y, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });

        y += 20;
<<<<<<< HEAD
        if (y > doc.page.height - doc.page.margins.bottom - 20) { // Add new page if needed
          doc.addPage({layout: 'landscape'});
          y = doc.page.margins.top; // Reset Y position for new page
           // Redraw headers on new page
=======
        if (y > doc.page.height - doc.page.margins.bottom - 20) {
          doc.addPage({layout: 'landscape'});
          y = doc.page.margins.top;
>>>>>>> 06cec42 (Adding employee management, create and import sale)
           x = doc.page.margins.left;
           headers.forEach((header, i) => {
             doc.fontSize(9).text(header, x, y, { width: colWidths[i], align: 'left', underline: true });
             x += colWidths[i];
           });
<<<<<<< HEAD
           y += 20; // Space after header
=======
           y += 20;
>>>>>>> 06cec42 (Adding employee management, create and import sale)
        }
      });

      doc.end();

    } else {
      res.status(400).json({ success: false, message: "Invalid export format specified. Use 'csv' or 'pdf'." });
    }

  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error exporting users',
      error: error.message
    });
  }
};
<<<<<<< HEAD
=======

>>>>>>> 06cec42 (Adding employee management, create and import sale)
