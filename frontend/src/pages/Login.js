import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';
import logoImage from '../images/logo-small.png';
import dashboardImage from '../images/dashboard.png';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const baseUrl = process.env.REACT_APP_API_URL || '';
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
    <main className="slate-auth-page login-page">
      <section
        className="slate-auth-left"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(51, 65, 85, 0.94) 0%, rgba(11, 15, 16, 0.94) 100%), url(${dashboardImage})` }}
      >
        <div className="slate-auth-grid-overlay" aria-hidden="true" />

        <div className="slate-auth-left-top">
          <div className="slate-auth-hero-copy" aria-hidden="true" />
        </div>

        {/* Removed system metrics per request (Node Status / Latency / Security) */}
      </section>

      <section className="slate-auth-right">
        <div className="slate-auth-right-inner">
          <header className="slate-auth-header">
            <div className="slate-auth-header-brand">
              {companyInfo.logo ? (
                <img src={companyInfo.logo} alt={companyInfo.name || 'FinTrack'} className="slate-auth-header-logo" />
              ) : (
                <span className="material-symbols-outlined slate-auth-header-logo">terminal</span>
              )}
              <h2 className="slate-auth-header-title">{companyInfo.name || 'FinTrack'}</h2>
            </div>
            <p>Enter credentials to unlock system</p>
          </header>

          {error && (
            <div className="slate-auth-error" role="alert">{error}</div>
          )}

          <form className="slate-auth-form" onSubmit={handleSubmit}>
            <div className="slate-auth-field">
              <label htmlFor="username">Operator ID / Email</label>
              <div className="slate-auth-input-wrap">
                <span className="material-symbols-outlined">person</span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Username"
                  required
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div className="slate-auth-field">
              <label htmlFor="password">Security Passcode</label>
              <div className="slate-auth-input-wrap">
                <span className="material-symbols-outlined">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="slate-auth-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Remember session checkbox removed per UI update */}

            <div className="slate-auth-submit-wrap">
                <button
                  type="submit"
                  disabled={loading}
                  className="slate-auth-submit-btn"
                >
                  <span className="material-symbols-outlined">{loading ? 'hourglass_top' : 'login'}</span>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
          </form>

          <div className="slate-auth-alt">
            <div className="slate-auth-alt-divider">
              <div />
              <span>Alternative Access</span>
              <div />
            </div>

            <div className="slate-auth-alt-grid">
              <button type="button">
                <span className="material-symbols-outlined">fingerprint</span>
                <span>Biometric</span>
              </button>
              <button type="button">
                <span className="material-symbols-outlined">credit_card</span>
                <span>Card Swipe</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop footer removed per design request (ALL SYSTEMS OPERATIONAL / V2.4.0-STABLE) */}
      </section>

      <footer className="slate-auth-footer-mobile">
        <span>System Status: Online</span>
        <span>Terminal: POS-08-NYC</span>
      </footer>
    </main>
  );
};

export default Login;