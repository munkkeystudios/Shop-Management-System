import React, { useState } from "react";
import { FaSearch, FaFilter, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import Sidebar from '../components/sidebar';
import './sales.css';

export const Frame = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - replace with your actual data source
  const [sales] = useState([
    {
      date: '2024-01-27',
      reference: 'SL_2119',
      addedBy: 'William Castillo',
      customer: 'Thomas',
      status: 'Received',
      grandTotal: '322.00',
      paid: '322.00',
      due: '322.00',
      paymentStatus: 'Paid'
    },
    {
      date: '2024-01-26',
      reference: 'SL_2118',
      addedBy: 'William Castillo',
      customer: 'Jack',
      status: 'Ordered',
      grandTotal: '680.00',
      paid: '680.00',
      due: '680.00',
      paymentStatus: 'Unpaid'
    },
    {
      date: '2024-01-25',
      reference: 'SL_2117',
      addedBy: 'William Castillo',
      customer: 'Will',
      status: 'Pending',
      grandTotal: '1500.00',
      paid: '1500.00',
      due: '1500.00',
      paymentStatus: 'Paid'
    }
  ]);

  // Filter sales based on reference number
  const filteredSales = sales.filter(sale =>
    sale.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    {filteredSales.map((sale, index) => (
                      <tr key={index}>
                        <td>{sale.date}</td>
                        <td>{sale.reference}</td>
                        <td>{sale.addedBy}</td>
                        <td>{sale.customer}</td>
                        <td><span className={`sales-status-badge ${sale.status.toLowerCase()}`}>{sale.status}</span></td>
                        <td>{sale.grandTotal}</td>
                        <td>{sale.paid}</td>
                        <td>{sale.due}</td>
                        <td><span className={`sales-status-badge ${sale.paymentStatus.toLowerCase()}`}>{sale.paymentStatus}</span></td>
                      </tr>
                    ))}
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
