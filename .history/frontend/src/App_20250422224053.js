import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// eventually make it so all this import components/pages comes in 1 line
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
import  Brands  from "./pages/brands";
import { Frame } from "./pages/supplier";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Frame as Sales } from "./pages/sales";
import SalesReport from "./pages/sales-report";
import ImportPurchase from "./pages/ImportPurchase";




function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainDashboard />
              </ProtectedRoute>
            } />
            <Route path="/all_products" element={
              <ProtectedRoute>
                <AllProducts />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            } />
            <Route path="/categories" element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/create_products" element={
              <ProtectedRoute>
                <CreateProducts />
              </ProtectedRoute>
            } />
            <Route path="/pos" element={
              <ProtectedRoute>
                <Pos />
              </ProtectedRoute>
            } />
            <Route path="/all_users" element={
              <ProtectedRoute>
                <AllUsers />
              </ProtectedRoute>
            } />
            <Route path="/brands" element={
              <ProtectedRoute>
                <Brands />
              </ProtectedRoute>
            } />
            <Route path="/supplier" element={
              <ProtectedRoute>
                <Frame />
              </ProtectedRoute>
            } />
            <Route path="/create-user" element={
              <ProtectedRoute>
                <CreateUser />
              </ProtectedRoute>
            } />
            <Route path="/sales" element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            } />
            <Route path="/sales-report" element={
              <ProtectedRoute>
                <SalesReport />
              </ProtectedRoute>
            } />
            <Route path="/import_purchases" element={
              <ProtectedRoute>
                <ImportPurchase />
              </ProtectedRoute>
            } />

<Route path="/employee-management" element={ <ProtectedRoute requiredRole="admin"><EmployeeManagement /></ProtectedRoute> } />  

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
