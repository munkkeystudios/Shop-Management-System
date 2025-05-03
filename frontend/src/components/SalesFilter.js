import React, { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import './styles/SalesFilter.css';

const SalesFilter = ({ onApplyFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [activeFilters, setActiveFilters] = useState(0);

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const handleApplyFilters = () => {
    const filters = {
      startDate,
      endDate,
      paymentStatus,
      paymentMethod
    };
    
    // Count active filters
    let count = 0;
    if (startDate) count++;
    if (endDate) count++;
    if (paymentStatus) count++;
    if (paymentMethod) count++;
    setActiveFilters(count);
    
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setPaymentStatus('');
    setPaymentMethod('');
    setActiveFilters(0);
    
    onApplyFilters({
      startDate: '',
      endDate: '',
      paymentStatus: '',
      paymentMethod: ''
    });
  };

  return (
    <div className="sales-filter-container">
      <button 
        className={`sales-filter-button ${activeFilters > 0 ? 'active' : ''}`} 
        onClick={toggleFilter}
      >
        <FaFilter /> 
        Filter
        {activeFilters > 0 && (
          <span className="filter-badge">{activeFilters}</span>
        )}
      </button>

      {isOpen && (
        <div className="sales-filter-dropdown">
          <div className="sales-filter-header">
            <h3>Filter Sales</h3>
            <button className="close-filter-btn" onClick={toggleFilter}>
              <FaTimes />
            </button>
          </div>
          
          <div className="sales-filter-content">
            <div className="filter-group">
              <h4>Date Range</h4>
              <div className="date-inputs">
                <div className="filter-input">
                  <label htmlFor="start-date">Start Date</label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="filter-input">
                  <label htmlFor="end-date">End Date</label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="filter-group">
              <h4>Payment Status</h4>
              <div className="filter-options">
                <div className="filter-option">
                  <input
                    type="radio"
                    id="status-all"
                    name="payment-status"
                    checked={paymentStatus === ''}
                    onChange={() => setPaymentStatus('')}
                  />
                  <label htmlFor="status-all">All</label>
                </div>
                <div className="filter-option">
                  <input
                    type="radio"
                    id="status-paid"
                    name="payment-status"
                    checked={paymentStatus === 'paid'}
                    onChange={() => setPaymentStatus('paid')}
                  />
                  <label htmlFor="status-paid">Paid</label>
                </div>
                <div className="filter-option">
                  <input
                    type="radio"
                    id="status-partial"
                    name="payment-status"
                    checked={paymentStatus === 'partial'}
                    onChange={() => setPaymentStatus('partial')}
                  />
                  <label htmlFor="status-partial">Partial</label>
                </div>
                <div className="filter-option">
                  <input
                    type="radio"
                    id="status-pending"
                    name="payment-status"
                    checked={paymentStatus === 'pending'}
                    onChange={() => setPaymentStatus('pending')}
                  />
                  <label htmlFor="status-pending">Pending</label>
                </div>
              </div>
            </div>

            <div className="filter-group">
              <h4>Payment Method</h4>
              <div className="filter-options">
                <div className="filter-option">
                  <input
                    type="radio"
                    id="method-all"
                    name="payment-method"
                    checked={paymentMethod === ''}
                    onChange={() => setPaymentMethod('')}
                  />
                  <label htmlFor="method-all">All</label>
                </div>
                <div className="filter-option">
                  <input
                    type="radio"
                    id="method-cash"
                    name="payment-method"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                  />
                  <label htmlFor="method-cash">Cash</label>
                </div>
                <div className="filter-option">
                  <input
                    type="radio"
                    id="method-card"
                    name="payment-method"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <label htmlFor="method-card">Card</label>
                </div>
                <div className="filter-option">
                  <input
                    type="radio"
                    id="method-mobile"
                    name="payment-method"
                    checked={paymentMethod === 'mobile_payment'}
                    onChange={() => setPaymentMethod('mobile_payment')}
                  />
                  <label htmlFor="method-mobile">Mobile Payment</label>
                </div>
                <div className="filter-option">
                  <input
                    type="radio"
                    id="method-credit"
                    name="payment-method"
                    checked={paymentMethod === 'credit'}
                    onChange={() => setPaymentMethod('credit')}
                  />
                  <label htmlFor="method-credit">Credit</label>
                </div>
              </div>
            </div>
          </div>

          <div className="sales-filter-footer">
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              Clear Filters
            </button>
            <button className="apply-filters-btn" onClick={handleApplyFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesFilter;
