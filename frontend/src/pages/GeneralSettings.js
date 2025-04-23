import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { settingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './settings.css';

const GeneralSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Check if user is admin
  const isAdmin = user && user.role === 'admin';

  // State for general app settings
  const [settings, setSettings] = useState({
    companyName: '',
    companyLogo: '',
    contactEmail: '',
    supportPhone: '',
    taxRate: 0,
    currencyCode: 'USD',
    invoicePrefix: 'INV-',
    fiscalYear: {
      start: '01-01',
      end: '12-31'
    },
    receiptFooter: '',
    inventoryAlertThreshold: 10,
    pricingStrategy: 'fixed',
    enableOnlinePayments: true,
    paymentMethods: ['cash', 'card'],
    enableDiscounts: true
  });

  // Currency options
  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'PKR', label: 'Pakistani Rupee (₨)' }
  ];

  // Pricing strategy options
  const pricingStrategyOptions = [
    { value: 'fixed', label: 'Fixed Pricing' }
  ];

  // Payment method options
  const availablePaymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'online', label: 'Online Payment' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'mobile', label: 'Mobile Payment' }
  ];

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getGeneralSettings();
      if (response.data) {
        // Filter only general settings from the response
        const generalSettings = {
          companyName: response.data.companyName || '',
          companyLogo: response.data.companyLogo || response.data.logoUrl || '',
          contactEmail: response.data.contactEmail || '',
          supportPhone: response.data.supportPhone || '',
          taxRate: response.data.defaultTaxRate || 0,
          currencyCode: response.data.currencyCode || 'USD',
          invoicePrefix: response.data.invoicePrefix || 'INV-',
          fiscalYear: {
            start: response.data.fiscalYearStart || '01-01',
            end: response.data.fiscalYearEnd || '12-31'
          },
          receiptFooter: response.data.receiptFooter || '',
          inventoryAlertThreshold: response.data.inventoryAlertThreshold || 10,
          pricingStrategy: response.data.pricingStrategy || 'fixed',
          enableOnlinePayments: response.data.enableOnlinePayments || false,
          paymentMethods: response.data.paymentMethods || ['cash', 'card'],
          enableDiscounts: response.data.enableDiscounts || true
        };
        
        setSettings(prevSettings => ({
          ...prevSettings,
          ...generalSettings
        }));
      }
    } catch (error) {
      console.error('Error fetching general settings:', error);
      toast.error('Failed to load general settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested fiscal year fields
    if (name.startsWith('fiscalYear.')) {
      const fiscalYearField = name.split('.')[1];
      setSettings({
        ...settings,
        fiscalYear: {
          ...settings.fiscalYear,
          [fiscalYearField]: value
        }
      });
      return;
    }
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      setSettings({
        ...settings,
        [name]: checked
      });
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      setSettings({
        ...settings,
        [name]: parseFloat(value)
      });
      return;
    }
    
    // Handle text inputs
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handlePaymentMethodChange = (method) => {
    const updatedMethods = [...settings.paymentMethods];
    
    if (updatedMethods.includes(method)) {
      // Remove method if already selected
      const index = updatedMethods.indexOf(method);
      updatedMethods.splice(index, 1);
    } else {
      // Add method if not already selected
      updatedMethods.push(method);
    }
    
    setSettings({
      ...settings,
      paymentMethods: updatedMethods
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Only administrators can update general settings');
      return;
    }
    
    try {
      setSaving(true);
      
      // Map settings to match backend schema
      const generalSettings = {
        companyName: settings.companyName,
        companyLogo: settings.companyLogo,
        logoUrl: settings.companyLogo, // For backward compatibility
        contactEmail: settings.contactEmail,
        supportPhone: settings.supportPhone,
        defaultTaxRate: settings.taxRate,
        currencyCode: settings.currencyCode,
        invoicePrefix: settings.invoicePrefix,
        fiscalYearStart: settings.fiscalYear.start,
        fiscalYearEnd: settings.fiscalYear.end,
        receiptFooter: settings.receiptFooter,
        inventoryAlertThreshold: settings.inventoryAlertThreshold,
        pricingStrategy: settings.pricingStrategy,
        enableOnlinePayments: settings.enableOnlinePayments,
        paymentMethods: settings.paymentMethods,
        enableDiscounts: settings.enableDiscounts
      };
      
      await settingsAPI.updateGeneralSettings(generalSettings);
      toast.success('General settings updated successfully');
    } catch (error) {
      console.error('Error updating general settings:', error);
      toast.error('Failed to update general settings');
    } finally {
      setSaving(false);
    }
  };

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout title="General Settings">
      <div className="settings-container">
        <div className="settings-header">
          <h1>General Settings</h1>
          <p className="settings-description">
            Configure global application settings. Only administrators can access this page.
          </p>
        </div>

        {loading ? (
          <div className="loading-message">Loading general settings...</div>
        ) : (
          <div className="settings-sections-container">
            {/* Company Information Section */}
            <div className="settings-section-card">
              <h2>Company Information</h2>
              <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={settings.companyName}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Company Logo URL</label>
                  <input
                    type="text"
                    name="companyLogo"
                    value={settings.companyLogo}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://example.com/logo.png"
                  />
                  {settings.companyLogo && (
                    <div className="logo-preview">
                      <img src={settings.companyLogo} alt="Company Logo Preview" />
                    </div>
                  )}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={settings.contactEmail}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Support Phone</label>
                    <input
                      type="tel"
                      name="supportPhone"
                      value={settings.supportPhone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Company Information'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Financial Settings Section */}
            <div className="settings-section-card">
              <h2>Financial Settings</h2>
              <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tax Rate (%)</label>
                    <input
                      type="number"
                      name="taxRate"
                      value={settings.taxRate}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      name="currencyCode"
                      value={settings.currencyCode}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {currencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Invoice Prefix</label>
                    <input
                      type="text"
                      name="invoicePrefix"
                      value={settings.invoicePrefix}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Pricing Strategy</label>
                    <select
                      name="pricingStrategy"
                      value={settings.pricingStrategy}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {pricingStrategyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Fiscal Year</label>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start (MM-DD)</label>
                      <input
                        type="text"
                        name="fiscalYear.start"
                        value={settings.fiscalYear.start}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="MM-DD"
                        pattern="\d{2}-\d{2}"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>End (MM-DD)</label>
                      <input
                        type="text"
                        name="fiscalYear.end"
                        value={settings.fiscalYear.end}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="MM-DD"
                        pattern="\d{2}-\d{2}"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Receipt Footer Text</label>
                  <textarea
                    name="receiptFooter"
                    value={settings.receiptFooter}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Thank you for shopping with us!"
                  />
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Financial Settings'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Inventory Settings Section */}
            <div className="settings-section-card">
              <h2>Inventory Settings</h2>
              <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    name="inventoryAlertThreshold"
                    value={settings.inventoryAlertThreshold}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                  />
                  <div className="input-hint">
                    Alert will be triggered when stock falls below this quantity
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Inventory Settings'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Payment & Discount Settings Section */}
            <div className="settings-section-card">
              <h2>Payment & Discount Settings</h2>
              <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="enableOnlinePayments"
                      checked={settings.enableOnlinePayments}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    Enable Online Payments
                  </label>
                </div>
                
                <div className="form-group">
                  <label>Accepted Payment Methods</label>
                  <div className="checkbox-group-container">
                    {availablePaymentMethods.map(method => (
                      <div key={method.value} className="checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={settings.paymentMethods.includes(method.value)}
                            onChange={() => handlePaymentMethodChange(method.value)}
                            className="form-checkbox"
                          />
                          {method.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="enableDiscounts"
                      checked={settings.enableDiscounts}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    Enable Discounts
                  </label>
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Payment & Discount Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GeneralSettings; 