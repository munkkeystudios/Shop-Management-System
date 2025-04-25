import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../images/logo-small.png';
import { RiShoppingBag4Line } from "react-icons/ri";
import { LuPackage, LuPackagePlus, LuPackageSearch } from "react-icons/lu";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FiUsers } from "react-icons/fi";
import { BsCartCheck } from "react-icons/bs";
import { TbReportMoney } from "react-icons/tb";
import { FiSettings } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';
import { MdOutlineDisplaySettings } from 'react-icons/md';
import { FiSliders } from 'react-icons/fi';
import { settingsAPI } from '../services/api';
import ModernDropdown, { ModernDropdownItem } from './ModernDropdown';


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
    const [isOpen, setIsOpen] = useState(false);
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

// attach Dropdown and item to sidebar component
SideBar.Dropdown = SideBarDropdown;
SideBar.Item = SideBarItem;

// main default sidebar function
function ToolsSidebar() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [companyLogo, setCompanyLogo] = useState(null);
    const [companyName, setCompanyName] = useState('FinTrack');

    useEffect(() => {
        // Fetch company settings when component mounts
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
            <div className="sidebar-logo-container" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px 20px',
                borderBottom: '1px solid #e6e6ff'
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

            <div style={{ padding: '10px 0' }}>
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
                </ModernDropdown>

                <ModernDropdown
                    isActive={isGroupActive(['/users', '/all_users', '/create_user'])}
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FiUsers size={16} /> Users
                        </div>
                    }
                >
                    <Link to="/all_users" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <ModernDropdownItem
                            isActive={isPathActive('/all_users')}
                            onClick={() => handleItemClick("All Users")}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FiUsers size={16} /> All Users
                            </div>
                        </ModernDropdownItem>
                    </Link>
                    <Link to="/create-user" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <ModernDropdownItem
                            isActive={isPathActive('/create-user')}
                            onClick={() => handleItemClick("Create User")}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FiUsers size={16} /> Create User
                            </div>
                        </ModernDropdownItem>
                    </Link>
                </ModernDropdown>

                <ModernDropdown
                    isActive={isGroupActive(['/purchases', '/supplier'])}
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
                </ModernDropdown>

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

                <ModernDropdown
                    isActive={isGroupActive(['/reports', '/sales-report'])}
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <HiOutlineDocumentReport size={16}/> Reports
                        </div>
                    }
                >
                    <Link to="/reports" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <ModernDropdownItem
                            isActive={isPathActive('/reports')}
                            onClick={() => handleItemClick("General Reports")}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <HiOutlineDocumentReport size={16} /> General Reports
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
                </ModernDropdown>

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
                        POS
                    </Link>
                </Nav.Item>

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
                    {user && (user.role === 'manager' || user.role === 'admin') && (
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
                    {user && user.role === 'admin' && (
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

                <Nav.Item
                    onClick={handleLogout}
                    className="sidebar-nav-item sidebar-logout"
                    style={{
                        cursor: 'pointer',
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#ff5252',
                        margin: '2px 8px',
                        borderRadius: '4px',
                        marginTop: '20px'
                    }}
                >
                    Logout
                </Nav.Item>
            </div>
        </SideBar>
    );
}

export default ToolsSidebar;