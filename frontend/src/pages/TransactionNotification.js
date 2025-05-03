import React, { useState, useEffect } from 'react';
import './TransactionNotification.css';

const TransactionNotification = ({ show, type, data, onClose }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (show) {
      setVisible(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  
  if (!visible) return null;
  
  const isSuccess = data?.status === 'success';
  const title = type === 'sale' 
    ? 'New Sale Recorded' 
    : 'New Purchase Recorded';
    
  const getAmount = () => {
    if (!data?.amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(data.amount);
  };
  
  const getDescription = () => {
    if (type === 'sale') {
      return `Sale ${data?.id || ''} has been successfully recorded for ${getAmount()}.`;
    } else {
      return `Purchase ${data?.id || ''} has been successfully recorded for ${getAmount()}.`;
    }
  };

  return (
    <div className={`transaction-notification ${isSuccess ? 'success' : 'error'}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {isSuccess ? (
            <i className="fas fa-check-circle"></i>
          ) : (
            <i className="fas fa-exclamation-circle"></i>
          )}
        </div>
        
        <div className="notification-text">
          <h4>{title}</h4>
          <p>{getDescription()}</p>
          {data?.products && (
            <p className="product-summary">
              {`${data.products.length} ${data.products.length === 1 ? 'product' : 'products'}`}
            </p>
          )}
        </div>
      </div>
      
      <button className="close-btn" onClick={() => {
        setVisible(false);
        onClose();
      }}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default TransactionNotification;