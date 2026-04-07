import React, { useState } from 'react';
import { usersAPI } from '../services/api';
import Layout from '../components/Layout';
import '../styles/create_user.css'; 

const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    shiftTime: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');
  
  const validateForm = () => {
    const newErrors = {};
   
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
   
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
   
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
   
    if (!formData.role) {
      newErrors.role = 'Role selection is required';
    }
   
    if (!formData.shiftTime) {
      newErrors.shiftTime = 'Shift time selection is required';
    }
   
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
   
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
   
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
   
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
   
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      shiftTime: '',
      username: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
   
    if (!validateForm()) {
      return;
    }
   
    setLoading(true);
   
    try {
      const response = await usersAPI.create(formData);
      if (response.data.success) {
        setCreateSuccess(`User ${formData.name} was created successfully`);
        resetForm();
        setTimeout(() => {
          setCreateSuccess('');
        }, 3000);
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setErrors(prev => ({
        ...prev,
        general: err.response?.data?.message || 'Failed to create user'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setCreateSuccess('');
  };

  return (
    <Layout title="Add New User">
      <div className="create-user-page">
        {createSuccess && <div className="create-user-banner success">{createSuccess}</div>}
        {errors.general && <div className="create-user-banner error">{errors.general}</div>}

        <form className="create-user-shell" onSubmit={handleSubmit}>
          <div className="create-user-header">
            <div>
              <h1>ADD NEW USER</h1>
              <p>User Management &amp; Permissions</p>
            </div>
            <button type="submit" className="save-user-top-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save User'}
            </button>
          </div>

          <div className="create-user-grid">
            <section className="identity-card">
              <div className="card-title-row">
                <span className="material-symbols-outlined">person</span>
                <h2>Identity Details</h2>
              </div>

              <div className="identity-fields-grid">
                <div className="slate-field">
                  <label>Enter Name</label>
                  <input
                    className={`slate-input input-bottom-border ${errors.name ? 'slate-input-error' : ''}`}
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>

                <div className="slate-field">
                  <label>Enter Username</label>
                  <input
                    className={`slate-input input-bottom-border ${errors.username ? 'slate-input-error' : ''}`}
                    type="text"
                    name="username"
                    placeholder="jdoe_admin"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {errors.username && <p className="error-text">{errors.username}</p>}
                </div>

                <div className="slate-field">
                  <label>Enter Email Address</label>
                  <input
                    className={`slate-input input-bottom-border ${errors.email ? 'slate-input-error' : ''}`}
                    type="email"
                    name="email"
                    placeholder="john@slatepos.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>

                <div className="slate-field">
                  <label>Enter Phone</label>
                  <input
                    className={`slate-input input-bottom-border ${errors.phone ? 'slate-input-error' : ''}`}
                    type="text"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <p className="error-text">{errors.phone}</p>}
                </div>
              </div>
            </section>

            <aside className="assignment-column">
              <section className="assignment-card">
                <div className="card-title-row">
                  <span className="material-symbols-outlined">badge</span>
                  <h2>Assignment</h2>
                </div>

                <div className="slate-field">
                  <label>Select Role</label>
                  <select
                    className={`slate-select input-bottom-border ${errors.role ? 'slate-input-error' : ''}`}
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Select role</option>
                    <option value="admin">Administrator</option>
                    <option value="manager">Floor Manager</option>
                    <option value="cashier">Cashier</option>
                  </select>
                  {errors.role && <p className="error-text">{errors.role}</p>}
                </div>

                <div className="slate-field">
                  <label>Select Shift Time</label>
                  <select
                    className={`slate-select input-bottom-border ${errors.shiftTime ? 'slate-input-error' : ''}`}
                    name="shiftTime"
                    value={formData.shiftTime}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Select shift</option>
                    <option value="morning">Morning (08:00 - 16:00)</option>
                    <option value="evening">Afternoon (16:00 - 00:00)</option>
                    <option value="night">Night (00:00 - 08:00)</option>
                  </select>
                  {errors.shiftTime && <p className="error-text">{errors.shiftTime}</p>}
                </div>
              </section>

              <section className="security-status-card">
                <div className="card-title-row">
                  <span className="material-symbols-outlined">verified_user</span>
                  <h2>Security Status</h2>
                </div>

                <div className="status-row">
                  <span>2FA Required</span>
                  <span className="status-chip">Enabled</span>
                </div>
                <div className="status-row">
                  <span>Access Tier</span>
                  <span>Level 4</span>
                </div>
              </section>
            </aside>

            <section className="security-card">
              <div className="card-title-row">
                <span className="material-symbols-outlined">lock</span>
                <h2>Security Credentials</h2>
              </div>

              <div className="security-fields-grid">
                <div className="slate-field">
                  <label>Enter Password</label>
                  <input
                    className={`slate-input input-bottom-border ${errors.password ? 'slate-input-error' : ''}`}
                    type="password"
                    name="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && <p className="error-text">{errors.password}</p>}
                </div>

                <div className="slate-field">
                  <label>Re-Enter Password</label>
                  <input
                    className={`slate-input input-bottom-border ${errors.confirmPassword ? 'slate-input-error' : ''}`}
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="security-note">
                <div className="security-note-line" />
                <p>
                  Passwords must be at least 12 characters long and include architectural variety: a mix of
                  uppercase, lowercase, numbers, and symbols.
                </p>
              </div>
            </section>
          </div>

          <div className="create-user-actions-mobile">
            <button type="submit" className="save-user-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save User'}
            </button>
            <button type="button" className="cancel-user-btn" onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateUser;