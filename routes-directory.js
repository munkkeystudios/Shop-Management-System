const fs = require('fs-extra');
const path = require('path');

// Create routes directory
if (!fs.existsSync('routes')) {
    fs.mkdirSync('routes', { recursive: true });
}

// Create a simple api.js file for testing
const simpleApiJs = `
const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.status(200).json({ success: true, message: 'API is working!' });
});

module.exports = router;
`;

fs.writeFileSync('routes/api.js', simpleApiJs);
console.log('Created simplified routes/api.js for testing');

// If backend/src/routes exists, copy its contents
if (fs.existsSync('backend/src/routes')) {
    console.log('Copying backend routes to root routes directory...');
    try {
        fs.copySync('backend/src/routes', 'routes');
        console.log('Routes copied successfully');
    } catch (error) {
        console.error('Error copying routes:', error);
    }
}

console.log('Routes directory setup complete.'); 