import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { FaFileExcel, FaFilePdf, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './all_purchases.css';
import PurchaseFilter from './purchase_filter';
import Layout from '../components/Layout';

const AllPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        sort: '-date',
        ...filters,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery;
      }

      const response = await axios.get('/api/purchases', { params });

      if (response.data.success) {
        setPurchases(response.data.data);
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
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPurchases();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchPurchases]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
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

  const totalPurchaseValue = purchases.reduce((sum, purchase) => sum + (Number(purchase.totalAmount) || 0), 0);
  const totalPaidValue = purchases.reduce((sum, purchase) => {
    const total = Number(purchase.totalAmount) || 0;
    if (purchase.paymentStatus === 'paid') return sum + total;
    return sum + (Number(purchase.paidAmount) || 0);
  }, 0);
  const totalDueValue = Math.max(0, totalPurchaseValue - totalPaidValue);
  const pendingPaymentsCount = purchases.filter((purchase) => purchase.paymentStatus !== 'paid').length;

  return (
    <Layout title="All Purchases">
      <div style={{ backgroundColor: '#f7f9fb', minHeight: 'calc(100vh - 80px)', fontFamily: 'Manrope, sans-serif' }}>
        <main style={{ flex: 1, minHeight: '100vh', background: '#f7f9fb' }}>
          <section style={{ padding: '32px', maxWidth: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <p style={{ margin: '0 0 4px', color: '#565e74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '12px' }}>
                  Procurement Ledger
                </p>
                <h2 style={{ margin: 0, fontSize: '36px', fontWeight: 700, letterSpacing: '-0.025em', color: '#2a3439' }}>
                  All Purchases
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '12px',
                      transform: 'translateY(-50%)',
                      color: '#717c82',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>search</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Search reference or supplier..."
                    value={searchQuery}
                    onChange={handleSearch}
                    style={{
                      width: '320px',
                      backgroundColor: '#f0f4f7',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '12px 16px 12px 40px',
                      fontSize: '14px',
                      outline: 'none',
                      boxShadow: 'rgba(15, 23, 42, 0.06) 0px 1px 2px',
                      color: '#2a3439',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExportPDF}
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
                  <FaFilePdf />
                  PDF
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
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
                  <FaFileExcel />
                  Excel
                </button>

                <span style={{ width: '1px', height: '30px', background: '#d7dfe6', margin: '0 4px' }} />

                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={toggleFilter}
                    style={{
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '4px',
                      border: 'none',
                      background: 'rgba(240, 244, 247, 0.9)',
                      color: activeFilterCount > 0 ? '#2a3439' : '#566166',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      gap: '8px',
                      fontSize: '12px',
                      fontWeight: 800,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                    }}
                    aria-label="Filter purchases"
                    title="Filters"
                  >
                    <FaFilter />
                    {activeFilterCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          minWidth: '18px',
                          height: '18px',
                          borderRadius: '9px',
                          background: '#2a3439',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 4px',
                          lineHeight: 1,
                        }}
                      >
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <PurchaseFilter
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    onApplyFilters={handleApplyFilters}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/create_purchases')}
                  style={{
                    backgroundColor: '#565e74',
                    color: '#f7f7ff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: 'rgba(15, 23, 42, 0.08) 0px 1px 2px',
                    whiteSpace: 'nowrap',
                    height: '48px',
                  }}
                >
                  <span className="material-symbols-outlined">add</span>
                  Create Purchase
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px', marginBottom: '16px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '24px', marginBottom: '48px' }}>
              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Total Purchase Value
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                  {formatCurrency(totalPurchaseValue)}
                </p>
              </div>

              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Paid Amount
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                  {formatCurrency(totalPaidValue)}
                </p>
              </div>

              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Due Amount
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#9f403d' }}>
                  {formatCurrency(totalDueValue)}
                </p>
              </div>

              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Pending Payments
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                  {pendingPaymentsCount}
                </p>
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 1.6fr 2.2fr 1.4fr 1.4fr 1.4fr 1.4fr 1.6fr 1fr',
                  background: '#e8eff3',
                  padding: '16px 24px',
                  columnGap: '12px',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Date</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Reference</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Supplier</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Status</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'right' }}>Grand Total</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'right' }}>Paid</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'right' }}>Due</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Payment</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'center' }}>Actions</div>
              </div>

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
              ) : purchases.length === 0 ? (
                <div style={{ padding: '40px 24px', color: '#566166', fontSize: '14px' }}>No purchases found.</div>
              ) : (
                <div>
                  {purchases.map((purchase, index) => {
                    const isStriped = index % 2 === 1;

                    let paidAmount = 0;
                    let dueAmount = Number(purchase.totalAmount) || 0;
                    if (purchase.paymentStatus === 'paid') {
                      paidAmount = Number(purchase.totalAmount) || 0;
                      dueAmount = 0;
                    } else if (purchase.paymentStatus === 'partial' && purchase.paidAmount) {
                      paidAmount = Number(purchase.paidAmount) || 0;
                      dueAmount = (Number(purchase.totalAmount) || 0) - paidAmount;
                    }

                    return (
                      <div
                        key={purchase._id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.6fr 1.6fr 2.2fr 1.4fr 1.4fr 1.4fr 1.4fr 1.6fr 1fr',
                          padding: '20px 24px',
                          alignItems: 'center',
                          columnGap: '12px',
                          background: isStriped ? 'rgba(240, 244, 247, 0.3)' : 'transparent',
                        }}
                      >
                        <div style={{ color: '#566166', fontSize: '13px' }}>{formatDate(purchase.date)}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#566166' }}>{purchase._id.substring(0, 8).toUpperCase()}</div>
                        <div style={{ fontWeight: 700, color: '#2a3439' }}>{purchase.supplier?.name || 'N/A'}</div>
                        <div>
                          <span className={`status-badge status-${purchase.status.toLowerCase()}`}>
                            {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(purchase.totalAmount)}</div>
                        <div style={{ textAlign: 'right' }}>{formatCurrency(paidAmount)}</div>
                        <div style={{ textAlign: 'right', color: dueAmount > 0 ? '#9f403d' : '#2a3439', fontWeight: 700 }}>{formatCurrency(dueAmount)}</div>
                        <div>
                          <span className={`payment-status payment-${purchase.paymentStatus.toLowerCase()}`}>
                            {purchase.paymentStatus.charAt(0).toUpperCase() + purchase.paymentStatus.slice(1)}
                          </span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="all-products-action-btn"
                            onClick={() => navigate(`/purchases/${purchase._id}`)}
                            aria-label="View purchase"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </section>
        </main>
      </div>
    </Layout>
  );
};

export default AllPurchases;
