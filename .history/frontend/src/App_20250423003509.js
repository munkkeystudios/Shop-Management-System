
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainDashboard from "./pages/main_dashboard";
import AllProducts from "./pages/all_products";
import Inventory from "./pages/inventory";
import Reports from "./pages/reports";
import Pos from "./pages/pos";
import Login from "./pages/Login";
import CreateUser from "./pages/create_user";
import CategoryPage from "./pages/categories";
import CreateProducts from "./pages/create_products";
import AllUsers from "./pages/all_users";
import Brands from "./pages/brands";
import { Frame as SupplierPage } from "./pages/supplier";
import { Frame as SalesPage } from "./pages/sales";
import SalesReport from "./pages/sales-report";
import ImportPurchase from "./pages/ImportPurchase";
import EmployeeManagement from "./pages/EmployeeManagement";
import CreateSale from "./pages/CreateSale";       // <-- NEW
import ImportSale from "./pages/ImportSale";       // <-- NEW
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes (authenticated) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/all_products"
              element={
                <ProtectedRoute>
                  <AllProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />

            {/* Manager-level routes */}
            <Route
              path="/categories"
              element={
                <ProtectedRoute requiredRole="manager">
                  <CategoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brands"
              element={
                <ProtectedRoute requiredRole="manager">
                  <Brands />
                </ProtectedRoute}
              }
            />
            <Route
              path="/supplier"
              element={
                <ProtectedRoute requiredRole="manager">
                  <SupplierPage />
                </ProtectedRoute}
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute requiredRole="manager">
                  <Reports />
                </ProtectedRoute}
              }
            />
            <Route
              path="/create_products"
              element={
                <ProtectedRoute requiredRole="manager">
                  <CreateProducts />
                </ProtectedRoute}
              }
            />

            {/* Cashier-level routes */}
            <Route
              path="/pos"
              element={
                <ProtectedRoute requiredRole="cashier">
                  <Pos />
                </ProtectedRoute}
              }
            />

            {/* Sales routes */}
            <Route
              path="/sales"
              element={
                <ProtectedRoute requiredRole="manager">
                  <SalesPage />
                </ProtectedRoute}
              }
            />
            <Route
              path="/sales-report"
              element={
                <ProtectedRoute requiredRole="manager">
                  <SalesReport />
                </ProtectedRoute}
              }
            />
            <Route
              path="/create-sale"
              element={
                <ProtectedRoute requiredRole="cashier">
                  <CreateSale />
                </ProtectedRoute}
              }
            /> {/* NEW: CreateSale (Cashier+) */}
            <Route
              path="/import-sales"
              element={
                <ProtectedRoute requiredRole="manager">
                  <ImportSale />
                </ProtectedRoute}
              }
            /> {/* NEW: ImportSale (Manager+) */}

            {/* Purchase routes */}
            <Route
              path="/import_purchases"
              element={
                <ProtectedRoute requiredRole="manager">
                  <ImportPurchase />
                </ProtectedRoute}
              }
            />

            {/* Admin-only routes */}
            <Route
              path="/all_users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AllUsers />
                </ProtectedRoute}
              }
            />
            <Route
              path="/create-user"
              element={
                <ProtectedRoute requiredRole="admin">
                  <CreateUser />
                </ProtectedRoute}
              }
            />
            <Route
              path="/employee-management"
              element={
                <ProtectedRoute requiredRole="admin">
                  <EmployeeManagement />
                </ProtectedRoute}
              }
            />

            {/* Redirect root and unmatched */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

