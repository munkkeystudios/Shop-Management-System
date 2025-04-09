
// import React, { useState } from "react";
// // import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// // import { Bell, ShoppingCart, Tag, Box } from "lucide-react";
// import "../components/Dashboard.css";  // Import the CSS file
// import OverviewCard from "../components/OverviewCard";
// import SalesChart from "../components/SalesChart";
// import StockAlerts from "../components/StockAlerts";
// import TopSellingProducts from "../components/TopSellingProducts";
// import PaymentsReceived from "../components/PaymentsReceived";
// import Alerts from "../components/Alerts";

// const MainDashboard = () => {
//   const [overviewData, setOverviewData] = useState({
//     totalSales: "$06,850",
//     totalPurchases: "$12,850",
//     totalProducts: "$14,000",
//     totalRevenue: "$80",
//   });

//   const [alerts, setAlerts] = useState([
//     { message: "Stock Alert! Green Shirts are low", timeAgo: "5 min ago" },
//     { message: "New Order Received", timeAgo: "10 min ago" },
//   ]);

//   const [payments, setPayments] = useState([]);

//   return (
//     <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 min-h-screen">
//       {/* Overview Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//         <OverviewCard title="Total Sales" value={overviewData.totalSales} color="bg-yellow-300 shadow-md rounded-lg p-4" />
//         <OverviewCard title="Total Purchases" value={overviewData.totalPurchases} color="bg-purple-300 shadow-md rounded-lg p-4" />
//         <OverviewCard title="Total Products" value={overviewData.totalProducts} color="bg-green-300 shadow-md rounded-lg p-4" />
//         <OverviewCard title="Total Revenue" value={overviewData.totalRevenue} color="bg-red-300 shadow-md rounded-lg p-4" />
//       </div>

//       {/* Sales Report & Alerts */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="md:col-span-2 bg-white shadow-lg rounded-lg p-6">
//           <SalesChart />
//         </div>
//         <div className="bg-white shadow-lg rounded-lg p-6">
//           <Alerts alerts={alerts} />
//         </div>
//       </div>

//       {/* Top Selling Products & Stock Alerts */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//         <div className="bg-white shadow-lg rounded-lg p-6">
//           <TopSellingProducts />
//         </div>
//         <div className="bg-white shadow-lg rounded-lg p-6">
//           <StockAlerts alerts={alerts} />
//         </div>
//       </div>

//       {/* Payments Received */}
//       <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
//         <PaymentsReceived payments={payments} />
//       </div>
//     </div>
//   );
// };

// export default MainDashboard;

// import React, { useState } from "react";
// import OverviewCard from "../components/OverviewCard";
// import SalesChart from "../components/SalesChart";
// import StockAlerts from "../components/StockAlerts";
// import TopSellingProducts from "../components/TopSellingProducts";
// import PaymentsReceived from "../components/PaymentsReceived";
// import Alerts from "../components/Alerts";
// import Sidebar from "../components/sidebar";

// const MainDashboard = () => {
//   const [overviewData] = useState({
//     totalSales: "$06,850",
//     totalPurchases: "$12,850",
//     totalProducts: "14,000",
//     totalRevenue: "$80",
//   });

//   const [alerts] = useState([
//     { message: "Stock Alert! Green Shirts are low", timeAgo: "5 min ago" },
//     { message: "New Order Received", timeAgo: "10 min ago" },
//   ]);

//   const [payments] = useState([]);

//   return (
//     <div style={{ display: 'flex' }}>
//       <Sidebar />
//       <div className="p-6 bg-gray-100 min-h-screen">
//         {/* Overview Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
//           <OverviewCard title="Total Sales" value={overviewData.totalSales} color="bg-yellow-100 border border-yellow-300" />
//           <OverviewCard title="Total Purchases" value={overviewData.totalPurchases} color="bg-purple-100 border border-purple-300" />
//           <OverviewCard title="Total Products" value={overviewData.totalProducts} color="bg-green-100 border border-green-300" />
//           <OverviewCard title="Total Revenue" value={overviewData.totalRevenue} color="bg-red-100 border border-red-300" />
//         </div>

//         {/* Sales Report & Alerts */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
//           <div className="md:col-span-2 bg-white shadow-md rounded-xl p-6">
//             <SalesChart />
//           </div>
//           <div className="bg-white shadow-md rounded-xl p-6">
//             <Alerts alerts={alerts} />
//           </div>
//         </div>

//         {/* Top Selling Products & Stock Alerts */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//           <div className="bg-white shadow-md rounded-xl p-6">
//             <TopSellingProducts />
//           </div>
//           <div className="bg-white shadow-md rounded-xl p-6">
//             <StockAlerts alerts={alerts} />
//           </div>
//         </div>

//         {/* Payments Received */}
//         <div className="mt-6 bg-white shadow-md rounded-xl p-6">
//           <PaymentsReceived payments={payments} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MainDashboard;


import React from "react";
import Sidebar from "../components/sidebar"; // Assuming sidebar structure is similar
import "../styles/style.css"; // Import custom styles

const MainDashboard = () => {
  return (
    <div className="dashboard-container" style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-wrapper bg-gray-100 min-h-screen">
        {/* Header */}
        <header className="header flex justify-between items-center p-4 bg-white shadow-md">
          <div className="header-left">
            <h1 className="page-title text-xl font-semibold">Dashboard</h1>
          </div>
          <div className="header-center flex items-center gap-4">
            <button className="pos-button flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded">
              <span className="icon-placeholder">[Cart]</span> POS
            </button>
            <input type="search" className="search-bar px-2 py-1 border rounded" placeholder="Search..." />
          </div>
          <div className="header-right flex items-center gap-2">
            <div className="user-avatar" />
            <span className="icon-placeholder">[v]</span>
          </div>
        </header>

        <main className="main-content p-6">
          {/* Stats Cards */}
          <section className="stats-cards grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Total Sales", value: "$06,850" },
              { label: "Total Purchase", value: "$12,850" },
              { label: "Total Products", value: "14,000" },
              { label: "Total Revenue", value: "$80" },
            ].map((stat, index) => (
              <article key={index} className="card stat-card p-4 bg-white shadow-md rounded-xl">
                <div className="stat-icon">[Icon]</div>
                <div className="stat-label text-sm font-medium text-gray-600">{stat.label}</div>
                <div className="stat-value text-lg font-bold">{stat.value}</div>
              </article>
            ))}
          </section>

          {/* Sales Report & Alerts */}
          <section className="content-row grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <article className="card sales-report bg-white shadow-md rounded-xl p-6 md:col-span-2">
              <div className="card-header flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Sales Report</h2>
                <select className="report-control border rounded px-2 py-1">
                  <option>Monthly</option>
                </select>
              </div>
              <div className="chart-placeholder text-center text-gray-400 py-10">
                [Bar Chart Area - Max height ~100px. June highest.]
              </div>
            </article>

            <aside className="card alerts-section bg-white shadow-md rounded-xl p-6">
              <div className="card-header mb-4">
                <h2 className="text-lg font-semibold">Alerts</h2>
              </div>
              <ul className="space-y-2 text-sm">
                <li><span className="alert-icon">[!]</span> Stock Alert! Green Shirt is low <span className="timestamp text-gray-400">1h ago</span></li>
                <li><span className="alert-icon">[!]</span> New order received #ORD004 <span className="timestamp text-gray-400">2h ago</span></li>
                <li><span className="alert-icon">[!]</span> Server maintenance scheduled <span className="timestamp text-gray-400">1d ago</span></li>
              </ul>
              <a href="#" className="view-all text-blue-500 mt-4 inline-block">View All</a>
            </aside>
          </section>

          {/* Top Selling Products Table */}
          <section className="card data-table-card bg-white shadow-md rounded-xl p-6 mt-6">
            <div className="card-header mb-4">
              <h2 className="text-lg font-semibold">Top Selling Product</h2>
            </div>
            <table className="data-table w-full text-sm">
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
                {[
                  ["1", "SKU001", "500", "$50,000", "29-Dec-2024"],
                  ["2", "SKU002", "400", "$40,000", "28-Dec-2024"],
                  ["3", "SKU003", "350", "$35,000", "27-Dec-2024"],
                  ["4", "SKU004", "400", "$40,000", "28-Dec-2024"],
                  ["5", "SKU005", "450", "$45,000", "29-Dec-2024"],
                ].map(([rank, sku, sales, revenue, sold], idx) => (
                  <tr key={idx}>
                    <td>{rank}</td><td>{sku}</td><td>{sales}</td><td>{revenue}</td><td>{sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination flex gap-2 justify-end mt-4">
              <span className="cursor-pointer">&lt;</span>
              <span className="active font-bold">1</span>
              <span>2</span>
              <span>3</span>
              <span className="cursor-pointer">&gt;</span>
            </div>
          </section>

          {/* Bottom Tables */}
          <section className="content-row grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <article className="card data-table-card small-table bg-white shadow-md rounded-xl p-6">
              <div className="card-header mb-4">
                <h2 className="text-lg font-semibold">Products Out of Stock</h2>
              </div>
              <table className="data-table w-full text-sm">
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
              </table>
            </article>

            <article className="card data-table-card small-table bg-white shadow-md rounded-xl p-6">
              <div className="card-header mb-4">
                <h2 className="text-lg font-semibold">Top Payments Received</h2>
              </div>
              <table className="data-table w-full text-sm">
                <thead>
                  <tr><th>Date</th><th>Order No</th><th>Customer</th><th>Amount</th></tr>
                </thead>
                <tbody>
                  <tr><td>01-Jan-2024</td><td>ORD001</td><td>James Wilson</td><td>$2,000</td></tr>
                  <tr><td>03-Jan-2024</td><td>ORD002</td><td>Jessica John</td><td>$1,800</td></tr>
                  <tr><td>05-Jan-2024</td><td>ORD003</td><td>Stella Harper</td><td>$950</td></tr>
                </tbody>
              </table>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
};

export default MainDashboard;



// function generateStatCard(type, label, value) {
//   return `
//     <article class="card stat-card ${type}">
//       <div class="stat-icon">[Icon]</div>
//       <div class="stat-label">${label}</div>
//       <div class="stat-value">${value}</div>
//     </article>
//   `;
// }

// function renderDashboard() {
//   const head = document.head;

//   // Add meta and links
//   head.innerHTML += `
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>FinTrack Dashboard</title>
//     <link rel="preconnect" href="https://fonts.googleapis.com">
//     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
//     <link rel="stylesheet" href="css/style.css">
//   `;

//   const dashboardHTML = `
//     <div class="dashboard-container">
//         <aside class="sidebar">
//             <div class="sidebar-logo">
//                 <span class="icon-placeholder">[Icon]</span> FinTrack
//             </div>
//             <nav class="sidebar-nav">
//                 <ul>
//                     <li class="active"><a href="#"><span class="icon-placeholder">[Icon]</span> Dashboard</a></li>
//                     <li><a href="#"><span class="icon-placeholder">[Icon]</span> Products</a></li>
//                     <li><a href="#"><span class="icon-placeholder">[Icon]</span> Adjustments</a></li>
//                     <li><a href="#"><span class="icon-placeholder">[Icon]</span> Purchases</a></li>
//                     <li><a href="#"><span class="icon-placeholder">[Icon]</span> Users</a></li>
//                     <li><a href="#"><span class="icon-placeholder">[Icon]</span> Sales</a></li>
//                     <li><a href="#"><span class="icon-placeholder">[Icon]</span> Reports</a></li>
//                     <li><a href="#"><span class="icon-placeholder">[Icon]</span> Settings</a></li>
//                 </ul>
//             </nav>
//         </aside>

//         <div class="main-wrapper">
//             <header class="header">
//                 <div class="header-left">
//                     <h1 class="page-title">Dashboard</h1>
//                 </div>
//                 <div class="header-center">
//                     <button class="pos-button"><span class="icon-placeholder">[Cart]</span> POS</button>
//                     <input type="search" class="search-bar" placeholder="Search...">
//                 </div>
//                 <div class="header-right">
//                     <div class="user-avatar"></div>
//                     <span class="icon-placeholder">[v]</span>
//                 </div>
//             </header>

//             <main class="main-content">
//                 <section class="stats-cards">
//                     ${generateStatCard("sales", "Total Sales", "$06,850")}
//                     ${generateStatCard("purchase", "Total Purchase", "$12,850")}
//                     ${generateStatCard("products", "Total Products", "14,000")}
//                     ${generateStatCard("revenue", "Total Revenue", "$80")}
//                 </section>

//                 <section class="content-row">
//                     <article class="card sales-report">
//                         <div class="card-header">
//                             <h2>Sales Report</h2>
//                             <select class="report-control"><option>Monthly</option></select>
//                         </div>
//                         <div class="chart-placeholder">
//                             <p style="text-align: center; padding: 40px 0; color: #999;">[Bar Chart Area - Max height ~100px. June highest.]</p>
//                         </div>
//                     </article>

//                     <aside class="card alerts-section">
//                         <div class="card-header"><h2>Alerts</h2></div>
//                         <ul>
//                             <li><span class="alert-icon">[!]</span> Stock Alert! Green Shirt is low <span class="timestamp">1h ago</span></li>
//                             <li><span class="alert-icon">[!]</span> New order received #ORD004 <span class="timestamp">2h ago</span></li>
//                             <li><span class="alert-icon">[!]</span> Server maintenance scheduled <span class="timestamp">1d ago</span></li>
//                         </ul>
//                         <a href="#" class="view-all">View All</a>
//                     </aside>
//                 </section>

//                 <section class="card data-table-card">
//                     <div class="card-header">
//                         <h2>Top Selling Product</h2>
//                     </div>
//                     <table class="data-table">
//                         <thead>
//                             <tr>
//                                 <th>Rank</th><th>SKU</th><th>Total Sales</th><th>Revenue</th><th>Last Sold</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr><td>1</td><td>SKU001</td><td>500</td><td>$50,000</td><td>29-Dec-2024</td></tr>
//                             <tr><td>2</td><td>SKU002</td><td>400</td><td>$40,000</td><td>28-Dec-2024</td></tr>
//                             <tr><td>3</td><td>SKU003</td><td>350</td><td>$35,000</td><td>27-Dec-2024</td></tr>
//                             <tr><td>4</td><td>SKU004</td><td>400</td><td>$40,000</td><td>28-Dec-2024</td></tr>
//                             <tr><td>5</td><td>SKU005</td><td>450</td><td>$45,000</td><td>29-Dec-2024</td></tr>
//                         </tbody>
//                     </table>
//                     <div class="pagination">
//                         <span>&lt;</span> <span class="active">1</span> <span>2</span> <span>3</span> <span>&gt;</span>
//                     </div>
//                 </section>

//                 <section class="content-row">
//                     <article class="card data-table-card small-table">
//                         <div class="card-header"><h2>Products Out of Stock</h2></div>
//                         <table class="data-table">
//                             <thead><tr><th>Product</th><th>SKU</th><th>Date Out</th><th>Restock Date</th></tr></thead>
//                             <tbody>
//                                 <tr><td>Product 1</td><td>SKU001</td><td>01-Jan-2024</td><td>10-Jan-2024</td></tr>
//                                 <tr><td>Product 2</td><td>SKU002</td><td>03-Jan-2024</td><td>12-Jan-2024</td></tr>
//                             </tbody>
//                         </table>
//                     </article>

//                     <article class="card data-table-card small-table">
//                         <div class="card-header"><h2>Top Payments Received</h2></div>
//                         <table class="data-table">
//                             <thead><tr><th>Date</th><th>Order No</th><th>Customer</th><th>Amount</th></tr></thead>
//                             <tbody>
//                                 <tr><td>01-Jan-2024</td><td>ORD001</td><td>James Wilson</td><td>$2,000</td></tr>
//                                 <tr><td>03-Jan-2024</td><td>ORD002</td><td>Jessica John</td><td>$1,800</td></tr>
//                                 <tr><td>05-Jan-2024</td><td>ORD003</td><td>Stella Harper</td><td>$950</td></tr>
//                             </tbody>
//                         </table>
//                     </article>
//                 </section>
//             </main>
//         </div>
//     </div>
//   `;

//   document.body.innerHTML = dashboardHTML;
// }

// export default renderDashboard;


// function renderDashboard() {
//   function generateStatCard(type, label, value) {
//     return `
//       <article class="card stat-card ${type}">
//         <div class="stat-icon">[Icon]</div>
//         <div class="stat-label">${label}</div>
//         <div class="stat-value">${value}</div>
//       </article>
//     `;
//   }

//   const head = document.head;

//   head.innerHTML += `
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>FinTrack Dashboard</title>
//     <link rel="preconnect" href="https://fonts.googleapis.com">
//     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
//     <link rel="stylesheet" href="css/style.css">
//   `;

//   const dashboardHTML = `
//     <div class="dashboard-container">
//       <aside class="sidebar">
//         <div class="sidebar-logo">
//           <span class="icon-placeholder">[Icon]</span> FinTrack
//         </div>
//         <nav class="sidebar-nav">
//           <ul>
//             <li class="active"><a href="#"><span class="icon-placeholder">[Icon]</span> Dashboard</a></li>
//             <li><a href="#"><span class="icon-placeholder">[Icon]</span> Products</a></li>
//             <li><a href="#"><span class="icon-placeholder">[Icon]</span> Adjustments</a></li>
//             <li><a href="#"><span class="icon-placeholder">[Icon]</span> Purchases</a></li>
//             <li><a href="#"><span class="icon-placeholder">[Icon]</span> Users</a></li>
//             <li><a href="#"><span class="icon-placeholder">[Icon]</span> Sales</a></li>
//             <li><a href="#"><span class="icon-placeholder">[Icon]</span> Reports</a></li>
//             <li><a href="#"><span class="icon-placeholder">[Icon]</span> Settings</a></li>
//           </ul>
//         </nav>
//       </aside>

//       <div class="main-wrapper">
//         <header class="header">
//           <div class="header-left">
//             <h1 class="page-title">Dashboard</h1>
//           </div>
//           <div class="header-center">
//             <button class="pos-button"><span class="icon-placeholder">[Cart]</span> POS</button>
//             <input type="search" class="search-bar" placeholder="Search...">
//           </div>
//           <div class="header-right">
//             <div class="user-avatar"></div>
//             <span class="icon-placeholder">[v]</span>
//           </div>
//         </header>

//         <main class="main-content">
//           <section class="stats-cards">
//             ${generateStatCard("sales", "Total Sales", "$06,850")}
//             ${generateStatCard("purchase", "Total Purchase", "$12,850")}
//             ${generateStatCard("products", "Total Products", "14,000")}
//             ${generateStatCard("revenue", "Total Revenue", "$80")}
//           </section>

//           <section class="content-row">
//             <article class="card sales-report">
//               <div class="card-header">
//                 <h2>Sales Report</h2>
//                 <select class="report-control"><option>Monthly</option></select>
//               </div>
//               <div class="chart-placeholder">
//                 <p style="text-align: center; padding: 40px 0; color: #999;">[Bar Chart Area - Max height ~100px. June highest.]</p>
//               </div>
//             </article>

//             <aside class="card alerts-section">
//               <div class="card-header"><h2>Alerts</h2></div>
//               <ul>
//                 <li><span class="alert-icon">[!]</span> Stock Alert! Green Shirt is low <span class="timestamp">1h ago</span></li>
//                 <li><span class="alert-icon">[!]</span> New order received #ORD004 <span class="timestamp">2h ago</span></li>
//                 <li><span class="alert-icon">[!]</span> Server maintenance scheduled <span class="timestamp">1d ago</span></li>
//               </ul>
//               <a href="#" class="view-all">View All</a>
//             </aside>
//           </section>

//           <section class="card data-table-card">
//             <div class="card-header">
//               <h2>Top Selling Product</h2>
//             </div>
//             <table class="data-table">
//               <thead>
//                 <tr>
//                   <th>Rank</th><th>SKU</th><th>Total Sales</th><th>Revenue</th><th>Last Sold</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr><td>1</td><td>SKU001</td><td>500</td><td>$50,000</td><td>29-Dec-2024</td></tr>
//                 <tr><td>2</td><td>SKU002</td><td>400</td><td>$40,000</td><td>28-Dec-2024</td></tr>
//                 <tr><td>3</td><td>SKU003</td><td>350</td><td>$35,000</td><td>27-Dec-2024</td></tr>
//                 <tr><td>4</td><td>SKU004</td><td>400</td><td>$40,000</td><td>28-Dec-2024</td></tr>
//                 <tr><td>5</td><td>SKU005</td><td>450</td><td>$45,000</td><td>29-Dec-2024</td></tr>
//               </tbody>
//             </table>
//             <div class="pagination">
//               <span>&lt;</span> <span class="active">1</span> <span>2</span> <span>3</span> <span>&gt;</span>
//             </div>
//           </section>

//           <section class="content-row">
//             <article class="card data-table-card small-table">
//               <div class="card-header"><h2>Products Out of Stock</h2></div>
//               <table class="data-table">
//                 <thead><tr><th>Product</th><th>SKU</th><th>Date Out</th><th>Restock Date</th></tr></thead>
//                 <tbody>
//                   <tr><td>Product 1</td><td>SKU001</td><td>01-Jan-2024</td><td>10-Jan-2024</td></tr>
//                   <tr><td>Product 2</td><td>SKU002</td><td>03-Jan-2024</td><td>12-Jan-2024</td></tr>
//                 </tbody>
//               </table>
//             </article>

//             <article class="card data-table-card small-table">
//               <div class="card-header"><h2>Top Payments Received</h2></div>
//               <table class="data-table">
//                 <thead><tr><th>Date</th><th>Order No</th><th>Customer</th><th>Amount</th></tr></thead>
//                 <tbody>
//                   <tr><td>01-Jan-2024</td><td>ORD001</td><td>James Wilson</td><td>$2,000</td></tr>
//                   <tr><td>03-Jan-2024</td><td>ORD002</td><td>Jessica John</td><td>$1,800</td></tr>
//                   <tr><td>05-Jan-2024</td><td>ORD003</td><td>Stella Harper</td><td>$950</td></tr>
//                 </tbody>
//               </table>
//             </article>
//           </section>
//         </main>
//       </div>
//     </div>
//   `;

//   return dashboardHTML;
// }

// export default renderDashboard;
