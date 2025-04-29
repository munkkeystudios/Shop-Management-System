import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api'; // Import usersAPI
import Layout from '../components/Layout';

// Inline CSS as a <style> block
const styles = `
  .content {
    display: flex;
    flex-direction: column;
    padding: 20px;
    width: 100%;
    background-color: #f8f9fa;
  }

  .form-container {
    width: 100%;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .add-user-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-top: 0;
    margin-bottom: 20px;
    padding-bottom: 0;
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    padding: 0;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 0;
  }

  .form-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
  }

  .form-input::placeholder {
    color: #999;
  }

  .form-input:focus {
    outline: none;
    border-color: #00a838;
  }

  select.form-input {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 30px;
  }

  .submit-button {
    padding: 8px 24px;
    background-color: #00a838;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    width: fit-content;
    margin-top: 8px;
  }

  .submit-button:hover {
    background-color: #008f2f;
  }

  .error-message {
    color: #dc2626;
    font-size: 12px;
    margin-top: 4px;
  }
`;

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
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordError('');
    setLoading(true);
    setError('');

    try {
      // Call the create user API
      const response = await usersAPI.create(formData);
      if (response.data.success) {
        navigate('/all_users'); // Redirect to the users list after successful creation
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add New User">
      {/* Inject the CSS */}
      <style>{styles}</style>

      <div className="content">
        <div className="form-container">
          <h2 className="add-user-title">Add New User</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            {/* Full width input for name */}
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />

            {/* Two column layout for email and phone */}
            <div className="form-row">
              <input
                type="email"
                name="email"
                placeholder="Enter Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
              <input
                type="text"
                name="phone"
                placeholder="Enter Phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            {/* Two column layout for role and shift time */}
            <div className="form-row">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="" disabled>
                  Select Role
                </option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
              <select
                name="shiftTime"
                value={formData.shiftTime}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="" disabled>
                  Select Shift Time
                </option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>

            {/* Two column layout for username and password */}
            <div className="form-row">
              <input
                type="text"
                name="username"
                placeholder="Enter Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
              />
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            {/* Re-enter password field */}
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-Enter Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="form-input"
              style={{ display: 'none' }}
            />

            {/* Error messages */}
            {passwordError && <div className="error-message">{passwordError}</div>}
            {error && <div className="error-message">{error}</div>}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Creating account...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateUser;