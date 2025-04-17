import React, { useState } from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import Sidebar from '../components/sidebar';
import './supplier.css';

export const Frame = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - replace with your actual data source
  const [suppliers] = useState([
    { id: 1, name: 'James', contact: '+1234567890', location: 'NYC, USA' },
    { id: 2, name: 'Alex', contact: '+0987654321', location: 'NYC, USA' },
    { id: 3, name: 'John', contact: '+1122334455', location: 'NYC, USA' },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log({ supplierName, contactNumber, address });
    setIsModalOpen(false);
    setSupplierName('');
    setContactNumber('');
    setAddress('');
  };

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="supplier-main-container">
      <Sidebar />
      <div className="supplier-frame">
        <div className="supplier-div-2">
          <div className="supplier-div-3">
            <div className="supplier-div-4">
              <div className="supplier-text-2">Supplier</div>
              <div className="supplier-search-container">
                <FaSearch className="supplier-search-icon" />
                <input
                  type="text"
                  placeholder="Search this table"
                  className="supplier-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="supplier-div-6">
              <div className="supplier-div-7">
                <table className="supplier-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id}>
                        <td>{supplier.id}</td>
                        <td>{supplier.name}</td>
                        <td>{supplier.contact}</td>
                        <td>{supplier.location}</td>
                        <td>
                          <div className="supplier-action-buttons">
                            <button className="supplier-action-button">
                              <FaEdit />
                            </button>
                            <button className="supplier-action-button">
                              <FaTrash />
                            </button>
                    </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="supplier-pagination-container">
                  <div className="supplier-pagination-controls">
                    <button className="supplier-pagination-button">Previous</button>
                    <button className="supplier-pagination-button">Next</button>
                  </div>
                  <span className="supplier-page-info">Page 1 of 10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="supplier-action-buttons-container">
            <button 
              className="supplier-action-button primary"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus /> Add New Supplier
            </button>
                </div>
              </div>
            </div>

      {isModalOpen && (
        <div className="supplier-modal-overlay">
          <div className="supplier-modal">
            <button 
              className="supplier-modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              <FaTimes />
            </button>
            <h2 className="supplier-modal-title">Add Supplier</h2>
            <form className="supplier-modal-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Supplier Name"
                className="supplier-modal-input"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Contact Number"
                className="supplier-modal-input"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Address"
                className="supplier-modal-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <button type="submit" className="supplier-modal-submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
