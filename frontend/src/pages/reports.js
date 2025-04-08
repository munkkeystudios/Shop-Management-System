import React from 'react';
import Sidebar from '../components/sidebar';
import axios from 'axios';

const Reports = () => {

  const createProduct = async (newProduct) => {
    try {
      const response = await axios.post('/api/products', newProduct);
      console.log('Product created successfully:', response.data);
    } catch (err) {
      console.error('Error creating product:', err);
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
    images: ["/src/images/green-shirt.png"],
    status: "active",
    costPrice: 150.00,
    taxRate: 5,
    minStockLevel: 10
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
