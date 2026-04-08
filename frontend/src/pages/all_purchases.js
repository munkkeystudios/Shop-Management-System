import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { FaFileExcel, FaFilePdf, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import logoSmall from '../images/logo-small.png';
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

  const handleExportPDF = async () => {
    try {
      setLoading(true);

      const rowTrs = purchases.map((purchase, idx) => {
        const id = String(idx + 1).padStart(3, '0');
        const date = formatDate(purchase.date);
        const reference = (purchase._id || '').toString().slice(0, 8).toUpperCase();
        const supplier = purchase.supplier?.name ? String(purchase.supplier.name).replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'N/A';
        const status = purchase.status ? String(purchase.status).charAt(0).toUpperCase() + String(purchase.status).slice(1) : '-';
        const grandTotal = formatCurrency(purchase.totalAmount);
        const paid = formatCurrency(purchase.paidAmount || 0);
        const due = formatCurrency((Number(purchase.totalAmount) || 0) - (Number(purchase.paidAmount) || 0));
        const paymentStatus = purchase.paymentStatus ? String(purchase.paymentStatus).charAt(0).toUpperCase() + String(purchase.paymentStatus).slice(1) : '-';

        return `
          <tr style="border-bottom:1px solid rgba(86,97,102,0.08)">
            <td style="padding:16px 8px;font-family:monospace;font-size:11px;color:#6b7280">${id}</td>
            <td style="padding:16px 8px;font-size:14px;color:#111827">${date}</td>
            <td style="padding:16px 8px;font-weight:700;font-size:14px;color:#111827">${reference}</td>
            <td style="padding:16px 8px;font-size:14px;color:#111827">${supplier}</td>
            <td style="padding:16px 8px;font-size:14px;color:#111827;text-align:right">${grandTotal}</td>
            <td style="padding:16px 8px;font-size:14px;color:#6b7280;text-align:right">${paid}</td>
            <td style="padding:16px 8px;font-size:14px;color:#6b7280;text-align:right">${due}</td>
            <td style="padding:16px 8px;font-size:12px;text-align:center;vertical-align:middle;display:flex;align-items:center;justify-content:center">
              <span style="display:inline-flex;align-items:center;justify-content:center;padding:6px 10px;background:transparent;color:#2b3b4a;font-weight:800;border-radius:8px;font-size:11px;letter-spacing:0.04em;text-transform:uppercase;margin:0 auto;min-width:72px;line-height:1">${paymentStatus}</span>
            </td>
          </tr>
        `;
      });

      const generatedDate = new Date().toLocaleString('en-US', { timeZone: 'UTC', hour12: false });

      let logoSrc = logoSmall || '';
      try {
        const logoEl = document.querySelector('.slate-auth-header-logo, .logo img, .slate-auth-header-logo img');
        if (logoEl && logoEl.src) logoSrc = logoEl.src;
      } catch (e) {}

      const printAreaWrapperStart = (counts, pageHeightPx, tableHeightPx) => `
        <div style="width:850px;box-sizing:border-box;background:#ffffff;padding:48px;font-family:Manrope, Arial, sans-serif;color:#111827;${pageHeightPx ? `height:${pageHeightPx}px;` : 'height:100%;'}display:flex;flex-direction:column;">
            <div id="header-block" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:40px">
                    <div>
                        <div style="display:flex;align-items:center;gap:12px">
                            <img src="${logoSrc}" alt="App" style="height:28px;object-fit:contain;display:block" />
                            <div style="font-size:20px;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase;line-height:1">FinTrack</div>
                        </div>
                        <h2 style="margin:0;font-size:32px;font-weight:300;">Purchases Report</h2>
                    </div>
                <div style="text-align:right">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#566166;margin-bottom:6px">GENERATED DATE</div>
                    <div style="font-size:14px">${generatedDate}</div>
                </div>
            </div>
            <div id="metrics-block" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
        <div style="border:1px solid rgba(0,0,0,0.06);padding:20px 20px;height:128px;display:flex;align-items:center;justify-content:space-between;background:#fff">
                    <div>
                        <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#566166;margin-bottom:6px">Total Purchase Value</div>
                        <div style="font-size:30px;font-weight:900;color:#111827">${formatCurrency(totalPurchaseValue)}</div>
                    </div>
          <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center"></div>
                </div>
        <div style="padding:20px;height:128px;display:flex;align-items:center;justify-content:space-between;background:#2a3439;color:white;border:1px solid rgba(0,0,0,0.04)">
                    <div>
                        <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#566166;margin-bottom:6px">Paid Amount</div>
            <div style="font-size:36px;font-weight:900;line-height:1">${formatCurrency(totalPaidValue)}</div>
                    </div>
          <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center"></div>
                </div>
        <div style="border:1px solid rgba(0,0,0,0.06);padding:20px 20px;height:128px;display:flex;align-items:center;justify-content:space-between;background:#fff">
                    <div>
                        <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#566166;margin-bottom:6px">Due Amount</div>
                        <div style="font-size:30px;font-weight:900;color:#9f403d">${formatCurrency(totalDueValue)}</div>
                    </div>
          <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center"></div>
                </div>
            </div>
            <div style="display:flex;flex-direction:column;">
            <div style="margin-top:20px;${tableHeightPx ? `height:${tableHeightPx}px;` : 'flex:1 1 auto;'}display:flex;flex-direction:column;overflow:hidden"> 
                <table style="width:100%;border-collapse:collapse;text-align:left">
                    <thead id="table-head">
                        <tr style="background:#e8eff3">
                            <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166;width:72px">#</th>
                            <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166">Date</th>
                            <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166">Reference</th>
                            <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166">Supplier</th>
                            <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166;text-align:right">Grand Total</th>
                            <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166;text-align:right">Paid</th>
                            <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166;text-align:right">Due</th>
                            <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166;text-align:center;width:120px">Payment</th>
                        </tr>
                    </thead>
                    <tbody id="rows-placeholder">
      `;

      const printAreaWrapperEnd = (pageIndex, totalPages) => `
                    </tbody>
                </table>
            </div>
            </div>
            <div id="footer-block" style="margin-top:auto;padding-top:32px;border-top:1px solid rgba(86,97,102,0.04);display:flex;justify-content:space-between;align-items:flex-end">
                <div style="max-width:320px;color:#6b7280;font-size:12px">
                    <div style="font-size:11px;font-weight:700;text-transform:uppercase">Document Integrity Verified</div>
                </div>
                <div style="text-align:right;color:#374151">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:6px">Page Number</div>
                    <div style="font-size:18px;font-weight:300">${String(pageIndex).padStart(2,'0')} <span style="color:#6b7280">/ ${String(totalPages).padStart(2,'0')}</span></div>
                </div>
            </div>
        </div>
      `;

      // measurement container
      const measureContainer = document.createElement('div');
      measureContainer.style.position = 'absolute';
      measureContainer.style.left = '-9999px';
      measureContainer.style.top = '0';
      measureContainer.style.width = '850px';
      measureContainer.style.background = '#ffffff';
      document.body.appendChild(measureContainer);

      const sampleRows = rowTrs.length ? rowTrs.slice(0, Math.min(6, rowTrs.length)).join('') : '<tr><td style="padding:16px 8px">-</td></tr>';
      measureContainer.innerHTML = printAreaWrapperStart() + sampleRows + printAreaWrapperEnd(1,1);

      try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) {}
      await new Promise(res => setTimeout(res, 250));

      const samplePrint = measureContainer.firstElementChild;
      const computedStyle = window.getComputedStyle(samplePrint);
      const paddingTop = parseInt(computedStyle.paddingTop || '48', 10);
      const paddingBottom = parseInt(computedStyle.paddingBottom || '48', 10);

      const headerEl = samplePrint.querySelector('#header-block');
      const headerHeight = headerEl ? headerEl.offsetHeight : 160;
      const metricsEl = samplePrint.querySelector('#metrics-block');
      const metricsHeight = metricsEl ? metricsEl.offsetHeight : 128;
      const theadEl = samplePrint.querySelector('#table-head');
      const theadHeight = theadEl ? theadEl.offsetHeight : 40;
      const footerEl = samplePrint.querySelector('#footer-block');
      const footerHeight = footerEl ? footerEl.offsetHeight : 160;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const pageHeightPx = Math.floor((850 * pdfHeight) / pdfWidth);

      const sampleRowEls = samplePrint.querySelectorAll('tbody tr');
      let avgRowHeight = 48;
      if (sampleRowEls && sampleRowEls.length) {
        let totalRh = 0;
        sampleRowEls.forEach(r => { totalRh += r.offsetHeight; });
        avgRowHeight = Math.max(32, Math.round(totalRh / sampleRowEls.length));
      }

      const availableForTable = pageHeightPx - paddingTop - paddingBottom - headerHeight - metricsHeight - theadHeight - footerHeight - 24;
      const rowsPerPage = Math.max(3, Math.floor(availableForTable / avgRowHeight));

      const pages = [];
      for (let i = 0; i < rowTrs.length; i += rowsPerPage) {
        pages.push(rowTrs.slice(i, i + rowsPerPage));
      }

      document.body.removeChild(measureContainer);

      for (let p = 0; p < pages.length; p++) {
        const pageHtml = printAreaWrapperStart(null, pageHeightPx, availableForTable) + pages[p].join('') + printAreaWrapperEnd(p + 1, pages.length);
        const pageDiv = document.createElement('div');
        pageDiv.style.width = '850px';
        pageDiv.style.height = `${pageHeightPx}px`;
        pageDiv.style.boxSizing = 'border-box';
        pageDiv.style.background = '#ffffff';
        pageDiv.style.overflow = 'hidden';
        pageDiv.innerHTML = pageHtml;
        document.body.appendChild(pageDiv);

        await new Promise(res => setTimeout(res, 250));
        const canvas = await html2canvas(pageDiv, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');

        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        if (p > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        document.body.removeChild(pageDiv);
      }

      pdf.save('purchases-report.pdf');
      setError(null);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Failed to export PDF');
    } finally {
      setLoading(false);
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
