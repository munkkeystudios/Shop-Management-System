import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './settings.css';
import { useNotifications } from '../context/NotificationContext';

const UserSettings = () => {
  const { user, updateUserInfo } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User profile state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    preferredLanguage: 'en',
    notificationPreferences: {
      email: true,
      browser: true
    }
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Form validation
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Language options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'ur', label: 'Urdu' }
  ];

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserProfile(user.id);
      if (response.data && response.data.data) {
        const userData = response.data.data;
        setProfile(prevProfile => ({
          ...prevProfile,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          jobTitle: userData.jobTitle || '',
          preferredLanguage: userData.preferredLanguage || 'en',
          notificationPreferences: {
            ...prevProfile.notificationPreferences,
            ...(userData.notificationPreferences || {})
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      // Handle nested notification preferences
      if (name.startsWith('notifications.')) {
        const notificationType = name.split('.')[1];
        setProfile({
          ...profile,
          notificationPreferences: {
            ...profile.notificationPreferences,
            [notificationType]: checked
          }
        });
        return;
      }

      // Handle regular checkboxes
      setProfile({
        ...profile,
        [name]: checked
      });
      return;
    }

    // Handle regular inputs
    setProfile({
      ...profile,
      [name]: value
    });

    // Clear any existing error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });

    // Clear any existing error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisible({
      ...passwordVisible,
      [field]: !passwordVisible[field]
    });
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profile.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profile.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profile.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (profile.phone && !/^\+?[0-9\s-()]+$/.test(profile.phone)) {
      newErrors.phone = 'Phone number format is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    try {
      setSaving(true);

      const profileData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        jobTitle: profile.jobTitle,
        preferredLanguage: profile.preferredLanguage
      };

      const response = await userAPI.updateUserProfile(user.id, profileData);

      if (response.data && response.data.success) {
        // Update the user info in the auth context if needed
        if (typeof updateUserInfo === 'function') {
          updateUserInfo({
            ...user,
            firstName: profile.firstName,
            lastName: profile.lastName
          });
        }

        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    try {
      setSaving(true);

      await userAPI.changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);

      if (error.response && error.response.status === 401) {
        setErrors({
          ...errors,
          currentPassword: 'Current password is incorrect'
        });
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = async (e) => {
    const { name, checked } = e.target;
    const notificationType = name.split('.')[1];

    // Update local state
    setProfile({
      ...profile,
      notificationPreferences: {
        ...profile.notificationPreferences,
        [notificationType]: checked
      }
    });

    try {
      // Save to backend
      await userAPI.updateNotificationPreferences(user.id, {
        [notificationType]: checked
      });

      // Add notification
      addNotification(
        'settings',
        `Notification preference updated: ${notificationType} notifications ${checked ? 'enabled' : 'disabled'}`
      );

      toast.success(`${notificationType.charAt(0).toUpperCase() + notificationType.slice(1)} notifications ${checked ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');

      // Revert the local state change if there was an error
      setProfile(prevProfile => ({
        ...prevProfile,
        notificationPreferences: {
          ...prevProfile.notificationPreferences
        }
      }));
    }
  };

  return (
    <Layout title="User Settings">
      <div className="settings-container">
        {loading ? (
          <div className="loading-message">Loading your profile...</div>
        ) : (
          <div className="settings-sections-container">
            {/* Personal Information */}
            <div className="settings-section-card settings-header-card">
              <div className="settings-header">
                <h1>User Settings</h1>
                <p className="settings-description">
                  Manage your personal information, password, and notification preferences
                </p>
              </div>
              <h2>Personal Information</h2>
              <form className="settings-form" onSubmit={handleProfileSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleInputChange}
                      className={`form-input ${errors.firstName ? 'input-error' : ''}`}
                    />
                    {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleInputChange}
                      className={`form-input ${errors.lastName ? 'input-error' : ''}`}
                    />
                    {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      className={`form-input ${errors.phone ? 'input-error' : ''}`}
                      placeholder="+1 (123) 456-7890"
                    />
                    {errors.phone && <div className="error-message">{errors.phone}</div>}
                  </div>

                  <div className="form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={profile.jobTitle}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Preferred Language</label>
                  <select
                    name="preferredLanguage"
                    value={profile.preferredLanguage}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    {languageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>

            {/* Password */}
            <div className="settings-section-card">
              <h2>Change Password</h2>
              <form className="settings-form" onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input-container">
                    <input
                      type={passwordVisible.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`form-input ${errors.currentPassword ? 'input-error' : ''}`}
                    />
                    <button
                      type="button"
                      className="password-toggle-button"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {passwordVisible.current ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>New Password</label>
                    <div className="password-input-container">
                      <input
                        type={passwordVisible.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
                      />
                      <button
                        type="button"
                        className="password-toggle-button"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {passwordVisible.new ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <div className="password-input-container">
                      <input
                        type={passwordVisible.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                      />
                      <button
                        type="button"
                        className="password-toggle-button"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {passwordVisible.confirm ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                  </div>
                </div>

                <div className="input-hint">
                  Password must be at least 8 characters and include uppercase, lowercase, and numbers
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Notification Preferences */}
            <div className="settings-section-card">
              <h2>Notification Preferences</h2>
              <form className="settings-form">
                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      name="notifications.email"
                      id="email-notifications"
                      checked={profile.notificationPreferences.email}
                      onChange={handleNotificationChange}
                      className="form-checkbox"
                    />
                    <label htmlFor="email-notifications">Email Notifications</label>
                    <div className="input-hint">
                      Receive notifications about important updates via email
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      name="notifications.browser"
                      id="browser-notifications"
                      checked={profile.notificationPreferences.browser}
                      onChange={handleNotificationChange}
                      className="form-checkbox"
                    />
                    <label htmlFor="browser-notifications">Browser Notifications</label>
                    <div className="input-hint">
                      Receive notifications in your browser while using the application
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserSettings;