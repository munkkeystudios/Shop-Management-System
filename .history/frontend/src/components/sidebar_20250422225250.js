import React, { useState } from 'react';
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
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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

                <SideBarDropdown
                    isActive={isGroupActive(['/products', '/all_products', '/create_products', '/inventory', '/categories', '/brands'])} // Updated to include brands
                    title={
                        <div className="sidebar-link" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <LuPackage size={16}/> Products
                        </div>
                    }>
                    <Link to="/all_products" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/all_products')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <LuPackage size={16} /> All Products
                                </div>
                            }
                            onClick={() => handleItemClick("All Products")}
                        />
                    </Link>
                    <Link to="/create_products" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/create_products')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <LuPackagePlus size={16} /> Create Product
                                </div>
                            }
                            onClick={() => handleItemClick("Create Product")}
                        />
                    </Link>
                    <Link to="/inventory" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/inventory')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <LuPackageSearch size={16} /> Inventory
                                </div>
                            }
                            onClick={() => handleItemClick("Inventory")}
                        />
                    </Link>
                    <Link to="/categories" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/categories')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <LuPackageSearch size={16} /> Categories
                                </div>
                            }
                            onClick={() => handleItemClick("Categories")}
                        />
                    </Link>
                    {/* New Brands Link */}
                    <Link to="/brands" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/brands')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <LuPackageSearch size={16} /> Brands
                                </div>
                            }
                            onClick={() => handleItemClick("Brands")}
                        />
                    </Link>
                </SideBarDropdown>

                <SideBarDropdown
                    isActive={isGroupActive(['/users', '/all_users', '/create_user'])}
                    title={
                        <div className="sidebar-link" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <FiUsers size={16} /> Users
                        </div>
                    }>
                    <Link to="/all_users" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/all_users')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <FiUsers size={16} /> All Users
                                </div>
                            }
                            onClick={() => handleItemClick("All Users")}
                        />
                    </Link>
                    <Link to="/create-user" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/create-user')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <FiUsers size={16} /> Create User
                                </div>
                            }
                            onClick={() => handleItemClick("Create User")}
                        />
                    </Link>
                </SideBarDropdown>

                {/* <SideBarDropdown
                    isActive={isGroupActive(['/purchases',/'all_purchases','/create_purchases','/import_purchases', '/supplier'])}
                    title={
                        <div className="sidebar-link" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <BsCartCheck size={16}/> Purchases
                        </div>
                    }>
                    <Link to="/supplier" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/supplier')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <BsCartCheck size={16} /> Suppliers
                                </div>
                            }
                            onClick={() => handleItemClick("Suppliers")}
                        />
                    </Link>
                </SideBarDropdown> */}

                <SideBarDropdown
                    isActive={isGroupActive([
                        '/purchases',
                        '/all_purchases',
                        '/create_purchases',
                        '/import_purchases',
                        '/supplier'
                    ])}
                    title={
                        <div className="sidebar-link" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <BsCartCheck size={16}/> Purchases
                        </div>
                    }>

                    {/* Suppliers */}
                    <Link to="/supplier" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/supplier')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <BsCartCheck size={16} /> Suppliers
                                </div>
                            }
                            onClick={() => handleItemClick("Suppliers")}
                        />
                    </Link>

                    {/* All Purchases */}
                    <Link to="/all_purchases" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/all_purchases')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <BsCartCheck size={16} /> All Purchases
                                </div>
                            }
                            onClick={() => handleItemClick("All Purchases")}
                        />
                    </Link>

                    {/* Create Purchase */}
                    <Link to="/create_purchases" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/create_purchases')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <BsCartCheck size={16} /> Create Purchase
                                </div>
                            }
                            onClick={() => handleItemClick("Create Purchase")}
                        />
                    </Link>

                    {/* Import Purchases */}
                    <Link to="/import_purchases" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/import_purchases')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <BsCartCheck size={16} /> Import Purchases
                                </div>
                            }
                            onClick={() => handleItemClick("Import Purchases")}
                        />
                    </Link>
                </SideBarDropdown>


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

                <SideBarDropdown
                    isActive={isGroupActive(['/reports', '/sales-report'])}
                    title={
                        <div className="sidebar-link" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <HiOutlineDocumentReport size={16}/> Reports
                        </div>
                    }>
                    <Link to="/reports" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/reports')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <HiOutlineDocumentReport size={16} /> General Reports
                                </div>
                            }
                            onClick={() => handleItemClick("General Reports")}
                        />
                    </Link>
                    <Link to="/sales-report" className="sidebar-link" style={{
                        textDecoration: 'none',
                        color: 'inherit'
                    }}>
                        <SideBarItem
                            isActive={isPathActive('/sales-report')}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <TbReportMoney size={16} /> Sales Report
                                </div>
                            }
                            onClick={() => handleItemClick("Sales Report")}
                        />
                    </Link>
                </SideBarDropdown>

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