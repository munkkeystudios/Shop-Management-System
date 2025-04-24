

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import { FiSearch, FiPlus, FiEdit, FiTrash, FiFilter, FiX } from 'react-icons/fi'; 
import { usersAPI } from '../services/api';
import './all_users.css'; 


const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-container" style={{maxWidth: '500px', padding: '20px'}}>
                 <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                    <h3>{title}</h3>
                    <button className="close-button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
                        <FiX />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};


const EmployeeManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // State for Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // User being edited or deleted

    // State for Forms
    const [formData, setFormData] = useState({
        name: '', username: '', password: '', role: 'cashier', phone: '', active: true
    });
    const [editFormData, setEditFormData] = useState({
        name: '', username: '', password: '', role: '', phone: '', active: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await usersAPI.getAll();
           
            setUsers(response.data.data.filter(user => user.role !== 'admin'));
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError(err.response?.data?.message || 'Failed to fetch employees.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

     const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // --- Modal Handling ---
    const openCreateModal = () => {
        setFormData({ name: '', username: '', password: '', role: 'cashier', phone: '', active: true });
        setError(null); // Clear previous errors
        setIsCreateModalOpen(true);
    };
    const closeCreateModal = () => setIsCreateModalOpen(false);

    const openEditModal = (user) => {
        setCurrentUser(user);
        setEditFormData({
            name: user.name || '',
            username: user.username, // Usually username cannot be edited
            password: '', // Clear password field for reset option
            role: user.role,
            phone: user.phone || '',
            active: user.active
        });
        setError(null); // Clear previous errors
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => setIsEditModalOpen(false);

    const openDeleteModal = (user) => {
        setCurrentUser(user);
        setIsDeleteModalOpen(true);
    };
    const closeDeleteModal = () => setIsDeleteModalOpen(false);


    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleEditFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 6) {
             setError("Password must be at least 6 characters long.");
             return;
        }
        setError(null); // Clear previous errors
        setLoading(true);
        try {
            await usersAPI.create({ ...formData });
            showSuccess(`Employee ${formData.username} created successfully.`);
            closeCreateModal();
            fetchEmployees(); // Refresh list
        } catch (err) {
            console.error("Create user error:", err);
            setError(err.response?.data?.message || "Failed to create employee.");
        } finally {
             setLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
         e.preventDefault();
         if (!currentUser) return;

         const updateData = {
             name: editFormData.name,
             role: editFormData.role,
             phone: editFormData.phone,
             active: editFormData.active
         };
         // Only include password if user entered something
         if (editFormData.password) {
             if (editFormData.password.length < 6) {
                 setError("New password must be at least 6 characters long.");
                 return;
             }
             updateData.password = editFormData.password;
         }
         setError(null); // Clear previous errors
         setLoading(true);

        try {
            await usersAPI.update(currentUser._id, updateData);
            showSuccess(`Employee ${currentUser.username} updated successfully.`);
            closeEditModal();
            fetchEmployees(); // Refresh list
        } catch (err) {
             console.error("Update user error:", err);
             setError(err.response?.data?.message || "Failed to update employee.");
        } finally {
             setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            await usersAPI.delete(currentUser._id);
            showSuccess(`Employee ${currentUser.username} deleted successfully.`);
            closeDeleteModal();
            fetchEmployees(); // Refresh list
        } catch (err) {
             console.error("Delete user error:", err);
             setError(err.response?.data?.message || "Failed to delete employee.");
             closeDeleteModal(); // Close modal even on error
        } finally {
             setLoading(false);
        }
    };

    // --- Filtering ---
    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="users-page">
            <Sidebar />
            <div className="content-container">
                <div className="header-section">
                    <h1>Employee Management</h1>
                    <div className="search-filter-container">
                        <div className="search-container">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="search-input"
                            />
                        </div>
                        <div className="action-buttons">
                            {/* Add filter button if needed */}
                            {/* <button className="filter-button"><FiFilter /> Filters</button> */}
                            <button className="add-user-button" onClick={openCreateModal}>
                                <FiPlus /> Add New Employee
                            </button>
                        </div>
                    </div>
                </div>

                 {successMessage && (
                    <div className="success-container">
                        <div className="success-message">{successMessage}</div>
                    </div>
                )}
                {error && !isCreateModalOpen && !isEditModalOpen && ( // Show general error only if modals are closed
                    <div className="error-container">
                        <div className="error-message">{error}</div>
                    </div>
                )}


                {loading && !isCreateModalOpen && !isEditModalOpen ? (
                     <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <div>Loading employees...</div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Username</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.name || '-'}</td>
                                            <td>{user.username}</td>
                                            <td>{user.phone || '-'}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                                                    {user.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-icons">
                                                    <FiEdit className="edit-icon" title="Edit" onClick={() => openEditModal(user)} />
                                                    <FiTrash className="delete-icon" title="Delete" onClick={() => openDeleteModal(user)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-results">No employees found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                 {/**/}

            </div>

            {/* */}
            <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Create New Employee">
                <form onSubmit={handleCreateSubmit} className="modal-form">
                     {error && isCreateModalOpen && <div className="error-message" style={{marginBottom: '10px'}}>{error}</div>}
                    <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleFormChange} required />
                    <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleFormChange} required />
                    <input type="password" name="password" placeholder="Password (min 6 chars)" value={formData.password} onChange={handleFormChange} required />
                    <input type="text" name="phone" placeholder="Phone (Optional)" value={formData.phone} onChange={handleFormChange} />
                    <select name="role" value={formData.role} onChange={handleFormChange} required>
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                    </select>
                     <label style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                        <input type="checkbox" name="active" checked={formData.active} onChange={handleFormChange} style={{ marginRight: '8px' }}/>
                        Active Account
                    </label>
                    <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Creating...' : 'Create Employee'}</button>
                </form>
            </Modal>

            
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title={`Edit Employee: ${currentUser?.username}`}>
                 <form onSubmit={handleEditSubmit} className="modal-form">
                    {error && isEditModalOpen && <div className="error-message" style={{marginBottom: '10px'}}>{error}</div>}
                    <input type="text" name="name" placeholder="Full Name" value={editFormData.name} onChange={handleEditFormChange} />
                    <input type="text" name="phone" placeholder="Phone" value={editFormData.phone} onChange={handleEditFormChange} />
                     <input type="password" name="password" placeholder="New Password (Optional)" value={editFormData.password} onChange={handleEditFormChange} />
                    <select name="role" value={editFormData.role} onChange={handleEditFormChange} required>
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                    </select>
                     <label style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                        <input type="checkbox" name="active" checked={editFormData.active} onChange={handleEditFormChange} style={{ marginRight: '8px' }}/>
                        Active Account
                    </label>
                    <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                </form>
            </Modal>

            
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Confirm Deletion">
                <p>Are you sure you want to delete employee <strong>{currentUser?.username}</strong>?</p>
                 {error && isDeleteModalOpen && <div className="error-message" style={{marginBottom: '10px'}}>{error}</div>}
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                     <button className="cancel-button" onClick={closeDeleteModal} disabled={loading}>Cancel</button>
                    <button className="delete-button" onClick={handleDeleteConfirm} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</button>
                </div>
            </Modal>


        </div>
    );
};

export default EmployeeManagement;
