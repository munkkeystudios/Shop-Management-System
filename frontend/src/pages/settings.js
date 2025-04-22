import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FiUpload } from 'react-icons/fi';
import './settings.css';

const Settings = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    currency: 'US Dollar',
    email: 'admin@example.com',
    companyName: 'Stocky',
    phone: '+123 456789',
    website: 'Verticalsols',
    systemName: 'Ultimate inventory with POS',
    language: 'English',
    defaultCustomer: 'Walk In Customer',
    warehouse: 'Warehouse 1',
    smsProvider: 'Twilio',
    timezone: 'UTC/GMT+00:00 - UTC'
  });

  // Data for dropdowns
  const currencies = ['US Dollar', 'Euro', 'British Pound', 'Japanese Yen'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese'];
  const customers = ['Walk In Customer', 'Regular Customer', 'Wholesale Customer'];
  const warehouses = ['Warehouse 1', 'Warehouse 2', 'Warehouse 3'];
  const smsProviders = ['Twilio', 'Nexmo', 'MessageBird'];
  const timezones = ['UTC/GMT+00:00 - UTC', 'UTC/GMT+01:00', 'UTC/GMT+02:00', 'UTC/GMT+03:00'];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // This would connect to backend when implemented
    console.log('Settings saved:', formData);
    // Show success message
    alert('Settings saved successfully!');
  };

  return (
    <Layout title="System Settings">
      <div className="settings-container">
        <div className="settings-header">
          <h1>System Settings</h1>
          <button className="save-button" onClick={handleSubmit}>
            Save Changes
          </button>
        </div>

        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="settings-section">
            <h2>General Settings</h2>
            <div className="settings-grid">
              <div className="form-group">
                <label>Currency</label>
                <select 
                  name="currency" 
                  value={formData.currency} 
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group logo-upload">
              <label>Company Logo</label>
              <div className="upload-container">
                <div className="upload-icon-container">
                  <FiUpload className="upload-icon" />
                </div>
                <div className="upload-text">
                  <p><span className="upload-link">Click to upload</span> or drag and drop</p>
                  <p className="upload-hint">SVG, PNG, JPG or GIF (Max 2 MB files are allowed)</p>
                </div>
              </div>
            </div>

            <div className="settings-grid three-columns">
              <div className="form-group">
                <label>Company Name</label>
                <input 
                  type="text" 
                  name="companyName" 
                  value={formData.companyName} 
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input 
                  type="text" 
                  name="website" 
                  value={formData.website} 
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2>System Settings</h2>
            <div className="settings-grid three-columns">
              <div className="form-group">
                <label>System Name</label>
                <input 
                  type="text" 
                  name="systemName" 
                  value={formData.systemName} 
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Language</label>
                <select 
                  name="language" 
                  value={formData.language} 
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {languages.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Default Customer</label>
                <select 
                  name="defaultCustomer" 
                  value={formData.defaultCustomer} 
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {customers.map(customer => (
                    <option key={customer} value={customer}>{customer}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="settings-grid three-columns">
              <div className="form-group">
                <label>Default Warehouse</label>
                <select 
                  name="warehouse" 
                  value={formData.warehouse} 
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {warehouses.map(warehouse => (
                    <option key={warehouse} value={warehouse}>{warehouse}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>SMS Provider</label>
                <select 
                  name="smsProvider" 
                  value={formData.smsProvider} 
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {smsProviders.map(provider => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <select 
                  name="timezone" 
                  value={formData.timezone} 
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {timezones.map(timezone => (
                    <option key={timezone} value={timezone}>{timezone}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2>Notification Settings</h2>
            <div className="settings-grid">
              <div className="form-group checkbox-group">
                <label className="checkbox-container">
                  <input type="checkbox" name="stockAlert" />
                  <span className="checkmark"></span>
                  Enable low stock alerts
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-container">
                  <input type="checkbox" name="emailNotifications" />
                  <span className="checkmark"></span>
                  Enable email notifications
                </label>
              </div>
            </div>

            <div className="settings-grid">
              <div className="form-group checkbox-group">
                <label className="checkbox-container">
                  <input type="checkbox" name="smsNotifications" />
                  <span className="checkmark"></span>
                  Enable SMS notifications
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-container">
                  <input type="checkbox" name="orderConfirmation" />
                  <span className="checkmark"></span>
                  Send order confirmation emails
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button">Cancel</button>
            <button type="submit" className="submit-button">Save Settings</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Settings; 