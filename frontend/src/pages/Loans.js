import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaMoneyBillWave, FaFileExcel, FaFilePdf, FaPlus } from 'react-icons/fa';
import Layout from '../components/Layout';
import '../styles/Loans.css';
import { loansAPI } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const Loans = () => {
    const { addNotification } = useNotifications();
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

    // Handle loan payment
    const handlePayLoan = async (loanId) => {
        try {
            setLoading(true);
            const response = await loansAPI.payLoan(loanId);
            console.log('Loan payment response:', response.data);

            // Find the loan that was paid
            const paidLoan = loans.find(loan => loan._id === loanId);

            if (paidLoan) {
                // Add notification
                const formattedAmount = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(paidLoan.loanAmount);

                addNotification(
                    'loan',
                    `Loan #${paidLoan.loanNumber} for ${paidLoan.customer.name} has been paid in full (${formattedAmount})`,
                    loanId
                );
            }

            // Update the loan in the state
            const updatedLoans = loans.map((loan) =>
                loan._id === loanId
                    ? {
                          ...loan,
                          loanAmount: 0,
                          amountPaid: 0,
                          remainingBalance: 0,
                          paymentStatus: 'paid',
                      }
                    : loan
            );
            setLoans(updatedLoans);
            setFilteredLoans(updatedLoans);
        } catch (err) {
            console.error('Error paying loan:', err);
            setError('Failed to complete loan payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle PDF export
    const handlePdfExport = async () => {
        try {
            setLoading(true);
            const response = await loansAPI.exportLoans('pdf');

            // Create a blob URL and open it in a new tab
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Open in a new tab
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

    // Handle create new loan
    const handleCreateNewLoan = () => {
        // Navigate to loan creation page or open a modal
        window.location.href = '/loans/create';
        // Alternatively, you could set state to open a modal:
        // setIsCreateModalOpen(true);
    };

    return (
        <Layout title="Loans">
            {loading ? (
                <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            ) : (
                <div className="loans-frame">
                    <div className="loans-container">
                        <div className="loans-header">
                            <div className="loans-title">Loans</div>
                            
                            <div className="loans-controls-container">
                                <div className="loans-search-container">
                                    <FaSearch className="loans-search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search by customer name or loan number"
                                        className="loans-search-input"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                
                                <div className="loans-action-buttons">
                                    <button
                                        className="loans-export-button pdf-button"
                                        onClick={handlePdfExport}
                                        disabled={loading}
                                    >
                                        <FaFilePdf /> PDF
                                    </button>
                                    <button
                                        className="loans-export-button excel-button"
                                        onClick={handleExcelExport}
                                        disabled={loading}
                                    >
                                        <FaFileExcel /> Excel
                                    </button>
                                    <button 
                                        className="loans-create-button" 
                                        onClick={handleCreateNewLoan}
                                    >
                                        <FaPlus /> Create New Loan
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="loans-table-container">
                            <table className="loans-table">
                                <thead>
                                    <tr>
                                        <th>Loan Number</th>
                                        <th>Customer</th>
                                        <th>Loan Amount</th>
                                        <th>Remaining Loan</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLoans.length > 0 ? (
                                        filteredLoans.map((loan) => (
                                            <tr key={loan.loanNumber}>
                                                <td>{loan.loanNumber}</td>
                                                <td>{loan.customer.name}</td>
                                                <td>${loan.loanAmount.toLocaleString()}</td>
                                                <td>${loan.remainingBalance.toLocaleString()}</td>
                                                <td>
                                                    <span className={`loans-status ${loan.paymentStatus}`}>
                                                        {loan.paymentStatus.charAt(0).toUpperCase() + loan.paymentStatus.slice(1)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="loans-action-button">
                                                        <FaEye />
                                                    </button>
                                                    {loan.paymentStatus !== 'paid' && (
                                                        <button
                                                            className="loans-action-button pay-button"
                                                            onClick={() => handlePayLoan(loan._id)}
                                                        >
                                                            <FaMoneyBillWave />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">
                                                No loans found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Loans;