import React from 'react';
import TopBar from './TopBar';
import './POSLayout.css';

const POSLayout = ({ children, title }) => {
  return (
    <div className="pos-layout-container">
      <div className="pos-layout-content">
        <TopBar title={title} />
        <main className="pos-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default POSLayout;
