import React from "react";
import { FaSearch, FaFilter, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import Sidebar from '../components/sidebar';
import './sales.css';

export const Frame = () => {
  return (
    <div className="sales-main-container">
      <Sidebar />
      <div className="sales-frame">
        <div className="sales-div-2">
          <div className="sales-div-3">
            <div className="sales-div-4">
              <div className="sales-text-2">All Sales</div>
              <div className="sales-controls-container">
                <div className="sales-search-container">
                  <FaSearch className="sales-search-icon" />
                  <input
                    type="text"
                    placeholder="Search this table"
                    className="sales-search-input"
                  />
                </div>
                <div className="sales-action-buttons">
                  <button className="sales-filter-button">
                    <FaFilter /> Filter
                  </button>
                  <button className="sales-export-button pdf-button">
                    <FaFilePdf /> PDF
                  </button>
                  <button className="sales-export-button excel-button">
                    <FaFileExcel /> Excel
                  </button>
                  <button className="sales-create-button">
                    Create New Sale
                  </button>
                </div>
              </div>
            </div>

            <div className="sales-div-6">
              <div className="sales-div-7">
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>Added by</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Grand Total</th>
                      <th>Paid</th>
                      <th>Due</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>2024-01-27</td>
                      <td>SL_2119</td>
                      <td>William Castillo</td>
                      <td>Thomas</td>
                      <td><span className="sales-status-badge received">Received</span></td>
                      <td>322.00</td>
                      <td>322.00</td>
                      <td>322.00</td>
                      <td><span className="sales-status-badge paid">Paid</span></td>
                    </tr>
                    <tr>
                      <td>2024-01-26</td>
                      <td>SL_2118</td>
                      <td>William Castillo</td>
                      <td>Jack</td>
                      <td><span className="sales-status-badge ordered">Ordered</span></td>
                      <td>680.00</td>
                      <td>680.00</td>
                      <td>680.00</td>
                      <td><span className="sales-status-badge unpaid">Unpaid</span></td>
                    </tr>
                    <tr>
                      <td>2024-01-25</td>
                      <td>SL_2117</td>
                      <td>William Castillo</td>
                      <td>Will</td>
                      <td><span className="sales-status-badge pending">Pending</span></td>
                      <td>1500.00</td>
                      <td>1500.00</td>
                      <td>1500.00</td>
                      <td><span className="sales-status-badge paid">Paid</span></td>
                    </tr>
                  </tbody>
                </table>

                <div className="sales-pagination-container">
                  <div className="sales-pagination-controls">
                    <button className="sales-pagination-button">Previous</button>
                    <button className="sales-pagination-button">Next</button>
                  </div>
                  <span className="sales-page-info">Page 1 of 10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
