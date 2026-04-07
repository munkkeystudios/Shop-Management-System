import React, { useState, useEffect } from "react";
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { FiPlus, FiSearch } from 'react-icons/fi';
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

  const normalizeAmount = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatAmount = (value) => {
    const amount = normalizeAmount(value);
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getSaleDue = (sale) => {
    if (sale.change !== undefined && sale.change !== null) {
      return normalizeAmount(sale.change);
    }

    return Math.max(0, normalizeAmount(sale.total) - normalizeAmount(sale.amountPaid));
  };

  const getSaleStatus = (sale) => {
    const due = getSaleDue(sale);
    const paid = normalizeAmount(sale.amountPaid);
    const total = normalizeAmount(sale.total);

    if (due <= 0 || paid >= total) {
      return { label: 'Completed', className: 'completed' };
    }

    if (paid > 0) {
      return { label: 'Partial', className: 'partial' };
    }

    return { label: 'Unpaid', className: 'unpaid' };
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    return new Date(dateValue).toLocaleDateString(undefined, {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return '';
    return new Date(dateValue).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter sales based on reference number or customer name
  const filteredSales = sales.filter(sale =>
    sale._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSalesAmount = filteredSales.reduce(
    (sum, sale) => sum + normalizeAmount(sale.total),
    0
  );

  const totalItemsSold = filteredSales.reduce(
    (sum, sale) => sum + (Array.isArray(sale.items)
      ? sale.items.reduce((itemSum, item) => itemSum + normalizeAmount(item?.quantity), 0)
      : 0),
    0
  );

  const averageOrderValue = filteredSales.length > 0
    ? totalSalesAmount / filteredSales.length
    : 0;

  const totalDueAmount = filteredSales.reduce(
    (sum, sale) => sum + getSaleDue(sale),
    0
  );

  const highPriorityPending = filteredSales.filter((sale) => getSaleDue(sale) > 0).length;

  return (
    <Layout title="All Sales">
      <div className="slate-sales-main">
<section className="slate-sales-shell">
          <header className="slate-sales-header">
            <h1>All Sales</h1>
          </header>

          {error && (
            <div className="slate-sales-alert" role="alert">
              {error}
            </div>
          )}

          <section className="slate-sales-stat-grid">
            <article className="slate-sales-stat-card">
              <span>Total Sales</span>
              <strong>{formatAmount(totalSalesAmount)}</strong>
              <p className="slate-sales-stat-meta slate-sales-stat-meta-positive">+12.5% from last month</p>
            </article>
            <article className="slate-sales-stat-card">
              <span>Average Order Value</span>
              <strong>{formatAmount(averageOrderValue)}</strong>
              <p className="slate-sales-stat-meta">Target: 90.00</p>
            </article>
            <article className="slate-sales-stat-card">
              <span>Total Items Sold</span>
              <strong>{totalItemsSold.toLocaleString()}</strong>
              <p className="slate-sales-stat-meta">Daily average: {Math.round(totalItemsSold / 30)}</p>
            </article>
            <article className="slate-sales-stat-card slate-sales-stat-card-warning">
              <span>Pending Payments</span>
              <strong>{formatAmount(totalDueAmount)}</strong>
              <p className="slate-sales-stat-meta slate-sales-stat-meta-danger">{highPriorityPending} high priority items</p>
            </article>
          </section>

          <div className="slate-sales-toolbar">
            <div className="slate-sales-toolbar-left">
              <div className="slate-sales-search-wrap">
                <FiSearch className="slate-sales-search-icon" />
                <input
                  type="text"
                  placeholder="Search transactions, customers..."
                  className="slate-sales-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="slate-sales-create-btn"
                onClick={() => navigate('/create-sale')}
              >
                <FiPlus />
                Create New Sale
              </button>
            </div>

            <div className="slate-sales-actions">
              <button
                className="slate-sales-export-button pdf-button"
                onClick={handlePdfExport}
                disabled={loading}
                style={{
                  height: '48px',
                  padding: '0 16px',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'rgba(240, 244, 247, 0.9)',
                  color: '#566166',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <FaFilePdf /> PDF
              </button>
              <button
                className="slate-sales-export-button excel-button"
                onClick={handleExcelExport}
                disabled={loading}
                style={{
                  height: '48px',
                  padding: '0 16px',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'rgba(240, 244, 247, 0.9)',
                  color: '#566166',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <FaFileExcel /> Excel
              </button>
              <span className="slate-sales-actions-divider" />
              <SalesFilter onApplyFilters={handleApplyFilters} iconOnly />
            </div>
          </div>

          <section className="slate-sales-table-panel">
            {loading ? (
              <div className="products-loading-container">
                <div className="block-pulse">
                  <div className="block rounded-sm"></div>
                  <div className="block rounded-sm"></div>
                  <div className="block rounded-sm"></div>
                  <div className="block rounded-sm"></div>
                  <div className="block rounded-sm"></div>
                  <div className="block rounded-sm"></div>
                  <div className="block rounded-sm"></div>
                  <div className="block rounded-sm"></div>
                  <div className="block rounded-sm"></div>
                </div>
              </div>
            ) : (
              <div className="slate-sales-table-wrap">
                <table className="slate-sales-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Transaction Reference</th>
                      <th>Customer</th>
                      <th>Total Amount</th>
                      <th>Paid Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.length > 0 ? (
                      filteredSales.map((sale, index) => {
                        const status = getSaleStatus(sale);
                        const isUnpaid = status.className === 'unpaid';

                        return (
                        <tr
                          key={sale._id || `${sale.createdAt}-${index}`}
                          className={isUnpaid ? 'slate-sales-row-unpaid' : ''}
                        >
                          <td>
                            <div className="slate-sales-date-cell">{formatDate(sale.createdAt)}</div>
                            <div className="slate-sales-time-cell">{formatTime(sale.createdAt)}</div>
                          </td>
                          <td className="slate-sales-reference-cell">{sale._id || '-'}</td>
                          <td>
                            <div className="slate-sales-customer-cell">{sale.customer?.name || '-'}</div>
                            <div className="slate-sales-customer-meta">{sale.customer?.phone || sale.customer?.email || ''}</div>
                          </td>
                          <td>{formatAmount(sale.total)}</td>
                          <td>{formatAmount(sale.amountPaid)}</td>
                          <td>
                            <span className={`slate-sales-status-badge ${status.className}`}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      )})
                    ) : (
                      <tr>
                        <td colSpan="6" className="slate-sales-empty-row">
                          No sales found for the current search and filter selection.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </div>
    </Layout>
  );
};
