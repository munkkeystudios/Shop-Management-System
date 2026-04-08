import React, { useState, useEffect } from "react";
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import logoSmall from '../images/logo-small.png';
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

      // Ensure we export the full dataset (not just the currently loaded/page-limited `filteredSales`).
      // Try fetching all sales from the API with a high limit, falling back to `filteredSales`.
      let exportSalesData = filteredSales;
      try {
        const fetchParams = { ...filters, limit: 10000, sort: '-date' };
        const resp = await salesAPI.getAll(fetchParams);
        if (resp && resp.data && resp.data.success) {
          exportSalesData = Array.isArray(resp.data.data) ? resp.data.data : (Array.isArray(resp.data.sales) ? resp.data.sales : exportSalesData);
        }
      } catch (e) {
        // If fetching all sales fails, continue with the currently filteredSales
        console.warn('Could not fetch full sales for export, using current filtered set', e);
      }

      const rowTrs = exportSalesData.map((sale, idx) => {
        const id = String(idx + 1).padStart(3, '0');
        const date = formatDate(sale.createdAt || sale.date);
        const reference = (sale._id || '').toString();
        const customer = sale.customer?.name ? String(sale.customer.name).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '-';
        const total = formatAmount(sale.total);
        const paid = formatAmount(sale.amountPaid || 0);
        const status = getSaleStatus(sale).label.toUpperCase();

        return `
          <tr style="border-bottom:1px solid rgba(86,97,102,0.08)">
            <td style="padding:16px 8px;font-family:monospace;font-size:11px;color:#6b7280">${id}</td>
            <td style="padding:16px 8px;font-weight:700;font-size:14px;color:#111827">${date}</td>
            <td style="padding:16px 8px;font-size:14px;color:#111827">${reference}</td>
            <td style="padding:16px 8px;font-size:14px;color:#111827">${customer}</td>
            <td style="padding:16px 8px;font-size:14px;color:#111827;text-align:right">${total}</td>
            <td style="padding:16px 8px;font-size:14px;color:#6b7280;text-align:right">${paid}</td>
            <td style="padding:16px 8px;font-size:12px;text-align:center;vertical-align:middle;display:flex;align-items:center;justify-content:center">
              <span style="display:inline-flex;align-items:center;justify-content:center;padding:6px 10px;background:transparent;color:#2b3b4a;font-weight:800;border-radius:8px;font-size:11px;letter-spacing:0.04em;text-transform:uppercase;margin:0 auto;min-width:72px;line-height:1">${status}</span>
            </td>
          </tr>
        `;
      });

  const generatedDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi', hour12: false, timeZoneName: 'short' });

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
                        <h2 style="margin:0;font-size:32px;font-weight:300;">Sales Report</h2>
                    </div>
                <div style="text-align:right">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#566166;margin-bottom:6px">GENERATED DATE</div>
                    <div style="font-size:14px">${generatedDate}</div>
                </div>
            </div>
            <div id="metrics-block" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
        <div style="border:1px solid rgba(0,0,0,0.06);padding:20px 20px;height:128px;display:flex;align-items:center;justify-content:space-between;background:#fff">
                    <div>
                        <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#566166;margin-bottom:6px">Total Sales</div>
                        <div style="font-size:30px;font-weight:900;color:#111827">${formatAmount(totalSalesAmount)}</div>
                    </div>
          <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center"></div>
                </div>
        <div style="padding:20px;height:128px;display:flex;align-items:center;justify-content:space-between;background:#2a3439;color:white;border:1px solid rgba(0,0,0,0.04)">
          <div>
            <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:rgba(255,255,255,0.9);margin-bottom:6px">Avg Order Value</div>
            <div style="font-size:36px;font-weight:900;line-height:1;color:#ffffff">${formatAmount(averageOrderValue)}</div>
          </div>
          <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center"></div>
        </div>
        <div style="border:1px solid rgba(0,0,0,0.06);padding:20px 20px;height:128px;display:flex;align-items:center;justify-content:space-between;background:#fff">
                    <div>
                        <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#566166;margin-bottom:6px">Items Sold</div>
                        <div style="font-size:30px;font-weight:900;color:#2a3439">${totalItemsSold.toLocaleString()}</div>
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
                            <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166">Customer</th>
                            <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166;text-align:right">Total Amount</th>
                            <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166;text-align:right">Paid Amount</th>
                            <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166;text-align:center;width:120px">Status</th>
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

  // create pages
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

      pdf.save('sales-report.pdf');
      setError(null);
    } catch (err) {
      console.error('Error exporting PDF:', err);
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
