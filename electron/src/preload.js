// Simple preload script that doesn't use external modules
const { contextBridge } = require('electron');

console.log('Preload script is running...');

// Expose a minimal API to the renderer process
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  appVersion: process.env.npm_package_version || 'unknown',
  // Add logging function
  log: (message) => {
    console.log('From renderer:', message);
  },
  // Add error reporting
  reportError: (error) => {
    console.error('Error from renderer:', error);
  }
});

console.log('Preload script has been loaded successfully');