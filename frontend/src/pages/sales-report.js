import React, { useState, useEffect } from "react";
import { FaSearch, FaFileExcel, FaFilePdf, FaCalendarAlt, FaChevronDown } from 'react-icons/fa';
import Layout from '../components/Layout';
import { salesAPI } from '../services/api';
import { SalesBarChart, PaymentMethodPieChart, SalesTrendLineChart } from '../components/SalesCharts';
import AISalesInsights from '../components/AISalesInsights';
import '../components/styles/AISalesInsights.css';
import './sales.css'; // Reusing sales.css for styling
import './collapsible-sales-report.css'; // New styles for collapsible report

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [salesStats, setSalesStats] = useState({
    overall: {
      totalSalesValue: 0,
      totalDiscountValue: 0,
      totalTaxValue: 0,
      averageSaleValue: 0,
      totalTransactions: 0
    },
    byPaymentMethod: []
  });

  // Fetch sales data
  useEffect(() => {
    fetchSales();
    fetchSalesStats();
  }, [startDate, endDate]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Add date filters if provided
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await salesAPI.getAll(params);

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
    } catch (err) {
      setError('Failed to fetch sales data');
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesStats = async () => {
    try {
      // Add date filters if provided
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await salesAPI.getStats(params);

      if (response.data.success) {
        setSalesStats(response.data);
      } else {
        console.warn('Failed to fetch sales stats');
      }
    } catch (err) {
      console.error('Error fetching sales stats:', err);
    }
  };

  const handleExcelExport = async () => {
    try {
      setLoading(true);

      // Add date filters if provided
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await salesAPI.exportSales('csv', params);

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export sales data');
      console.error('Error exporting sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfExport = async () => {
    try {
      setLoading(true);

      // Add date filters if provided
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await salesAPI.exportSales('pdf', params);

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export sales data');
      console.error('Error exporting sales:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter sales based on search term
  const filteredSales = sales.filter(sale =>
    (sale._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Layout title="Reports">
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
        <div className="collapsible-report-container">
          {/* Collapsible Header */}
          <div
            className="collapsible-report-header"
            onClick={() => setIsReportOpen(!isReportOpen)}
          >
            <div className="collapsible-report-title">Sales Report</div>
            <FaChevronDown className={`collapsible-report-icon ${isReportOpen ? 'open' : ''}`} />
          </div>

          {/* Collapsible Content */}
          <div className={`collapsible-report-content ${isReportOpen ? 'open' : ''}`}>
            <div className="collapsible-report-inner">
              <div className="sales-div-3">
                <div className="sales-div-4">
                  {/* Date Filter Controls */}
                  <div className="sales-controls-container">
                    <div className="sales-date-filter">
                      <div className="sales-date-input-container">
                        <label htmlFor="start-date">Start Date:</label>
                        <div className="sales-date-input-wrapper">
                          <FaCalendarAlt className="sales-date-icon" />
                          <input
                            type="date"
                            id="start-date"
                            className="sales-date-input"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="sales-date-input-container">
                        <label htmlFor="end-date">End Date:</label>
                        <div className="sales-date-input-wrapper">
                          <FaCalendarAlt className="sales-date-icon" />
                          <input
                            type="date"
                            id="end-date"
                            className="sales-date-input"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sales-search-container">
                      <FaSearch className="sales-search-icon" />
                      <input
                        type="text"
                        placeholder="Search by reference or customer"
                        className="sales-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="sales-action-buttons">
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
                    </div>
                  </div>

                  {/* Sales Statistics */}
                  <div className="sales-stats-container">
                    <div className="sales-stats-card">
                      <h3>Total Sales</h3>
                      <p>${salesStats.overall.totalSalesValue.toFixed(2)}</p>
                    </div>
                    <div className="sales-stats-card">
                      <h3>Total Transactions</h3>
                      <p>{salesStats.overall.totalTransactions}</p>
                    </div>
                    <div className="sales-stats-card">
                      <h3>Average Sale</h3>
                      <p>${salesStats.overall.averageSaleValue.toFixed(2)}</p>
                    </div>
                    <div className="sales-stats-card">
                      <h3>Total Discount</h3>
                      <p>${salesStats.overall.totalDiscountValue.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Payment Method Stats */}
                  <div className="payment-method-stats">
                    <h3>Sales by Payment Method</h3>
                    <div className="payment-method-cards">
                      {salesStats.byPaymentMethod.map((method, index) => (
                        <div className="payment-method-card" key={index}>
                          <h4>{method._id.charAt(0).toUpperCase() + method._id.slice(1)}</h4>
                          <p>Count: {method.count}</p>
                          <p>Total: ${method.totalValue.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="sales-charts-container">
                    <div className="chart-card">
                      <SalesBarChart sales={filteredSales} />
                    </div>
                    <div className="chart-card">
                      <PaymentMethodPieChart paymentMethodStats={salesStats.byPaymentMethod} />
                    </div>
                  </div>

                  <div className="sales-charts-container">
                    <div className="chart-card">
                      <SalesTrendLineChart sales={filteredSales} />
                    </div>
                  </div>

                  {/* AI Sales Insights */}
                  <AISalesInsights sales={filteredSales} salesStats={salesStats} />
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
                            <td>{formatDate(sale.createdAt)}</td>
                            <td>{sale._id}</td>
                            <td>{sale.createdBy?.name || sale.createdBy?.username || 'N/A'}</td>
                            <td>{sale.customer.name}</td>
                            <td>${sale.total.toFixed(2)}</td>
                            <td>${sale.amountPaid.toFixed(2)}</td>
                            <td>${Math.max(0, sale.total - sale.amountPaid).toFixed(2)}</td>
                            <td><span className={`sales-status-badge ${sale.paymentStatus.toLowerCase()}`}>{sale.paymentStatus}</span></td>
                          </tr>
                        ))}
                        {filteredSales.length === 0 && (
                          <tr>
                            <td colSpan="8" className="text-center">No sales found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
