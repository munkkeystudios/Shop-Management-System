

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import "../components/Dashboard.css";
import { salesAPI, productsAPI } from "../services/api";
import { Table } from 'react-bootstrap'; // Adjust based on your UI library

const MainDashboard = () => {
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalTransactions: 0,
    averageSale: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]); // Ensuring it's an empty array initially
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch sales statistics
      const statsResponse = await salesAPI.getStats();
      if (statsResponse.data.success) {
        setSalesStats({
          totalSales: statsResponse.data.overall.totalSalesValue,
          totalTransactions: statsResponse.data.overall.totalTransactions,
          averageSale: statsResponse.data.overall.averageSaleValue,
        });
      }

      // Fetch low stock products using existing endpoint
      const stockResponse = await productsAPI.getLowStock();
      if (stockResponse.data.success) {
        setLowStockProducts(stockResponse.data.products || []); // Safeguard if products are undefined
      }

    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Dashboard">
      <main className="main-content p-6">
        {/* Stats Cards */}
        <section className="stats-cards grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Sales", value: salesStats.totalSales },
            { label: "Total Transactions", value: salesStats.totalTransactions },
            { label: "Average Sale", value: salesStats.averageSale },
          ].map((stat, index) => (
            <article key={index} className="card stat-card p-4 bg-white shadow-md rounded-xl">
              <div className="stat-icon">[Icon]</div>
              <div className="stat-label text-sm font-medium text-gray-600">{stat.label}</div>
              <div className="stat-value text-lg font-bold">{stat.value}</div>
            </article>
          ))}
        </section>

        {/* Products Section */}
        <section className="content-row grid grid-cols-1 gap-6 mt-6">
          <article className="card data-table-card bg-white shadow-md rounded-xl p-6">
            <div className="card-header mb-4">
              <h2 className="text-lg font-semibold">Low Stock Products</h2>
            </div>
            <Table className="data-table w-full text-sm">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(lowStockProducts) && lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product, idx) => (
                    <tr key={idx}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>{product.stock}</td>
                      <td>{product.lowStockThreshold || 'N/A'}</td>
                      <td>{product.category || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No low stock products</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="pagination flex gap-2 justify-end mt-4">
              {/* <a href="/products" className="text-blue-500">View All Products</a> */}
            </div>
          </article>
        </section>

        {/* Bottom Tables */}
        <section className="content-row grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <article className="card data-table-card small-table bg-white shadow-md rounded-xl p-6">
            <div className="card-header mb-4">
              <h2 className="text-lg font-semibold">Products Out of Stock</h2>
            </div>
            <Table className="data-table w-full text-sm">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Date Out</th>
                  <th>Restock Date</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Product 1</td><td>SKU001</td><td>01-Jan-2024</td><td>10-Jan-2024</td></tr>
                <tr><td>Product 2</td><td>SKU002</td><td>03-Jan-2024</td><td>12-Jan-2024</td></tr>
              </tbody>
            </Table>
          </article>

          <article className="card data-table-card small-table bg-white shadow-md rounded-xl p-6">
            <div className="card-header mb-4">
              <h2 className="text-lg font-semibold">Top Payments Received</h2>
            </div>
            <Table className="data-table w-full text-sm">
              <thead>
                <tr><th>Date</th><th>Order No</th><th>Customer</th><th>Amount</th></tr>
              </thead>
              <tbody>
                <tr><td>01-Jan-2024</td><td>ORD001</td><td>James Wilson</td><td>$2,000</td></tr>
                <tr><td>03-Jan-2024</td><td>ORD002</td><td>Jessica John</td><td>$1,800</td></tr>
                <tr><td>05-Jan-2024</td><td>ORD003</td><td>Stella Harper</td><td>$950</td></tr>
              </tbody>
            </Table>
          </article>
        </section>
      </main>
    </Layout>
  );
};

export default MainDashboard;
