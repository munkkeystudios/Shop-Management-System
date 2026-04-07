import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { settingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './settings.css';
import { useNotifications } from '../context/NotificationContext';

const DisplaySettings = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

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

    if (['tableRowsPerPage', 'fontScale'].includes(name)) {
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

  if (!hasAccess && !loading) {
    return <Navigate to="/dashboard" />;
  }

  const currencySymbolMap = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    INR: '₹',
    PKR: '₨'
  };

  const currencyLabel = currencyOptions.find(opt => opt.value === settings.currency)?.label || settings.currency;
  const formattedPreview = `${settings.currencyPosition === 'before' ? `${currencySymbolMap[settings.currency] || '$'} ` : ''}${(1450).toFixed(settings.decimalPlaces).replace('.', settings.decimalSeparator).replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousandsSeparator)}${settings.currencyPosition === 'after' ? ` ${currencySymbolMap[settings.currency] || '$'}` : ''}`;

  return (
    <Layout title="Display Settings">
      <div className="ds-page">
        {loading ? (
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
        ) : (
          <div className="ds-wrap">
            <div className="ds-head">
              <div>
                <h1>Display Settings</h1>
                <p className="settings-subheading">Configure terminal interface and localization preferences.</p>
              </div>
              <div className="ds-head-actions">
                <button type="button" className="ds-btn ds-btn-tertiary" onClick={fetchSettings}>Discard</button>
                <button type="button" className="ds-btn ds-btn-primary" onClick={handleSubmit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>

            <div className="ds-grid">
              <section className="ds-card ds-date-time">
                <div className="ds-title-row">
                  <span className="material-symbols-outlined">schedule</span>
                  <h2>Date and Time</h2>
                </div>

                <div className="ds-stack">
                  <div className="ds-group">
                    <label>Date Format</label>
                    <select name="dateFormat" value={settings.dateFormat} onChange={handleInputChange} className="ds-control">
                      {dateFormatOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ds-group">
                    <label>Time Format</label>
                    <select name="timeFormat" value={settings.timeFormat} onChange={handleInputChange} className="ds-control">
                      {timeFormatOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ds-group">
                    <label>Timezone</label>
                    <select name="timezone" value={settings.timezone} onChange={handleInputChange} className="ds-control">
                      {timezoneOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </section>

              <section className="ds-card ds-currency">
                <div className="ds-title-row">
                  <span className="material-symbols-outlined">payments</span>
                  <h2>Currency and Number Formatting</h2>
                </div>

                <div className="ds-split-grid">
                  <div className="ds-stack">
                    <div className="ds-group">
                      <label>Currency</label>
                      <select name="currency" value={settings.currency} onChange={handleInputChange} className="ds-control">
                        {currencyOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ds-group">
                      <label>Currency Position</label>
                      <select name="currencyPosition" value={settings.currencyPosition} onChange={handleInputChange} className="ds-control">
                        {currencyPositionOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ds-group">
                      <label>Decimal Places</label>
                      <input type="number" name="decimalPlaces" value={settings.decimalPlaces} onChange={handleInputChange} className="ds-control" min="0" max="4" />
                    </div>

                    <div className="ds-group">
                      <label>Decimal Separator</label>
                      <select name="decimalSeparator" value={settings.decimalSeparator} onChange={handleInputChange} className="ds-control">
                        {decimalSeparatorOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ds-group">
                      <label>Thousands Separator</label>
                      <select name="thousandsSeparator" value={settings.thousandsSeparator} onChange={handleInputChange} className="ds-control">
                        {thousandsSeparatorOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="ds-stack">
                    <div className="ds-group">
                      <label>Currency</label>
                      <select name="currency" value={settings.currency} onChange={handleInputChange} className="ds-control">
                        {currencyOptions.map(option => (
                          <option key={`secondary-${option.value}`} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ds-preview">
                      <p>Example Preview</p>
                      <strong>{formattedPreview}</strong>
                    </div>
                  </div>
                </div>

              </section>

              <section className="ds-card ds-interface">
                <div className="ds-title-row">
                  <span className="material-symbols-outlined">desktop_windows</span>
                  <h2>Interface Display Options</h2>
                </div>

                <div className="ds-two-col-grid">
                  <div className="ds-group">
                    <label>Language</label>
                    <select name="language" value={settings.language} onChange={handleInputChange} className="ds-control">
                      {languageOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ds-group">
                    <label>Default Rows Per Page</label>
                    <select name="tableRowsPerPage" value={settings.tableRowsPerPage} onChange={handleInputChange} className="ds-control">
                      {rowsPerPageOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ds-group">
                    <label>Color Scheme</label>
                    <select name="colorScheme" value={settings.colorScheme} onChange={handleInputChange} className="ds-control">
                      {colorSchemeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ds-group">
                    <label>Font Size</label>
                    <select name="fontScale" value={settings.fontScale} onChange={handleInputChange} className="ds-control">
                      {fontScaleOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ds-toggle-area">
                    <label className="ds-check-row">
                      <input type="checkbox" name="enableDarkMode" checked={settings.enableDarkMode} onChange={handleInputChange} />
                      <span>Enable Dark Mode (System sync preferred)</span>
                    </label>
                    <label className="ds-check-row">
                      <input type="checkbox" name="showGridLines" checked={settings.showGridLines} onChange={handleInputChange} />
                      <span>Show Grid Lines in Tables</span>
                    </label>
                  </div>
                </div>

              </section>

              <section className="ds-doc-stack">
                <div className="ds-card ds-doc-format">
                  <div className="ds-title-row">
                    <span className="material-symbols-outlined">description</span>
                    <h2>Document Formatting</h2>
                  </div>

                  <div className="ds-stack">
                    <div className="ds-group">
                      <label>Receipt Footer Text</label>
                      <textarea
                        name="receiptFooter"
                        value={settings.receiptFooter}
                        onChange={handleTextAreaChange}
                        className="ds-textarea"
                        rows="3"
                        placeholder="Thank you for your business. Visit us again!"
                      />
                    </div>

                    <div className="ds-group">
                      <label>Default Invoice Notes</label>
                      <textarea
                        name="invoiceNotes"
                        value={settings.invoiceNotes}
                        onChange={handleTextAreaChange}
                        className="ds-textarea"
                        rows="3"
                        placeholder="Terms: Net 30. Please include invoice number on all payments."
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
};

export default DisplaySettings;