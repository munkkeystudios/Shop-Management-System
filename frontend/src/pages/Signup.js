import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import { usersAPI } from '../services/api'; // Import usersAPI

// Inline CSS as a <style> block
const styles = `
  .layout {
    display: flex;
    min-height: 100vh;
    background-color: #f9f9f9;
  }

  .content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  .auth-container {
    width: 100%;
    max-width: 500px;
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .form-title {
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: bold;
  }

  .form-grid {
    display: grid;
    gap: 15px;
  }

  .form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }

  .submit-button {
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
  }

  .submit-button:hover {
    background-color: #218838;
  }

  .error-message {
    color: red;
    font-size: 12px;
  }
`;

const Signup = () => {
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
    <>
      {/* Inject the CSS */}
      <style>{styles}</style>

      <div className="layout">
        {/* Sidebar Component */}
        <Sidebar />

        {/* Signup Form */}
        <div className="content">
          <div className="auth-container signup-page">
            <div className="form-card">
              <h2 className="form-title">Add New User</h2>
              <form onSubmit={handleSubmit} className="form-grid">
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
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
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-Enter Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                {passwordError && <div className="error-message">{passwordError}</div>}
                {error && <div className="error-message">{error}</div>}
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
        </div>
      </div>
    </>
  );
};

export default Signup;