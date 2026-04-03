import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEME_LIGHT, THEME_DARK, getTheme, setTheme, toggleTheme } from '../utils/themeUtils';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(THEME_DARK);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = getTheme();
    setThemeState(savedTheme);
    setIsLoaded(true);
  }, []);

  const handleToggleTheme = () => {
    const newTheme = toggleTheme(theme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: handleToggleTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
