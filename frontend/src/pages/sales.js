import React, { useState, useEffect } from "react";
import { FaSearch, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { salesAPI } from '../services/api';
import SalesFilter from '../components/SalesFilter';
import './sales.css';

export const Frame = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentStatus: '',
    paymentMethod: ''
  });

  // Fetch sales data
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        // Add filters to API call
        const params = {};
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
        if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;

        const response = await salesAPI.getAll(params);
        console.log('sales payload:', response.data);

        if (response.data.success && Array.isArray(response.data.data)) {
          setSales(response.data.data);
        } else if (response.data.success && Array.isArray(response.data.sales)) {
          // if your server calls it "sales" instead of "data"
          setSales(response.data.sales);
        } else {
          // fallback to empty array
          console.warn('Unexpected sales shape, defaulting to []');
          setSales([]);
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching sales:', error);
        setSales([]);      // ensure state stays an array
        setError('Failed to load sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [filters]); // Re-fetch when filters change

  // Handle PDF export
  const handlePdfExport = async () => {
    try {
      setLoading(true);

      // Add current filters to export
      const params = {
        format: 'pdf',
        ...filters
      };

      const response = await salesAPI.exportSales('pdf', params);

      // Create a blob URL and open it in a new tab
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Open in a new tab
      window.open(url, '_blank');

      // Clean up the URL object after opening
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      setError(null);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError('Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  // Handle Excel export
  const handleExcelExport = async () => {
    try {
      setLoading(true);

      // Add current filters to export
      const params = {
        format: 'csv',
        ...filters
      };

      const response = await salesAPI.exportSales('csv', params);

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales.csv');
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      setError(null);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Failed to export CSV');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Filter sales based on reference number or customer name
  const filteredSales = sales.filter(sale =>
    sale._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="All Sales">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {loading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
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
                  <SalesFilter onApplyFilters={handleApplyFilters} />
                  <button
                    className="sales-export-button pdf-button"
                    onClick={handlePdfExport}
                    disabled={loading}
                  >
                    <FaFilePdf /> PDF
                  </button>
                  <button
                    className="sales-export-button excel-button"
                    onClick={handleExcelExport}
                    disabled={loading}
                  >
                    <FaFileExcel /> Excel
                  </button>
                  <button
                    className="sales-create-button"
                    onClick={() => navigate('/create-sale')}
                  >
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
                      <th>Grand Total</th>
                      <th>Paid</th>
                      <th>Due</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale, index) => (
                      <tr key={index}>
                        <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                        <td>{sale._id}</td>
                        <td>{sale.createdBy?.name}</td>
                        <td>{sale.customer.name}</td>
                        <td>{sale.total}</td>
                        <td>{sale.amountPaid}</td>
                        <td>{sale.change}</td>
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
    </Layout>
  );
};
