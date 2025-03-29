// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;


// import React from "react";
// import "./App.css";
// import OverviewCard from "./components/OverviewCard";
// import SalesChart from "./components/SalesChart";
// import StockAlerts from "./components/StockAlerts";
// import TopSellingProducts from "./components/TopSellingProducts";
// import PaymentsReceived from "./components/PaymentsRecieved";
// import Alerts from "./components/Alerts";

// function App() {
//   return (
//     <div className="App">
//       {/* Navigation Bar */}
//       <nav className="bg-blue-600 p-4 text-white text-center text-xl">
//         Shop Management Dashboard
//       </nav>

//       {/* Main Dashboard Layout */}
//       <div className="container mx-auto p-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           <OverviewCard />
//           <SalesChart />
//           <StockAlerts />
//           <TopSellingProducts />
//           <PaymentsReceived />
//           <Alerts />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;


import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainDashboard from "./pages/main_dashboard";
import AllProducts from "./pages/all_products";
import Inventory from "./pages/inventory";  
import Reports from "./pages/reports"; 
import Pos from "./pages/pos";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateProducts from "./pages/create_products";
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
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes */}
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
