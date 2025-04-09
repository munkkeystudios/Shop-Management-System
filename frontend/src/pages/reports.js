import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import axios from 'axios';

const Reports = () => {

  const getError = (error) => {
    let e = error;
    if (error.response) {
      e = error.response.data;
      if (error.response.data && error.response.data.error) {
        e = error.response.data.error;
      }
    } else if (error.message) {
      e = error.message;
    } else {
      e = "Unknown error occurred";
    }
    return e;
  };

  const createProduct = async (newProduct) => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.error('No token found. Please log in.');
        return;
      }

      const result = await axios.post('/api/products', newProduct, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      console.log('Product created successfully:', result.data);
    } catch (err) {
      console.error('Error creating product:', getError(err));
    }
  };

  const sampleProduct = {
    name: "Green Shirt",
    barcode: "1001",
    description: "Comfy Green shirt for everyday wear.",
    price: 249.99,
    quantity: 100,
    category: "Casual Wear",
    supplier: "Packages",
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="container">
        <h1>REPORTS PAGE</h1>
        <p>This is a simple HTML page.</p>

        <button onClick={() => createProduct(sampleProduct)}>
          Add Product
        </button>
      </div>
    </div>
  );
};

export default Reports;
