import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { settingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './settings.css';
import ModernDropdown, { ModernDropdownItem } from '../components/ModernDropdown';
import '../styles/dropdown.css';
import { useNotifications } from '../context/NotificationContext';

const DisplaySettings = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedDateFormat, setSelectedDateFormat] = useState(null);

  // Display settings state
  const [settings, setSettings] = useState({
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12hour',
    timezone: 'UTC',
    currency: 'USD',
    currencyPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
    language: 'en',
    tableRowsPerPage: 10,
    enableDarkMode: false,
    colorScheme: 'blue',
    showGridLines: true,
    fontScale: 1.0,
    receiptFooter: '',
    invoiceNotes: ''
  });

  // Available options
  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK/EU)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' },
    { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' }
  ];

  const timeFormatOptions = [
    { value: '12hour', label: '12-hour (1:30 PM)' },
    { value: '24hour', label: '24-hour (13:30)' }
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Karachi', label: 'Pakistan (PKT)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Asia/Tokyo', label: 'Japan (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'JPY', label: 'Japanese Yen (JPY)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
    { value: 'AUD', label: 'Australian Dollar (AUD)' },
    { value: 'INR', label: 'Indian Rupee (INR)' },
    { value: 'PKR', label: 'Pakistani Rupee (PKR)' }
  ];

  const currencyPositionOptions = [
    { value: 'before', label: 'Before amount ($100)' },
    { value: 'after', label: 'After amount (100$)' }
  ];

  const decimalSeparatorOptions = [
    { value: '.', label: 'Period (.)' },
    { value: ',', label: 'Comma (,)' }
  ];

  const thousandsSeparatorOptions = [
    { value: ',', label: 'Comma (,)' },
    { value: '.', label: 'Period (.)' },
    { value: ' ', label: 'Space ( )' },
    { value: '', label: 'None' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'ur', label: 'Urdu' }
  ];

  const rowsPerPageOptions = [
    { value: 5, label: '5 rows' },
    { value: 10, label: '10 rows' },
    { value: 15, label: '15 rows' },
    { value: 20, label: '20 rows' },
    { value: 25, label: '25 rows' },
    { value: 50, label: '50 rows' },
    { value: 100, label: '100 rows' }
  ];

  const colorSchemeOptions = [
    { value: 'blue', label: 'Blue (Default)' },
    { value: 'green', label: 'Green' },
    { value: 'purple', label: 'Purple' },
    { value: 'orange', label: 'Orange' },
    { value: 'red', label: 'Red' },
    { value: 'teal', label: 'Teal' },
    { value: 'indigo', label: 'Indigo' }
  ];

  const fontScaleOptions = [
    { value: 0.8, label: 'Small (80%)' },
    { value: 0.9, label: 'Medium Small (90%)' },
    { value: 1.0, label: 'Normal (100%)' },
    { value: 1.1, label: 'Medium Large (110%)' },
    { value: 1.2, label: 'Large (120%)' },
    { value: 1.3, label: 'Extra Large (130%)' }
  ];

  useEffect(() => {
    // Check if user is manager or admin
    if (user && (user.role === 'manager' || user.role === 'admin')) {
      setHasAccess(true);
      fetchSettings();
    } else {
      setHasAccess(false);
      setLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getDisplaySettings();
      if (response.data) {
        // Filter only display-related settings from the response
        const displaySettings = {
          dateFormat: response.data.dateFormat || 'MM/DD/YYYY',
          timeFormat: response.data.timeFormat || '12hour',
          timezone: response.data.timezone || 'UTC',
          currency: response.data.currencyCode || 'USD',
          currencyPosition: response.data.currencyPosition || 'before',
          decimalSeparator: response.data.decimalSeparator || '.',
          thousandsSeparator: response.data.thousandsSeparator || ',',
          decimalPlaces: response.data.decimalPlaces || 2,
          language: response.data.language || 'en',
          tableRowsPerPage: response.data.tableRowsPerPage || 10,
          enableDarkMode: response.data.enableDarkMode || false,
          colorScheme: response.data.colorScheme || 'blue',
          showGridLines: response.data.showGridLines || true,
          fontScale: response.data.fontScale || 1.0,
          receiptFooter: response.data.receiptFooter || '',
          invoiceNotes: response.data.invoiceNotes || ''
        };

        setSettings(prevSettings => ({
          ...prevSettings,
          ...displaySettings
        }));
      }
    } catch (error) {
      console.error('Error fetching display settings:', error);
      toast.error('Failed to load display settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setSettings({
        ...settings,
        [name]: checked
      });
      return;
    }

    if (type === 'number') {
      setSettings({
        ...settings,
        [name]: parseFloat(value)
      });
      return;
    }

    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleTextAreaChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasAccess) {
      toast.error('You do not have permission to update display settings');
      return;
    }

    try {
      setSaving(true);

      // Only send display-related settings to avoid overwriting other settings
      const displaySettings = {
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
        timezone: settings.timezone,
        currencyCode: settings.currency, // Map to backend field name
        currencyPosition: settings.currencyPosition,
        decimalSeparator: settings.decimalSeparator,
        thousandsSeparator: settings.thousandsSeparator,
        decimalPlaces: settings.decimalPlaces,
        language: settings.language,
        tableRowsPerPage: settings.tableRowsPerPage,
        enableDarkMode: settings.enableDarkMode,
        colorScheme: settings.colorScheme,
        showGridLines: settings.showGridLines,
        fontScale: settings.fontScale,
        receiptFooter: settings.receiptFooter,
        invoiceNotes: settings.invoiceNotes
      };

      await settingsAPI.updateDisplaySettings(displaySettings);

      // Add notification
      addNotification(
        'settings',
        'Display settings have been updated'
      );

      toast.success('Display settings saved successfully');
    } catch (error) {
      console.error('Error saving display settings:', error);
      toast.error('Failed to save display settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDateFormatChange = (value, label) => {
    setSelectedDateFormat(label);
    setSettings({
      ...settings,
      dateFormat: value
    });
  };

  if (!hasAccess && !loading) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Layout title="Display Settings">
      <div className="settings-container">
        {loading ? (
          <div className="loading-message">Loading display settings...</div>
        ) : (
          <div className="settings-sections-container">
            {/* Date and Time */}
            <div className="settings-section-card settings-header-card">
              <div className="settings-header">
                <h1>Display Settings</h1>
                <p className="settings-description">
                  Configure date formats, time formats, and other display preferences
                </p>
              </div>
              <h2>Date and Time</h2>
              <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date Format</label>
                    <div style={{ width: '100%', position: 'relative' }}>
                      <ModernDropdown
                        title={
                          <div style={{ width: '100%', justifyContent: 'space-between' }}>
                            {selectedDateFormat || dateFormatOptions.find(opt => opt.value === settings.dateFormat)?.label || 'Select Date Format'}
                          </div>
                        }
                      >
                        {dateFormatOptions.map(option => (
                          <ModernDropdownItem
                            key={option.value}
                            isActive={settings.dateFormat === option.value}
                            onClick={() => handleDateFormatChange(option.value, option.label)}
                          >
                            {option.label}
                          </ModernDropdownItem>
                        ))}
                      </ModernDropdown>
                    </div>
                    <div className="input-hint">
                      Example: {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Time Format</label>
                    <div style={{ width: '100%', position: 'relative' }}>
                      <ModernDropdown
                        title={
                          <div style={{ width: '100%', justifyContent: 'space-between' }}>
                            {timeFormatOptions.find(opt => opt.value === settings.timeFormat)?.label || 'Select Time Format'}
                          </div>
                        }
                      >
                        {timeFormatOptions.map(option => (
                          <ModernDropdownItem
                            key={option.value}
                            isActive={settings.timeFormat === option.value}
                            onClick={() => handleInputChange({ target: { name: 'timeFormat', value: option.value } })}
                          >
                            {option.label}
                          </ModernDropdownItem>
                        ))}
                      </ModernDropdown>
                    </div>
                    <div className="input-hint">
                      Example: {settings.timeFormat === '12hour'
                        ? new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                        : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Timezone</label>
                  <div style={{ width: '100%', position: 'relative' }}>
                    <ModernDropdown
                      title={
                        <div style={{ width: '100%', justifyContent: 'space-between' }}>
                          {timezoneOptions.find(opt => opt.value === settings.timezone)?.label || 'Select Timezone'}
                        </div>
                      }
                    >
                      {timezoneOptions.map(option => (
                        <ModernDropdownItem
                          key={option.value}
                          isActive={settings.timezone === option.value}
                          onClick={() => handleInputChange({ target: { name: 'timezone', value: option.value } })}
                        >
                          {option.label}
                        </ModernDropdownItem>
                      ))}
                    </ModernDropdown>
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

            {/* Currency and Number Formatting */}
            <div className="settings-section-card">
              <h2>Currency and Number Formatting</h2>
              <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Currency</label>
                    <div style={{ width: '100%', position: 'relative' }}>
                      <ModernDropdown
                        title={
                          <div style={{ width: '100%', justifyContent: 'space-between' }}>
                            {currencyOptions.find(opt => opt.value === settings.currency)?.label || 'Select Currency'}
                          </div>
                        }
                      >
                        {currencyOptions.map(option => (
                          <ModernDropdownItem
                            key={option.value}
                            isActive={settings.currency === option.value}
                            onClick={() => handleInputChange({ target: { name: 'currency', value: option.value } })}
                          >
                            {option.label}
                          </ModernDropdownItem>
                        ))}
                      </ModernDropdown>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Currency Position</label>
                    <div style={{ width: '100%', position: 'relative' }}>
                      <ModernDropdown
                        title={
                          <div style={{ width: '100%', justifyContent: 'space-between' }}>
                            {currencyPositionOptions.find(opt => opt.value === settings.currencyPosition)?.label || 'Select Position'}
                          </div>
                        }
                      >
                        {currencyPositionOptions.map(option => (
                          <ModernDropdownItem
                            key={option.value}
                            isActive={settings.currencyPosition === option.value}
                            onClick={() => handleInputChange({ target: { name: 'currencyPosition', value: option.value } })}
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
                    <label>Decimal Separator</label>
                    <div style={{ width: '100%', position: 'relative' }}>
                      <ModernDropdown
                        title={
                          <div style={{ width: '100%', justifyContent: 'space-between' }}>
                            {decimalSeparatorOptions.find(opt => opt.value === settings.decimalSeparator)?.label || 'Select Separator'}
                          </div>
                        }
                      >
                        {decimalSeparatorOptions.map(option => (
                          <ModernDropdownItem
                            key={option.value}
                            isActive={settings.decimalSeparator === option.value}
                            onClick={() => handleInputChange({ target: { name: 'decimalSeparator', value: option.value } })}
                          >
                            {option.label}
                          </ModernDropdownItem>
                        ))}
                      </ModernDropdown>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Thousands Separator</label>
                    <div style={{ width: '100%', position: 'relative' }}>
                      <ModernDropdown
                        title={
                          <div style={{ width: '100%', justifyContent: 'space-between' }}>
                            {thousandsSeparatorOptions.find(opt => opt.value === settings.thousandsSeparator)?.label || 'Select Separator'}
                          </div>
                        }
                      >
                        {thousandsSeparatorOptions.map(option => (
                          <ModernDropdownItem
                            key={option.value}
                            isActive={settings.thousandsSeparator === option.value}
                            onClick={() => handleInputChange({ target: { name: 'thousandsSeparator', value: option.value } })}
                          >
                            {option.label}
                          </ModernDropdownItem>
                        ))}
                      </ModernDropdown>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Decimal Places</label>
                  <input
                    type="number"
                    name="decimalPlaces"
                    value={settings.decimalPlaces}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                    max="4"
                  />
                  <div className="input-hint">
                    Example: {(1234.56789).toFixed(settings.decimalPlaces).replace('.', settings.decimalSeparator).replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousandsSeparator)}
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

            {/* Interface Display Options */}
            <div className="settings-section-card">
              <h2>Interface Display Options</h2>
              <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Language</label>
                    <div style={{ width: '100%', position: 'relative' }}>
                      <ModernDropdown
                        title={
                          <div style={{ width: '100%', justifyContent: 'space-between' }}>
                            {languageOptions.find(opt => opt.value === settings.language)?.label || 'Select Language'}
                          </div>
                        }
                      >
                        {languageOptions.map(option => (
                          <ModernDropdownItem
                            key={option.value}
                            isActive={settings.language === option.value}
                            onClick={() => handleInputChange({ target: { name: 'language', value: option.value } })}
                          >
                            {option.label}
                          </ModernDropdownItem>
                        ))}
                      </ModernDropdown>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Default Rows Per Page</label>
                    <div style={{ width: '100%', position: 'relative' }}>
                      <ModernDropdown
                        title={
                          <div style={{ width: '100%', justifyContent: 'space-between' }}>
                            {rowsPerPageOptions.find(opt => opt.value === settings.tableRowsPerPage)?.label || 'Select Rows Per Page'}
                          </div>
                        }
                      >
                        {rowsPerPageOptions.map(option => (
                          <ModernDropdownItem
                            key={option.value}
                            isActive={settings.tableRowsPerPage === option.value}
                            onClick={() => handleInputChange({ target: { name: 'tableRowsPerPage', value: option.value } })}
                          >
                            {option.label}
                          </ModernDropdownItem>
                        ))}
                      </ModernDropdown>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="enable-dark-mode"
                      name="enableDarkMode"
                      checked={settings.enableDarkMode}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <label htmlFor="enable-dark-mode">Enable Dark Mode</label>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Color Scheme</label>
                    <div style={{ width: '100%', position: 'relative' }}>
                      <ModernDropdown
                        title={
                          <div style={{ width: '100%', justifyContent: 'space-between' }}>
                            {colorSchemeOptions.find(opt => opt.value === settings.colorScheme)?.label || 'Select Color Scheme'}
                          </div>
                        }
                      >
                        {colorSchemeOptions.map(option => (
                          <ModernDropdownItem
                            key={option.value}
                            isActive={settings.colorScheme === option.value}
                            onClick={() => handleInputChange({ target: { name: 'colorScheme', value: option.value } })}
                          >
                            {option.label}
                          </ModernDropdownItem>
                        ))}
                      </ModernDropdown>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Font Size</label>
                    <div style={{ width: '100%', position: 'relative' }}>
                      <ModernDropdown
                        title={
                          <div style={{ width: '100%', justifyContent: 'space-between' }}>
                            {fontScaleOptions.find(opt => opt.value === settings.fontScale)?.label || 'Select Font Size'}
                          </div>
                        }
                      >
                        {fontScaleOptions.map(option => (
                          <ModernDropdownItem
                            key={option.value}
                            isActive={settings.fontScale === option.value}
                            onClick={() => handleInputChange({ target: { name: 'fontScale', value: option.value } })}
                          >
                            {option.label}
                          </ModernDropdownItem>
                        ))}
                      </ModernDropdown>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="show-grid-lines"
                      name="showGridLines"
                      checked={settings.showGridLines}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <label htmlFor="show-grid-lines">Show Grid Lines in Tables</label>
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

            {/* Document Formatting */}
            <div className="settings-section-card">
              <h2>Document Formatting</h2>
              <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Receipt Footer Text</label>
                  <textarea
                    name="receiptFooter"
                    value={settings.receiptFooter}
                    onChange={handleTextAreaChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Thank you for your business!"
                  />
                  <div className="input-hint">
                    This text will appear at the bottom of all receipts
                  </div>
                </div>

                <div className="form-group">
                  <label>Default Invoice Notes</label>
                  <textarea
                    name="invoiceNotes"
                    value={settings.invoiceNotes}
                    onChange={handleTextAreaChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Payment due within 30 days."
                  />
                  <div className="input-hint">
                    These notes will be pre-filled on all new invoices
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

export default DisplaySettings;