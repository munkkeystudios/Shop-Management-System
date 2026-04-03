import React from 'react';
import './styles/POSLayout.css';

const POSLayout = ({ children, title, isDarkMode }) => {
  return (
    <div className="pos-layout-container">
      <div className="pos-layout-content">
        <main className={`pos-main-content ${isDarkMode ? 'dark-mode' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default POSLayout;
