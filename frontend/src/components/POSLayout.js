import React from 'react';
import './styles/POSLayout.css';

const POSLayout = ({ children, title }) => {
  return (
    <div className="pos-layout-container">
      <div className="pos-layout-content">
        <main className="pos-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default POSLayout;
