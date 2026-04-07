import React, { useState, useEffect } from "react";
import Layout from '../components/Layout';
import { salesAPI } from '../services/api';
import './sales.css';
import './sales-report.override.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// register Chart.js components to avoid "not registered" errors
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesStats, setSalesStats] = useState({
    overall: {
      totalSalesValue: 0,
      totalDiscountValue: 0,
      totalTaxValue: 0,
      averageSaleValue: 0,
      totalTransactions: 0
    },
    weeklyPerformance: [],
    byPaymentMethod: []
  });

  useEffect(() => {
    fetchSales();
    fetchSalesStats();
  }, [startDate, endDate]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await salesAPI.getAll(params);
      // support API shapes: { data: [...] } or [...] or { data: { data: [...] } }
      const payload = response?.data;
      if (Array.isArray(payload)) setSales(payload);
      else if (Array.isArray(payload?.data)) setSales(payload.data);
      else if (Array.isArray(payload?.data?.data)) setSales(payload.data.data);
      else setSales([]);
    } catch (err) {
      setError('Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesStats = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await salesAPI.getStats(params);
      const payload = response?.data;
      // normalize the payload into the expected shape
      const normalized = {
        overall: {
          totalSalesValue: (payload?.overall?.totalSalesValue ?? payload?.totalSalesValue) || 0,
          totalDiscountValue: (payload?.overall?.totalDiscountValue ?? payload?.totalDiscountValue) || 0,
          totalTaxValue: (payload?.overall?.totalTaxValue ?? payload?.totalTaxValue) || 0,
          averageSaleValue: (payload?.overall?.averageSaleValue ?? payload?.averageSaleValue) || 0,
          totalTransactions: (payload?.overall?.totalTransactions ?? payload?.totalTransactions) || 0,
        },
        weeklyPerformance: Array.isArray(payload?.weeklyPerformance)
          ? payload.weeklyPerformance
          : Array.isArray(payload?.data?.weeklyPerformance)
          ? payload.data.weeklyPerformance
          : [],
        byPaymentMethod: Array.isArray(payload?.byPaymentMethod) ? payload.byPaymentMethod : [],
      };
      setSalesStats(normalized);
    } catch (err) {
      console.error('Error fetching sales stats:', err);
    }
  };

  const filteredSales = sales.filter(sale =>
    sale._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Layout title="Sales Report">
  <main className="sales-report-root bg-surface min-h-screen" style={{ backgroundColor: '#f7f9fb' }}>
    <section style={{ padding: '32px', maxWidth: '100%', margin: '0 auto' }}>
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
        <>
        {/* Page Header (matches template) */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-outline text-xs font-bold uppercase tracking-[0.2em] mb-1">Analytical Hub</p>
            <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface">SALES PERFORMANCE</h2>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-surface-container-low text-on-surface-variant text-xs font-bold rounded flex items-center space-x-2 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              <span>LAST 30 DAYS</span>
            </button>
            <button className="px-4 py-2 text-on-primary text-xs font-bold rounded flex items-center space-x-2 hover:opacity-90 transition-opacity" style={{ backgroundColor: '#565e74', color: '#f7f7ff' }}>
              <span className="material-symbols-outlined text-sm">file_download</span>
              <span>EXPORT DATA</span>
            </button>
          </div>
        </div>

        {/* KPI Grid (matches template classes) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface-container-lowest p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-outline">Total Revenue</span>
              <span className="text-green-600 text-xs font-bold">+12.4%</span>
            </div>
            <p className="text-3xl font-black tracking-tight text-on-surface">${salesStats.overall.totalSalesValue.toFixed(2)}</p>
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'wght' 700" }}>payments</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-outline">Transactions</span>
              <span className="text-green-600 text-xs font-bold">+5.2%</span>
            </div>
            <p className="text-3xl font-black tracking-tight text-on-surface">{salesStats.overall.totalTransactions}</p>
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'wght' 700" }}>receipt</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-outline">Avg Sale Value</span>
              <span className="text-error text-xs font-bold">-1.8%</span>
            </div>
            <p className="text-3xl font-black tracking-tight text-on-surface">${salesStats.overall.averageSaleValue.toFixed(2)}</p>
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'wght' 700" }}>calculate</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-outline">Total Discount</span>
              <span className="text-on-surface-variant text-xs font-bold">Stable</span>
            </div>
            <p className="text-3xl font-black tracking-tight text-on-surface">${salesStats.overall.totalDiscountValue.toFixed(2)}</p>
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'wght' 700" }}>sell</span>
            </div>
          </div>
        </div>

        {/* Analytical Centerpiece (matches template) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-surface-container-lowest p-8">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface">Weekly Performance Analysis</h3>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3" style={{ backgroundColor: '#565e74' }}></div>
                  <span className="text-[10px] font-bold text-outline uppercase">Gross Sales</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3" style={{ backgroundColor: '#d9e4ea' }}></div>
                  <span className="text-[10px] font-bold text-outline uppercase">Net Sales</span>
                </div>
              </div>
            </div>

            {/* Chart: render real Bar when weeklyPerformance exists, otherwise show visual mock */}
            {salesStats.weeklyPerformance && salesStats.weeklyPerformance.length > 0 ? (
              (() => {
                const labels = salesStats.weeklyPerformance.map((d) => d.day || d.label || '');
                const chartData = {
                  labels,
                  datasets: [
                    {
                      label: 'Gross Sales',
                      data: salesStats.weeklyPerformance.map((d) => d.grossSales ?? d.gross ?? 0),
                      backgroundColor: '#565e74',
                    },
                    {
                      label: 'Net Sales',
                      data: salesStats.weeklyPerformance.map((d) => d.netSales ?? d.net ?? 0),
                      backgroundColor: '#d9e4ea',
                    },
                  ],
                };

                const chartOptions = {
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: false },
                  },
                  scales: {
                    x: { type: 'category', stacked: true },
                    y: { beginAtZero: true, stacked: true },
                  },
                };

                return <Bar data={chartData} options={chartOptions} />;
              })()
            ) : (
              <div className="h-64 flex items-end justify-between space-x-2 overflow-hidden">
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
                      <div className="w-full h-[15%] mb-1" style={{ backgroundColor: '#d9e4ea' }}></div>
                      <div className="w-full h-[25%]" style={{ backgroundColor: '#565e74' }}></div>
                      <span className="mt-4 text-[10px] font-bold text-outline shrink-0">{day}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Distribution */}
          <div className="bg-surface-container-low p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface mb-8">Payment Distribution</h3>
            <div className="space-y-6">
              {[{ method: "Credit Card", percentage: 64 }, { method: "Cash", percentage: 28 }, { method: "Loan", percentage: 8 }].map((payment, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex justify-between text-[11px] font-bold mb-2">
                    <span className="uppercase tracking-widest">{payment.method}</span>
                    <span>{payment.percentage}%</span>
                  </div>
                  <div className="h-2 bg-surface-container-highest w-full overflow-hidden" style={{ backgroundColor: '#d9e4ea' }}>
                    <div className="h-full" style={{ width: `${payment.percentage}%`, backgroundColor: '#565e74' }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 pt-8 border-t border-outline-variant/20">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-outline uppercase">Top Gateway</span>
                <span className="text-xs font-black">STRIPE_CONNECT</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Sales Insights (matches template) */}
        <div className="mb-12">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface mb-6 flex items-center">
            <span className="material-symbols-outlined mr-2" style={{ fontVariationSettings: '"FILL" 1', color: '#565e74' }}>auto_awesome</span>
            AI Sales Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["Trend Anomaly", "Optimization Suggestion", "Recent Sales Trend"].map((insight, index) => (
              <div key={index} className="bg-surface-container-highest p-6" style={{ backgroundColor: '#d9e4ea', borderLeft: '4px solid #565e74' }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#565e74' }}>{insight}</p>
                <p className="text-sm font-bold leading-relaxed text-on-surface mb-4">Insight details for {insight}.</p>
                <a className="text-[10px] font-black uppercase underline tracking-widest transition-colors" href="#" style={{ color: '#565e74' }}>View Details</a>
              </div>
            ))}
          </div>
        </div>

  {/* Transaction Log (matches template table classes and layout) */}
        <div className="bg-surface-container-lowest overflow-hidden">
          <div className="px-8 py-6 border-b border-surface-container flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface">Recent Transaction Log</h3>
            <button className="text-[10px] font-black uppercase tracking-widest border border-outline/20 px-3 py-1 hover:bg-surface-container transition-colors">View All Transactions</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-[10px] font-black uppercase tracking-widest text-outline">
                  <th className="px-8 py-4">Date &amp; Time</th>
                  <th className="px-8 py-4">Reference</th>
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Method</th>
                  <th className="px-8 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-xs font-medium">
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-8 py-4 text-on-surface">{formatDate(sale.date)}</td>
                      <td className="px-8 py-4 font-mono text-outline">{sale._id}</td>
                      <td className="px-8 py-4 font-bold text-on-surface">{sale.customer?.name || 'Guest'}</td>
                      <td className="px-8 py-4 uppercase tracking-tighter">{sale.paymentMethod || 'N/A'}</td>
                      <td className="px-8 py-4 text-right font-black">${(sale.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-4 text-center text-sm text-gray-500">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </section>
      </main>
    </Layout>
  );
};

export default Reports;
