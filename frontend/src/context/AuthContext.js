import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Check if user data is stored in localStorage
        const userData = localStorage.getItem('userData');
        
        if (userData) {
          // If user data exists, parse and use it
          const parsedUser = JSON.parse(userData);
          // Ensure we have an id field (MongoDB typically uses _id)
          setUser({ 
            token, 
            ...parsedUser,
            // If _id exists but id doesn't, use _id as id
            id: parsedUser.id || parsedUser._id || '64f7175c68853b5d3b2bbd04' // Fallback ID for testing
          });
        } else {
          // For testing, create a default admin user with a valid MongoDB ID
          setUser({ 
            token, 
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            id: '64f7175c68853b5d3b2bbd04' // Example MongoDB ObjectId for testing
          });
        }
      } catch (err) {
        console.error('Invalid token or user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/login', { username, password });

      if (response.data.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        
        // Create a user object with all necessary fields
        const userObject = { 
          token, 
          ...userData,
          // Ensure we have an id field (MongoDB typically uses _id)
          id: userData?.id || userData?._id || '64f7175c68853b5d3b2bbd04', // Fallback ID for testing
          // For testing, set role to admin to show all settings
          role: userData?.role || 'admin' 
        };
        
        // Store the user data in localStorage for persistence
        localStorage.setItem('userData', JSON.stringify(userObject));
        
        // Update state
        setUser(userObject);
        
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;