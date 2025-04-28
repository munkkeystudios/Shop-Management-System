
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import "../components/Dashboard.css";
import { salesAPI, productsAPI, purchasesAPI } from "../services/api";
import { Table } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import { SalesBarChart } from '../components/SalesCharts';
import { FaMoneyBillWave, FaShoppingCart, FaChartLine, FaBoxes, FaBell } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';

const MainDashboard = () => {
  // Get notifications from context
  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
    formatRelativeTime
  } = useNotifications();

  const [salesStats, setSalesStats] = useState({
    totalSales: 6850,
    totalPurchase: 12850,
    totalProducts: 14.00,
    totalRevenue: 80,
  });
  const [sales, setSales] = useState([]); // Add sales state to store raw sales data
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [productsOutOfStock, setProductsOutOfStock] = useState([]);
  const [topPayments, setTopPayments] = useState([]);
  const [topPaymentsLoading, setTopPaymentsLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('Monthly');
  const [tablePeriod, setTablePeriod] = useState('Monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // We'll use the SalesBarChart component which processes data from the sales API

  // Sample alerts data
  const sampleAlerts = [
    { id: 1, message: 'New Alert', timestamp: '5h' },
    { id: 2, message: 'Lorem Ipsum', timestamp: '8h' },
    { id: 3, message: 'New Alert', timestamp: '1d' },
    { id: 4, message: 'Lorem Ipsum', timestamp: '2d' },
    { id: 5, message: 'New Alert', timestamp: '3d' },
  ];

  // Sample top selling products
  const sampleTopSellingProducts = [
    { rank: 1, sku: 'SKU001', totalSales: 600, revenue: '$50,000', lastSold: '20-Dec-2024' },
    { rank: 2, sku: 'SKU002', totalSales: 450, revenue: '$40,000', lastSold: '20-Dec-2024' },
    { rank: 3, sku: 'SKU003', totalSales: 350, revenue: '$30,000', lastSold: '20-Dec-2024' },
    { rank: 4, sku: 'SKU004', totalSales: 400, revenue: '$40,000', lastSold: '20-Dec-2024' },
    { rank: 5, sku: 'SKU005', totalSales: 430, revenue: '$40,000', lastSold: '20-Dec-2024' },
  ];

  // Sample products out of stock
  const sampleProductsOutOfStock = [
    { product: 'Product 1', sku: 'SKU001', dateOut: '01-Jan-2024', restockDate: '10-Jan-2024' },
    { product: 'Product 2', sku: 'SKU002', dateOut: '03-Jan-2024', restockDate: '10-Jan-2024' },
    { product: 'Product 3', sku: 'SKU003', dateOut: '05-Jan-2024', restockDate: '10-Jan-2024' },
    { product: 'Product 4', sku: 'SKU004', dateOut: '06-Jan-2024', restockDate: '10-Jan-2024' },
    { product: 'Product 5', sku: 'SKU005', dateOut: '06-Jan-2024', restockDate: '10-Jan-2024' },
  ];

  // Sample top payments - sorted by paid amount (highest to lowest)
  const sampleTopPayments = [
    { date: '01-Jan-2024', customer: 'James Wilson', paid: '$5,200', due: '$800' },
    { date: '03-Jan-2024', customer: 'Michael Brown', paid: '$4,750', due: '$0' },
    { date: '02-Jan-2024', customer: 'Jessica John', paid: '$3,800', due: '$1,200' },
    { date: '05-Jan-2024', customer: 'Sarah Parker', paid: '$3,500', due: '$500' },
    { date: '04-Jan-2024', customer: 'David Miller', paid: '$2,900', due: '$0' },
  ];

  useEffect(() => {
    fetchDashboardData();
    fetchSales();
    fetchOutOfStockProducts();
    // Set sample data for demonstration
    setTopSellingProducts(sampleTopSellingProducts);
    // productsOutOfStock will be set by fetchOutOfStockProducts
    // topPayments will be set by fetchSales
    // notifications are fetched from NotificationContext
  }, [startDate, endDate, tablePeriod]);

  // Fetch products with 0 quantity
  const fetchOutOfStockProducts = async () => {
    try {
      setLoading(true);

      // Use the productsAPI to fetch products with inStock=false parameter
      const response = await productsAPI.getAll({
        inStock: 'false',
        limit: 5, // Limit to 5 products
        sortBy: 'updatedAt', // Sort by last updated
        order: 'desc' // Most recently updated first
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        // Format the data for display
        const outOfStockProducts = response.data.data.map(product => ({
          id: product._id,
          product: product.name,
          sku: product.barcode,
          dateOut: new Date(product.updatedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '-'),
          restockDate: 'Pending', // Default value since we don't have this information
          category: product.category?.name || 'Uncategorized',
          price: product.price || 0,
          quantity: product.quantity || 0
        }));

        setProductsOutOfStock(outOfStockProducts);
      } else {
        // Fallback to sample data if API fails or returns no data
        setProductsOutOfStock(sampleProductsOutOfStock);
      }
    } catch (err) {
      console.error('Error fetching out of stock products:', err);
      // Fallback to sample data on error
      setProductsOutOfStock(sampleProductsOutOfStock);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sales data - similar to the all sales page
  const fetchSales = async () => {
    try {
      setLoading(true);

      // Add date filters based on period and provided dates
      const params = {
        sort: '-amountPaid', // Sort by amount paid in descending order
        limit: 100 // Get enough data to find top 5 after processing
      };

      // Calculate date range based on selected period
      const today = new Date();
      let periodStartDate = new Date();

      if (tablePeriod === 'Daily') {
        // Last 24 hours
        periodStartDate.setDate(today.getDate() - 1);
      } else if (tablePeriod === 'Weekly') {
        // Last 7 days
        periodStartDate.setDate(today.getDate() - 7);
      } else {
        // Monthly (default) - Last 30 days
        periodStartDate.setDate(today.getDate() - 30);
      }

      // Use provided date range if specified, otherwise use calculated period
      if (startDate) {
        params.startDate = startDate;
      } else {
        params.startDate = periodStartDate.toISOString().split('T')[0];
      }

      if (endDate) {
        params.endDate = endDate;
      } else {
        params.endDate = today.toISOString().split('T')[0];
      }

      const response = await salesAPI.getAll(params);
      let salesData = [];

      if (response.data.success && Array.isArray(response.data.data)) {
        salesData = response.data.data;
      } else if (response.data.success && Array.isArray(response.data.sales)) {
        // if your server calls it "sales" instead of "data"
        salesData = response.data.sales;
      } else {
        // fallback to empty array
        console.warn('Unexpected sales shape, defaulting to []');
      }

      // Set sales data for the chart
      setSales(salesData);

      // Process sales data for top payments
      await processTopPayments(salesData);
    } catch (err) {
      setError('Failed to fetch sales data');
      console.error('Error fetching sales:', err);
      setSales([]);
      // Use sample data on error
      setTopPayments(sampleTopPayments);
    } finally {
      setLoading(false);
    }
  };

  // Process sales data to get top payments
  const processTopPayments = async (salesData) => {
    try {
      // Set loading state for top payments section
      setTopPaymentsLoading(true);

      if (salesData && salesData.length > 0) {
        // Sort by amountPaid (highest first) and take top 5
        const topSales = [...salesData]
          .sort((a, b) => {
            // Get the paid amount from each sale
            const paidA = a.amountPaid || 0;
            const paidB = b.amountPaid || 0;
            return paidB - paidA; // Sort descending
          })
          .slice(0, 5)
          .map(sale => {
            // Format the data for display
            const total = sale.total || 0;
            const paid = sale.amountPaid || 0;
            const due = Math.max(0, total - paid);

            return {
              date: new Date(sale.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }).replace(/\//g, '-'),
              customer: sale.customer?.name || 'Walk-in Customer',
              paid: `$${paid.toLocaleString()}`,
              due: `$${due.toLocaleString()}`
            };
          });

        if (topSales.length > 0) {
          setTopPayments(topSales);
        } else {
          // If no real data after processing, use sample data
          setTopPayments(sampleTopPayments);
        }
      } else {
        // If no sales data, use sample data
        setTopPayments(sampleTopPayments);
      }
    } catch (err) {
      console.error('Error processing top payments:', err);
      // Use sample data on error
      setTopPayments(sampleTopPayments);
    } finally {
      setTopPaymentsLoading(false);
    }
  };

  // Dedicated function to refresh just the top payments
  const refreshTopPayments = async () => {
    try {
      setTopPaymentsLoading(true);

      // Add date filters based on period and provided dates
      const params = {
        sort: '-amountPaid', // Sort by amount paid in descending order
        limit: 100 // Get enough data to find top 5 after processing
      };

      // Calculate date range based on selected period
      const today = new Date();
      let periodStartDate = new Date();
      periodStartDate.setDate(today.getDate() - 30); // Default to last 30 days

      // Use provided date range if specified, otherwise use calculated period
      if (startDate) {
        params.startDate = startDate;
      } else {
        params.startDate = periodStartDate.toISOString().split('T')[0];
      }

      if (endDate) {
        params.endDate = endDate;
      } else {
        params.endDate = today.toISOString().split('T')[0];
      }

      const response = await salesAPI.getAll(params);
      let salesData = [];

      if (response.data.success && Array.isArray(response.data.data)) {
        salesData = response.data.data;
      } else if (response.data.success && Array.isArray(response.data.sales)) {
        salesData = response.data.sales;
      } else {
        console.warn('Unexpected sales shape, defaulting to []');
      }

      // Process the data for top payments
      await processTopPayments(salesData);

    } catch (err) {
      console.error('Error refreshing top payments:', err);
      setTopPayments(sampleTopPayments);
    } finally {
      setTopPaymentsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Add date filters if provided
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      // Fetch sales statistics
      const statsResponse = await salesAPI.getStats(params);

      // Fetch total product count
      const productsResponse = await productsAPI.getAll({ limit: 1 }); // Just need the total count, not all products
      const totalProductCount = productsResponse.data.success ? productsResponse.data.total : 0;

      // Fetch purchases to calculate total purchase amount
      const purchasesResponse = await purchasesAPI.getAll({
        limit: 100, // Get a reasonable number of purchases
        sort: '-date' // Sort by most recent
      });

      // Calculate total purchase amount
      let totalPurchaseAmount = 0;
      if (purchasesResponse.data.success && Array.isArray(purchasesResponse.data.data)) {
        totalPurchaseAmount = purchasesResponse.data.data.reduce((total, purchase) => {
          return total + (purchase.totalAmount || 0);
        }, 0);
      }

      if (statsResponse.data.success) {
        setSalesStats({
          totalSales: statsResponse.data.overall.totalSalesValue || 6850,
          totalPurchase: totalPurchaseAmount || 12850,
          totalProducts: totalProductCount || 0,
          totalRevenue: statsResponse.data.overall.totalRevenue || 80,
        });
      } else {
        // Use sample data if API fails, but keep the real product count and purchase amount if available
        setSalesStats({
          totalSales: 6850,
          totalPurchase: totalPurchaseAmount || 12850,
          totalProducts: totalProductCount || 14,
          totalRevenue: 80,
        });
      }

      // Fetch low stock products
      const stockResponse = await productsAPI.getLowStock();
      if (stockResponse.data.success) {
        setLowStockProducts(stockResponse.data.products || []);
      }

    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);

      // Use sample data if API fails
      setSalesStats({
        totalSales: 6850,
        totalPurchase: 12850,
        totalProducts: 14,
        totalRevenue: 80,
      });
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return typeof value === 'number'
      ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : value;
  };

  return (
    <Layout title="Dashboard">
      <main className="main-content">
        {/* Stats Cards with White Background Container */}
        <div className="stats-container">
          <section className="stats-cards">
            {/* Total Sales - Light Yellow */}
            <article className="stat-card">
              <div className="stat-label">Total Sales</div>
              <div className="stat-value">${salesStats.totalSales.toLocaleString()}</div>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 138, 101, 0.2)', color: '#FF8A65' }}>
                <FaShoppingCart />
              </div>
            </article>

            {/* Total Purchase - Light Purple */}
            <article className="stat-card">
              <div className="stat-label">Total Purchase</div>
              <div className="stat-value">${salesStats.totalPurchase.toLocaleString()}</div>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(179, 136, 255, 0.2)', color: '#B388FF' }}>
                <FaMoneyBillWave />
              </div>
            </article>

            {/* Total Products - Light Green */}
            <article className="stat-card">
              <div className="stat-label">Total Products</div>
              <div className="stat-value">{salesStats.totalProducts}</div>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50' }}>
                <FaBoxes />
              </div>
            </article>

            {/* Total Revenue - Light Pink */}
            <article className="stat-card">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">{salesStats.totalRevenue}</div>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 138, 128, 0.2)', color: '#FF8A80' }}>
                <FaChartLine />
              </div>
            </article>
          </section>
        </div>

        {/* Sales Report and Alerts */}
        <div className="content-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          {/* Sales Report - Using the same SalesBarChart component as in sales-report.js */}
          <article className="card" style={{ padding: '1.5rem', borderRadius: '0.75rem', backgroundColor: 'white' }}>
            {/* Chart has no header - removed title and filters */}
            <div className="chart-container" style={{ height: '300px', marginTop: '10px' }}>
              {/* Use the same SalesBarChart component as in the sales report page */}
              <SalesBarChart sales={sales} />
            </div>
          </article>

          {/* Alerts - Showing last 3 notifications */}
          <article className="card" style={{ padding: '1.5rem', borderRadius: '0.75rem', backgroundColor: 'white' }}>
            <div className="section-header">
              <div className="section-title">Alerts</div>
            </div>
            <div className="alerts-list">
              {notificationsLoading ? (
                <div style={{ padding: '1rem 0', textAlign: 'center', color: '#64748b' }}>
                  Loading notifications...
                </div>
              ) : notificationsError ? (
                <div style={{ padding: '1rem 0', textAlign: 'center', color: '#f43f5e' }}>
                  {notificationsError}
                </div>
              ) : notifications && notifications.length > 0 ? (
                // Display the last 3 notifications
                notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ color: '#00a838', marginTop: '0.2rem' }}>
                        <FaBell />
                      </div>
                      <div>
                        <div>{notification.message}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </div>
                      </div>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                      {formatRelativeTime(notification.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                // Fallback to sample alerts if no notifications
                alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <div>{alert.message}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{alert.timestamp}</div>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>

        {/* Top Selling Products */}
        <article className="data-table-card" style={{ padding: '1.5rem' }}>
          <div className="section-header">
            <div className="section-title">Top selling product</div>
            <select
              className="period-selector"
              value={tablePeriod}
              onChange={(e) => setTablePeriod(e.target.value)}
            >
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Daily</option>
            </select>
          </div>
          <Table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>SKU</th>
                <th>Total Sales</th>
                <th>Revenue</th>
                <th>Last Sold</th>
              </tr>
            </thead>
            <tbody>
              {topSellingProducts.map((product, idx) => (
                <tr key={idx}>
                  <td>{product.rank}</td>
                  <td>{product.sku}</td>
                  <td>{product.totalSales}</td>
                  <td>{product.revenue}</td>
                  <td>{product.lastSold}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="pagination">
            <span>Previous</span>
            <span>Next</span>
            <div style={{ marginLeft: 'auto' }}>Page 1 of 10</div>
          </div>
        </article>

        {/* Bottom Tables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          {/* Products Out of Stock */}
          <article className="data-table-card" style={{ padding: '1.5rem' }}>
            <div className="section-header">
              <div className="section-title">Products Out Of Stock</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#00a838',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.875rem'
                  }}
                  onClick={fetchOutOfStockProducts}
                >
                  Refresh
                </button>
              </div>
            </div>
            {loading ? (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b' }}>
                Loading products...
              </div>
            ) : error ? (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: '#f43f5e' }}>
                {error}
              </div>
            ) : (
              <Table className="data-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {productsOutOfStock.length > 0 ? (
                    productsOutOfStock.map((product, idx) => (
                      <tr key={product.id || idx}>
                        <td>{product.product}</td>
                        <td>{product.category || 'Uncategorized'}</td>
                        <td>{product.sku}</td>
                        <td>${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</td>
                        <td>{product.dateOut}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                        No products out of stock
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
            {productsOutOfStock.length > 0 && (
              <div className="pagination" style={{ marginTop: '1rem' }}>
                <a href="/products" style={{ color: '#00a838', textDecoration: 'none' }}>View All Products</a>
                <div style={{ marginLeft: 'auto' }}>Showing {productsOutOfStock.length} items</div>
              </div>
            )}
          </article>

          {/* Top Payments Received */}
          <article className="data-table-card" style={{ padding: '1.5rem' }}>
            <div className="section-header">
              <div className="section-title">Top 5 Payments Received</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#00a838',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.875rem'
                  }}
                  onClick={refreshTopPayments}
                >
                  Refresh
                </button>
              </div>
            </div>
            {topPaymentsLoading ? (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b' }}>
                Loading payments...
              </div>
            ) : (
              <Table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>Paid</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {topPayments.length > 0 ? (
                    topPayments.map((payment, idx) => (
                      <tr key={idx}>
                        <td>{payment.date}</td>
                        <td>{payment.customer}</td>
                        <td style={{ color: '#00a838' }}>{payment.paid}</td>
                        <td style={{ color: payment.due === '$0' ? '#64748b' : '#f43f5e' }}>{payment.due}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                        No payment data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
            <div className="pagination" style={{ marginTop: '1rem' }}>
              <a href="/sales" style={{ color: '#00a838', textDecoration: 'none' }}>View All Sales</a>
              <div style={{ marginLeft: 'auto' }}>Showing {topPayments.length} items</div>
            </div>
          </article>
        </div>
      </main>
    </Layout>
  );
};

export default MainDashboard;
