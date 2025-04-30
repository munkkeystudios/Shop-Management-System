import React, { useState } from 'react';
import { loansAPI } from '../services/api';
import Layout from '../components/Layout';
import { useNotifications } from '../context/NotificationContext';
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
      <div className="loan-container">
        {successMessage && (
          <div className="success-container">
            <div className="success-message">{successMessage}</div>
          </div>
        )}
        
        <div className="loan-form-container">
          <h2 className="form-title">Create New Loan</h2>
          
          {errors.general && (
            <div className="error-message-general">
              {errors.general}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="form-content">
            <div className="form-field">
              <input
                type="number"
                name="loanAmount"
                placeholder="Enter Loan Amount"
                value={formData.loanAmount}
                onChange={handleChange}
                className={errors.loanAmount ? "input-error" : ""}
                autoComplete="off"
              />
              {errors.loanAmount && <p className="error-text">{errors.loanAmount}</p>}
            </div>
            
            <div className="customer-section">
              <h3 className="section-title">Customer Details</h3>
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <input
                  type="text"
                  name="customerName"
                  placeholder="Enter Customer Name"
                  value={formData.customerName}
                  onChange={handleChange}
                  className={errors.customerName ? "input-error" : ""}
                  autoComplete="off"
                />
                {errors.customerName && <p className="error-text">{errors.customerName}</p>}
              </div>
              <div className="form-field">
                <input
                  type="email"
                  name="customerEmail"
                  placeholder="Enter Customer Email"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className={errors.customerEmail ? "input-error" : ""}
                  autoComplete="off"
                />
                {errors.customerEmail && <p className="error-text">{errors.customerEmail}</p>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <input
                  type="text"
                  name="customerPhone"
                  placeholder="Enter Customer Phone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className={errors.customerPhone ? "input-error" : ""}
                  autoComplete="off"
                />
                {errors.customerPhone && <p className="error-text">{errors.customerPhone}</p>}
              </div>
              <div className="form-field">
                <input
                  type="text"
                  name="customerAddress"
                  placeholder="Enter Customer Address"
                  value={formData.customerAddress}
                  onChange={handleChange}
                  className={errors.customerAddress ? "input-error" : ""}
                  autoComplete="off"
                />
                {errors.customerAddress && <p className="error-text">{errors.customerAddress}</p>}
              </div>
            </div>
            
            <div className="form-field">
              <textarea
                rows={3}
                name="notes"
                placeholder="Enter any additional notes"
                value={formData.notes}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Loan'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateLoan;