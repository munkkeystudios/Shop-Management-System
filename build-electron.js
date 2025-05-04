const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Building Electron app...');

// Step 1: Install dependencies
console.log('Installing dependencies...');
try {
  // Make sure backend dependencies are installed
  execSync('cd backend && npm install', { stdio: 'inherit' });
  console.log('Backend dependencies installed.');
  
  // Make sure frontend dependencies are installed
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('Frontend dependencies installed.');
  
  // Make sure electron dependencies are installed
  execSync('cd electron && npm install', { stdio: 'inherit' });
  console.log('Electron dependencies installed.');
} catch (error) {
  console.error('Failed to install dependencies:', error);
  process.exit(1);
}

// Step 2: Build the React frontend
console.log('Building React frontend...');
try {
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  console.log('Frontend build completed successfully.');
} catch (error) {
  console.error('Frontend build failed:', error);
  process.exit(1);
}

// Step 3: Make sure the electron assets directory exists with icon
const assetsDir = path.join(__dirname, 'electron', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('Created assets directory');
}

// Create a simple icon if it doesn't exist
const iconPath = path.join(assetsDir, 'icon.png');
if (!fs.existsSync(iconPath)) {
  console.log('Icon not found, copying a placeholder...');
  // You can add code to copy a placeholder icon here if needed
  console.log('Please place an icon.png file in electron/assets directory');
}

// Step 4: Build the Electron app
console.log('Building Electron app...');
try {
  execSync('cd electron && npx electron-builder build --win', { stdio: 'inherit' });
  console.log('Electron build completed successfully.');
  console.log('Installer can be found in electron/dist/');
} catch (error) {
  console.error('Electron build failed:', error);
  process.exit(1);
}

console.log('Build process completed!'); 