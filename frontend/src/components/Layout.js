import React from 'react';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './Layout.css';

const Layout = ({ children, title }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-content">
        <TopBar title={title} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
