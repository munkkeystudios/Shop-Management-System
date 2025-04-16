import React from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import Sidebar from '../components/sidebar';
import './supplier.css';

export const Frame = () => {
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
                    <tr>
                      <td>1</td>
                      <td>James</td>
                      <td>+1234567890</td>
                      <td>NYC, USA</td>
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
                    <tr>
                      <td>2</td>
                      <td>Alex</td>
                      <td>+0987654321</td>
                      <td>NYC, USA</td>
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
                    <tr>
                      <td>3</td>
                      <td>John</td>
                      <td>+1122334455</td>
                      <td>NYC, USA</td>
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
            <button className="supplier-action-button primary">
              <FaPlus /> Add New Supplier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
