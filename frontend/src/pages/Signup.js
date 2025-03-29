import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signup, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordError('');
    const success = await signup(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container signup-page">
      <div className="auth-card">
        <div className="auth-card-left">
          <div className="auth-logo">
            <h1>POS Signup</h1>
            <p>Join our secure POS platform. Efficiently handle your transactions.</p>
          </div>
        </div>
        
        <div className="auth-card-right">
          <div className="form-content">
            <div className="auth-header">
              <h2>Sign Up</h2>
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {passwordError && (
              <div className="error-message">
                {passwordError}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              <input 
                type="submit" 
                value={loading ? "Creating account..." : "Sign Up"} 
                disabled={loading}
                className="submit-button"
              />
              
              <div className="auth-footer">
                <p>
                  Already have an Account?
                  <Link to="/login"> Login</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 