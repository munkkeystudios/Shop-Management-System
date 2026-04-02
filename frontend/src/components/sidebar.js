import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import logoImage from '../images/logo-small.png';
import { RiShoppingBag4Line } from "react-icons/ri";
import { LuPackage, LuPackagePlus, LuPackageSearch } from "react-icons/lu";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FiUsers, FiUserPlus, FiSettings, FiUser, FiSliders, FiLogOut, FiChevronLeft, FiChevronRight, FiMenu } from "react-icons/fi";
import { BsCartCheck } from "react-icons/bs";
import { TbReportMoney } from "react-icons/tb";
import { MdOutlineDisplaySettings } from 'react-icons/md';
import { FaPlus, FaUpload } from "react-icons/fa";
import { jwtDecode } from 'jwt-decode';
import ModernDropdown, { ModernDropdownItem } from './ModernDropdown';
import './styles/Sidebar.css';

// sidebar layout
const SideBar = ({ children, isCollapsed }) => {
    return (
        <Nav className={`flex-column sidebar-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
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
            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
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
    const { logout } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();
    const [userRole, setUserRole] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Get company logo and name from settings context
    const companyName = settings?.companyName || 'FinTrack';

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
        <SideBar isCollapsed={isCollapsed}>
            {/* Logo + collapse toggle */}
            <div className={`sidebar-header ${isCollapsed ? 'sidebar-header-collapsed' : ''}`}>
                {!isCollapsed && (
                    <Link to={isCashierOrHigher ? "/dashboard" : "/"} className="sidebar-logo-link">
                        <div className="sidebar-logo-container">
                            <img
                                src={logoImage}
                                alt="Logo"
                                className="sidebar-logo"
                            />
                            <span className="sidebar-title">{companyName}</span>
                        </div>
                    </Link>
                )}
                <button
                    type="button"
                    className={`sidebar-toggle-btn ${isCollapsed ? 'sidebar-toggle-btn-collapsed' : ''}`}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <FiMenu size={20} /> : <FiChevronLeft size={18} />}
                </button>
            </div>

            {!isCollapsed && (
            <div className="sidebar-menu-container">
                {/* POS Primary Action (Cashier+) */}
                {isCashierOrHigher && (
                    <Nav.Item className={`sidebar-nav-item sidebar-pos-primary ${isPathActive('/pos') ? 'active' : ''}`}>
                        <Link to="/pos" className="sidebar-link">
                            <RiShoppingBag4Line size={16} />
                            <span className="sidebar-link-label">POS</span>
                        </Link>
                    </Nav.Item>
                )}

                {/* Dashboard (Cashier+) */}
                {isCashierOrHigher && (
                    <Nav.Item className={`sidebar-nav-item ${isPathActive('/dashboard') ? 'active' : ''}`}>
                        <Link to="/dashboard" className="sidebar-link">
                            <RiShoppingBag4Line size={16} />
                            <span className="sidebar-link-label">Dashboard</span>
                        </Link>
                    </Nav.Item>
                )}

                {/* Products Dropdown (Cashier+) */}
                {isCashierOrHigher && (
                    <ModernDropdown
                        isActive={isGroupActive(['/products', '/all_products', '/create_products', '/categories', '/brands'])}
                        title={
                            <div className="sidebar-link">
                                <LuPackage size={16}/>
                                <span className="sidebar-link-label">Products</span>
                            </div>
                        }
                    >
                        <Link to="/all_products" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/all_products')}
                                onClick={() => handleItemClick("All Products")}
                            >
                                <div className="sidebar-link">
                                    <LuPackage size={16} />
                                    <span className="sidebar-link-label">All Products</span>
                                </div>
                            </ModernDropdownItem>
                        </Link>

                        {isManagerOrHigher && (
                            <Link to="/create_products" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <ModernDropdownItem
                                    isActive={isPathActive('/create_products')}
                                    onClick={() => handleItemClick("Create Product")}
                                >
                                    <div className="sidebar-link">
                                        <LuPackagePlus size={16} />
                                        <span className="sidebar-link-label">Create Product</span>
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
                                    <div className="sidebar-link">
                                        <LuPackageSearch size={16} />
                                        <span className="sidebar-link-label">Categories</span>
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
                                    <div className="sidebar-link">
                                        <LuPackageSearch size={16} />
                                        <span className="sidebar-link-label">Brands</span>
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
                            <div className="sidebar-link">
                                <FiUsers size={16} />
                                <span className="sidebar-link-label">Employee Management</span>
                            </div>
                        }
                    >
                        <Link to="/employee-management" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/employee-management')}
                                onClick={() => handleItemClick("Manage Employees")}
                            >
                                <div className="sidebar-link">
                                    <FiUsers size={16} />
                                    <span className="sidebar-link-label">Manage Employees</span>
                                </div>
                            </ModernDropdownItem>
                        </Link>
                        <Link to="/create-user" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/create-user')}
                                onClick={() => handleItemClick("Create Employee")}
                            >
                                <div className="sidebar-link">
                                    <FiUserPlus size={16} />
                                    <span className="sidebar-link-label">Create Employee</span>
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
                            <div className="sidebar-link">
                                <BsCartCheck size={16}/>
                                <span className="sidebar-link-label">Purchases</span>
                            </div>
                        }
                    >
                        <Link to="/supplier" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/supplier')}
                                onClick={() => handleItemClick("Suppliers")}
                            >
                                <div className="sidebar-link">
                                    <BsCartCheck size={16} />
                                    <span className="sidebar-link-label">Suppliers</span>
                                </div>
                            </ModernDropdownItem>
                        </Link>

                        <Link to="/all_purchases" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/all_purchases')}
                                onClick={() => handleItemClick("All Purchases")}
                            >
                                <div className="sidebar-link">
                                    <BsCartCheck size={16} />
                                    <span className="sidebar-link-label">All Purchases</span>
                                </div>
                            </ModernDropdownItem>
                        </Link>

                        <Link to="/create_purchases" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/create_purchases')}
                                onClick={() => handleItemClick("Create Purchase")}
                            >
                                <div className="sidebar-link">
                                    <BsCartCheck size={16} />
                                    <span className="sidebar-link-label">Create Purchase</span>
                                </div>
                            </ModernDropdownItem>
                        </Link>

                        <Link to="/import_purchases" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/import_purchases')}
                                onClick={() => handleItemClick("Import Purchases")}
                            >
                                <div className="sidebar-link">
                                    <BsCartCheck size={16} />
                                    <span className="sidebar-link-label">Import Purchases</span>
                                </div>
                            </ModernDropdownItem>
                        </Link>
                    </ModernDropdown>
                )}

                {/* Sales Dropdown */}
                {isManagerOrHigher && (
                    <ModernDropdown
                        isActive={isGroupActive(['/sales', '/create-sale', '/import-sales']) && !isPathActive('/sales-report')}
                        title={
                            <div className="sidebar-link">
                                <TbReportMoney size={16}/>
                                <span className="sidebar-link-label">Sales</span>
                            </div>
                        }
                    >
                        <Link to="/sales" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/sales')}
                                onClick={() => handleItemClick("All Sales")}
                            >
                                <div className="sidebar-link">
                                    <TbReportMoney size={16} />
                                    <span className="sidebar-link-label">All Sales</span>
                                </div>
                            </ModernDropdownItem>
                        </Link>



                        {isCashierOrHigher && (
                            <Link to="/create-sale" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <ModernDropdownItem
                                    isActive={isPathActive('/create-sale')}
                                    onClick={() => handleItemClick("Create Sale")}
                                >
                                    <div className="sidebar-link">
                                        <FaPlus size={14} />
                                        <span className="sidebar-link-label">Create Sale</span>
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
                                    <div className="sidebar-link">
                                        <FaUpload size={14} />
                                        <span className="sidebar-link-label">Import Sales</span>
                                    </div>
                                </ModernDropdownItem>
                            </Link>
                        )}
                    </ModernDropdown>
                )}

                {/* Loans Dropdown (Manager+) */}
                {isManagerOrHigher && (
                    <ModernDropdown
                        isActive={isGroupActive(['/loans', '/create-loans'])}
                        title={
                            <div className="sidebar-link">
                                <TbReportMoney size={16}/>
                                <span className="sidebar-link-label">Loans</span>
                            </div>
                        }
                    >
                        {/* All Loans (Manager+) */}
                        <Link to="/loans" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/loans')}
                                onClick={() => handleItemClick("All Loans")}
                            >
                                <div className="sidebar-link">
                                    <TbReportMoney size={16} />
                                    <span className="sidebar-link-label">All Loans</span>
                                </div>
                            </ModernDropdownItem>
                        </Link>

                        {/* Create Loans (Manager+) */}
                        <Link to="/create-loans" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ModernDropdownItem
                                isActive={isPathActive('/create-loans')}
                                onClick={() => handleItemClick("Create Loans")}
                            >
                                <div className="sidebar-link">
                                    <FaPlus size={14} />
                                    <span className="sidebar-link-label">Create Loans</span>
                                </div>
                            </ModernDropdownItem>
                        </Link>
                    </ModernDropdown>
                )}

                {/* Reports Link (Manager+) */}
                {isManagerOrHigher && (
                    <Nav.Item
                        className={`sidebar-nav-item ${isPathActive('/sales-report') ? 'active' : ''}`}
                        onClick={() => navigate('/sales-report')}
                    >
                        <div className="sidebar-link">
                            <HiOutlineDocumentReport size={16} />
                            <span className="sidebar-link-label">Reports</span>
                        </div>
                    </Nav.Item>
                )}

                {/* Settings Dropdown */}
                <ModernDropdown
                    title={
                        <div className="sidebar-link">
                            <FiSettings size={16}/>
                            <span className="sidebar-link-label">Settings</span>
                        </div>
                    }
                    isActive={isGroupActive(['/settings/user', '/settings/display', '/settings/general'])}
                >
                    <Link to="/settings/user" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <ModernDropdownItem
                            isActive={isPathActive('/settings/user')}
                            onClick={() => handleItemClick("User Settings")}
                        >
                            <div className="sidebar-link">
                                <FiUser size={16} />
                                <span className="sidebar-link-label">User Settings</span>
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
                                <div className="sidebar-link">
                                    <MdOutlineDisplaySettings size={16} />
                                    <span className="sidebar-link-label">Display Settings</span>
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
                                <div className="sidebar-link">
                                    <FiSliders size={16} />
                                    <span className="sidebar-link-label">General Settings</span>
                                </div>
                            </ModernDropdownItem>
                        </Link>
                    )}
                </ModernDropdown>

                {/* Logout Link - below Settings */}
                <Nav.Item
                    onClick={handleLogout}
                    className="sidebar-nav-item sidebar-logout"
                >
                    <div className="sidebar-link">
                        <FiLogOut size={16} />
                        <span className="sidebar-link-label">Logout</span>
                    </div>
                </Nav.Item>
            </div>
            )}

        </SideBar>
    );
}

export default ToolsSidebar;
