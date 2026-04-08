import React, { useState, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { usersAPI } from '../services/api';
import Layout from '../components/Layout';
import EmployeeFilter from '../components/EmployeeFilter';
import { useNotifications } from '../context/NotificationContext';
import './employee_management.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logoSmall from '../images/logo-small.png';


const Modal = ({ isOpen, onClose, title, children, modalType = 'create' }) => {
    if (!isOpen) return null;
    return (
        <div className="employee-modal-overlay" onClick={onClose}>
            <div className={`employee-modal-container ${modalType}`} onClick={(e) => e.stopPropagation()}>
                <div className="employee-modal-header">
                    <h3 className="employee-modal-title">{title}</h3>
                    <button 
                        className="employee-modal-close" 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px',
                            borderRadius: '999px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#e8eff3'; e.currentTarget.style.color = '#334155'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
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

   
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);


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
            username: user.username, 
            password: '', 
            role: user.role,
            phone: user.phone || '',
            active: user.active
        });
        setError(null); 
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
        setError(null); 
        setLoading(true);
        try {
            const response = await usersAPI.create({ ...formData });
            const newEmployeeId = response.data?.data?._id;

            
            addNotification(
                'employee',
                `New employee "${formData.name}" (${formData.username}) has been created`,
                newEmployeeId
            );

            showSuccess(`Employee ${formData.username} created successfully.`);
            closeCreateModal();
            fetchEmployees(); 
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
         
         if (editFormData.password) {
             if (editFormData.password.length < 6) {
                 setError("New password must be at least 6 characters long.");
                 return;
             }
             updateData.password = editFormData.password;
         }
         setError(null); 
         setLoading(true);

        try {
            await usersAPI.update(currentUser._id, updateData);

            
            addNotification(
                'employee',
                `Employee "${currentUser.name || currentUser.username}" has been updated`,
                currentUser._id
            );

            showSuccess(`Employee ${currentUser.username} updated successfully.`);
            closeEditModal();
            fetchEmployees(); 
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

            
            addNotification(
                'employee',
                `Employee "${currentUser.name || currentUser.username}" has been deleted`
            );

            showSuccess(`Employee ${currentUser.username} deleted successfully.`);
            closeDeleteModal();
            fetchEmployees(); 
        } catch (err) {
             console.error("Delete user error:", err);
             setError(err.response?.data?.message || "Failed to delete employee.");
             closeDeleteModal(); 
        } finally {
             setLoading(false);
        }
    };

    
    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
    };

   
    const handleExportPDF = async () => {
        // Use the exact Loans page PDF template but swap in Employee table content
        try {
            setLoading(true);

            // Build rows similar to Loans' row markup but for employees
            const rowTrs = filteredUsers.map((user, idx) => {
                const id = String(idx + 1).padStart(3, '0');
                const username = (user.username || '-').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const name = (user.name || '-').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const phone = (user.phone || '-').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const roleText = (user.role || '-').toString();
                const role = roleText.toUpperCase();
                const created = user.createdAt ? new Date(user.createdAt).toISOString().slice(0,10) : '-';

                return `
                    <tr style="border-bottom:1px solid rgba(86,97,102,0.08)">
                        <td style="padding:16px 8px;font-family:monospace;font-size:11px;color:#6b7280">${id}</td>
                        <td style="padding:16px 8px;font-weight:700;font-size:14px;color:#111827">${username}</td>
                        <td style="padding:16px 8px;font-size:14px;color:#111827">${name}</td>
                        <td style="padding:16px 8px;font-size:14px;color:#6b7280">${phone}</td>
                        <td style="padding:16px 8px;font-size:12px;text-align:center;vertical-align:middle;display:flex;align-items:center;justify-content:center">
                            <span style="display:inline-flex;align-items:center;justify-content:center;padding:6px 10px;background:transparent;color:#2b3b4a;font-weight:800;border-radius:8px;font-size:11px;letter-spacing:0.04em;text-transform:uppercase;margin:0 auto;min-width:72px;line-height:1">${role}</span>
                        </td>
                        <td style="padding:16px 8px;font-size:14px;color:#6b7280">${created}</td>
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
                                    <img src="${logoSrc}" alt="FinTrack" style="height:28px;object-fit:contain;display:block" />
                                    <div style="font-size:20px;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase;line-height:1">FinTrack</div>
                                </div>
                                <h2 style="margin:0;font-size:32px;font-weight:300;">User Audit Report</h2>
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
                                <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#566166;margin-bottom:6px">Total Registered</div>
                                <div style="font-size:30px;font-weight:900;color:#111827">${totalEmployees}</div>
                            </div>
                            <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center"></div>
                        </div>
                        <div style="padding:20px;height:128px;display:flex;align-items:center;justify-content:space-between;background:#2a3439;color:white;border:1px solid rgba(0,0,0,0.04)">
                            <div>
                                <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:rgba(255,255,255,0.9);margin-bottom:6px">Active Users</div>
                                <div style="font-size:36px;font-weight:900;line-height:1">${activeEmployees}</div>
                            </div>
                            <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center"></div>
                        </div>
                        <div style="border:1px solid rgba(0,0,0,0.06);padding:20px 20px;height:128px;display:flex;align-items:center;justify-content:space-between;background:#fff">
                            <div>
                                <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#566166;margin-bottom:6px">Total Managers</div>
                                <div style="font-size:30px;font-weight:900;color:#111827">${managerCount}</div>
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
                                    <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166">Username</th>
                                    <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166">Full Name</th>
                                    <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166">Phone</th>
                                    <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166;text-align:center;width:140px">Role</th>
                                    <th style="padding:12px 8px;font-size:10px;font-weight:900;text-transform:uppercase;color:#566166">Created</th>
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

            pdf.save('employee-audit.pdf');
            setError(null);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            setError('Failed to export PDF');
        } finally {
            setLoading(false);
        }
    };

  
    const handleExportExcel = async () => {
        try {
            setLoading(true);

           
            const params = {
                format: 'csv',
                role: filters.role || '',
                status: filters.status || ''
            };

            const response = await usersAPI.exportUsers('csv', params);

            
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);

            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'employees.csv');
            document.body.appendChild(link);
            link.click();

            
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

   
    const filteredUsers = users.filter(user => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch =
            (user.name?.toLowerCase() || '').includes(searchTermLower) ||
            user.username.toLowerCase().includes(searchTermLower) ||
            user.role.toLowerCase().includes(searchTermLower);

        
        const matchesRole = !filters.role || user.role === filters.role;

       
        const matchesStatus = !filters.status ||
            (filters.status === 'active' && user.active) ||
            (filters.status === 'inactive' && !user.active);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const totalEmployees = users.length;
    const activeEmployees = users.filter((user) => user.active).length;
    const inactiveEmployees = users.filter((user) => !user.active).length;
    const managerCount = users.filter((user) => user.role === 'manager').length;

    return (
        <Layout title="Employee Management">
            {error && !isCreateModalOpen && !isEditModalOpen && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div style={{ backgroundColor: '#f7f9fb', minHeight: 'calc(100vh - 80px)', fontFamily: 'Manrope, sans-serif' }}>
                <main style={{ flex: 1, minHeight: '100vh', background: '#f7f9fb' }}>
                    {loading && !isCreateModalOpen && !isEditModalOpen && !isDeleteModalOpen ? (
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
                                        Workforce Overview
                                    </p>
                                    <h2 style={{ margin: 0, fontSize: '36px', fontWeight: 700, letterSpacing: '-0.025em', color: '#2a3439' }}>
                                        Employee Management
                                    </h2>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                                            placeholder="Search employees..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            style={{
                                                width: '300px',
                                                maxWidth: '78vw',
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

                                    <EmployeeFilter onApplyFilters={handleApplyFilters} />

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

                                    <button
                                        type="button"
                                        onClick={openCreateModal}
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
                                        <FiPlus /> Add New Employee
                                    </button>
                                </div>
                            </div>

                            {successMessage && (
                                <div style={{ background: '#e7f5eb', color: '#1f5e2e', padding: '12px 14px', borderRadius: '4px', fontWeight: 600, marginBottom: '20px' }}>
                                    {successMessage}
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '24px', marginBottom: '48px' }}>
                                <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                                    <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Total Employees
                                    </p>
                                    <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                                        {totalEmployees}
                                    </p>
                                </div>
                                <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                                    <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Active Staff
                                    </p>
                                    <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#166534' }}>
                                        {activeEmployees}
                                    </p>
                                </div>
                                <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                                    <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Inactive Staff
                                    </p>
                                    <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#9f403d' }}>
                                        {inactiveEmployees}
                                    </p>
                                </div>
                                <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px', borderLeft: '4px solid #f59e0b' }}>
                                    <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Managers
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                        <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                                            {managerCount}
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
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>supervisor_account</span>
                                            Leadership
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#ffffff', borderRadius: '4px', overflow: 'hidden' }}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '3fr 2fr 2fr 1.5fr 1.5fr 1.5fr',
                                        background: '#e8eff3',
                                        padding: '16px 24px',
                                        columnGap: '12px',
                                    }}
                                >
                                    <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Name</div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Username</div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Phone</div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Role</div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'center' }}>Status</div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'center' }}>Actions</div>
                                </div>

                                {filteredUsers.length > 0 ? (
                                    <div>
                                        {filteredUsers.map((user, index) => {
                                            const isStriped = index % 2 === 1;
                                            return (
                                                <div
                                                    key={user._id}
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '3fr 2fr 2fr 1.5fr 1.5fr 1.5fr',
                                                        padding: '20px 24px',
                                                        alignItems: 'center',
                                                        columnGap: '12px',
                                                        background: isStriped ? 'rgba(240, 244, 247, 0.3)' : 'transparent',
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 700, color: '#2a3439' }}>{user.name || '-'}</div>
                                                    <div style={{ color: '#566166', fontFamily: 'monospace', fontSize: '13px' }}>{user.username}</div>
                                                    <div style={{ color: '#566166', fontSize: '14px' }}>{user.phone || '-'}</div>
                                                    <div style={{ color: '#566166', fontSize: '14px', textTransform: 'capitalize' }}>{user.role}</div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <span
                                                            className={`employee-status-badge ${user.active ? 'completed' : 'unpaid'}`}
                                                        >
                                                            {user.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <div className="action-icons" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                        <button
                                                            type="button"
                                                            className="employee-action-icon-btn"
                                                            title="Edit"
                                                            onClick={() => openEditModal(user)}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="employee-action-icon-btn delete"
                                                            title="Delete"
                                                            onClick={() => openDeleteModal(user)}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px 24px', color: '#566166', fontSize: '14px' }}>No employees found.</div>
                                )}
                            </div>
                        </section>
                    )}
                </main>
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

            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Employee" modalType="edit">
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="products-modal-overlay"
          onClick={() => {
            closeDeleteModal();
            document.body.style.overflow = 'auto';
          }}
        >
          <div
            className="products-modal-container delete"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="products-modal-header">
              <div className="products-modal-title">Confirm Delete</div>
              <button
                className="products-modal-close"
                onClick={() => {
                  closeDeleteModal();
                  document.body.style.overflow = 'auto';
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="products-delete-modal-body">
              <p className="products-delete-modal-message">
                Are you sure you want to delete employee "{currentUser?.username}"? This action cannot be undone.
              </p>
              {error && <div className="employee-error-message">{error}</div>}
              <div className="products-delete-modal-buttons">
                <button
                  type="button"
                  onClick={() => {
                    closeDeleteModal();
                    document.body.style.overflow = 'auto';
                  }}
                  className="products-delete-modal-btn cancel"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="products-delete-modal-btn delete"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </Layout>
    );
};

export default EmployeeManagement;
