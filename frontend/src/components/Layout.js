import React, { useState } from 'react';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './Layout.css';

const Layout = ({ children, title }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="layout-container">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="layout-content">
        <TopBar onMenuToggle={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
