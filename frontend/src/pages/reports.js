import React from 'react';
import Sidebar from '../components/sidebar';


const Reports = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="container">
        <h1>REPORTS PAGE</h1>
        <p>This is a simple HTML page.</p>
      </div>
    </div>
  );
}

export default Reports;