import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';
import logoImage from '../images/logo-small.png';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();
  const [companyInfo, setCompanyInfo] = useState({
    name: 'FinTrack',
    logo: logoImage
  });

  useEffect(() => {
    // Fetch company settings on component mount
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002';
      const response = await axios.get(`${baseUrl}/api/settings`);
      
      if (response.data) {
        const settings = response.data;
        const updatedInfo = {
          name: settings.companyName || 'FinTrack',
          logo: settings.logoUrl || settings.companyLogo || logoImage
        };
        
        // If the logo is a relative path, prepend the API base URL
        if (updatedInfo.logo && !updatedInfo.logo.startsWith('http')) {
          updatedInfo.logo = `${baseUrl}${updatedInfo.logo}`;
        }
        
        setCompanyInfo(updatedInfo);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
      // Keep defaults if there's an error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container login-page">
      <div className="auth-card-left">
        <div className="logo-container">
          <div className="logo">
            <img src={companyInfo.logo} alt="Company Logo" />
          </div>
          <h1>{companyInfo.name}</h1>
        </div>

        <div className="promo-content">
          <h2>Start your Journey with us!</h2>
          <p>Experience seamless transactions and personalized solutions. Let's enhance your business operations together.
            Start optimizing your POS system today with us!</p>
          <div className="company-info">
            <p>{companyInfo.name} Solutions Inc.</p>
          </div>
        </div>
      </div>

      <div className="auth-card-right">
        <div className="form-content">
          <div className="auth-header">
            <h2>Login</h2>
            <p>Login to your account!</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="username"
                required
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="password"
                required
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <div className="form-options">
                <div className="remember-me">
                  <input 
                    type="checkbox" 
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember">Remember Me</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">Forget Password?</Link>
              </div>
            </div>

            <div className="form-group">
              <input 
                type="submit" 
                value={loading ? "Logging in..." : "Login"} 
                disabled={loading}
                className="submit-button"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 