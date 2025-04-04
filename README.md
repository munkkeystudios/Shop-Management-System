# Shop Management System

## Getting Started

### Prerequisites
- Node.js (v14.x or later)
- npm (v6.x or later)
- MongoDB (local installation or Atlas account)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/Shop-Management-System.git
   cd Shop-Management-System
   ```

2. Install all dependencies with a single command
   ```
   npm run install-all
   ```

3. Create a .env file in the backend directory
   ```
   cd backend
   # Create and edit .env file with your MongoDB connection string
   echo "MONGODB_URI=your_mongodb_connection_string" > .env
   cd ..
   ```

### Running the Application

1. Start both backend and frontend with a single command
   ```
   npm start
   ```

2. Access the application
   - Backend API: http://localhost:5000
   - Dashboard: http://localhost:3000

### Development

If you prefer to run services separately:

1. Start the backend server
   ```
   cd backend
   npm start
   ```

2. Start the dashboard in a new terminal
   ```
   cd dashboard
   npm start
   ```


### Below are dependencies to keep track of:

## in dashboard ran:

```
npm install react-bootstrap

npm install react-router-dom

npm install react-icons --save

```

## In /backend: ran following commands:

```
run these commands:

npm install

npm audit fix

npm install -g nodemon

nodemon src/index.js

then open this in browser to test: http://localhost:3000/
```