

import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit, FiTrash, FiX } from 'react-icons/fi';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { usersAPI } from '../services/api';
import Layout from '../components/Layout';
import EmployeeFilter from '../components/EmployeeFilter';
import { useNotifications } from '../context/NotificationContext';
import './employee_management.css';


const Modal = ({ isOpen, onClose, title, children, modalType = 'create' }) => {
    if (!isOpen) return null;
    return (
        <div className="employee-modal-overlay">
            <div className={`employee-modal-container ${modalType}`}>
                <div className="employee-modal-header">
                    <h3 className="employee-modal-title">{title}</h3>
                    <button className="employee-modal-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>
                <div className="employee-modal-body">
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
    const [filters, setFilters] = useState({
        role: '',
        status: ''
    });
    const { addNotification } = useNotifications();

    // State for Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // State for Forms
    const [formData, setFormData] = useState({
        name: '', username: '', password: '', role: 'cashier', phone: '', active: true
    });
    const [editFormData, setEditFormData] = useState({
        name: '', username: '', password: '', role: '', phone: '', active: ''
    });

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
        setError(null);
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
            const response = await usersAPI.create({ ...formData });
            const newEmployeeId = response.data?.data?._id;

            // Add notification
            addNotification(
                'employee',
                `New employee "${formData.name}" (${formData.username}) has been created`,
                newEmployeeId
            );

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

            // Add notification
            addNotification(
                'employee',
                `Employee "${currentUser.name || currentUser.username}" has been updated`,
                currentUser._id
            );

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

            // Add notification
            addNotification(
                'employee',
                `Employee "${currentUser.name || currentUser.username}" has been deleted`
            );

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

    // Handle applying filters
    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
    };

    // Handle PDF export
    const handleExportPDF = async () => {
        try {
            setLoading(true);

            // Add current filters to export
            const params = {
                format: 'pdf',
                role: filters.role || '',
                status: filters.status || ''
            };

            const response = await usersAPI.exportUsers('pdf', params);

            // Create a blob URL and open it in a new tab
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Open in a new tab
            window.open(url, '_blank');

            // Clean up the URL object after opening
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);

            setError(null);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            setError('Failed to export PDF');
        } finally {
            setLoading(false);
        }
    };

    // Handle Excel export
    const handleExportExcel = async () => {
        try {
            setLoading(true);

            // Add current filters to export
            const params = {
                format: 'csv',
                role: filters.role || '',
                status: filters.status || ''
            };

            const response = await usersAPI.exportUsers('csv', params);

            // Create a blob URL and trigger download
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'employees.csv');
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

    // --- Filtering ---
    const filteredUsers = users.filter(user => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch =
            (user.name?.toLowerCase() || '').includes(searchTermLower) ||
            user.username.toLowerCase().includes(searchTermLower) ||
            user.role.toLowerCase().includes(searchTermLower);

        // Apply role filter
        const matchesRole = !filters.role || user.role === filters.role;

        // Apply status filter
        const matchesStatus = !filters.status ||
            (filters.status === 'active' && user.active) ||
            (filters.status === 'inactive' && !user.active);

        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <Layout title="Employee Management">
            <div className="employee-frame">
                <div className="employee-div-2">
                    <div className="employee-div-3">
                        <div className="employee-div-4">
                            <h2 className="employee-text-2">Employee Management</h2>
                        </div>
                        <div className="employee-controls-row">
                            <div className="employee-search-container">
                                <FiSearch className="employee-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="employee-search-input"
                                />
                            </div>
                            <div className="employee-action-buttons">
                                <EmployeeFilter onApplyFilters={handleApplyFilters} />

                                <button
                                    className="employee-export-button pdf-button"
                                    onClick={handleExportPDF}
                                    disabled={loading}
                                >
                                    <FaFilePdf /> PDF
                                </button>

                                <button
                                    className="employee-export-button excel-button"
                                    onClick={handleExportExcel}
                                    disabled={loading}
                                >
                                    <FaFileExcel /> Excel
                                </button>

                                <button className="employee-create-button" onClick={openCreateModal}>
                                    <FiPlus /> Add New Employee
                                </button>
                            </div>
                        </div>
                    </div>

                    {successMessage && (
                        <div className="employee-success-message">
                            {successMessage}
                        </div>
                    )}

                    {error && !isCreateModalOpen && !isEditModalOpen && (
                        <div className="employee-error-message">
                            {error}
                        </div>
                    )}

                    {loading && !isCreateModalOpen && !isEditModalOpen && !isDeleteModalOpen && (
                        <div className="employee-loading-overlay">
                            <div className="employee-spinner"></div>
                            <div className="employee-loading-text">Processing...</div>
                        </div>
                    )}

                    {loading && !isCreateModalOpen && !isEditModalOpen ? (
                        <div className="employee-loading">
                            <div className="employee-spinner"></div>
                            <div className="employee-loading-text">Loading employees...</div>
                        </div>
                    ) : (
                        <div>
                            <table className="employee-table">
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
                                            <td colSpan="6" style={{textAlign: 'center', padding: '20px', color: '#6c757d'}}>
                                                No employees found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Create New Employee" modalType="create">
                <form onSubmit={handleCreateSubmit}>
                    {error && isCreateModalOpen && <div className="employee-error-message">{error}</div>}

                    <div className="employee-form-group">
                        <label className="employee-form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="employee-form-input"
                            value={formData.name}
                            onChange={handleFormChange}
                            required
                        />
                    </div>

                    <div className="employee-form-group">
                        <label className="employee-form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="employee-form-input"
                            value={formData.username}
                            onChange={handleFormChange}
                            required
                        />
                    </div>

                    <div className="employee-form-group">
                        <label className="employee-form-label">Password (min 6 chars)</label>
                        <input
                            type="password"
                            name="password"
                            className="employee-form-input"
                            value={formData.password}
                            onChange={handleFormChange}
                            required
                        />
                    </div>

                    <div className="employee-form-group">
                        <label className="employee-form-label">Phone (Optional)</label>
                        <input
                            type="text"
                            name="phone"
                            className="employee-form-input"
                            value={formData.phone}
                            onChange={handleFormChange}
                        />
                    </div>

                    <div className="employee-form-group">
                        <label className="employee-form-label">Role</label>
                        <select
                            name="role"
                            className="employee-form-select"
                            value={formData.role}
                            onChange={handleFormChange}
                            required
                        >
                            <option value="cashier">Cashier</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>

                    <div className="employee-form-checkbox">
                        <input
                            type="checkbox"
                            name="active"
                            checked={formData.active}
                            onChange={handleFormChange}
                        />
                        <label>Active Account</label>
                    </div>

                    <div className="employee-form-actions">
                        <button type="button" className="employee-btn-cancel" onClick={closeCreateModal}>Cancel</button>
                        <button type="submit" className="employee-btn-submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Employee'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title={`Edit Employee: ${currentUser?.username}`} modalType="edit">
                <form onSubmit={handleEditSubmit}>
                    {error && isEditModalOpen && <div className="employee-error-message">{error}</div>}

                    <div className="employee-form-group">
                        <label className="employee-form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="employee-form-input"
                            value={editFormData.name}
                            onChange={handleEditFormChange}
                        />
                    </div>

                    <div className="employee-form-group">
                        <label className="employee-form-label">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            className="employee-form-input"
                            value={editFormData.phone}
                            onChange={handleEditFormChange}
                        />
                    </div>

                    <div className="employee-form-group">
                        <label className="employee-form-label">New Password (Optional)</label>
                        <input
                            type="password"
                            name="password"
                            className="employee-form-input"
                            value={editFormData.password}
                            onChange={handleEditFormChange}
                        />
                    </div>

                    <div className="employee-form-group">
                        <label className="employee-form-label">Role</label>
                        <select
                            name="role"
                            className="employee-form-select"
                            value={editFormData.role}
                            onChange={handleEditFormChange}
                            required
                        >
                            <option value="cashier">Cashier</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>

                    <div className="employee-form-checkbox">
                        <input
                            type="checkbox"
                            name="active"
                            checked={editFormData.active}
                            onChange={handleEditFormChange}
                        />
                        <label>Active Account</label>
                    </div>

                    <div className="employee-form-actions">
                        <button type="button" className="employee-btn-cancel" onClick={closeEditModal}>Cancel</button>
                        <button type="submit" className="employee-btn-submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Confirm Deletion" modalType="delete">
                <p style={{marginBottom: '20px'}}>Are you sure you want to delete employee <strong>{currentUser?.username}</strong>?</p>

                {error && isDeleteModalOpen && <div className="employee-error-message">{error}</div>}

                <div className="employee-form-actions">
                    <button className="employee-btn-cancel" onClick={closeDeleteModal} disabled={loading}>
                        Cancel
                    </button>
                    <button className="employee-btn-delete" onClick={handleDeleteConfirm} disabled={loading}>
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </Modal>
        </Layout>
    );
};

export default EmployeeManagement;
