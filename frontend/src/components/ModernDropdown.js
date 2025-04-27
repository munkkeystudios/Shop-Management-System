import React, { useState } from 'react';
import '../styles/dropdown.css';

/**
 * ModernDropdownItem - Item component for the ModernDropdown
 */
export const ModernDropdownItem = ({ children, isActive, onClick, className = '' }) => {
  return (
    <div
      className={`sidebar-dropdown-item ${isActive ? 'active' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

/**
 * ModernDropdown - A dropdown component with a modern design
 */
const ModernDropdown = ({ title, children, isActive, headerColor = '#ffffff', className = '', style = {} }) => {
  // Initialize isOpen based on isActive prop
  const [isOpen, setIsOpen] = useState(isActive);

  // Update isOpen when isActive changes
  React.useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  return (
    <div className={`sidebar-dropdown ${className} ${isActive ? 'active' : ''}`} style={style}>
      <div
        className={`sidebar-dropdown-header ${isActive ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: isActive ? '#f0f8f4' : headerColor }}
      >
        <div className="sidebar-dropdown-title">
          {title}
        </div>
        <span className={`sidebar-dropdown-icon ${isOpen ? 'open' : ''}`}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {isOpen && (
        <div className="sidebar-dropdown-content">
          <div className="sidebar-dropdown-content-inner">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDropdown;