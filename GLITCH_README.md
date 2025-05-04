# Shop Management System - Glitch Deployment

This document explains how to deploy this Shop Management System to Glitch.

## Deployment Steps

1. **Sign up for Glitch**
   - Go to [Glitch.com](https://glitch.com/) and sign up for an account

2. **Create a New Project**
   - Click "New Project" and select "Import from GitHub"
   - Enter your GitHub repository URL

3. **Set Environment Variables**
   - Click on the project name in the top left
   - Select "Settings" → "Environment Variables (.env)"
   - Add the following variables:
     - `MONGODB_URI`: Your MongoDB connection string (use MongoDB Atlas for free cloud hosting)
     - `JWT_SECRET`: A secure random string for JWT token encryption
     - `NODE_ENV`: Set to "production"

4. **Setup MongoDB Atlas (if needed)**
   - Sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Set up database access credentials
   - Add your Glitch app's IP to the IP access list (or use 0.0.0.0/0 to allow all IPs)
   - Get your connection string and add it to the Glitch environment variables

5. **Verify Deployment**
   - Your app should automatically build and start
   - Check the logs in the Glitch console for any errors

## File Structure for Glitch

- `server.js` - Main server file that serves both API and frontend
- `glitch-package.json` - Rename this to `package.json` for Glitch deployment
- Copy all files from backend/src to the root directory (if needed)
- Ensure frontend/build exists with compiled React app

## Troubleshooting

- If you encounter "Build failed" errors, check the Glitch logs
- Memory issues? Try cleaning up node_modules and rebuilding
- Database connection problems? Verify your MongoDB URI

For more help, refer to the [Glitch Support](https://glitch.com/help/) page. 