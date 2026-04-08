import React, { useState, useEffect } from 'react';
import { FaFileExcel, FaFilePdf, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './sales.css';
import { loansAPI } from '../services/api';

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

    // Handle PDF export
    const handlePdfExport = async () => {
        try {
            setLoading(true);
            const response = await loansAPI.exportLoans('pdf');

            // Create a blob URL and open it in a new tab
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            window.open(url, '_blank');

            // Clean up the URL object after opening
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);

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