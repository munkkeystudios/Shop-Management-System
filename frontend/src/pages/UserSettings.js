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
    const previousValue = profile.notificationPreferences[notificationType];

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
          ...prevProfile.notificationPreferences,
          [notificationType]: previousValue
        }
      }));
    }
  };

  return (
    <Layout title="User Settings">
      <div className="slate-settings-page">
        {loading ? (
          <div className="products-loading-container">
            <div className="block-pulse">
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
            </div>
          </div>
        ) : (
          <div className="slate-settings-wrap">
            <header className="slate-main-header">
              <h1>Profile Settings</h1>
              <p className="settings-subheading">Update your architectural profile and security credentials.</p>
            </header>

            <div className="slate-settings-grid">
              <section className="slate-col-left">
                <div className="slate-card">
                  <h3 className="slate-section-title">Personal Information</h3>
                  <form className="slate-form" onSubmit={handleProfileSubmit}>
                    <div className="slate-form-grid">
                      <div className="slate-field">
                        <label htmlFor="firstName">First Name</label>
                        <input
                          id="firstName"
                          type="text"
                          name="firstName"
                          value={profile.firstName}
                          onChange={handleInputChange}
                          className={`slate-input input-bottom-border ${errors.firstName ? 'slate-input-error' : ''}`}
                        />
                        {errors.firstName && <div className="slate-error-message">{errors.firstName}</div>}
                      </div>

                      <div className="slate-field">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          id="lastName"
                          type="text"
                          name="lastName"
                          value={profile.lastName}
                          onChange={handleInputChange}
                          className={`slate-input input-bottom-border ${errors.lastName ? 'slate-input-error' : ''}`}
                        />
                        {errors.lastName && <div className="slate-error-message">{errors.lastName}</div>}
                      </div>

                      <div className="slate-field slate-span-2">
                        <label htmlFor="email">Email Address</label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleInputChange}
                          className={`slate-input input-bottom-border ${errors.email ? 'slate-input-error' : ''}`}
                        />
                        {errors.email && <div className="slate-error-message">{errors.email}</div>}
                      </div>

                      <div className="slate-field">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={profile.phone}
                          onChange={handleInputChange}
                          className={`slate-input input-bottom-border ${errors.phone ? 'slate-input-error' : ''}`}
                          placeholder="+1 (123) 456-7890"
                        />
                        {errors.phone && <div className="slate-error-message">{errors.phone}</div>}
                      </div>

                      <div className="slate-field">
                        <label htmlFor="jobTitle">Job Title</label>
                        <input
                          id="jobTitle"
                          type="text"
                          name="jobTitle"
                          value={profile.jobTitle}
                          onChange={handleInputChange}
                          className="slate-input input-bottom-border"
                        />
                      </div>

                      <div className="slate-field slate-span-2">
                        <label htmlFor="preferredLanguage">Preferred Language</label>
                        <select
                          id="preferredLanguage"
                          name="preferredLanguage"
                          value={profile.preferredLanguage}
                          onChange={handleInputChange}
                          className="slate-select input-bottom-border"
                        >
                          {languageOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="slate-actions-end">
                      <button
                        type="submit"
                        className="slate-btn-primary"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              <div className="slate-col-right">
                <section className="slate-card">
                  <h3 className="slate-section-title">Change Password</h3>
                  <form className="slate-form" onSubmit={handlePasswordSubmit}>
                    <div className="slate-stack-lg">
                      <div className="slate-field">
                        <label htmlFor="currentPassword">Current Password</label>
                        <div className="slate-password-wrap">
                          <input
                            id="currentPassword"
                            type={passwordVisible.current ? 'text' : 'password'}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className={`slate-input input-bottom-border ${errors.currentPassword ? 'slate-input-error' : ''}`}
                            placeholder="••••••••••••"
                          />
                          <button
                            type="button"
                            className="slate-password-toggle"
                            onClick={() => togglePasswordVisibility('current')}
                            aria-label={passwordVisible.current ? 'Hide current password' : 'Show current password'}
                          >
                            <span className="material-symbols-outlined">
                              {passwordVisible.current ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                        {errors.currentPassword && <div className="slate-error-message">{errors.currentPassword}</div>}
                      </div>

                      <div className="slate-field">
                        <label htmlFor="newPassword">New Password</label>
                        <div className="slate-password-wrap">
                          <input
                            id="newPassword"
                            type={passwordVisible.new ? 'text' : 'password'}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className={`slate-input input-bottom-border ${errors.newPassword ? 'slate-input-error' : ''}`}
                            placeholder="••••••••••••"
                          />
                          <button
                            type="button"
                            className="slate-password-toggle"
                            onClick={() => togglePasswordVisibility('new')}
                            aria-label={passwordVisible.new ? 'Hide new password' : 'Show new password'}
                          >
                            <span className="material-symbols-outlined">
                              {passwordVisible.new ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                        {errors.newPassword && <div className="slate-error-message">{errors.newPassword}</div>}
                      </div>

                      <div className="slate-field">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <div className="slate-password-wrap">
                          <input
                            id="confirmPassword"
                            type={passwordVisible.confirm ? 'text' : 'password'}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className={`slate-input input-bottom-border ${errors.confirmPassword ? 'slate-input-error' : ''}`}
                            placeholder="••••••••••••"
                          />
                          <button
                            type="button"
                            className="slate-password-toggle"
                            onClick={() => togglePasswordVisibility('confirm')}
                            aria-label={passwordVisible.confirm ? 'Hide confirm password' : 'Show confirm password'}
                          >
                            <span className="material-symbols-outlined">
                              {passwordVisible.confirm ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                        {errors.confirmPassword && <div className="slate-error-message">{errors.confirmPassword}</div>}
                      </div>

                      <div className="slate-input-hint">
                        Password must be at least 8 characters and include uppercase, lowercase, and numbers.
                      </div>

                      <button
                        type="submit"
                        className="slate-btn-outline"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </section>

                <section className="slate-card">
                  <h3 className="slate-section-title">Notification Preferences</h3>
                  <form className="slate-form slate-stack-md">
                    <div className="slate-toggle-row">
                      <div>
                        <label htmlFor="email-notifications" className="slate-toggle-label">Email Notifications</label>
                        <div className="slate-input-hint">Receive notifications about important updates via email.</div>
                      </div>
                      <input
                        type="checkbox"
                        name="notifications.email"
                        id="email-notifications"
                        checked={profile.notificationPreferences.email}
                        onChange={handleNotificationChange}
                        className="slate-checkbox"
                      />
                    </div>

                    <div className="slate-toggle-row">
                      <div>
                        <label htmlFor="browser-notifications" className="slate-toggle-label">Browser Notifications</label>
                        <div className="slate-input-hint">Receive notifications in your browser while using the application.</div>
                      </div>
                      <input
                        type="checkbox"
                        name="notifications.browser"
                        id="browser-notifications"
                        checked={profile.notificationPreferences.browser}
                        onChange={handleNotificationChange}
                        className="slate-checkbox"
                      />
                    </div>
                  </form>
                </section>

                <section className="slate-integrity-box">
                  <div className="slate-integrity-head">
                    <span className="material-symbols-outlined">verified_user</span>
                    <span className="slate-status-chip">Active Account</span>
                  </div>
                  <h4>Account Integrity</h4>
                  <p>
                    Your account is secured with two-factor authentication. Last login activity is continuously monitored.
                  </p>
                </section>
              </div>
            </div>

            <section className="slate-danger-zone">
              <div>
                <h3>Danger Zone</h3>
                <p>Permanently delete your account and all architectural assets.</p>
              </div>
              <button type="button" className="slate-danger-btn">
                Delete Account
              </button>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserSettings;