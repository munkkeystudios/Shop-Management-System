import React, { createContext, useContext, useState, useEffect } from 'react';

const POSThemeContext = createContext();

export const POSThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('pos-theme-mode');
    if (saved) {
      return saved === 'dark';
    }
    // Default to light mode
    return false;
  });

  // Save preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pos-theme-mode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <POSThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </POSThemeContext.Provider>
  );
};

export const usePOSTheme = () => {
  const context = useContext(POSThemeContext);
  if (!context) {
    throw new Error('usePOSTheme must be used within POSThemeProvider');
  }
  return context;
};
