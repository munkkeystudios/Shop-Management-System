const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;
let serverProcess;

// Log app paths for debugging
console.log('App path:', app.getAppPath());
console.log('User data path:', app.getPath('userData'));
console.log('Executable path:', app.getPath('exe'));

function getResourcePath(resourcePath) {
  // In development, resources are at their original location
  // In production, they are in the extraResources folder
  return isDev 
    ? path.resolve(__dirname, '../../', resourcePath) 
    : path.join(process.resourcesPath, resourcePath);
}

// Path to backend server file
const serverPath = getResourcePath('backend/src/server.js');

function startBackendServer() {
  console.log('Starting backend server from:', serverPath);
  
  try {
    // Create the .env file for the backend with production settings
    const envPath = path.join(app.getPath('userData'), '.env');
    if (!fs.existsSync(envPath)) {
      const envContent = 
        'MONGODB_URI=mongodb+srv://khanmuhammadrayyan17:nBJPFX5JhtdlN0B6@cluster0.aowkj.mongodb.net/POS?retryWrites=true&w=majority\n' +
        'PORT=5002\n' +
        'JWT_SECRET=your-secret-key-for-jwt-tokenst\n' +
        'NODE_ENV=production\n';
      fs.writeFileSync(envPath, envContent);
    }

    // Set the environment variables for the child process
    const env = { 
      ...process.env,
      MONGODB_URI: 'mongodb+srv://khanmuhammadrayyan17:nBJPFX5JhtdlN0B6@cluster0.aowkj.mongodb.net/POS?retryWrites=true&w=majority',
      PORT: '5002',
      JWT_SECRET: 'your-secret-key-for-jwt-tokenst',
      NODE_ENV: 'production'
    };

    // Check if backend server file exists
    if (!fs.existsSync(serverPath)) {
      console.error(`ERROR: Backend server file not found at: ${serverPath}`);
      return false;
    }

    console.log(`Starting backend server with NODE_ENV=${env.NODE_ENV}`);

    // Make sure backend has node_modules
    const backendDir = path.dirname(path.dirname(serverPath));
    const backendNodeModules = path.join(backendDir, 'node_modules');
    if (!fs.existsSync(backendNodeModules)) {
      console.log('Installing backend dependencies...');
      // Install dependencies if not present
      const { execSync } = require('child_process');
      execSync('npm install', { cwd: backendDir, stdio: 'inherit' });
    }

    // Start the backend server
    serverProcess = spawn('node', [serverPath], { 
      env,
      cwd: path.dirname(path.dirname(serverPath)), // Run in backend directory
      stdio: 'pipe' // Capture output
    });

    // Log server output
    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      if (code !== 0) {
        // Try to restart server if it crashes
        setTimeout(() => {
          if (mainWindow) {
            console.log('Attempting to restart backend server...');
            startBackendServer();
          }
        }, 3000);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error starting backend server:', error);
    return false;
  }
}

function createWindow() {
  try {
    // Start the backend server
    const serverStarted = startBackendServer();
    if (!serverStarted) {
      console.error("Failed to start backend server");
    }

    // Wait a bit for server to start
    setTimeout(() => {
      // Create the browser window
      mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          contextIsolation: true,
          nodeIntegration: false,
          devTools: true
        },
        icon: path.join(__dirname, '../assets/icon.png')
      });

      // Load the app
      let startUrl;
      if (isDev) {
        startUrl = 'http://localhost:3000'; // Development - React dev server
      } else {
        // Production - built React app with proper path resolution
        const frontendBuildPath = getResourcePath('frontend/build/index.html');
        console.log('Loading frontend from:', frontendBuildPath);
        
        // Check if frontend build exists
        if (!fs.existsSync(frontendBuildPath)) {
          console.error(`ERROR: Frontend build not found at: ${frontendBuildPath}`);
          mainWindow.loadURL('data:text/html,<h1>Error: Frontend build not found</h1><p>Path: ' + frontendBuildPath + '</p>');
          mainWindow.webContents.openDevTools();
          return;
        }
        
        // Use file protocol with the complete absolute path
        startUrl = `file://${frontendBuildPath}`;
      }
      
      console.log(`Loading application from URL: ${startUrl}`);
      
      // Wait a bit for server to be ready
      setTimeout(() => {
        mainWindow.loadURL(startUrl);
      }, 1000);
      
      // Handle load errors
      mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error(`Failed to load URL: ${startUrl}`);
        console.error(`Error ${errorCode}: ${errorDescription}`);
        mainWindow.loadURL('data:text/html,<h1>Failed to load application</h1><p>Error: ' + errorDescription + '</p>');
      });
      
      // Log when page finishes loading
      mainWindow.webContents.on('did-finish-load', () => {
        console.log('Application loaded successfully');
      });
      
      // Always open DevTools for debugging
      mainWindow.webContents.openDevTools();

      // Emitted when the window is closed
      mainWindow.on('closed', function() {
        mainWindow = null;
      });
    }, 2000); // Wait 2 seconds for server to start
  } catch (error) {
    console.error('Error creating window:', error);
  }
}

// This method will be called when Electron has finished initialization
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});

// Clean up on app quit
app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});