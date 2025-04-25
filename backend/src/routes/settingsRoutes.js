const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { getSettings, updateSettings, uploadLogo, changePassword } = require('../controllers/settingsController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage for logo uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/logos';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check if file is an image
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|svg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
router.get('/', getSettings);
router.put('/', protect, admin, updateSettings);
router.post('/logo', protect, admin, upload.single('logo'), uploadLogo);
router.post('/change-password', protect, changePassword);

module.exports = router; 