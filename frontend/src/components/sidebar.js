import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../images/logo-small.png';


// sidebar layout:
const SideBar = ({ children }) => {
    return (
        <Nav
            className="flex-column"
            style={{
                width: '270px',
                height: '100vh',
                backgroundColor: '#ffffff'
            }}
        >
            {children}
        </Nav>
    );
};

// dropdown component that allows collapsing
// takes in title and children
const SideBarDropdown = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="text">
            <Nav.Item
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    cursor: 'pointer',
                    padding: '10px 15px',
                    textAlign: 'left',
                    paddingLeft: '30px'
                }}
            >
                {title}
            </Nav.Item>

            {isOpen && (
                <div
                    style={{
                        paddingLeft: '25px',
                        textAlign: 'left'
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

// properties for each item in sidebar
const SideBarItem = ({ title, onClick }) => {
    return (
        <Nav.Item
            onClick={onClick}
            style={{
                cursor: 'pointer',
                padding: '10px 15px',
                textAlign: 'left',
                paddingLeft: '50px'
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

    const handleItemClick = (item) => {
        console.log(`Clicked: ${item}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <SideBar>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '15px 30px',
                }}
            >
                <img
                    src={logoImage}
                    alt="Logo"
                    style={{
                        width: '48px',
                        height: '48px',
                        marginRight: '10px'
                    }}
                />
                <span style={{ fontWeight: 'semi-bold', fontSize: '29px' }}>FinTrack</span>
            </div>

            <Nav.Item style={{ padding: '10px 15px', textAlign: 'left', paddingLeft: '30px' }}>
                <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>
            </Nav.Item>

            <SideBar.Dropdown title="Products  (+)">
                <Link to="/all_products" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <SideBar.Item
                        title="All Products"
                        onClick={() => handleItemClick("All Products")}
                    />
                </Link>
                <Link to="/create_products" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <SideBar.Item
                        title="Create Product"
                        onClick={() => handleItemClick("Create Product")}
                    />
                </Link>
                <Link to="/inventory" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <SideBar.Item
                        title="Inventory"
                        onClick={() => handleItemClick("Inventory")}
                    />
                </Link>
            </SideBar.Dropdown>

            <Nav.Item style={{
                padding: '10px 15px',
                textAlign: 'left',
                paddingLeft: '30px'
            }}>
                <Link to="/reports" style={{ textDecoration: 'none', color: 'inherit' }}>Reports</Link>
            </Nav.Item>

            <Nav.Item style={{
                padding: '10px 15px',
                textAlign: 'left',
                paddingLeft: '30px'
            }}>
                <Link to="/pos" style={{ textDecoration: 'none', color: 'inherit' }}>POS</Link>
            </Nav.Item>

            <Nav.Item
                onClick={handleLogout}
                style={{
                    cursor: 'pointer',
                    padding: '10px 15px',
                    textAlign: 'left',
                    paddingLeft: '30px',
                    marginTop: '20px',
                    color: '#ff5252'
                }}
            >
                Logout
            </Nav.Item>
        </SideBar>
    );
}

export default ToolsSidebar;