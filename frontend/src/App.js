import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// eventually make it so all this import components/pages comes in 1 line
import MainDashboard from "./pages/main_dashboard";
import AllProducts from "./pages/all_products";
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
import { NotificationProvider } from "./context/NotificationContext";
import ImportPurchase from "./pages/ImportPurchase";
import CreatePurchase from "./pages/CreatePurchase";
import AllPurchases from "./pages/all_purchases";
import EmployeeManagement from "./pages/EmployeeManagement";
import CreateSale from "./pages/CreateSale";
import ImportSale from "./pages/ImportSale";
import Loans from "./pages/Loans";
import CreateLoan from "./pages/CreateLoan";
import UserSettings from "./pages/UserSettings";
import DisplaySettings from "./pages/DisplaySettings";
import GeneralSettings from "./pages/GeneralSettings";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
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
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supplier"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <SupplierPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create_products"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <CreateProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/loans"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <Loans />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-loans"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <CreateLoan />
                  </ProtectedRoute>
                }
              />

              {/* Cashier-level routes */}
              <Route
                path="/pos"
                element={
                  <ProtectedRoute requiredRole="cashier">
                    <Pos />
                  </ProtectedRoute>
                }
              />

              {/* Sales routes */}
              <Route
                path="/sales"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <SalesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales-report"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <SalesReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-sale"
                element={
                  <ProtectedRoute requiredRole="cashier">
                    <CreateSale />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/import-sales"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <ImportSale />
                  </ProtectedRoute>
                }
              />

              {/* Purchase routes */}
              <Route
                path="/import_purchases"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <ImportPurchase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create_purchases"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <CreatePurchase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/all_purchases"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <AllPurchases />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only routes */}
              <Route
                path="/all_users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AllUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-user"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <CreateUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee-management"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <EmployeeManagement />
                  </ProtectedRoute>
                }
              />

              {/* Settings routes */}
              <Route
                path="/settings/user"
                element={
                  <ProtectedRoute>
                    <UserSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/display"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <DisplaySettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/general"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <GeneralSettings />
                  </ProtectedRoute>
                }
              />

              {/* Redirect /settings to user settings */}
              <Route path="/settings" element={<Navigate to="/settings/user" replace />} />

              {/* Redirect root and unmatched */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
