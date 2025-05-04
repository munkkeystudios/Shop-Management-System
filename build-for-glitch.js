const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Glitch deployment build process...');

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  console.log('Creating uploads directory...');
  fs.mkdirSync('uploads');
}

// Build the frontend React app
console.log('Building frontend...');
try {
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
  console.log('Frontend build completed successfully.');
} catch (error) {
  console.error('Error building frontend:', error);
  process.exit(1);
}

console.log('Build process completed. Your app is ready for Glitch deployment!');
console.log('');
console.log('IMPORTANT: Make sure to set up your environment variables in Glitch:');
console.log('1. MONGODB_URI - Your MongoDB connection string');
console.log('2. JWT_SECRET - A secure random string for JWT tokens');
console.log('');
console.log('Glitch will automatically restart your app after each change.'); 