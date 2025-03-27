import React from 'react';
import Sidebar from '../components/sidebar';


const AllProducts = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="container">
        <h1>AllProducts PAGE</h1>
        <p>This is a simple HTML page.</p>
      </div>
    </div>
  );
}

export default AllProducts;