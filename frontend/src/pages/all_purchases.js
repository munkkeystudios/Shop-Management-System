import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './all_purchases.css';
import PurchaseFilter from './purchase_filter';
import Layout from '../components/Layout';
import PurchaseButtons from './PurchaseButtons';

const AllPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [filters, setFilters] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit,
        sort: '-date',
        ...filters,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery;
      }

      const response = await axios.get('/api/purchases', { params });

      if (response.data.success) {
        setPurchases(response.data.data);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.data.message || 'Failed to fetch purchases');
        setPurchases([]);
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch purchases');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters, searchQuery]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchPurchases();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchPurchases]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      autoTable(doc, {
        head: [['Date', 'Reference', 'Supplier', 'Status', 'Grand Total', 'Paid', 'Due', 'Payment Status']],
        body: purchases.map((purchase) => [
          formatDate(purchase.date),
          purchase._id.substring(0, 8).toUpperCase(),
          purchase.supplier?.name || 'N/A',
          purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1),
          formatCurrency(purchase.totalAmount),
          formatCurrency(purchase.paidAmount || 0),
          formatCurrency(purchase.totalAmount - (purchase.paidAmount || 0)),
          purchase.paymentStatus.charAt(0).toUpperCase() + purchase.paymentStatus.slice(1),
        ]),
      });

      doc.save('purchases.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      purchases.map((purchase) => ({
        Date: formatDate(purchase.date),
        Reference: purchase._id.substring(0, 8).toUpperCase(),
        Supplier: purchase.supplier?.name || 'N/A',
        Status: purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1),
        'Grand Total': formatCurrency(purchase.totalAmount),
        Paid: formatCurrency(purchase.paidAmount || 0),
        Due: formatCurrency(purchase.totalAmount - (purchase.paidAmount || 0)),
        'Payment Status': purchase.paymentStatus.charAt(0).toUpperCase() + purchase.paymentStatus.slice(1),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Purchases');
    XLSX.writeFile(wb, 'purchases.xlsx');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
  };

  const activeFilterCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <Layout title="All Purchases">
      <div className="all-purchases-container">
        <div className="header">
          <h2>All Purchases</h2>
          <div className="header-actions">
            <PurchaseButtons
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
              activeFilterCount={activeFilterCount}
              toggleFilter={toggleFilter}
            />
          </div>

          <PurchaseFilter
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            onApplyFilters={handleApplyFilters}
          />
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="table-container">
          {loading ? null : purchases.length === 0 ? (
            <div className="no-data">No purchases found</div>
          ) : (
            <table className="purchases-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Grand Total</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => {
                  let paidAmount = 0;
                  let dueAmount = purchase.totalAmount;

                  if (purchase.paymentStatus === 'paid') {
                    paidAmount = purchase.totalAmount;
                    dueAmount = 0;
                  } else if (purchase.paymentStatus === 'partial' && purchase.paidAmount) {
                    paidAmount = purchase.paidAmount;
                    dueAmount = purchase.totalAmount - paidAmount;
                  }

                  return (
                    <tr key={purchase._id} onClick={() => navigate(`/purchases/${purchase._id}`)}>
                      <td>{formatDate(purchase.date)}</td>
                      <td>{purchase._id.substring(0, 8).toUpperCase()}</td>
                      <td>{purchase.supplier?.name || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${purchase.status.toLowerCase()}`}>
                          {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                        </span>
                      </td>
                      <td>{formatCurrency(purchase.totalAmount)}</td>
                      <td>{formatCurrency(paidAmount)}</td>
                      <td>{formatCurrency(dueAmount)}</td>
                      <td>{purchase.paymentStatus.charAt(0).toUpperCase() + purchase.paymentStatus.slice(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination">
          <button
            className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button
            className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AllPurchases;
