import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './settings.css';
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
    { value: 'loan', label: 'Loan' }
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

  const handleDiscard = () => {
    if (!globalSettings) return;

    setSettings({
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
    });
    setShowUrlInput(false);
    toast.info('Changes discarded');
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
    if (e) e.preventDefault();

    if (!settings.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    if (!settings.contactEmail.trim()) {
      toast.error('Contact email is required');
      return;
    }

    try {
      setSaving(true);

      const backendSettings = {
        companyName: settings.companyName,
        companyLogo: settings.companyLogo,
        logoUrl: settings.companyLogo,
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

      const result = await updateSettings(backendSettings);

      if (result.success) {
        toast.success('General settings saved successfully');
        addNotification('General settings updated successfully', 'success');
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <Layout>
        <div className="gs-page">
          <div className="products-loading-container">
            <div className="block-pulse">
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="gs-page">
        <main className="gs-main">
          <header className="gs-header">
            <div>
              <h1>General Settings</h1>
              <p className="settings-subheading">Configure terminal identity and global financial parameters.</p>
            </div>
            <button type="button" className="gs-save-top" onClick={handleSubmit} disabled={saving || uploading}>
              <span className="material-symbols-outlined">save</span>
              {saving ? 'Saving...' : 'Save Global Settings'}
            </button>
          </header>

          <div className="gs-grid">
            <section className="gs-card gs-company">
              <div className="gs-section-head">
                <span className="material-symbols-outlined">business</span>
                <h2>Company Information</h2>
              </div>

              <div className="gs-company-layout">
                <div className="gs-logo-side">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/gif,image/svg+xml"
                    style={{ display: 'none' }}
                  />

                  <div
                    className="gs-logo-box"
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {settings.companyLogo ? (
                      <img src={settings.companyLogo} alt="Company Logo" className="gs-logo-image" />
                    ) : (
                      <span className="material-symbols-outlined">domain</span>
                    )}
                  </div>

                  <div className="gs-logo-actions">
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Change Logo'}
                    </button>
                    <div className="gs-logo-actions-row">
                      <button type="button" onClick={toggleUrlInput}>Edit URL</button>
                      <button type="button" className="gs-danger-mini" onClick={removeLogo}>Remove</button>
                    </div>
                  </div>
                </div>

                <div className="gs-form-col">
                  <div className="gs-input-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={settings.companyName}
                      onChange={handleInputChange}
                      className="gs-input"
                      required
                    />
                  </div>

                  {showUrlInput && (
                    <div className="gs-input-group">
                      <label>Logo URL</label>
                      <input
                        type="text"
                        name="companyLogo"
                        value={settings.companyLogo}
                        onChange={handleInputChange}
                        className="gs-input"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  )}

                  <div className="gs-two-col">
                    <div className="gs-input-group">
                      <label>Contact Email</label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={settings.contactEmail}
                        onChange={handleInputChange}
                        className="gs-input"
                        placeholder="contact@fintrack.io"
                        required
                      />
                    </div>

                    <div className="gs-input-group">
                      <label>Support Phone</label>
                      <input
                        type="tel"
                        name="supportPhone"
                        value={settings.supportPhone}
                        onChange={handleInputChange}
                        className="gs-input"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="gs-card gs-inventory">
              <div className="gs-section-head">
                <span className="material-symbols-outlined">inventory</span>
                <h2>Inventory Settings</h2>
              </div>

              <div className="gs-inventory-box">
                <label>Low Stock Alert Threshold</label>
                <div className="gs-inventory-range">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    name="inventoryAlertThreshold"
                    value={settings.inventoryAlertThreshold}
                    onChange={handleInputChange}
                  />
                  <span>{settings.inventoryAlertThreshold}</span>
                </div>
                <p>Notifications will trigger when SKU counts fall below this global threshold.</p>
              </div>

              <button type="button" className="gs-secondary-btn" onClick={handleSubmit} disabled={saving}>
                Update Inventory Rules
              </button>
            </section>

            <section className="gs-card gs-financial">
              <div className="gs-section-head">
                <span className="material-symbols-outlined">payments</span>
                <h2>Financial Settings & Compliance</h2>
              </div>

              <div className="gs-financial-grid">
                <div className="gs-input-group">
                  <label>Tax Rate (%)</label>
                  <input
                    type="number"
                    name="taxRate"
                    value={settings.taxRate}
                    onChange={handleInputChange}
                    className="gs-input gs-input-strong"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                <div className="gs-input-group">
                  <label>Currency</label>
                  <select
                    name="currencyCode"
                    value={settings.currencyCode}
                    onChange={handleInputChange}
                    className="gs-select"
                  >
                    {currencyOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="gs-input-group">
                  <label>Invoice Prefix</label>
                  <input
                    type="text"
                    name="invoicePrefix"
                    value={settings.invoicePrefix}
                    onChange={handleInputChange}
                    className="gs-input"
                  />
                </div>

                <div className="gs-input-group">
                  <label>Pricing Strategy</label>
                  <select
                    name="pricingStrategy"
                    value={settings.pricingStrategy}
                    onChange={handleInputChange}
                    className="gs-select"
                  >
                    {pricingStrategyOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="gs-fiscal-row">
                <div className="gs-input-group">
                  <label>Fiscal Year Start</label>
                  <input
                    type="text"
                    name="fiscalYear.start"
                    value={settings.fiscalYear.start}
                    onChange={handleInputChange}
                    className="gs-input gs-center"
                    placeholder="MM-DD"
                    pattern="\d{2}-\d{2}"
                  />
                </div>

                <div className="gs-input-group">
                  <label>Fiscal Year End</label>
                  <input
                    type="text"
                    name="fiscalYear.end"
                    value={settings.fiscalYear.end}
                    onChange={handleInputChange}
                    className="gs-input gs-center"
                    placeholder="MM-DD"
                    pattern="\d{2}-\d{2}"
                  />
                </div>

                <div className="gs-input-group gs-span-2">
                  <label>Receipt Footer Text</label>
                  <textarea
                    name="receiptFooter"
                    value={settings.receiptFooter}
                    onChange={handleInputChange}
                    className="gs-textarea"
                    rows="3"
                    placeholder="Thank you for shopping with us!"
                  />
                </div>
              </div>
            </section>

            <section className="gs-card gs-payments">
              <div className="gs-section-head">
                <span className="material-symbols-outlined">credit_card</span>
                <h2>Payment & Promotion Logic</h2>
              </div>

              <div className="gs-payments-grid">
                <div className="gs-toggle-stack">
                  <label className="gs-toggle-card gs-toggle-emphasis">
                    <input
                      type="checkbox"
                      id="enable-online-payments"
                      name="enableOnlinePayments"
                      checked={settings.enableOnlinePayments}
                      onChange={handleInputChange}
                    />
                    <div>
                      <strong>Enable Online Payments</strong>
                      <span>Process digital gateway transactions</span>
                    </div>
                  </label>

                  <label className="gs-toggle-card">
                    <input
                      type="checkbox"
                      id="enable-discounts"
                      name="enableDiscounts"
                      checked={settings.enableDiscounts}
                      onChange={handleInputChange}
                    />
                    <div>
                      <strong>Enable Discounts</strong>
                      <span>Allow manual & automated price reductions</span>
                    </div>
                  </label>
                </div>

                <div className="gs-methods-panel">
                  <label>Accepted Payment Methods</label>
                  <div className="gs-methods-grid">
                    {availablePaymentMethods.map(method => (
                      <label key={method.value} className="gs-method-item">
                        <div>
                          <span className="material-symbols-outlined">
                            {method.value === 'cash' ? 'payments' : method.value === 'card' ? 'credit_card' : 'account_balance_wallet'}
                          </span>
                          <span>{method.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.paymentMethods.includes(method.value)}
                          onChange={() => handlePaymentMethodChange(method.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <footer className="gs-footer">
            <div className="gs-footer-actions">
              <button type="button" onClick={handleDiscard}>Discard Changes</button>
              <button type="button" onClick={handleSubmit} disabled={saving || uploading}>
                {saving ? 'Saving...' : 'Final Commit'}
              </button>
            </div>
          </footer>
        </main>
      </div>
    </Layout>
  );
};

export default GeneralSettings;