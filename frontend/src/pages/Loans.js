import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaMoneyBillWave } from 'react-icons/fa';
import Layout from '../components/Layout';
import '../styles/Loans.css';
import { loansAPI } from '../services/api'; // Use the actual API

const Loans = () => {
    const [loans, setLoans] = useState([]); // Ensure loans is initialized as an array
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
            const response = await loansAPI.payLoan(loanId); // Call the API to pay the loan
            console.log('Loan payment response:', response.data);

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
                <div className="loans-container">
                    <div className="loans-header">
                        <h1>Loans</h1>
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
                                                <span className={`status-badge ${loan.paymentStatus}`}>
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
            )}
        </Layout>
    );
};

export default Loans;