// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\App.js (MERGED) ---
// ============================================================================

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import MainDashboard from "./pages/main_dashboard";
import AllProducts from "./pages/all_products";
import Inventory from "./pages/inventory";
import Reports from "./pages/reports"; // General Reports Page
import Pos from "./pages/pos";
import Login from "./pages/Login";
import CreateUser from "./pages/create_user"; // Admin uses this form page
import CategoryPage from "./pages/categories";
import CreateProducts from "./pages/create_products";
import EmployeeManagement from "./pages/EmployeeManagement"; // Your new employee list/management page
import Brands from "./pages/brands";
import { Frame as SupplierFrame } from "./pages/supplier"; // Using alias for supplier page
import { Frame as Sales } from "./pages/sales"; // Using alias for sales list page
import SalesReport from "./pages/sales-report"; // New from collaborator
import ImportPurchase from "./pages/ImportPurchase"; // New from collaborator

// Import Context & Components
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout"; // Assuming you have this Layout component

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* ---------- Public Route ---------- */}
            <Route path="/login" element={<Login />} />

            {/* ---------- Protected Routes (Wrapped in Layout) ---------- */}

            {/* --- Accessible by Cashier, Manager, Admin --- */}
            <Route path="/dashboard" element={ <ProtectedRoute><Layout title="Dashboard"><MainDashboard /></Layout></ProtectedRoute> } />
            <Route path="/all_products" element={ <ProtectedRoute><Layout title="All Products"><AllProducts /></Layout></ProtectedRoute> } />
            <Route path="/inventory" element={ <ProtectedRoute><Layout title="Inventory"><Inventory /></Layout></ProtectedRoute> } />
            <Route path="/pos" element={ <ProtectedRoute><Layout title="Point of Sale"><Pos /></Layout></ProtectedRoute> } />
            <Route path="/brands" element={ <ProtectedRoute><Layout title="Brands"><Brands /></Layout></ProtectedRoute> } />
            <Route path="/supplier" element={ <ProtectedRoute><Layout title="Suppliers"><SupplierFrame /></Layout></ProtectedRoute> } />

            {/* --- Accessible by Manager, Admin --- */}
            <Route path="/categories" element={ <ProtectedRoute requiredRole="manager"><Layout title="Categories"><CategoryPage /></Layout></ProtectedRoute> } />
            <Route path="/reports" element={ <ProtectedRoute requiredRole="manager"><Layout title="Reports"><Reports /></Layout></ProtectedRoute> } />
            <Route path="/create_products" element={ <ProtectedRoute requiredRole="manager"><Layout title="Create Product"><CreateProducts /></Layout></ProtectedRoute> } />
            <Route path="/sales" element={ <ProtectedRoute requiredRole="manager"><Layout title="Sales List"><Sales /></Layout></ProtectedRoute> } />
            <Route path="/sales-report" element={ <ProtectedRoute requiredRole="manager"><Layout title="Sales Report"><SalesReport /></Layout></ProtectedRoute> } />
            <Route path="/import_purchases" element={ <ProtectedRoute requiredRole="manager"><Layout title="Import Purchase"><ImportPurchase /></Layout></ProtectedRoute> } />
            {/* Assuming access to all purchases list requires manager */}
            {/* You might need an /all_purchases route here if it exists */}

            {/* --- Accessible ONLY by Admin --- */}
            <Route path="/employee-management" element={ <ProtectedRoute requiredRole="admin"><Layout title="Employee Management"><EmployeeManagement /></Layout></ProtectedRoute> } />
            <Route path="/create-user" element={ <ProtectedRoute requiredRole="admin"><Layout title="Create User"><CreateUser /></Layout></ProtectedRoute> } />
            {/* '/all_users' route is replaced by '/employee-management' */}


            {/* ---------- Redirects ---------- */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} /> {/* Or a dedicated 404 page inside Layout */}
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

// --- File End: App.js (MERGED) ---