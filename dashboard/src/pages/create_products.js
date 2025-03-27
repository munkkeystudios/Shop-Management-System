import React from 'react';
import Sidebar from '../components/sidebar';


const CreateProducts = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="container">
        <h1>CREATE PRODUCTS PAGE</h1>
        <p>This is a simple HTML page.</p>
      </div>
    </div>
  );
}

export default CreateProducts;