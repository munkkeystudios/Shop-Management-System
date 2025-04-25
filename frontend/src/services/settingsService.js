import api from './api';

const settingsService = {
  // Get all settings
  getSettings: () => api.get('/settings'),
  
  // Update settings
  updateSettings: (settingsData) => api.put('/settings', settingsData),
  
  // Upload logo
  uploadLogo: (formData) => api.post('/settings/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Change password
  changePassword: (passwordData) => api.post('/settings/change-password', passwordData)
};

export default settingsService; 