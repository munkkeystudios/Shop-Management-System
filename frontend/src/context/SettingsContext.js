import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';

// Create the context
const SettingsContext = createContext();

// Custom hook to use the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Provider component
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsAPI.getGeneralSettings();
      if (response.data) {
        setSettings(response.data);
      } else {
        setSettings({
          companyName: 'Shop Management System',
          companyLogo: null
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
      setSettings({
        companyName: 'Shop Management System',
        companyLogo: null
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Update settings in the API and context
  const updateSettings = useCallback(async (updatedSettings) => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsAPI.updateGeneralSettings(updatedSettings);
      if (response.data) {
        setSettings(response.data);
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Failed to update settings' };
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
      return { success: false, error: err.message || 'Failed to update settings' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update logo specifically
  const updateLogo = useCallback(async (logoFile) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const response = await settingsAPI.uploadLogo(formData);
      if (response.data && response.data.logoUrl) {
        setSettings(prevSettings => ({
          ...prevSettings,
          companyLogo: response.data.logoUrl,
          logoUrl: response.data.logoUrl // For backward compatibility
        }));
        return { success: true, logoUrl: response.data.logoUrl };
      }
      return { success: false, error: 'Failed to upload logo' };
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Failed to upload logo');
      return { success: false, error: err.message || 'Failed to upload logo' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch of settings
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Context value
  const value = {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updateLogo
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
