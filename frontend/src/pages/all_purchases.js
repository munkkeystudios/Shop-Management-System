import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, FileText, FileSpreadsheet, Plus, AlertCircle } from 'lucide-react';
import axios from 'axios';
import './all_purchases.css';
import PurchaseFilter from './purchase_filter';

const AllPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch purchases with current filters and pagination
  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = {
        page: currentPage,
        limit,
        sort: '-date',
        ...filters
      };
      
      // Only add search query if it exists
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
  
  // Initial fetch
  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);
  
  // Handle pagination
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Submit search with delay to prevent too many requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Reset to page 1 when searching
      setCurrentPage(1);
      fetchPurchases();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchPurchases]);
  
  // Handle filters
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 when filters change
  };
  
  // Handle export
  const handleExport = (format) => {
    // Build query parameters for export including current filters
    const params = new URLSearchParams({
      format,
      ...filters
    });
    
    if (searchQuery.trim()) {
      params.append('search', searchQuery);
    }
    
    // Generate full URL for export
    const exportUrl = `/api/purchases/export?${params.toString()}`;
    
    // Open export URL in new tab/window
    window.open(exportUrl, '_blank');
  };
  
  // Format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Get status class for CSS styling
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'received':
        return 'status-received';
      case 'ordered':
        return 'status-ordered';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  // Get payment status class for CSS styling
  const getPaymentStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'payment-paid';
      case 'partial':
        return 'payment-partial';
      case 'pending':
      case 'unpaid':
        return 'payment-unpaid';
      default:
        return '';
    }
  };

  // Format currency values
  const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <div className="all-purchases-container">
      <div className="header">
        <h2>All Purchases</h2>
        <div className="header-actions">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search purchases..." 
              className="search-input" 
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="action-buttons">
            <button className={`filter-btn ${activeFilterCount > 0 ? 'active' : ''}`} onClick={toggleFilter}>
              <Filter size={16} />
              <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
            </button>
            <button className="pdf-btn" onClick={() => handleExport('pdf')}>
              <FileText size={16} />
              <span>PDF</span>
            </button>
            <button className="excel-btn" onClick={() => handleExport('csv')}>
              <FileSpreadsheet size={16} />
              <span>Excel</span>
            </button>
            <button className="create-btn" onClick={() => window.location.href = '/create-purchase'}>
              <Plus size={16} />
              <span>Create New Purchase</span>
            </button>
          </div>
        </div>
        
        {/* Filter dropdown */}
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
        {loading ? (
          <div className="loading">Loading purchases...</div>
        ) : purchases.length === 0 ? (
          <div className="no-data">No purchases found</div>
        ) : (
          <table className="purchases-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Supplier</th>
                <th>Warehouse</th>
                <th>Status</th>
                <th>Grand Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => {
                // Calculate paid and due amounts based on payment status
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
                  <tr key={purchase._id} onClick={() => window.location.href = `/purchases/${purchase._id}`}>
                    <td>{formatDate(purchase.date)}</td>
                    <td>{purchase._id.substring(0, 8).toUpperCase()}</td>
                    <td>{purchase.supplier?.name || 'N/A'}</td>
                    <td>{purchase.warehouse?.name || 'Warehouse 1'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(purchase.status)}`}>
                        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                      </span>
                    </td>
                    <td>{formatCurrency(purchase.totalAmount)}</td>
                    <td>{formatCurrency(paidAmount)}</td>
                    <td>{formatCurrency(dueAmount)}</td>
                    <td>
                      <span className={`payment-status ${getPaymentStatusClass(purchase.paymentStatus)}`}>
                        {purchase.paymentStatus.charAt(0).toUpperCase() + purchase.paymentStatus.slice(1)}
                      </span>
                    </td>
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
  );
};

export default AllPurchases;