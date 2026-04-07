import React, { useState } from 'react';
import { loansAPI } from '../services/api';
import Layout from '../components/Layout';
import { useNotifications } from '../context/NotificationContext';
import './settings.css';
import '../styles/create_loan.css';

const CreateLoan = () => {
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    loanAmount: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email is invalid';
    }
    
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    }
    
    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = 'Address is required';
    }
    
    if (!formData.loanAmount) {
      newErrors.loanAmount = 'Loan amount is required';
    } else if (parseFloat(formData.loanAmount) <= 0) {
      newErrors.loanAmount = 'Loan amount must be greater than zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      loanAmount: '',
      notes: ''
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const loanData = {
      customer: {
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
        address: formData.customerAddress,
      },
      loanAmount: parseFloat(formData.loanAmount),
      notes: formData.notes,
    };

    try {
      const response = await loansAPI.create(loanData);
      const loanId = response.data.data._id;
      const loanNumber = response.data.data.loanNumber;
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(formData.loanAmount);

      // Add notification
      addNotification(
        'loan',
        `New loan #${loanNumber} created for ${formData.customerName} with amount ${formattedAmount}`,
        loanId
      );

      setSuccessMessage('Loan created successfully!');
      console.log('Loan created:', response.data);
      
      // Reset form fields
      resetForm();
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      console.error('Error creating loan:', err);
      setErrors(prev => ({
        ...prev,
        general: err.response?.data?.message || 'Failed to create loan'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Loan">
      <div className="slate-settings-page loan-page">
        <div className="slate-settings-wrap loan-main-stage">
          <div className="slate-main-header loan-context-header">
            <h2>Create New Loan</h2>
            <p className="loan-subheading">Enter high-precision transaction details for the architectural credit registry.</p>
          </div>

          {successMessage && (
            <div className="loan-success-banner" role="status">
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="loan-error-banner" role="alert">
              {errors.general}
            </div>
          )}

          <div className="loan-form-card">
            <form onSubmit={handleSubmit} className="loan-form-grid">
              <div className="loan-amount-section">
                <label htmlFor="loanAmount">Loan Principal Amount</label>
                <div className="loan-amount-input-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="loanAmount"
                    type="number"
                    name="loanAmount"
                    placeholder="0.00"
                    value={formData.loanAmount}
                    onChange={handleChange}
                    className={errors.loanAmount ? 'input-error' : ''}
                    autoComplete="off"
                  />
                </div>
                {errors.loanAmount && <p className="error-text">{errors.loanAmount}</p>}
                <p className="loan-amount-note">Architectural Note: Ensure principal matches station credit limits.</p>
              </div>

              <div className="loan-field-group">
                <label htmlFor="customerName">Enter Customer Name</label>
                <input
                  id="customerName"
                  type="text"
                  name="customerName"
                  placeholder="Full Legal Name"
                  value={formData.customerName}
                  onChange={handleChange}
                  className={`slate-input input-bottom-border ${errors.customerName ? 'slate-input-error' : ''}`}
                  autoComplete="off"
                />
                {errors.customerName && <p className="slate-error-message">{errors.customerName}</p>}
              </div>

              <div className="loan-field-group">
                <label htmlFor="customerEmail">Enter Customer Email</label>
                <input
                  id="customerEmail"
                  type="email"
                  name="customerEmail"
                  placeholder="name@precision-retail.com"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className={`slate-input input-bottom-border ${errors.customerEmail ? 'slate-input-error' : ''}`}
                  autoComplete="off"
                />
                {errors.customerEmail && <p className="slate-error-message">{errors.customerEmail}</p>}
              </div>

              <div className="loan-field-group">
                <label htmlFor="customerPhone">Enter Customer Phone</label>
                <input
                  id="customerPhone"
                  type="text"
                  name="customerPhone"
                  placeholder="+1 (000) 000-0000"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className={`slate-input input-bottom-border ${errors.customerPhone ? 'slate-input-error' : ''}`}
                  autoComplete="off"
                />
                {errors.customerPhone && <p className="slate-error-message">{errors.customerPhone}</p>}
              </div>

              <div className="loan-field-group">
                <label htmlFor="customerAddress">Enter Customer Address</label>
                <input
                  id="customerAddress"
                  type="text"
                  name="customerAddress"
                  placeholder="Architectural Physical Address"
                  value={formData.customerAddress}
                  onChange={handleChange}
                  className={`slate-input input-bottom-border ${errors.customerAddress ? 'slate-input-error' : ''}`}
                  autoComplete="off"
                />
                {errors.customerAddress && <p className="slate-error-message">{errors.customerAddress}</p>}
              </div>

              <div className="loan-field-group full-width">
                <label htmlFor="notes">Enter any additional notes</label>
                <textarea
                  id="notes"
                  rows={3}
                  name="notes"
                  placeholder="Specify collateral, internal references, or payment schedule milestones..."
                  value={formData.notes}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>

              <div className="loan-actions full-width">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Loan'}
                </button>
                <button
                  type="button"
                  className="discard-button"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Discard
                </button>
                <div className="secure-note">
                  <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                  Secure Slate Transaction
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateLoan;