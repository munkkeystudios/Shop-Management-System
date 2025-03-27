import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';

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
    const handleItemClick = (item) => {
        console.log(`Clicked: ${item}`);
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
                src="/path/to/logo.png" 
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
                <Nav.Link href="/dashboard">Dashboard</Nav.Link>
            </Nav.Item>

            <SideBar.Dropdown title="Products">
                <SideBar.Item
                    title="All Products"
                    onClick={() => handleItemClick("All Products")}
                />
                <SideBar.Item
                    title="Create Product"
                    onClick={() => handleItemClick("Create Product")} />
                <SideBar.Item
                    title="Inventory"
                    onClick={() => handleItemClick("Inventory")}
                />
            </SideBar.Dropdown>

            <SideBar.Dropdown title="Orders">
                <SideBar.Item
                    title="Order List"
                    onClick={() => handleItemClick("Order List")}
                />
                <SideBar.Item
                    title="Create Order"
                    onClick={() => handleItemClick("Create Order")}
                />
            </SideBar.Dropdown>

            <Nav.Item style={
                {
                    padding: '10px 15px',
                    textAlign: 'left',
                    paddingLeft: '30px'
                }}>
                <Nav.Link href="/reports">Reports</Nav.Link>
            </Nav.Item>
        </SideBar>
    );
}

export default ToolsSidebar;