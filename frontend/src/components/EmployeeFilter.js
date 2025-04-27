import React, { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import './EmployeeFilter.css';

const EmployeeFilter = ({ onApplyFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [activeFilters, setActiveFilters] = useState(0);

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const handleApplyFilters = () => {
    const filters = {
      role,
      status
    };
    
    // Count active filters
    let count = 0;
    if (role) count++;
    if (status) count++;
    setActiveFilters(count);
    
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setRole('');
    setStatus('');
    setActiveFilters(0);
    
    onApplyFilters({
      role: '',
      status: ''
    });
  };

  return (
    <div className="employee-filter-container">
      <button 
        className={`employee-filter-button ${activeFilters > 0 ? 'active' : ''}`} 
        onClick={toggleFilter}
      >
        <FaFilter /> 
        Filter
        {activeFilters > 0 && (
          <span className="filter-badge">{activeFilters}</span>
        )}
      </button>

      {isOpen && (
        <div className="employee-filter-dropdown">
          <div className="employee-filter-header">
            <h3>Filter Employees</h3>
            <button className="close-filter-btn" onClick={toggleFilter}>
              <FaTimes />
            </button>
          </div>
          
          <div className="employee-filter-content">
            <div className="filter-group">
              <h4>Role</h4>
              <div className="filter-options">
                <div className="filter-option">
                  <input
                    type="radio"
                    id="role-all"
                    name="role"
                    checked={role === ''}
                    onChange={() => setRole('')}
                  />
                  <label htmlFor="role-all">All</label>
                </div>
                <div className="filter-option">
                  <input
                    type="radio"
                    id="role-cashier"
                    name="role"
                    checked={role === 'cashier'}
                    onChange={() => setRole('cashier')}
                  />
                  <label htmlFor="role-cashier">Cashier</label>
                </div>
                <div className="filter-option">
                  <input
                    type="radio"
                    id="role-manager"
                    name="role"
                    checked={role === 'manager'}
                    onChange={() => setRole('manager')}
                  />
                  <label htmlFor="role-manager">Manager</label>
                </div>
              </div>
            </div>

            <div className="filter-group">
              <h4>Status</h4>
              <div className="filter-options">
                <div className="filter-option">
                  <input
                    type="radio"
                    id="status-all"
                    name="status"
                    checked={status === ''}
                    onChange={() => setStatus('')}
                  />
                  <label htmlFor="status-all">All</label>
                </div>
                <div className="filter-option">
                  <input
                    type="radio"
                    id="status-active"
                    name="status"
                    checked={status === 'active'}
                    onChange={() => setStatus('active')}
                  />
                  <label htmlFor="status-active">Active</label>
                </div>
                <div className="filter-option">
                  <input
                    type="radio"
                    id="status-inactive"
                    name="status"
                    checked={status === 'inactive'}
                    onChange={() => setStatus('inactive')}
                  />
                  <label htmlFor="status-inactive">Inactive</label>
                </div>
              </div>
            </div>
          </div>

          <div className="employee-filter-footer">
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

export default EmployeeFilter;
