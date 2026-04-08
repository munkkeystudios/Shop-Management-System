import React, { useState, useEffect } from 'react';
import { FaFileExcel, FaFilePdf, FaPlus } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './sales.css';
import { loansAPI } from '../services/api';
import logoSmall from '../images/logo-small.png';

const Loans = () => {
    const navigate = useNavigate();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredLoans, setFilteredLoans] = useState([]);

    // Fetch loans from the API
    useEffect(() => {
        const fetchLoans = async () => {
            try {
                setLoading(true);
                const response = await loansAPI.getAll();
                console.log('API Response:', response.data);

                // Extract the loans array from the response
                const loansData = response.data && response.data.data && Array.isArray(response.data.data)
                    ? response.data.data
                    : [];
                setLoans(loansData);
                setFilteredLoans(loansData);
                console.log('Loans State:', loansData);
            } catch (err) {
                console.error('Error fetching loans:', err);
                setError('Failed to load loans. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
    }, []);

    // Filter loans based on search term
    useEffect(() => {
        const filtered = loans.filter((loan) =>
            loan.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.loanNumber.toString().includes(searchTerm)
        );
        setFilteredLoans(filtered);
    }, [searchTerm, loans]);

    // Handle PDF export (client-side, same template as EmployeeManagement)
    const handlePdfExport = async () => {
        try {
            setLoading(true);

            // build safe row HTML array from filteredLoans
                const rowTrs = filteredLoans.map((loan, idx) => {
                const id = String(idx + 1).padStart(3, '0');
                const customer = (loan.customer?.name || '-').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const loanAmt = loan.loanAmount ? formatCurrency(loan.loanAmount) : '-';
                const remaining = loan.remainingBalance ? formatCurrency(loan.remainingBalance) : '-';
                const status = (loan.paymentStatus || 'Unpaid').toString().toUpperCase();
                const created = loan.createdAt ? new Date(loan.createdAt).toISOString().slice(0,10) : (loan.date ? String(loan.date).slice(0,10) : '-');
                return `
                    <tr style="border-bottom:1px solid rgba(86,97,102,0.08)">
                        <td style="padding:16px 8px;font-family:monospace;font-size:11px;color:#6b7280">${id}</td>
                        <td style="padding:16px 8px;font-weight:700;font-size:14px;color:#111827">${customer}</td>
                        <td style="padding:16px 8px;font-size:14px;color:#111827;text-align:right">${loanAmt}</td>
                        <td style="padding:16px 8px;font-size:14px;color:#6b7280;text-align:right">${remaining}</td>
                        <td style="padding:16px 8px;font-size:12px;text-align:center;vertical-align:middle;display:flex;align-items:center;justify-content:center">
                            <span style="display:inline-flex;align-items:center;justify-content:center;padding:6px 10px;background:transparent;color:#2b3b4a;font-weight:800;border-radius:8px;font-size:11px;letter-spacing:0.04em;text-transform:uppercase;margin:0 auto;min-width:72px;line-height:1">${status}</span>
                        </td>
                    </tr>
                `;
            });

            const generatedDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi', hour12: false, timeZoneName: 'short' });

            // try to reuse the app logo if present on the page (login header or global header)
            let logoSrc = logoSmall || '';
            try {
                const logoEl = document.querySelector('.slate-auth-header-logo, .logo img, .slate-auth-header-logo img');
                if (logoEl && logoEl.src) logoSrc = logoEl.src;
            } catch (e) {}

            // Inline-styled print-area template (deterministic sizes)
            const printAreaWrapperStart = (counts, pageHeightPx, tableHeightPx) => `
                <div style="width:850px;box-sizing:border-box;background:#ffffff;padding:48px;font-family:Manrope, Arial, sans-serif;color:#111827;${pageHeightPx ? `height:${pageHeightPx}px;` : 'height:100%;'}display:flex;flex-direction:column;">
                    <div id="header-block" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:40px">
                            <div>
                                <div style="display:flex;align-items:center;gap:12px">
                                    <img src="${logoSrc}" alt="FinTrack" style="height:28px;object-fit:contain;display:block" />
                                    <div style="font-size:20px;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase;line-height:1">FinTrack</div>
                                </div>
                                <h2 style="margin:0;font-size:32px;font-weight:300;">Loans Report</h2>
                            </div>
                        <div style="text-align:right">
                            <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#566166;margin-bottom:6px">GENERATED DATE</div>
                            <div style="font-size:14px">${generatedDate}</div>
                        </div>
                    </div>
                    <!-- metrics -->
                    <div id="metrics-block" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
                        <div style="border:1px solid rgba(0,0,0,0.06);padding:20px 20px;height:128px;display:flex;align-items:center;justify-content:space-between;background:#fff">
                            <div>
                                <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#566166;margin-bottom:6px">Total Loan Portfolio</div>
                                <div style="font-size:30px;font-weight:900;color:#111827">${formatCurrency(totalLoanAmount)}</div>
                            </div>
                            <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center"></div>
                        </div>
                        <div style="padding:20px;height:128px;display:flex;align-items:center;justify-content:space-between;background:#2a3439;color:white;border:1px solid rgba(0,0,0,0.04)">
                            <div>
                                <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:rgba(255,255,255,0.9);margin-bottom:6px">Outstanding Loans</div>
                                <div style="font-size:36px;font-weight:900;line-height:1">${outstandingCount}</div>
                            </div>
                            <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center"></div>
                        </div>
                        <div style="border:1px solid rgba(0,0,0,0.06);padding:20px 20px;height:128px;display:flex;align-items:center;justify-content:space-between;background:#fff">
                            <div>
                                <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#566166;margin-bottom:6px">Completed Loans</div>
                                <div style="font-size:30px;font-weight:900;color:#111827">${paidCount}</div>
                            </div>
                            <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center"></div>
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;">
                    <div style="margin-top:20px;${tableHeightPx ? `height:${tableHeightPx}px;` : 'flex:1 1 auto;'}display:flex;flex-direction:column;overflow:hidden"> 
                        <table style="width:100%;border-collapse:collapse;text-align:left">
                            <thead id="table-head">
                                <tr style="background:#e8eff3">
                                    <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166;width:60px">ID</th>
                                    <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166">Customer</th>
                                    <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166;text-align:right">Loan Amount</th>
                                    <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166;text-align:right">Remaining</th>
                                    <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166;text-align:center;width:140px">Status</th>
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

            // create measurement container
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

            pdf.save('loans-report.pdf');
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
            const response = await loansAPI.exportLoans('csv');

            // Create a blob URL and trigger download
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'loans.csv');
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);

            setError(null);
        } catch (err) {
            console.error('Error exporting CSV:', err);
            setError('Failed to export CSV');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewLoan = () => {
        navigate('/create-loans');
    };

    const formatCurrency = (value) => {
        return `$${Number(value || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const totalLoanAmount = loans.reduce((sum, loan) => sum + (Number(loan.loanAmount) || 0), 0);
    const totalRemaining = loans.reduce((sum, loan) => sum + (Number(loan.remainingBalance) || 0), 0);
    const paidCount = loans.filter((loan) => loan.paymentStatus === 'paid').length;
    const outstandingCount = loans.filter((loan) => loan.paymentStatus !== 'paid').length;

    // Map loan paymentStatus values to the same label + className used on the Sales page
    const mapLoanStatus = (status) => {
        if (!status) return { label: 'Unpaid', className: 'unpaid' };
        const s = String(status).toLowerCase();
        if (s === 'paid') return { label: 'Completed', className: 'completed' };
        if (s === 'partial') return { label: 'Partial', className: 'partial' };
        // default -> unpaid (keeps visual parity with sales)
        return { label: s.charAt(0).toUpperCase() + s.slice(1), className: 'unpaid' };
    };

    return (
        <Layout title="All Loans">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div style={{ backgroundColor: '#f7f9fb', minHeight: 'calc(100vh - 80px)', fontFamily: 'Manrope, sans-serif' }}>
                <main style={{ flex: 1, minHeight: '100vh', background: '#f7f9fb' }}>
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
                        <section style={{ padding: '32px', maxWidth: '100%', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', gap: '16px', flexWrap: 'wrap' }}>
                                <div>
                                    <p
                                        style={{
                                            margin: '0 0 4px',
                                            color: '#565e74',
                                            fontWeight: 700,
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            fontSize: '12px',
                                        }}
                                    >
                                        Credit Overview
                                    </p>
                                    <h2 style={{ margin: 0, fontSize: '36px', fontWeight: 700, letterSpacing: '-0.025em', color: '#2a3439' }}>
                                        All Loans
                                    </h2>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                                            placeholder="Search customer or loan number..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{
                                                width: '320px',
                                                maxWidth: '80vw',
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
                                        type="button"
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

                                    <button
                                        type="button"
                                        onClick={handleCreateNewLoan}
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
                                        }}
                                    >
                                        <FaPlus /> Create New Loan
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '24px', marginBottom: '48px' }}>
                                <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                                    <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Total Loan Portfolio
                                    </p>
                                    <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                                        {formatCurrency(totalLoanAmount)}
                                    </p>
                                </div>
                                <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                                    <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Outstanding Balance
                                    </p>
                                    <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                                        {formatCurrency(totalRemaining)}
                                    </p>
                                </div>
                                <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                                    <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Paid Loans
                                    </p>
                                    <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#166534' }}>
                                        {paidCount}
                                    </p>
                                </div>
                                <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px', borderLeft: '4px solid #f59e0b' }}>
                                    <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Active Balances
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                        <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                                            {outstandingCount}
                                        </p>
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                color: '#b45309',
                                                background: '#fef3c7',
                                                padding: '2px 8px',
                                                borderRadius: '2px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>payments</span>
                                            Monitor
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#ffffff', borderRadius: '4px', overflow: 'hidden' }}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1.5fr 3fr 2fr 2fr 2fr',
                                        background: '#e8eff3',
                                        padding: '16px 24px',
                                        columnGap: '12px',
                                    }}
                                >
                                    <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>ID</div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Customer</div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'right' }}>Loan Amount</div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'right' }}>Remaining</div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'center' }}>Status</div>
                                </div>

                                {filteredLoans.length > 0 ? (
                                    <div>
                                        {filteredLoans.map((loan, index) => {
                                            const isStriped = index % 2 === 1;
                                            const loanStatus = mapLoanStatus(loan.paymentStatus);
                                            return (
                                                <div
                                                    key={loan._id || loan.loanNumber}
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '1.5fr 3fr 2fr 2fr 2fr',
                                                        padding: '20px 24px',
                                                        alignItems: 'center',
                                                        borderTop: index === 0 ? 'none' : '1px solid rgba(169, 180, 185, 0.2)',
                                                        background: isStriped ? '#fcfdff' : '#ffffff',
                                                        columnGap: '12px',
                                                    }}
                                                >
                                                    <div style={{ fontSize: '13px', color: '#566166', fontWeight: 700 }}>#{loan.loanNumber}</div>
                                                    <div style={{ fontSize: '14px', color: '#2a3439', fontWeight: 600 }}>{loan.customer?.name || 'Unknown Customer'}</div>
                                                    <div style={{ fontSize: '14px', color: '#2a3439', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(loan.loanAmount)}</div>
                                                    <div style={{ fontSize: '14px', color: '#2a3439', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(loan.remainingBalance)}</div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <span className={`slate-sales-status-badge ${loanStatus.className}`}>
                                                            {loanStatus.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px 24px', color: '#566166', fontSize: '14px' }}>No loans found.</div>
                                )}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </Layout>
    );
};

export default Loans;