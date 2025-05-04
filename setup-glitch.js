const fs = require('fs-extra');
const path = require('path');

console.log('Setting up project structure for Glitch deployment...');

// Create directories if they don't exist
const dirs = ['uploads', 'models', 'routes', 'controllers', 'middleware'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating ${dir} directory...`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Copy backend files to root directory
console.log('Copying backend files to root directory...');

// Copy models
fs.copySync('backend/src/models', 'models');
console.log('Models copied successfully');

// Copy routes
fs.copySync('backend/src/routes', 'routes');
console.log('Routes copied successfully');

// Copy controllers
fs.copySync('backend/src/controllers', 'controllers');
console.log('Controllers copied successfully');

// Copy middleware
fs.copySync('backend/src/middleware', 'middleware');
console.log('Middleware copied successfully');

// Update the server.js file to use the new file paths
console.log('Updating server.js to use new file paths...');
const serverJsPath = 'server.js';
let serverJs = fs.readFileSync(serverJsPath, 'utf8');

// Update the require paths
serverJs = serverJs.replace('./backend/src/routes/api', './routes/api');

// Write the updated file
fs.writeFileSync(serverJsPath, serverJs);

console.log('Project structure set up complete. Ready for Glitch deployment!'); 