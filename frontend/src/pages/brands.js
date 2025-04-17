import React, { useState } from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import Sidebar from '../components/sidebar';
import './brands.css';

const Brands = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - replace with your actual data source
  const [categories] = useState([
    { code: 'CA9', name: 'Jeans' },
    { code: 'CA8', name: 'Shirts' },
    { code: 'CA7', name: 'Shorts' },
    { code: 'CA6', name: 'Jacket' },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log({ categoryCode, categoryName });
    setIsModalOpen(false);
    setCategoryCode('');
    setCategoryName('');
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="categories-main-container">
      <Sidebar />
      <div className="categories-frame">
        <div className="categories-div-2">
          <div className="categories-div-3">
            <div className="categories-div-4">
              <div className="categories-text-2">Brand</div>
            </div>
            <div className="categories-search-container">
              <FaSearch className="categories-search-icon" />
              <input
                type="text"
                placeholder="Search this table"
                className="categories-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="categories-div-6">
              <div className="categories-div-7">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Brand Name</th>
                      <th>Brand Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category, index) => (
                      <tr key={index}>
                        <td>{category.code}</td>
                        <td>{category.name}</td>
                        <td>
                          <div className="categories-action-buttons">
                            <button className="categories-action-button">
                              <FaEdit />
                            </button>
                            <button className="categories-action-button">
                              <FaTrash />
                            </button>
                    </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="categories-pagination-container">
                  <div className="categories-pagination-controls">
                    <button className="categories-pagination-button">Previous</button>
                    <button className="categories-pagination-button">Next</button>
                  </div>
                  <span className="categories-page-info">Page 1 of 10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="categories-action-buttons-container">
            <button 
              className="categories-action-button primary"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus /> Create New Brand
            </button>
                      </div>
                    </div>
                  </div>

      {isModalOpen && (
        <div className="categories-modal-overlay">
          <div className="categories-modal">
            <button 
              className="categories-modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              <FaTimes />
            </button>
            <h2 className="categories-modal-title">Create Brand</h2>
            <form className="categories-modal-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Enter brand name"
                className="categories-modal-input"
                value={categoryCode}
                onChange={(e) => setCategoryCode(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Enter brand description"
                className="categories-modal-description"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
              <button type="submit" className="categories-modal-submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
