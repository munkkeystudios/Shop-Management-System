

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const PurchaseFilter = ({ isOpen, onClose, onApplyFilters }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [filterValues, setFilterValues] = useState({
    supplier: '',
    date: '',
    minAmount: '',
    maxAmount: ''
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('/api/suppliers');
        if (response.data.success) {
          setSuppliers(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilterValues({
      ...filterValues,
      [name]: value
    });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    onApplyFilters(filterValues);
    onClose();
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      supplier: '',
      date: '',
      minAmount: '',
      maxAmount: ''
    };
    setFilterValues(emptyFilters);
    onApplyFilters(emptyFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="filter-dropdown">
      <div className="filter-header">
        <h3>Filter Purchases</h3>
        <button className="close-filter" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <form className="filter-form" onSubmit={handleApplyFilters}>
        <div className="filter-item">
          <label htmlFor="supplier">Supplier</label>
          <select 
            id="supplier" 
            name="supplier" 
            value={filterValues.supplier}
            onChange={handleInputChange}
          >
            <option value="">All Suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="date">Date</label>
          <input 
            type="date" 
            id="date" 
            name="date" 
            value={filterValues.date}
            onChange={handleInputChange}
          />
        </div>

        <div className="amount-range">
          <div className="form-group">
            <label htmlFor="minAmount">Min Amount</label>
            <input 
              type="number" 
              id="minAmount" 
              name="minAmount" 
              value={filterValues.minAmount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxAmount">Max Amount</label>
            <input 
              type="number" 
              id="maxAmount" 
              name="maxAmount" 
              value={filterValues.maxAmount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="Max"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button type="button" className="reset-filter" onClick={handleResetFilters}>
            Reset
          </button>
          <button type="submit" className="apply-filter">
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseFilter;
