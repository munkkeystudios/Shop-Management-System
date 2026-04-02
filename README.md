# Shop Management System

A comprehensive, full-stack point-of-sale (POS) and inventory management system built with **React** and **Node.js**, designed for retail shops and small businesses to manage sales, inventory, suppliers, loans, and financial reporting.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality
- **Point of Sale (POS)** - Create and manage sales transactions with multiple payment methods
- **Inventory Management** - Track product stock, categories, and brands
- **Supplier Management** - Manage supplier information and purchase orders
- **Purchase Orders** - Create and track purchase orders from suppliers
- **Loan Management** - Track and manage loans with interest calculations
- **Sales Reports** - Generate and export comprehensive sales reports (PDF, CSV, Excel)
- **User Authentication** - Secure JWT-based authentication system
- **Role-Based Access Control** - Different permission levels for admin, manager, and staff
- **Notifications** - Real-time notifications for important events
- **Settings Management** - Configurable application settings

### Technical Features
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI** - Clean, intuitive interface built with React Bootstrap
- **Data Export** - Export reports to PDF, CSV, and Excel formats
- **Charts & Analytics** - Visual sales insights with Recharts
- **Database Integration** - MongoDB for reliable data persistence
- **RESTful API** - Comprehensive backend API for all operations

## 🛠️ Tech Stack

### Frontend
- **React** 19.0.0 - UI library
- **React Router** 6.30.0 - Client-side routing
- **React Bootstrap** 2.10.9 - Bootstrap component library
- **React Icons** 5.5.0 - Icon library
- **Axios** 1.7.5 - HTTP client
- **Recharts** 2.10.3 - Charting library
- **Tailwind CSS** - Utility-first CSS framework
- **jsPDF** - PDF generation
- **XLSX** - Excel file handling
- **Chart.js** - Advanced charting
- **CSS Grid & Flexbox** - Responsive layouts

### Backend
- **Node.js** - Runtime environment
- **Express** 4.21.2 - Web framework
- **MongoDB** 8.13.2 - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** (jsonwebtoken 9.0.2) - Authentication
- **Bcrypt** 5.1.1 - Password hashing
- **Multer** 1.4.5 - File upload handling
- **Cors** 2.8.5 - Cross-origin resource sharing
- **Dotenv** 16.4.7 - Environment configuration

## 📦 Prerequisites

- **Node.js** v14.x or later (v18.x recommended)
- **npm** v6.x or later (v9.x or later recommended)
- **MongoDB** v4.4 or later
  - Local installation OR
  - MongoDB Atlas account (cloud database)
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/munkkeystudios/Shop-Management-System.git
cd Shop-Management-System
```

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
npm run install-all
```

Or install separately:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
```

Create `.env` file with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/shop_management
# For MongoDB Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shop_management

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# Session Configuration
SESSION_SECRET=your_session_secret_key_change_this_in_production

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## ▶️ Running the Application

### Quick Start (Recommended)

Start both backend and frontend simultaneously:

```bash
npm start
```

This command will:
- Start the backend API server on http://localhost:5000
- Start the frontend development server on http://localhost:3000

### Access the Application

- **Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs (if available)

### Run Services Separately

If you prefer to run services independently:

**Terminal 1 - Backend Server:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend Dashboard:**
```bash
cd frontend
npm start
```

### Production Build

Build the frontend for production:

```bash
cd frontend
npm run build
```

The production-ready files will be in the `frontend/build` directory.

## 📁 Project Structure

```
Shop-Management-System/
├── frontend/                      # React frontend application
│   ├── public/
│   │   └── index.html            # HTML entry point
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   │   ├── Sidebar.js        # Navigation sidebar
│   │   │   ├── DocumentHead.js   # Document header management
│   │   │   └── styles/           # Component-specific styles
│   │   ├── pages/                # Page components
│   │   │   ├── Dashboard.jsx     # Main dashboard
│   │   │   ├── CreateSale.js     # POS sales creation
│   │   │   ├── Sales.js          # Sales management
│   │   │   ├── Products.js       # Product management
│   │   │   ├── Categories.js     # Category management
│   │   │   ├── Suppliers.js      # Supplier management
│   │   │   ├── Loans.js          # Loan management
│   │   │   ├── Purchases.js      # Purchase management
│   │   │   └── Auth/             # Authentication pages
│   │   ├── services/             # API communication
│   │   ├── context/              # React context for state management
│   │   ├── styles/               # Global styles
│   │   ├── App.js                # Main App component
│   │   └── index.js              # React entry point
│   ├── package.json
│   └── README.md
│
├── backend/                       # Express backend application
│   ├── src/
│   │   ├── server.js             # Server entry point
│   │   ├── controllers/          # Request handlers
│   │   │   ├── userController.js
│   │   │   ├── productController.js
│   │   │   ├── saleController.js
│   │   │   ├── purchaseController.js
│   │   │   ├── supplierController.js
│   │   │   └── ... (other controllers)
│   │   ├── routes/               # API routes
│   │   │   ├── api.js            # Main API routes
│   │   │   └── ... (route files)
│   │   ├── models/               # Database schemas
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Sale.js
│   │   │   ├── Purchase.js
│   │   │   └── ... (other models)
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.js           # Authentication middleware
│   │   │   └── permissions.js    # Authorization middleware
│   │   └── uploads/              # File uploads directory
│   ├── package.json
│   └── README.md
│
├── tests/                         # Python test scripts
│   ├── cashierrolevalidation.py
│   ├── createsaleusingcash.py
│   ├── loginincorrectusername.py
│   └── ... (other test files)
│
├── package.json                   # Root package.json
└── README.md                      # This file
```

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get current user profile |
| POST | `/api/auth/logout` | User logout |

### Product Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| POST | `/api/products` | Create new product |
| GET | `/api/products/:id` | Get product details |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Sales Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sales` | Get all sales |
| POST | `/api/sales` | Create new sale |
| GET | `/api/sales/:id` | Get sale details |
| GET | `/api/sales/report` | Generate sales report |

### Supplier Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | Get all suppliers |
| POST | `/api/suppliers` | Create new supplier |
| PUT | `/api/suppliers/:id` | Update supplier |
| DELETE | `/api/suppliers/:id` | Delete supplier |

For complete API documentation, refer to the routes in `backend/src/routes/api.js`.

## 🛠️ Development

### Available Scripts

#### Frontend

```bash
# Start development server
cd frontend
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

#### Backend

```bash
# Start development server with auto-reload
cd backend
npm start

# Run with nodemon (auto-reload)
nodemon src/server.js

# Install new dependency
npm install <package-name>
```

### Code Style

- **Frontend**: Follow React best practices and component structure
- **Backend**: Follow Node.js/Express conventions
- **Naming**: Use camelCase for variables and functions, PascalCase for classes
- **Comments**: Add comments for complex logic

### Making Changes

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes and test thoroughly
3. Commit with clear messages: `git commit -m "Add feature description"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Create a Pull Request

## 🧪 Testing

### Backend Testing

Python test scripts are available in the `tests/` directory:

```bash
# Run specific test
python tests/createsaleusingcash.py

# Run all tests (if automated)
python -m pytest tests/
```

### Frontend Testing

```bash
cd frontend
npm test
```

### Manual Testing

1. Test user authentication (login/logout)
2. Create a sample sale transaction
3. Test inventory management
4. Generate and export reports
5. Test on different devices (responsive design)

## 🔍 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running locally or update `MONGODB_URI` in `.env`

#### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution**: Change PORT in `.env` or kill process using port 5000

#### Frontend Cannot Connect to Backend
**Solution**: Verify backend is running on correct port and update API base URL in frontend services

#### Build Errors
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Missing Dependencies
```bash
# Reinstall all dependencies
cd backend
npm install

cd ../frontend
npm install
```

## 👥 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Write or update tests as needed
5. Submit a pull request with a detailed description

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For issues, questions, or suggestions:
- Create an Issue on GitHub
- Contact the development team

## 🎯 Roadmap

- [ ] Enhanced reporting features
- [ ] Mobile app (React Native)
- [ ] Real-time inventory sync
- [ ] Advanced analytics dashboard
- [ ] Multi-store support
- [ ] API rate limiting and security enhancements

---

**Last Updated**: April 2, 2026
**Version**: 1.0.0