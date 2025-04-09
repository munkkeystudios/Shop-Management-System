import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import axios from 'axios';

const Reports = () => {
  const [categoryId, setCategoryId] = useState(null);
  const [supplierId, setSupplierId] = useState(null);

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

  // Function to fetch Category and Supplier IDs from backend
  const fetchCategoryAndSupplierIds = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.error('No token found. Please log in.');
        return;
      }

      // Fetch the category and supplier IDs from the backend
      const categoryResult = await axios.get('/api/categories?name=Casual Wear', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const supplierResult = await axios.get('/api/suppliers?name=Best Supplies Co.', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (categoryResult.data && supplierResult.data) {
        setCategoryId(categoryResult.data._id);
        setSupplierId(supplierResult.data._id);
      }
    } catch (err) {
      console.error('Error fetching category or supplier:', getError(err));
    }
  };

  useEffect(() => {
    fetchCategoryAndSupplierIds();
  }, []);

  // Sample product object that uses category and supplier IDs
  const createProduct = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.error('No token found. Please log in.');
        return;
      }

      // Wait for category and supplier IDs to be fetched before sending the request
      if (!categoryId || !supplierId) {
        console.log('Category or Supplier ID not available yet.');
        return;
      }

      const newProduct = {
        name: "Green Shirt",
        barcode: "1001",
        description: "Comfy Green shirt for everyday wear.",
        price: 249.99,
        quantity: 100,
        category: categoryId,  // Dynamically set category ID
        supplier: supplierId,  // Dynamically set supplier ID
      };

      const result = await axios.post('/api/products', newProduct, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Product created successfully:', result.data);
    } catch (err) {
      console.error('Error creating product:', getError(err));
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="container">
        <h1>REPORTS PAGE</h1>
        <p>This is a simple HTML page.</p>

        <button onClick={createProduct}>
          Add Product
        </button>
      </div>
    </div>
  );
};

export default Reports;
