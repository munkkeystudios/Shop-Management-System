import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { jwtDecode } from 'jwt-decode';
import ModernDropdown, { ModernDropdownItem } from './ModernDropdown';
import './styles/Sidebar.css';

const SidebarIcon = ({ name }) => (
    <span className="material-symbols-outlined sidebar-material-icon" aria-hidden="true">
        {name}
    </span>
);

// sidebar layout
const SideBar = ({ children, isCollapsed }) => {
    return (
        <aside className={`sidebar-container ${isCollapsed ? 'sidebar-collapsed' : ''}`} aria-label="Sidebar">
            {children}
        </aside>
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
        <div
            onClick={onClick}
            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
            {title}
        </div>
    );
};

// attach Dropdown and item to sidebar component
SideBar.Dropdown = SideBarDropdown;
SideBar.Item = SideBarItem;

// main default sidebar function
function ToolsSidebar({ isCollapsed }) {
    const { logout } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();
    const [userRole, setUserRole] = useState(null);

    // Get company name from settings context
    const companyName = settings?.companyName || 'SLATE PRECISION';

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

    return (
        <SideBar isCollapsed={isCollapsed}>
            {/* Template-style brand anchor */}
            {!isCollapsed && (
                <div className="sidebar-header">
                    <Link to={isCashierOrHigher ? "/dashboard" : "/"} className="sidebar-logo-link">
                        <h1 className="sidebar-brand-title">{companyName}</h1>
                    </Link>
                </div>
            )}

            {!isCollapsed && (
            <div className="sidebar-menu-container">
                {/* POS Primary Action (Cashier+) */}
                {isCashierOrHigher && (
                    <div className={`sidebar-nav-item sidebar-pos-primary ${isPathActive('/pos') ? 'active' : ''}`}>
                        <Link to="/pos" className="sidebar-link">
                            <SidebarIcon name="point_of_sale" />
                            <span className="sidebar-link-label">POS</span>
                        </Link>
                    </div>
                )}

                {/* Dashboard (Cashier+) */}
                {isCashierOrHigher && (
                    <div className={`sidebar-nav-item ${isPathActive('/dashboard') ? 'active' : ''}`}>
                        <Link to="/dashboard" className="sidebar-link">
                            <SidebarIcon name="dashboard" />
                            <span className="sidebar-link-label">Dashboard</span>
                        </Link>
                    </div>
                )}

                {/* Products Dropdown (Cashier+) */}
                {isCashierOrHigher && (
                    <ModernDropdown
                        isActive={isGroupActive(['/products', '/all_products', '/create_products', '/categories', '/brands'])}
                        title={
                            <div className="sidebar-link">
                                <SidebarIcon name="inventory_2" />
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
                                    <SidebarIcon name="inventory_2" />
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
                                        <SidebarIcon name="add_box" />
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
                                        <SidebarIcon name="category" />
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
                                        <SidebarIcon name="loyalty" />
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
                                <SidebarIcon name="group" />
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
                                    <SidebarIcon name="group" />
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
                                    <SidebarIcon name="person_add" />
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
                                <SidebarIcon name="shopping_cart" />
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
                                    <SidebarIcon name="local_shipping" />
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
                                    <SidebarIcon name="receipt_long" />
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
                                    <SidebarIcon name="add_shopping_cart" />
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
                                    <SidebarIcon name="upload" />
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
                                <SidebarIcon name="receipt_long" />
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
                                    <SidebarIcon name="receipt_long" />
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
                                        <SidebarIcon name="add_circle" />
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
                                        <SidebarIcon name="upload" />
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
                                <SidebarIcon name="payments" />
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
                                    <SidebarIcon name="payments" />
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
                                    <SidebarIcon name="add_circle" />
                                    <span className="sidebar-link-label">Create Loans</span>
                                </div>
                            </ModernDropdownItem>
                        </Link>
                    </ModernDropdown>
                )}

                {/* Reports Link (Manager+) */}
                {isManagerOrHigher && (
                    <div
                        className={`sidebar-nav-item ${isPathActive('/sales-report') ? 'active' : ''}`}
                        onClick={() => navigate('/sales-report')}
                    >
                        <div className="sidebar-link">
                            <SidebarIcon name="analytics" />
                            <span className="sidebar-link-label">Reports</span>
                        </div>
                    </div>
                )}

                {/* Settings Dropdown */}
                <ModernDropdown
                    title={
                        <div className="sidebar-link">
                            <SidebarIcon name="settings" />
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
                                <SidebarIcon name="account_circle" />
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
                                    <SidebarIcon name="display_settings" />
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
                                    <SidebarIcon name="tune" />
                                    <span className="sidebar-link-label">General Settings</span>
                                </div>
                            </ModernDropdownItem>
                        </Link>
                    )}
                </ModernDropdown>

            </div>
            )}

            {/* Sidebar footer removed - profile moved to topbar */}

        </SideBar>
    );
}

export default ToolsSidebar;
