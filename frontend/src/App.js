import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// eventually make it so all this import components/pages comes in 1 line
import MainDashboard from "./pages/main_dashboard";
import AllProducts from "./pages/all_products";
import Inventory from "./pages/inventory";  
import Reports from "./pages/reports"; 
import Pos from "./pages/pos";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CategoryPage from "./pages/categories";
import CreateProducts from "./pages/create_products";
import AllUsers from "./pages/all_users";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <div className="App">
//           <Routes>
//             {/* Public routes */}
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
            
//             {/* Protected routes */}
//             <Route path="/dashboard" element={
//               <ProtectedRoute>
//                 <MainDashboard />
//               </ProtectedRoute>
//             } />
//             <Route path="/all_products" element={
//               <ProtectedRoute>
//                 <AllProducts />
//               </ProtectedRoute>
//             } />
//             <Route path="/inventory" element={
//               <ProtectedRoute>
//                 <Inventory />
//               </ProtectedRoute>
//             } />
//             <Route path="/reports" element={
//               <ProtectedRoute>
//                 <Reports />
//               </ProtectedRoute>
//             } />
//             <Route path="/create_products" element={
//               <ProtectedRoute>
//                 <CreateProducts />
//               </ProtectedRoute>
//             } />
//             <Route path="/pos" element={
//               <ProtectedRoute>
//                 <Pos />
//               </ProtectedRoute>
//             } />
            
//             {/* Redirect root to login */} 
//             {/* change navigation to /login later */}
// {/* <<<<<<< HEAD
//             <Route path="/" element={<Navigate to="/dashboard" replace />} />
// =======
//             <Route path="/" element={<Navigate to="/login" replace />} />
// >>>>>>> 98bc7567d52c2283e785bd8250452b38d862cfd1
//             <Route path="*" element={<Navigate to="/login" replace />} />
//           </Routes> */}
//           <Routes>
//           {/* Redirect root to login */}
//           <Route path="/" element={<Navigate to="/login" replace />} />
//           <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>

//         </div>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

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
