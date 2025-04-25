import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye } from 'react-icons/fa';
import Layout from '../components/Layout';
import loansAPI from '../services/loanService';
import '../styles/Loans.css';

const mockLoans = [
    {
        _id: '1',
        loanNumber: 1001,
        customer: { name: 'John Doe' },
        loanAmount: 5000,
        remainingBalance: 2000,
        paymentStatus: 'partial',
    },
    {
        _id: '2',
        loanNumber: 1002,
        customer: { name: 'Jane Smith' },
        loanAmount: 10000,
        remainingBalance: 0,
        paymentStatus: 'paid',
    },
    {
        _id: '3',
        loanNumber: 1003,
        customer: { name: 'Robert Johnson' },
        loanAmount: 7500,
        remainingBalance: 7500,
        paymentStatus: 'pending',
    },
    {
        _id: '4',
        loanNumber: 1004,
        customer: { name: 'Alice Williams' },
        loanAmount: 12000,
        remainingBalance: 6000,
        paymentStatus: 'partial',
    },
    {
        _id: '5',
        loanNumber: 1005,
        customer: { name: 'Michael Brown' },
        loanAmount: 15000,
        remainingBalance: 15000,
        paymentStatus: 'pending',
    },
];

const Loans = () => {
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
                // // const response = await loansAPI.getAll(); // Fetch all loans
                // setLoans(response.data.data); // Assuming the API returns data in `data.data`
                // setFilteredLoans(response.data.data); // Initialize filtered loans
                // Simulate API call with mock data
                const response = { data: { data: mockLoans } }; // Mock API response
                setLoans(response.data.data);
                setFilteredLoans(response.data.data);

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
                                    <th>Remaining Balance</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLoans.length > 0 ? (
                                    filteredLoans.map((loan) => (
                                        <tr key={loan._id}>
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