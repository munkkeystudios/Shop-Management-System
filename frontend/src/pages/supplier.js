import React from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import Sidebar from '../components/sidebar';
import './supplier.css';

export const Frame = () => {
  return (
    <div className="main-container">
      <Sidebar />
      <div className="frame">
        <div className="div-2">
          <div className="div-3">
            <div className="div-4">
              <div className="text-2">Supplier</div>
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search this table"
                  className="search-input"
                />
              </div>
            </div>

            <div className="div-6">
              <div className="div-7">
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
                        <div className="action-buttons">
                          <button className="action-button">
                            <FaEdit />
                          </button>
                          <button className="action-button">
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
                        <div className="action-buttons">
                          <button className="action-button">
                            <FaEdit />
                          </button>
                          <button className="action-button">
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
                        <div className="action-buttons">
                          <button className="action-button">
                            <FaEdit />
                          </button>
                          <button className="action-button">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="pagination-container">
                  <div className="pagination-controls">
                    <button className="pagination-button">Previous</button>
                    <button className="pagination-button">Next</button>
                  </div>
                  <span className="page-info">Page 1 of 10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons-container">
            <button className="action-button primary">
              <FaPlus /> Add New Supplier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
