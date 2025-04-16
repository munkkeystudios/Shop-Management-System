import React from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import Sidebar from '../components/sidebar';
import './categories.css';

const CategoryPage = () => {
  return (
    <div className="categories-main-container">
      <Sidebar />
      <div className="categories-frame">
        <div className="categories-div-2">
          <div className="categories-div-3">
            <div className="categories-div-4">
              <div className="categories-text-2">Category</div>
            </div>
            <div className="categories-search-container">
              <FaSearch className="categories-search-icon" />
              <input
                type="text"
                placeholder="Search this table"
                className="categories-search-input"
              />
            </div>

            <div className="categories-div-6">
              <div className="categories-div-7">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Category Code</th>
                      <th>Category Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>CA9</td>
                      <td>Jeans</td>
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
                    <tr>
                      <td>CA8</td>
                      <td>Shirts</td>
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
                    <tr>
                      <td>CA7</td>
                      <td>Shorts</td>
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
                    <tr>
                      <td>CA6</td>
                      <td>Jacket</td>
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
            <button className="categories-action-button primary">
              <FaPlus /> Create New Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
