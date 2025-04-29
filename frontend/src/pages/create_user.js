import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <Layout>
      <div className="user-container">
        
        {createSuccess && (
          <div className="success-container">
            <div className="success-message">{createSuccess}</div>
          </div>
        )}
        
        <div className="user-form-container">
          <h2 className="form-title">Add New User</h2>
          
          {errors.general && (
            <div className="error-message-general">
              {errors.general}
            </div>
          )}
          
          <div className="form-content">
            <div className="form-field">
              <input
                type="text"
                name="name"
                placeholder="Enter Name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>
              
              <div className="form-field">
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? "input-error" : ""}
                />
                {errors.phone && <p className="error-text">{errors.phone}</p>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field select-container">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={errors.role ? "select-error" : ""}
                >
                  <option value="" disabled>Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
                <div className="select-arrow"></div>
                {errors.role && <p className="error-text">{errors.role}</p>}
              </div>
              
              <div className="form-field select-container">
                <select
                  name="shiftTime"
                  value={formData.shiftTime}
                  onChange={handleChange}
                  className={errors.shiftTime ? "select-error" : ""}
                >
                  <option value="" disabled>Select Shift Time</option>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
                <div className="select-arrow"></div>
                {errors.shiftTime && <p className="error-text">{errors.shiftTime}</p>}
              </div>
            </div>
            
            <div className="form-field">
              <input
                type="text"
                name="username"
                placeholder="Enter Username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? "input-error" : ""}
              />
              {errors.username && <p className="error-text">{errors.username}</p>}
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <input
                  type="password"
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "input-error" : ""}
                />
                {errors.password && <p className="error-text">{errors.password}</p>}
              </div>
              
              <div className="form-field">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-Enter Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "input-error" : ""}
                />
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateUser;