import React, { useState, useRef, useEffect } from 'react';
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import '../styles/quantitybutton.css';

const QuantityButton = ({ item, handleQuantityChange, handleRemoveItem }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (isEditing && inputRef.current && item) { 
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, item]); 
  
  // Safely handle when item doesn't exist
  if (!item) {
    return null; 
  }
  
  const increment = () => {
    if (handleQuantityChange) {
      handleQuantityChange(item.id, item.quantity + 1);
    }
  };
  
  const decrement = () => {
    if (item.quantity > 1) {
      handleQuantityChange(item.id, item.quantity - 1);
    } else if (item.quantity === 1 && handleRemoveItem) {
      // Remove item when quantity reaches zero
      handleRemoveItem(item.id);
    }
  };
  
  const handleInputChange = (e) => {
    // Allow only numbers
    const value = e.target.value.replace(/[^\d]/g, '');
    setInputValue(value);
  };
  
  const handleInputBlur = () => {
    let newQuantity = parseInt(inputValue, 10);
    
    // Validate the input
    if (isNaN(newQuantity) || newQuantity === 0) {
      if (handleRemoveItem) {
        handleRemoveItem(item.id);
      }
    } else {
      if (handleQuantityChange) {
        handleQuantityChange(item.id, newQuantity);
      }
    }
    
    setIsEditing(false);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };
  
  const startEditing = () => {
    setInputValue(item.quantity.toString());
    setIsEditing(true);
  };
  
  // Format the count to always have 2 digits
  const formattedCount = item.quantity.toString().padStart(2, '0');
  
  return (
    <div className="quantity-control">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="quantity-input"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          maxLength={3}
        />
      ) : (
        <span 
          className="quantity-display"
          onClick={startEditing}
        >
          {formattedCount}
        </span>
      )}
      <div className="quantity-buttons">
        <button 
          onClick={increment}
          className="quantity-button"
          type="button"
          aria-label="Increase quantity"
        >
          <IoChevronUp size={14} />
        </button>
        <button 
          onClick={decrement}
          className="quantity-button"
          type="button"
          aria-label="Decrease quantity"
        >
          <IoChevronDown size={14} />
        </button>
      </div>
    </div>
  );
};

export default QuantityButton;