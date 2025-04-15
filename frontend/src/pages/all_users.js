import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import { FaFileExcel, FaFilePdf, FaEdit, FaTrash } from 'react-icons/fa';

const AllUsers = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "William Castillo",
      email: "william@example.com",
      phone: "+91-123456789",
      role: "Admin",
      status: "active"
    },
    {
      id: 2,
      name: "Thomas Johnson",
      email: "thomas@example.com",
      phone: "+91-987654321",
      role: "Manager",
      status: "active"
    },
    {
      id: 3,
      name: "Jack Wilson",
      email: "jack@example.com",
      phone: "+91-456789123",
      role: "Purchasing",
      status: "inactive"
    },
    {
      id: 4,
      name: "Wili Brown",
      email: "wili@example.com",
      phone: "+91-123789456",
      role: "Sales",
      status: "active"
    },
    {
      id: 5,
      name: "Stella Davis",
      email: "stella@example.com",
      phone: "+91-789123456",
      role: "Accounting",
      status: "inactive"
    },
    {
      id: 6,
      name: "Jessica Miller",
      email: "jessica@example.com",
      phone: "+91-456123789",
      role: "Purchasing",
      status: "active"
    },
    {
      id: 7,
      name: "Henry Taylor",
      email: "henry@example.com",
      phone: "+91-321654987",
      role: "Sales",
      status: "active"
    },
    {
      id: 8,
      name: "Larry Anderson",
      email: "larry@example.com",
      phone: "+91-654987321",
      role: "Accounting",
      status: "inactive"
    },
    {
      id: 9,
      name: "Hamzairi Moore",
      email: "hamzairi@example.com",
      phone: "+91-987321654",
      role: "Purchasing",
      status: "active"
    },
    {
      id: 10,
      name: "Stephen Jackson",
      email: "stephen@example.com",
      phone: "+91-654321987",
      role: "Manager",
      status: "active"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  return (
    <div className="users-page">
      <Sidebar />
      <div className="content-container">
        <div className="header-section">
          <h1>All Users</h1>
          <div className="search-filter-container">
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search this table"
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            <div className="action-buttons">
              <button className="filter-button">
                <FiFilter /> Filters
              </button>
              <button className="export-button pdf">
                <FaFilePdf /> PDF
              </button>
              <button className="export-button excel">
                <FaFileExcel /> Excel
              </button>
              <button className="add-user-button">
                <FiPlus /> Add New User
              </button>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`status-badge ${user.status}`}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-icons">
                        <FaEdit className="edit-icon" title="Edit" />
                        <FaTrash className="delete-icon" title="Delete" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="pagination">
            <button 
              onClick={handlePreviousPage} 
              disabled={currentPage === 1}
              className={currentPage === 1 ? 'disabled' : ''}
            >
              Previous
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              className={currentPage === totalPages ? 'disabled' : ''}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers; 