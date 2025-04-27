import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FiUpload, FiX, FiEdit, FiLink } from 'react-icons/fi';
import './settings.css';
import ModernDropdown, { ModernDropdownItem } from '../components/ModernDropdown';
import '../styles/dropdown.css';
import { useNotifications } from '../context/NotificationContext';
import { useSettings } from '../context/SettingsContext';

const GeneralSettings = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { settings: globalSettings, updateSettings, updateLogo } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

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
    if (isAdmin && globalSettings) {
      // Map global settings to local state
      const localSettings = {
        companyName: globalSettings.companyName || '',
        companyLogo: globalSettings.companyLogo || globalSettings.logoUrl || '',
        contactEmail: globalSettings.contactEmail || '',
        supportPhone: globalSettings.supportPhone || '',
        taxRate: globalSettings.defaultTaxRate || 0,
        currencyCode: globalSettings.currencyCode || 'USD',
        invoicePrefix: globalSettings.invoicePrefix || 'INV-',
        fiscalYear: {
          start: globalSettings.fiscalYearStart || '01-01',
          end: globalSettings.fiscalYearEnd || '12-31'
        },
        receiptFooter: globalSettings.receiptFooter || '',
        inventoryAlertThreshold: globalSettings.inventoryAlertThreshold || 10,
        pricingStrategy: globalSettings.pricingStrategy || 'fixed',
        enableOnlinePayments: globalSettings.enableOnlinePayments || false,
        paymentMethods: globalSettings.paymentMethods || ['cash', 'card'],
        enableDiscounts: globalSettings.enableDiscounts || true
      };

      setSettings(localSettings);
      setLoading(false);
    } else if (!isAdmin) {
      setLoading(false);
    }
  }, [isAdmin, globalSettings]);

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an image file (JPEG, PNG, GIF, SVG)');
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Use the updateLogo function from SettingsContext
      const result = await updateLogo(file);

      if (result.success) {
        // Update local state
        setSettings({
          ...settings,
          companyLogo: result.logoUrl
        });
        toast.success('Logo uploaded successfully');
      } else {
        toast.error(result.error || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Simulate file input change
      const fileInput = fileInputRef.current;
      if (fileInput) {
        // Create a new file list with the dropped file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(e.dataTransfer.files[0]);
        fileInput.files = dataTransfer.files;

        // Trigger the change event manually
        const changeEvent = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(changeEvent);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-active');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-active');
  };

  const removeLogo = () => {
    setSettings({
      ...settings,
      companyLogo: ''
    });
  };

  const toggleUrlInput = () => {
    setShowUrlInput(!showUrlInput);
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

      // Use the updateSettings function from SettingsContext
      const result = await updateSettings(generalSettings);

      if (result.success) {
        // Add notification
        addNotification(
          'settings',
          'General settings have been updated'
        );

        toast.success('General settings updated successfully');
      } else {
        toast.error(result.error || 'Failed to update settings');
      }
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
        {loading ? (
          <div className="loading-message">Loading general settings...</div>
        ) : (
          <div className="settings-sections-container">
            {/* Company Information Section */}
            <div className="settings-section-card settings-header-card">
              <div className="settings-header">
                <h1>General Settings</h1>
                <p className="settings-description">
                  Configure global application settings such as company information, financial settings, and inventory options
                </p>
              </div>
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
                  <label>Company Logo</label>
                  {!settings.companyLogo ? (
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/gif,image/svg+xml"
                        style={{ display: 'none' }}
                      />
                      <div
                        className="file-upload-container"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        onDrop={handleFileDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        <div className="upload-icon">
                          <FiUpload />
                        </div>
                        <div className="file-upload-text">
                          {uploading ? (
                            <>
                              <span className="upload-spinner"></span> Uploading...
                            </>
                          ) : (
                            <>
                              <strong>Click to upload</strong> or drag and drop
                            </>
                          )}
                        </div>
                        <div className="file-upload-hint">
                          SVG, PNG, JPG or GIF (max. 5MB)
                        </div>
                      </div>
                      <div className="url-input-container">
                        {showUrlInput ? (
                          <input
                            type="text"
                            name="companyLogo"
                            value={settings.companyLogo}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="https://example.com/logo.png"
                          />
                        ) : (
                          <button
                            type="button"
                            className="logo-url-button"
                            onClick={toggleUrlInput}
                          >
                            <FiLink /> Use logo URL instead
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="company-logo-preview">
                      <img
                        src={settings.companyLogo}
                        alt="Company Logo"
                        className="logo-image"
                      />
                      <div className="logo-controls">
                        <button
                          type="button"
                          className="logo-control-button logo-change-button"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        >
                          <FiEdit /> Change Logo
                        </button>
                        <button
                          type="button"
                          className="logo-control-button logo-url-button"
                          onClick={toggleUrlInput}
                        >
                          <FiLink /> Edit URL
                        </button>
                        <button
                          type="button"
                          className="logo-control-button logo-remove-button"
                          onClick={removeLogo}
                        >
                          <FiX /> Remove
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/gif,image/svg+xml"
                        style={{ display: 'none' }}
                      />
                      {showUrlInput && (
                        <div className="url-input-container">
                          <input
                            type="text"
                            name="companyLogo"
                            value={settings.companyLogo}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="https://example.com/logo.png"
                          />
                        </div>
                      )}
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
                    disabled={saving || uploading}
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
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
                    <div style={{ width: '100%', position: 'relative' }}>
                      <ModernDropdown
                        title={
                          <div style={{ width: '100%', justifyContent: 'space-between' }}>
                            {currencyOptions.find(opt => opt.value === settings.currencyCode)?.label || 'Select Currency'}
                          </div>
                        }
                      >
                        {currencyOptions.map(option => (
                          <ModernDropdownItem
                            key={option.value}
                            isActive={settings.currencyCode === option.value}
                            onClick={() => handleInputChange({ target: { name: 'currencyCode', value: option.value } })}
                          >
                            {option.label}
                          </ModernDropdownItem>
                        ))}
                      </ModernDropdown>
                    </div>
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
                    <div style={{ width: '100%', position: 'relative' }}>
                      <ModernDropdown
                        title={
                          <div style={{ width: '100%', justifyContent: 'space-between' }}>
                            {pricingStrategyOptions.find(opt => opt.value === settings.pricingStrategy)?.label || 'Select Strategy'}
                          </div>
                        }
                      >
                        {pricingStrategyOptions.map(option => (
                          <ModernDropdownItem
                            key={option.value}
                            isActive={settings.pricingStrategy === option.value}
                            onClick={() => handleInputChange({ target: { name: 'pricingStrategy', value: option.value } })}
                          >
                            {option.label}
                          </ModernDropdownItem>
                        ))}
                      </ModernDropdown>
                    </div>
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
                    {saving ? 'Saving...' : 'Save Settings'}
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
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>

            {/* Payment & Discount Settings Section */}
            <div className="settings-section-card">
              <h2>Payment & Discount Settings</h2>
              <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="enable-online-payments"
                      name="enableOnlinePayments"
                      checked={settings.enableOnlinePayments}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <label htmlFor="enable-online-payments">Enable Online Payments</label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Accepted Payment Methods</label>
                  <div className="checkbox-group-container">
                    {availablePaymentMethods.map(method => (
                      <div key={method.value} className="checkbox-group">
                        <input
                          type="checkbox"
                          id={`payment-${method.value}`}
                          checked={settings.paymentMethods.includes(method.value)}
                          onChange={() => handlePaymentMethodChange(method.value)}
                          className="form-checkbox"
                        />
                        <label htmlFor={`payment-${method.value}`}>{method.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="enable-discounts"
                      name="enableDiscounts"
                      checked={settings.enableDiscounts}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <label htmlFor="enable-discounts">Enable Discounts</label>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
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