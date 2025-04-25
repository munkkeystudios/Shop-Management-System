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

const SideBarDropdown = ({ title, children, isActive }) => {
    const [isOpen, setIsOpen] = useState(isActive);

    useEffect(() => {
        if (isActive) {
            setIsOpen(true);
        }
        // Optional: If you want it to close when navigating away from the group:
        // else if (!isActive && isOpen) { // Check if it's not active but was open
        //    setIsOpen(false); // Close it
        // }
        // Current behavior: Stays open once opened via isActive until manually closed or component remounts.
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
                    paddingLeft: '12px'
                }}>
                    {children}
                </div>
            )}
        </div>
    );
};

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
                color: isActive ? '#357EC7' : '#505050',
                backgroundColor: isActive ? '#f0f7ff' : 'transparent',
                borderRadius: '4px',
                margin: '2px 8px'
            }}
        >
            {title}
        </Nav.Item>
    );
};

SideBar.Dropdown = SideBarDropdown;
SideBar.Item = SideBarItem;

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
                logout();
                navigate('/login');
            }
        } else {
             logout();
        }
    }, [location.pathname, logout, navigate]);

    const isCashierOrHigher = userRole === 'cashier' || userRole === 'manager' || userRole === 'admin';
    const isManagerOrHigher = userRole === 'manager' || userRole === 'admin';
    const isAdmin = userRole === 'admin';

    const isPathActive = (path) => location.pathname === path;
    const isGroupActive = (paths) => paths.some(basePath => location.pathname.startsWith(basePath));

    const handleItemClick = (item) => {
        console.log(`Clicked: ${item}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const productPaths = ['/all_products', '/create_products', '/inventory', '/categories', '/brands'];
    const employeePaths = ['/employee-management', '/create-user']; // Using new paths for admin section
    const purchasePaths = ['/supplier', '/all_purchases', '/create_purchases', '/import_purchases'];
    const reportPaths = ['/reports', '/sales-report'];

    return (
        <SideBar>
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

            <div style={{ padding: '10px 0' }}>
                {isCashierOrHigher && (
                    <Nav.Item className="sidebar-nav-item" style={{
                        padding: '12px 16px',
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
                            gap: '12px'
                        }}>
                            <RiShoppingBag4Line size={16} /> Dashboard
                        </Link>
                    </Nav.Item>
                )}

                {isCashierOrHigher && (
                    <SideBarDropdown
                        isActive={isGroupActive(productPaths)}
                        title={
                            <div className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <LuPackage size={16}/> Products
                            </div>
                        }>
                        <Link to="/all_products" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/all_products')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><LuPackage size={16} /> All Products</div>}
                                onClick={() => handleItemClick("All Products")}
                            />
                        </Link>

                        {isManagerOrHigher && (
                            <Link to="/create_products" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <SideBarItem
                                    isActive={isPathActive('/create_products')}
                                    title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><LuPackagePlus size={16} /> Create Product</div>}
                                    onClick={() => handleItemClick("Create Product")}
                                />
                            </Link>
                        )}

                        <Link to="/inventory" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/inventory')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><LuPackageSearch size={16} /> Inventory</div>}
                                onClick={() => handleItemClick("Inventory")}
                            />
                        </Link>

                        {isManagerOrHigher && (
                            <Link to="/categories" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <SideBarItem
                                    isActive={isPathActive('/categories')}
                                    title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><LuPackageSearch size={16} /> Categories</div>}
                                    onClick={() => handleItemClick("Categories")}
                                />
                            </Link>
                        )}

                        {isManagerOrHigher && (
                            <Link to="/brands" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <SideBarItem
                                    isActive={isPathActive('/brands')}
                                    title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><LuPackageSearch size={16} /> Brands</div>}
                                    onClick={() => handleItemClick("Brands")}
                                />
                            </Link>
                        )}
                    </SideBarDropdown>
                 )}

                {/* Use Employee Management (Admin Only) instead of the original Users dropdown */}
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

                {/* Keep the detailed Purchases Dropdown from original, now Manager+ */}
                {isManagerOrHigher && (
                    <SideBarDropdown
                        isActive={isGroupActive(purchasePaths)}
                        title={
                            <div className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <BsCartCheck size={16}/> Purchases
                            </div>
                        }>
                        <Link to="/supplier" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/supplier')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BsCartCheck size={16} /> Suppliers</div>}
                                onClick={() => handleItemClick("Suppliers")}
                            />
                        </Link>

                        <Link to="/all_purchases" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/all_purchases')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BsCartCheck size={16} /> All Purchases</div>}
                                onClick={() => handleItemClick("All Purchases")}
                            />
                        </Link>

                        <Link to="/create_purchases" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/create_purchases')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BsCartCheck size={16} /> Create Purchase</div>}
                                onClick={() => handleItemClick("Create Purchase")}
                            />
                        </Link>

                        <Link to="/import_purchases" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/import_purchases')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BsCartCheck size={16} /> Import Purchases</div>}
                                onClick={() => handleItemClick("Import Purchases")}
                            />
                        </Link>
                    </SideBarDropdown>
                )}

                {/* Keep Sales Link from original, now Manager+ */}
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

                {/* Keep Reports Dropdown from original, now Manager+ */}
                {isManagerOrHigher && (
                     <SideBarDropdown
                        isActive={isGroupActive(reportPaths)}
                        title={
                            <div className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <HiOutlineDocumentReport size={16}/> Reports
                            </div>
                        }>
                        <Link to="/reports" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/reports')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><HiOutlineDocumentReport size={16} /> General Reports</div>}
                                onClick={() => handleItemClick("General Reports")}
                            />
                        </Link>
                        <Link to="/sales-report" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/sales-report')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><TbReportMoney size={16} /> Sales Report</div>}
                                onClick={() => handleItemClick("Sales Report")}
                            />
                        </Link>
                    </SideBarDropdown>
                )}

                {/* Keep POS Link from original, now Cashier+, added icon */}
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
                            <RiShoppingBag4Line size={16}/> {/* Added icon */}
                            POS
                        </Link>
                    </Nav.Item>
                 )}

                {/* Keep Logout Link from original, using new styling */}
                <Nav.Item
                    onClick={handleLogout}
                    className="sidebar-nav-item sidebar-logout"
                    style={{
                        cursor: 'pointer',
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#ff5252', // Color from new file
                        margin: '2px 8px',
                        borderRadius: '4px',
                        marginTop: '20px' // Margin from new file
                    }}
                >
                    Logout
                </Nav.Item>
            </div>
        </SideBar>
    );
}

export default ToolsSidebar;