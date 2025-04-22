import React, { useState, useEffect } from 'react'; // Added useEffect
import { Nav } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../images/logo-small.png';
import { RiShoppingBag4Line } from "react-icons/ri";
import { LuPackage, LuPackagePlus, LuPackageSearch } from "react-icons/lu";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FiUsers, FiUserPlus } from "react-icons/fi"; // Added FiUserPlus
import { BsCartCheck } from "react-icons/bs";
import { TbReportMoney } from "react-icons/tb";
import { jwtDecode } from 'jwt-decode'; // Added jwtDecode

// sidebar layout:
const SideBar = ({ children }) => {
    return (
        <Nav className="flex-column" style={{
            width: '270px',
            height: '100vh',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
            borderRight: '1px solid #e6e6ff',
            overflow: 'auto'
        }}>
            {children}
        </Nav>
    );
};

// dropdown component that allows collapsing
// takes in title and children
const SideBarDropdown = ({ title, children, isActive }) => {
    const [isOpen, setIsOpen] = useState(isActive); // Initialize based on isActive

    // Update isOpen state if isActive prop changes (e.g., navigating to a sub-item)
    useEffect(() => {
        // Only set isOpen to true if isActive becomes true.
        // Don't automatically close it if isActive becomes false, allow user interaction.
        if (isActive) {
            setIsOpen(true);
        }
        // Optional: If you want it to close when navigating away from the group:
        // setIsOpen(isActive);
    }, [isActive]);

    return (
        <div className="text">
            <Nav.Item
                onClick={() => setIsOpen(!isOpen)}
                className="sidebar-dropdown-title"
                style={{
                    cursor: 'pointer',
                    padding: '12px 16px',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: isActive ? '#357EC7' : '#505050',
                    backgroundColor: isActive ? '#f0f7ff' : 'transparent',
                    margin: '2px 8px',
                    borderRadius: '4px'
                }}
            >
                {title}
                <span style={{ fontSize: '10px' }}>{isOpen ? '▲' : '▼'}</span>
            </Nav.Item>

            {isOpen && (
                <div className="sidebar-dropdown-content" style={{
                    paddingLeft: '12px' // Indent dropdown items
                }}>
                    {children}
                </div>
            )}
        </div>
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
                padding: '10px 12px', // Slightly less padding than dropdown title
                textAlign: 'left',
                fontSize: '14px',
                color: isActive ? '#357EC7' : '#505050',
                backgroundColor: isActive ? '#f0f7ff' : 'transparent',
                borderRadius: '4px',
                margin: '2px 8px' // Consistent margin
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
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role);
            } catch (error) {
                console.error("Failed to decode token:", error);
                logout(); // Log out if token is invalid
                navigate('/login');
            }
        } else {
             logout(); // Ensure logout state if no token
             // No navigation needed here, ProtectedRoute handles it
             // If not using ProtectedRoute, uncommenting below might be needed
             // navigate('/login');
        }
    }, [location.pathname, logout, navigate]); // Re-check on location change (pathname specifically)

    // Role Check Helpers
    const isCashierOrHigher = userRole === 'cashier' || userRole === 'manager' || userRole === 'admin';
    const isManagerOrHigher = userRole === 'manager' || userRole === 'admin';
    const isAdmin = userRole === 'admin';

    const isPathActive = (path) => location.pathname === path;
    // Updated isGroupActive to handle potential variations like trailing slashes
    const isGroupActive = (paths) => paths.some(basePath => location.pathname.startsWith(basePath));


    const handleItemClick = (item) => {
        // This function is mostly for potential future use or debugging
        // Navigation is handled by the <Link> component
        console.log(`Sidebar item clicked (via handleItemClick): ${item}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define active paths for groups
    const productPaths = ['/all_products', '/create_products', '/inventory', '/categories', '/brands'];
    const employeePaths = ['/employee-management', '/create-user'];
    const purchasePaths = ['/supplier', '/all_purchases', '/create_purchases', '/import_purchases'];
    const reportPaths = ['/reports', '/sales-report'];


    return (
        <SideBar>
            {/* Logo Section */}
            <div className="sidebar-logo-container" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px 20px',
                borderBottom: '1px solid #e6e6ff'
            }}>
                <img
                    src={logoImage}
                    alt="Logo"
                    className="sidebar-logo"
                    style={{
                        width: '32px',
                        height: '32px',
                        marginRight: '10px'
                    }}
                />
                <span className="sidebar-title" style={{
                    fontWeight: '600',
                    fontSize: '22px',
                    color: '#333'
                }}>FinTrack</span>
            </div>

            {/* Navigation Section */}
            <div style={{ padding: '10px 0' }}>

                {/* Dashboard (Cashier+) */}
                {isCashierOrHigher && (
                    <Nav.Item className="sidebar-nav-item" style={{
                        padding: '12px 16px', // Standard padding for top-level items
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isPathActive('/dashboard') ? '#357EC7' : '#505050',
                        backgroundColor: isPathActive('/dashboard') ? '#f0f7ff' : 'transparent',
                        margin: '2px 8px',
                        borderRadius: '4px'
                    }}>
                        <Link to="/dashboard" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px' // Space between icon and text
                        }}>
                            <RiShoppingBag4Line size={16} /> Dashboard
                        </Link>
                    </Nav.Item>
                )}

                {/* Products Dropdown (Cashier+) */}
                 {isCashierOrHigher && (
                    <SideBarDropdown
                        isActive={isGroupActive(productPaths)}
                        title={
                            <div className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <LuPackage size={16}/> Products
                            </div>
                        }>
                        {/* All Products (Cashier+) */}
                        <Link to="/all_products" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/all_products')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><LuPackage size={16} /> All Products</div>}
                                onClick={() => handleItemClick("All Products")} // onClick here is optional as Link handles navigation
                            />
                        </Link>

                        {/* Create Product (Manager+) */}
                        {isManagerOrHigher && (
                            <Link to="/create_products" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <SideBarItem
                                    isActive={isPathActive('/create_products')}
                                    title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><LuPackagePlus size={16} /> Create Product</div>}
                                    onClick={() => handleItemClick("Create Product")}
                                />
                            </Link>
                        )}

                         {/* Inventory (Cashier+) */}
                        <Link to="/inventory" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/inventory')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><LuPackageSearch size={16} /> Inventory</div>}
                                onClick={() => handleItemClick("Inventory")}
                            />
                        </Link>

                        {/* Categories (Manager+) */}
                        {isManagerOrHigher && (
                            <Link to="/categories" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <SideBarItem
                                    isActive={isPathActive('/categories')}
                                    title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><LuPackageSearch size={16} /> Categories</div>} // Consider different icon
                                    onClick={() => handleItemClick("Categories")}
                                />
                            </Link>
                        )}

                        {/* Brands (Manager+) - Kept from original */}
                        {isManagerOrHigher && (
                            <Link to="/brands" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <SideBarItem
                                    isActive={isPathActive('/brands')}
                                    title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><LuPackageSearch size={16} /> Brands</div>} // Consider different icon
                                    onClick={() => handleItemClick("Brands")}
                                />
                            </Link>
                        )}
                    </SideBarDropdown>
                 )}

                {/* Employee Management Dropdown (Admin Only) */}
                {isAdmin && (
                    <SideBarDropdown
                        isActive={isGroupActive(employeePaths)}
                        title={
                            <div className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FiUsers size={16} /> Employee Management
                            </div>
                        }>
                        <Link to="/employee-management" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/employee-management')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FiUsers size={16} /> Manage Employees</div>}
                                onClick={() => handleItemClick("Manage Employees")}
                            />
                        </Link>
                        <Link to="/create-user" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/create-user')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FiUserPlus size={16} /> Create Employee</div>}
                                onClick={() => handleItemClick("Create Employee")}
                            />
                        </Link>
                    </SideBarDropdown>
                )}

                {/* Purchases Dropdown (Manager+) */}
                {isManagerOrHigher && (
                    <SideBarDropdown
                        isActive={isGroupActive(purchasePaths)}
                        title={
                            <div className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <BsCartCheck size={16}/> Purchases
                            </div>
                        }>
                        {/* Suppliers (Manager+) */}
                        <Link to="/supplier" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/supplier')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BsCartCheck size={16} /> Suppliers</div>}
                                onClick={() => handleItemClick("Suppliers")}
                            />
                        </Link>

                        {/* All Purchases (Manager+) - Kept from original */}
                        <Link to="/all_purchases" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/all_purchases')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BsCartCheck size={16} /> All Purchases</div>}
                                onClick={() => handleItemClick("All Purchases")}
                            />
                        </Link>

                        {/* Create Purchase (Manager+) - Kept from original */}
                        <Link to="/create_purchases" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/create_purchases')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BsCartCheck size={16} /> Create Purchase</div>}
                                onClick={() => handleItemClick("Create Purchase")}
                            />
                        </Link>

                        {/* Import Purchases (Manager+) - Kept from original */}
                        <Link to="/import_purchases" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/import_purchases')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BsCartCheck size={16} /> Import Purchases</div>}
                                onClick={() => handleItemClick("Import Purchases")}
                            />
                        </Link>
                    </SideBarDropdown>
                )}

                {/* Sales Link (Manager+) */}
                {isManagerOrHigher && (
                    <Nav.Item className="sidebar-nav-item" style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isPathActive('/sales') ? '#357EC7' : '#505050',
                        backgroundColor: isPathActive('/sales') ? '#f0f7ff' : 'transparent',
                        margin: '2px 8px',
                        borderRadius: '4px'
                    }}>
                        <Link to="/sales" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <TbReportMoney size={16} /> Sales
                        </Link>
                    </Nav.Item>
                )}

                {/* Reports Dropdown (Manager+) */}
                {isManagerOrHigher && (
                     <SideBarDropdown
                        isActive={isGroupActive(reportPaths)}
                        title={
                            <div className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <HiOutlineDocumentReport size={16}/> Reports
                            </div>
                        }>
                         {/* General Reports (Manager+) - Kept from original */}
                        <Link to="/reports" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/reports')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><HiOutlineDocumentReport size={16} /> General Reports</div>}
                                onClick={() => handleItemClick("General Reports")}
                            />
                        </Link>
                         {/* Sales Report (Manager+) - Kept from original */}
                        <Link to="/sales-report" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/sales-report')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><TbReportMoney size={16} /> Sales Report</div>}
                                onClick={() => handleItemClick("Sales Report")}
                            />
                        </Link>
                    </SideBarDropdown>
                )}

                {/* POS Link (Cashier+) */}
                 {isCashierOrHigher && (
                    <Nav.Item className="sidebar-nav-item" style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isPathActive('/pos') ? '#357EC7' : '#505050',
                        backgroundColor: isPathActive('/pos') ? '#f0f7ff' : 'transparent',
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
                            {/* Optional: Add a specific POS icon if you have one */}
                            <RiShoppingBag4Line size={16}/> {/* Example: Using shopping bag again */}
                            POS
                        </Link>
                    </Nav.Item>
                 )}

                {/* Logout Link (Always visible) */}
                <Nav.Item
                    onClick={handleLogout}
                    className="sidebar-nav-item sidebar-logout"
                    style={{
                        cursor: 'pointer',
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#ff5252', // Highlight color for logout
                        margin: '2px 8px',
                        borderRadius: '4px',
                        marginTop: '20px' // Space above logout
                    }}
                >
                    Logout
                </Nav.Item>
            </div>
        </SideBar>
    );
}

export default ToolsSidebar;