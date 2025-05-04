import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';


const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }


  const token = localStorage.getItem('token');
  let userRole = null;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userRole = decodedToken.role;
    } catch (error) {
      console.error("Invalid token during route protection:", error);
      logout();
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } else {
     logout();
     return <Navigate to="/login" state={{ from: location }} replace />;
  }


  if (requiredRole) {
    let hasAccess = false;

    if (userRole === 'admin') {
      hasAccess = true;
    } else if (userRole === 'manager') {
      hasAccess = (requiredRole === 'manager' || requiredRole === 'cashier');
    } else if (userRole === 'cashier') {
      hasAccess = (requiredRole === 'cashier');
    }

    if (!hasAccess) {
      console.warn(`Access Denied: Route requires role '${requiredRole}' or higher, user has role '${userRole}'. Redirecting.`);
      return <Navigate to="/dashboard" replace />;
    }
  }


  return children;
};

export default ProtectedRoute;
