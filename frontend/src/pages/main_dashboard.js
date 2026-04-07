import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './main_dashboard.css';
import { salesAPI, productsAPI, purchasesAPI } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const MainDashboard = () => {
  const navigate = useNavigate();

  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
    formatRelativeTime,
  } = useNotifications();

  const [salesStats, setSalesStats] = useState({
    totalSales: 6850,
    totalPurchase: 12850,
    totalProducts: 14,
    totalRevenue: 80,
  });

  const [sales, setSales] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [productsOutOfStock, setProductsOutOfStock] = useState([]);
  const [topPayments, setTopPayments] = useState([]);
  const [topPaymentsLoading, setTopPaymentsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const sampleTopSellingProducts = useMemo(
    () => [
      { rank: '#01', sku: 'AS-9923-LP', totalSales: 1240, revenue: '$12,400.00', lastSold: '2 mins ago' },
      { rank: '#02', sku: 'BK-2021-MS', totalSales: 982, revenue: '$8,150.60', lastSold: '1 hour ago' },
      { rank: '#03', sku: 'WD-5541-GR', totalSales: 745, revenue: '$6,230.00', lastSold: 'Yesterday' },
    ],
    [],
  );

  const sampleProductsOutOfStock = useMemo(
    () => [
      { product: 'Silk Finish Emulsion', category: 'Paint', price: 45, quantity: 0 },
      { product: 'Hardwood Primer', category: 'Coating', price: 22.5, quantity: 0 },
    ],
    [],
  );

  const sampleTopPayments = useMemo(
    () => [
      { date: '24-10-2023', customer: 'Jonathan Harker', paid: '$4,500.00', due: '$0.00' },
      { date: '23-10-2023', customer: 'Mina Murray', paid: '$1,200.00', due: '$300.00' },
      { date: '22-10-2023', customer: 'Arthur Holmwood', paid: '$8,940.20', due: '$0.00' },
    ],
    [],
  );

  const processTopPayments = async (salesData) => {
    try {
      setTopPaymentsLoading(true);

      if (salesData && salesData.length > 0) {
        const topSales = [...salesData]
          .sort((a, b) => (b.amountPaid || 0) - (a.amountPaid || 0))
          .slice(0, 5)
          .map((sale) => {
            const total = sale.total || 0;
            const paid = sale.amountPaid || 0;
            const due = Math.max(0, total - paid);

            return {
              date: new Date(sale.createdAt)
                .toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
                .replace(/\//g, '-'),
              customer: sale.customer?.name || 'Walk-in Customer',
              paid: `$${paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              due: `$${due.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            };
          });

        setTopPayments(topSales.length ? topSales : sampleTopPayments);
      } else {
        setTopPayments(sampleTopPayments);
      }
    } catch (err) {
      console.error('Error processing top payments:', err);
      setTopPayments(sampleTopPayments);
    } finally {
      setTopPaymentsLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getAll({ sort: '-amountPaid', limit: 100 });

      let salesData = [];

      if (response.data.success && Array.isArray(response.data.data)) {
        salesData = response.data.data;
      } else if (response.data.success && Array.isArray(response.data.sales)) {
        salesData = response.data.sales;
      }

      setSales(salesData);
      await processTopPayments(salesData);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setSales([]);
      setTopPayments(sampleTopPayments);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutOfStockProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({
        inStock: 'false',
        limit: 5,
        sortBy: 'updatedAt',
        order: 'desc',
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        const outOfStockProducts = response.data.data.map((product) => ({
          id: product._id,
          product: product.name,
          category: product.category?.name || 'Uncategorized',
          price: Number(product.price) || 0,
          quantity: Number(product.quantity) || 0,
        }));

        setProductsOutOfStock(outOfStockProducts);
      } else {
        setProductsOutOfStock(sampleProductsOutOfStock);
      }
    } catch (err) {
      console.error('Error fetching out of stock products:', err);
      setProductsOutOfStock(sampleProductsOutOfStock);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const statsResponse = await salesAPI.getStats({});
      const productsResponse = await productsAPI.getAll({ limit: 1 });
      const purchasesResponse = await purchasesAPI.getAll({ limit: 100, sort: '-date' });

      const totalProductCount = productsResponse.data.success ? productsResponse.data.total : 0;

      let totalPurchaseAmount = 0;
      if (purchasesResponse.data.success && Array.isArray(purchasesResponse.data.data)) {
        totalPurchaseAmount = purchasesResponse.data.data.reduce(
          (total, purchase) => total + (purchase.totalAmount || 0),
          0,
        );
      }

      if (statsResponse.data.success) {
        setSalesStats({
          totalSales: statsResponse.data.overall.totalSalesValue || 6850,
          totalPurchase: totalPurchaseAmount || 12850,
          totalProducts: totalProductCount || 0,
          totalRevenue: statsResponse.data.overall.totalRevenue || 80,
        });
      } else {
        setSalesStats({
          totalSales: 6850,
          totalPurchase: totalPurchaseAmount || 12850,
          totalProducts: totalProductCount || 14,
          totalRevenue: 80,
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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

  useEffect(() => {
    fetchDashboardData();
    fetchSales();
    fetchOutOfStockProducts();
    setTopSellingProducts(sampleTopSellingProducts);
  }, [sampleTopSellingProducts]);

  const dashboardAlerts = useMemo(() => {
    if (!notifications || !notifications.length) {
      return [
        { id: 'a1', message: 'Product "milk" has been deleted', time: 'Today • 14:22', type: 'error' },
        { id: 'a2', message: 'System Backup Complete', time: 'Today • 03:00', type: 'success' },
        { id: 'a3', message: 'New Supplier Added: Slate Co.', time: 'Yesterday • 18:45', type: 'neutral' },
        { id: 'a4', message: 'Stock Warning: Heavy Duty Polish', time: 'Yesterday • 16:10', type: 'error' },
      ];
    }

    return notifications.slice(0, 4).map((notification) => ({
      id: notification._id,
      message: notification.message,
      time: formatRelativeTime(notification.createdAt),
      type: notification.type === 'sale' ? 'success' : notification.type === 'product' ? 'neutral' : 'error',
    }));
  }, [notifications, formatRelativeTime]);

  const dailyTotal = useMemo(() => {
    const paidTotal = topPayments.reduce((sum, payment) => {
      const value = Number(String(payment.paid || '').replace(/[$,]/g, ''));
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);

    return `$${paidTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [topPayments]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fallbackHeights = [40, 65, 55, 85, 95, 70, 60, 75, 45, 90, 50, 80];

    if (!sales || sales.length === 0) {
      return {
        months,
        bars: fallbackHeights.map((height, index) => ({
          month: months[index],
          height,
          active: height === Math.max(...fallbackHeights),
        })),
      };
    }

    const monthTotals = new Array(12).fill(0);

    sales.forEach((sale) => {
      const date = new Date(sale.createdAt);
      const monthIndex = date.getMonth();
      const amount = Number(sale.total ?? sale.amountPaid ?? 0);

      if (!Number.isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
        monthTotals[monthIndex] += Number.isNaN(amount) ? 0 : amount;
      }
    });

    const maxValue = Math.max(...monthTotals);
    const normalizedHeights = monthTotals.map((value) => {
      if (maxValue <= 0) return 40;

      const ratio = value / maxValue;
      return Math.round(40 + ratio * 55);
    });

    const highestIndex = normalizedHeights.indexOf(Math.max(...normalizedHeights));

    return {
      months,
      bars: normalizedHeights.map((height, index) => ({
        month: months[index],
        height,
        active: index === highestIndex,
      })),
    };
  }, [sales]);

  const statusLabel = (quantity) => {
    if (quantity <= 0) return '0 Items';
    if (quantity <= 2) return 'Critically Low';
    return 'Low';
  };

  const getAlertIcon = (alert) => {
    if (alert.type === 'success') return 'check_circle';
    if (alert.type === 'neutral') return 'person_add';
    if (String(alert.message || '').toLowerCase().includes('stock')) return 'inventory_2';
    return 'delete';
  };

  return (
    <Layout title="Dashboard">
      <div style={{ backgroundColor: '#f7f9fb', minHeight: 'calc(100vh - 80px)', fontFamily: 'Manrope, sans-serif' }}>
        <main className="slate-dashboard-main" style={{ flex: 1, minHeight: '100vh', background: '#f7f9fb' }}>
        {loading ? (
          <div className="products-loading-container">
            <div className="block-pulse">
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
              <div className="block rounded-sm"></div>
            </div>
          </div>
        ) : (
          <div className="slate-dashboard-shell">
            <section className="slate-metrics-grid">
              <article className="slate-metric-card">
                <span className="slate-metric-label">Total Sales</span>
                <div className="slate-metric-value-row">
                  <span className="slate-metric-value">
                    ${salesStats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="slate-metric-trend">+12%</span>
                </div>
              </article>

              <article className="slate-metric-card">
                <span className="slate-metric-label">Total Purchase</span>
                <div className="slate-metric-value-row">
                  <span className="slate-metric-value">
                    ${salesStats.totalPurchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </article>

              <article className="slate-metric-card">
                <span className="slate-metric-label">Total Products</span>
                <div className="slate-metric-value-row">
                  <span className="slate-metric-value">{salesStats.totalProducts}</span>
                </div>
              </article>

              <article className="slate-metric-card">
                <span className="slate-metric-label">Total Revenue</span>
                <div className="slate-metric-value-row">
                  <span className="slate-metric-value">{salesStats.totalRevenue}</span>
                </div>
              </article>
            </section>

            <div className="slate-mid-grid">
              <section className="slate-panel slate-sales-panel">
                <div className="slate-panel-top">
                  <h3>Sales Report</h3>
                  <div className="slate-legend">
                    <span className="slate-legend-dot" />
                    <span>MONTHLY REVENUE</span>
                  </div>
                </div>
                <div className="slate-sales-chart-wrap">
                  <div className="slate-chart-grid-lines" aria-hidden="true">
                    <div />
                    <div />
                    <div />
                    <div />
                  </div>

                  <div className="slate-chart-bars-row" role="img" aria-label="Monthly revenue chart">
                    {chartData.bars.map((bar) => (
                      <div
                        key={bar.month}
                        className={`slate-chart-bar ${bar.active ? 'active' : ''}`}
                        style={{ height: `${bar.height}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="slate-chart-month-row">
                  {chartData.months.map((month) => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
              </section>

              <section className="slate-panel slate-alerts-panel">
                <h3>
                  <span className="material-symbols-outlined">bolt</span>
                  System Alerts
                </h3>

                {notificationsLoading ? (
                  <div className="slate-empty-state">
                    <div className="block-pulse">
                      <div className="block rounded-sm"></div>
                      <div className="block rounded-sm"></div>
                      <div className="block rounded-sm"></div>
                    </div>
                  </div>
                ) : notificationsError ? (
                  <div className="slate-empty-state slate-error-state">{notificationsError}</div>
                ) : (
                  <div className="slate-alert-feed">
                    {dashboardAlerts.map((alert) => (
                      <article key={alert.id} className={`slate-alert-item slate-alert-${alert.type}`}>
                        <span className="material-symbols-outlined">{getAlertIcon(alert)}</span>
                        <div>
                          <p>{alert.message}</p>
                          <small>{alert.time}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section className="slate-table-section">
              <div className="slate-table-header">
                <h3>Top Selling Products</h3>
                <button type="button">Export CSV</button>
              </div>

              <div className="slate-table-wrap">
                <table className="slate-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>SKU</th>
                      <th className="right">Total Sales</th>
                      <th className="right">Revenue</th>
                      <th>Last Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingProducts.map((product, idx) => (
                      <tr key={`${product.sku}-${idx}`}>
                        <td>{product.rank}</td>
                        <td className="mono">{product.sku}</td>
                        <td className="right">{Number(product.totalSales).toLocaleString()}</td>
                        <td className="right">{product.revenue}</td>
                        <td>{product.lastSold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="slate-bottom-grid">
              <section className="slate-table-card">
                <div className="slate-table-card-head">
                  <h3 className="slate-error-title">
                    <span className="material-symbols-outlined">warning</span>
                    Out of Stock
                  </h3>
                </div>

                <div className="slate-table-wrap">
                  <table className="slate-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(productsOutOfStock.length ? productsOutOfStock : sampleProductsOutOfStock).map((product, idx) => (
                        <tr key={product.id || `${product.product}-${idx}`}>
                          <td>{product.product}</td>
                          <td className="muted uppercase">{product.category || 'Uncategorized'}</td>
                          <td className="mono">${Number(product.price || 0).toFixed(2)}</td>
                          <td>
                            <span className="slate-status-chip">{statusLabel(Number(product.quantity || 0))}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="slate-table-card">
                <div className="slate-table-card-head">
                  <h3 className="slate-compact-title">Recent Payments</h3>
                </div>

                <div className="slate-table-wrap">
                  <table className="slate-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th className="right">Paid</th>
                        <th className="right">Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(topPaymentsLoading ? sampleTopPayments : (topPayments.length ? topPayments : sampleTopPayments)).map((payment, idx) => (
                        <tr key={`${payment.customer}-${idx}`}>
                          <td className="muted">{payment.date}</td>
                          <td>{payment.customer}</td>
                          <td className="right paid">{payment.paid}</td>
                          <td className={`right ${payment.due === '$0.00' || payment.due === '$0' ? 'muted' : 'due'}`}>{payment.due}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="slate-daily-total-bar">
                  <div>
                    <span>Daily Total</span>
                    <strong>{dailyTotal}</strong>
                  </div>
                  <button type="button" onClick={() => navigate('/sales')}>All Sales</button>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
      </div>
    </Layout>
  );
};

export default MainDashboard;
