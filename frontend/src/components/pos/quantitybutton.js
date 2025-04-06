import React from 'react';
import { Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

const QuantityButton = ({ item, handleQuantityChange }) => {

  // Check if item exists before proceeding
  if (!item) {
    return null; 
  }

  const increment = () => {
    if (handleQuantityChange) {
      handleQuantityChange(item.id, item.quantity + 1);
    }
  };
  
  const decrement = () => {
    if (item.quantity > 1 && handleQuantityChange) {
      handleQuantityChange(item.id, item.quantity - 1);
    }
  };
  

  // Format the count to always have 2 digits
  const formattedCount = item.quantity.toString().padStart(2, '0');
  
  return (
    <div style={{ display: 'inline-block' }}>
      <div 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          //TODO: border should be EAECF0
          border: '1px solid #000000', 
          borderRadius: '4px',
          overflow: 'hidden',
          width: '85px'
        }}
      >
        <span 
          style={{ 
            padding: '5px 5px',
            fontSize: '14px',
            flexGrow: 1,
            textAlign: 'center'
          }}
        >
          {formattedCount}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid #EAECF0' }}>
          <button 
            onClick={increment}
            style={{ 
              border: 'none',
              background: 'none',
              padding: '2px 4px',
              cursor: 'pointer',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IoChevronUp size={16} />
          </button>
          <div style={{ borderTop: '1px solid #EAECF0', width: '100%' }}></div>
          <button 
            onClick={decrement}
            style={{ 
              border: 'none',
              background: 'none',
              padding: '2px 4px',
              cursor: 'pointer',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IoChevronDown size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuantityButton;