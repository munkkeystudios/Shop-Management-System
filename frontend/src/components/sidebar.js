import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../images/logo-small.png';
import { RiShoppingBag4Line } from "react-icons/ri";
import { LuPackage, LuPackagePlus, LuPackageSearch } from "react-icons/lu";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FiUsers, FiUserPlus, FiSettings, FiUser, FiSliders } from "react-icons/fi";
import { BsCartCheck } from "react-icons/bs";
import { TbReportMoney } from "react-icons/tb";
import { MdOutlineDisplaySettings } from 'react-icons/md';
import { FaPlus, FaUpload } from "react-icons/fa";
import { jwtDecode } from 'jwt-decode';
import { settingsAPI } from '../services/api';
import ModernDropdown, { ModernDropdownItem } from './ModernDropdown';

// sidebar layout
const SideBar = ({ children }) => {
    return (
        <Nav className="flex-column sidebar-container" style={{
            width: '270px',
            height: '100vh',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
            borderRight: '1px solid #e6e6ff',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {children}
        </Nav>
    );
};

// dropdown component that allows collapsing
// takes in title and children
const SideBarDropdown = ({ title, children, isActive }) => {
    // We don't need to track isOpen separately since we're using isActive
    // to control the dropdown state through ModernDropdown

    // Update effect removed as it's no longer needed

    return (
        <ModernDropdown
            isActive={isActive}
            title={title}
            className="text"
        >
            {children}
        </ModernDropdown>
    );
};

// properties for each item in sidebar
const SideBarItem = ({ title, onClick, isActive }) => {
    return (
        <Nav.Item
            onClick={onClick}
            className="sidebar-item"
            style={{
                cursor: 'pointer',
                padding: '10px 12px',
                textAlign: 'left',
                fontSize: '14px',
                color: isActive ? '#ffffff' : '#505050',
                backgroundColor: isActive ? '#00a838' : 'transparent',
                borderRadius: '4px',
                margin: '2px 8px'
            }}
        >
            {title}
        </Nav.Item>
    );
};

// attach Dropdown and item to sidebar component
SideBar.Dropdown = SideBarDropdown;
SideBar.Item = SideBarItem;

// main default sidebar function
function ToolsSidebar() {
    const { logout, } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [companyLogo, setCompanyLogo] = useState(null);
    const [companyName, setCompanyName] = useState('FinTrack');
    const [userRole, setUserRole] = useState(null);

    // Fetch company settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await settingsAPI.getAll();
                const settings = response.data;

                if (settings.logoUrl) {
                    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002';
                    setCompanyLogo(baseUrl + settings.logoUrl);
                }

                if (settings.companyName) {
                    setCompanyName(settings.companyName);
                }
            } catch (error) {
                console.error('Error fetching company settings:', error);
            }
        };

        fetchSettings();
    }, []);

    // Get user role from token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role);
            } catch (error) {
                console.error("Failed to decode token:", error);
                logout();
                navigate('/login');
            }
        } else {
            logout();
        }
    }, [location, logout, navigate]);

    // Role Check Helpers
    const isCashierOrHigher = userRole === 'cashier' || userRole === 'manager' || userRole === 'admin';
    const isManagerOrHigher = userRole === 'manager' || userRole === 'admin';
    const isAdmin = userRole === 'admin';

    const isPathActive = (path) => location.pathname === path;
    const isGroupActive = (paths) => paths.some(path => location.pathname.includes(path));

    const handleItemClick = (item) => {
        console.log(`Clicked: ${item}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <SideBar>
            {/* Logo Section */}
            <div className="sidebar-logo-container" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px 20px',
                borderBottom: '1px solid #e6e6ff',
                flex: '0 0 auto'
            }}>
                <img
                    src={companyLogo || logoImage}
                    alt="Logo"
                    className="sidebar-logo"
                    style={{
                        width: '32px',
                        height: '32px',
                        marginRight: '10px',
                        objectFit: 'contain'
                    }}
                />
                <span className="sidebar-title" style={{
                    fontWeight: '600',
                    fontSize: '22px',
                    color: '#333'
                }}>{companyName}</span>
            </div>

            <div className="sidebar-menu-container" style={{
                padding: '10px 0',
                flex: '1 1 auto',
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
                {/* Dashboard (Cashier+) */}
                {isCashierOrHigher && (
                    <Nav.Item className="sidebar-nav-item" style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isPathActive('/dashboard') ? '#ffffff' : '#505050',
                        backgroundColor: isPathActive('/dashboard') ? '#00a838' : 'transparent',
                        margin: '2px 8px',
                        borderRadius: '4px'
                    }}>
                        <Link to="/dashboard" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <RiShoppingBag4Line size={16} /> Dashboard
                        </Link>
                    </Nav.Item>
                )}

                {/* Products Dropdown (Cashier+) */}
                {isCashierOrHigher && (
                    <ModernDropdown
                        isActive={isGroupActive(['/products', '/all_products', '/create_products', '/categories', '/brands'])}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <LuPackage size={16}/> Products
                            </div>
                        }
                    >
                        <Link to="/all_products" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/all_products')}
                                onClick={() => handleItemClick("All Products")}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <LuPackage size={16} /> All Products
                                </div>
                            </ModernDropdownItem>
                        </Link>

                        {isManagerOrHigher && (
                            <Link to="/create_products" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <ModernDropdownItem
                                    isActive={isPathActive('/create_products')}
                                    onClick={() => handleItemClick("Create Product")}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <LuPackagePlus size={16} /> Create Product
                                    </div>
                                </ModernDropdownItem>
                            </Link>
                        )}

                        {isManagerOrHigher && (
                            <Link to="/categories" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <ModernDropdownItem
                                    isActive={isPathActive('/categories')}
                                    onClick={() => handleItemClick("Categories")}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <LuPackageSearch size={16} /> Categories
                                    </div>
                                </ModernDropdownItem>
                            </Link>
                        )}

                        {isManagerOrHigher && (
                            <Link to="/brands" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <ModernDropdownItem
                                    isActive={isPathActive('/brands')}
                                    onClick={() => handleItemClick("Brands")}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <LuPackageSearch size={16} /> Brands
                                    </div>
                                </ModernDropdownItem>
                            </Link>
                        )}
                    </ModernDropdown>
                )}

                {/* Employee Management (Admin only) */}
                {isAdmin && (
                    <ModernDropdown
                        isActive={isGroupActive(['/employee-management', '/create-user'])}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FiUsers size={16} /> Employee Management
                            </div>
                        }
                    >
                        <Link to="/employee-management" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/employee-management')}
                                onClick={() => handleItemClick("Manage Employees")}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FiUsers size={16} /> Manage Employees
                                </div>
                            </ModernDropdownItem>
                        </Link>
                        <Link to="/create-user" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/create-user')}
                                onClick={() => handleItemClick("Create Employee")}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FiUserPlus size={16} /> Create Employee
                                </div>
                            </ModernDropdownItem>
                        </Link>
                    </ModernDropdown>
                )}

                {/* Purchases Dropdown (Manager+) */}
                {isManagerOrHigher && (
                    <ModernDropdown
                        isActive={isGroupActive([
                            '/supplier',
                            '/all_purchases',
                            '/create_purchases',
                            '/import_purchases'
                        ])}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <BsCartCheck size={16}/> Purchases
                            </div>
                        }
                    >
                        <Link to="/supplier" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/supplier')}
                                onClick={() => handleItemClick("Suppliers")}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <BsCartCheck size={16} /> Suppliers
                                </div>
                            </ModernDropdownItem>
                        </Link>

                        <Link to="/all_purchases" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/all_purchases')}
                                onClick={() => handleItemClick("All Purchases")}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <BsCartCheck size={16} /> All Purchases
                                </div>
                            </ModernDropdownItem>
                        </Link>

                        <Link to="/create_purchases" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/create_purchases')}
                                onClick={() => handleItemClick("Create Purchase")}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <BsCartCheck size={16} /> Create Purchase
                                </div>
                            </ModernDropdownItem>
                        </Link>

                        <Link to="/import_purchases" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/import_purchases')}
                                onClick={() => handleItemClick("Import Purchases")}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <BsCartCheck size={16} /> Import Purchases
                                </div>
                            </ModernDropdownItem>
                        </Link>
                    </ModernDropdown>
                )}

                {/* Sales Dropdown */}
                {isManagerOrHigher && (
                    <ModernDropdown
                        isActive={isGroupActive(['/sales', '/sales-report', '/create-sale', '/import-sales'])}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <TbReportMoney size={16}/> Sales
                            </div>
                        }
                    >
                        <Link to="/sales" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/sales')}
                                onClick={() => handleItemClick("All Sales")}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <TbReportMoney size={16} /> All Sales
                                </div>
                            </ModernDropdownItem>
                        </Link>

                        <Link to="/sales-report" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/sales-report')}
                                onClick={() => handleItemClick("Sales Report")}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <TbReportMoney size={16} /> Sales Report
                                </div>
                            </ModernDropdownItem>
                        </Link>

                        {isCashierOrHigher && (
                            <Link to="/create-sale" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <ModernDropdownItem
                                    isActive={isPathActive('/create-sale')}
                                    onClick={() => handleItemClick("Create Sale")}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FaPlus size={14} /> Create Sale
                                    </div>
                                </ModernDropdownItem>
                            </Link>
                        )}

                        {isManagerOrHigher && (
                            <Link to="/import-sales" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <ModernDropdownItem
                                    isActive={isPathActive('/import-sales')}
                                    onClick={() => handleItemClick("Import Sales")}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FaUpload size={14} /> Import Sales
                                    </div>
                                </ModernDropdownItem>
                            </Link>
                        )}
                    </ModernDropdown>
                )}

                {/* Loans Link (Manager+) */}
                {isManagerOrHigher && (
                    <Nav.Item className="sidebar-nav-item" style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isPathActive('/loans') ? '#ffffff' : '#505050',
                        backgroundColor: isPathActive('/loans') ? '#00a838' : 'transparent',
                        margin: '2px 8px',
                        borderRadius: '4px'
                    }}>
                        <Link to="/loans" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <TbReportMoney size={16} /> Loans
                        </Link>
                    </Nav.Item>
                )}

                {/* Reports Link (Manager+) */}
                {isManagerOrHigher && (
                    <Nav.Item className="sidebar-nav-item" style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isPathActive('/sales-report') ? '#ffffff' : '#505050',
                        backgroundColor: isPathActive('/sales-report') ? '#00a838' : 'transparent',
                        margin: '2px 8px',
                        borderRadius: '4px'
                    }}>
                        <Link to="/sales-report" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <HiOutlineDocumentReport size={16} /> Reports
                        </Link>
                    </Nav.Item>
                )}

                {/* POS Link (Cashier+) */}
                {isCashierOrHigher && (
                    <Nav.Item className="sidebar-nav-item" style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isPathActive('/pos') ? '#ffffff' : '#505050',
                        backgroundColor: isPathActive('/pos') ? '#00a838' : 'transparent',
                        margin: '2px 8px',
                        borderRadius: '4px'
                    }}>
                        <Link to="/pos" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            POS
                        </Link>
                    </Nav.Item>
                )}

                {/* Settings Dropdown */}
                <ModernDropdown
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FiSettings size={16}/> Settings
                        </div>
                    }
                    isActive={isGroupActive(['/settings/user', '/settings/display', '/settings/general'])}
                >
                    <Link to="/settings/user" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <ModernDropdownItem
                            isActive={isPathActive('/settings/user')}
                            onClick={() => handleItemClick("User Settings")}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FiUser size={16} /> User Settings
                            </div>
                        </ModernDropdownItem>
                    </Link>

                    {/* Display Settings - only for managers and admins */}
                    {isManagerOrHigher && (
                        <Link to="/settings/display" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/settings/display')}
                                onClick={() => handleItemClick("Display Settings")}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <MdOutlineDisplaySettings size={16} /> Display Settings
                                </div>
                            </ModernDropdownItem>
                        </Link>
                    )}

                    {/* General Settings - only for admins */}
                    {isAdmin && (
                        <Link to="/settings/general" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/settings/general')}
                                onClick={() => handleItemClick("General Settings")}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FiSliders size={16} /> General Settings
                                </div>
                            </ModernDropdownItem>
                        </Link>
                    )}
                </ModernDropdown>

                {/* Logout Link */}
                <Nav.Item
                    onClick={handleLogout}
                    className="sidebar-nav-item sidebar-logout"
                    style={{
                        cursor: 'pointer',
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#ffffff',
                        backgroundColor: '#ff5252',
                        margin: '2px 8px',
                        borderRadius: '4px',
                        marginTop: '20px'
                    }}
                >
                    Logout
                </Nav.Item>
            </div>

            {/* Bottom padding to ensure scrollable content doesn't get cut off */}
            <div style={{ padding: '10px', flex: '0 0 auto' }}></div>
        </SideBar>
    );
}

export default ToolsSidebar;
