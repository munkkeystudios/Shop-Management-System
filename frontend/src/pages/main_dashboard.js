// import React, { useState, useEffect } from "react";
// import Layout from "../components/Layout";
// import "../components/Dashboard.css";
// import { salesAPI, productsAPI } from "../services/api";


// const MainDashboard = () => {
//   const [salesStats, setSalesStats] = useState({
//     totalSales: 0,
//     totalTransactions: 0,
//     averageSale: 0,
//   });
//   const [lowStockProducts, setLowStockProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch sales statistics
//       const statsResponse = await salesAPI.getStats();
//       if (statsResponse.data.success) {
//         setSalesStats({
//           totalSales: statsResponse.data.overall.totalSalesValue,
//           totalTransactions: statsResponse.data.overall.totalTransactions,
//           averageSale: statsResponse.data.overall.averageSaleValue,
//         });
//       }

//       // Fetch low stock products using existing endpoint
//       const stockResponse = await productsAPI.getLowStock();
//       if (stockResponse.data.success) {
//         setLowStockProducts(stockResponse.data.products);
//       }

//     } catch (err) {
//       setError('Failed to fetch dashboard data');
//       console.error('Error fetching dashboard data:', err);
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <Layout title="Dashboard">

//         <main className="main-content p-6">
//           {/* Stats Cards */}
//           <section className="stats-cards grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
//             {[
//              { label: "Total Sales", value: salesStats.totalSales },
//              { label: "Total Transactions", value: salesStats.totalTransactions },
//              { label: "Average Sale", value: salesStats.averageSale },
//             ].map((stat, index) => (
//               <article key={index} className="card stat-card p-4 bg-white shadow-md rounded-xl">
//                 <div className="stat-icon">[Icon]</div>
//                 <div className="stat-label text-sm font-medium text-gray-600">{stat.label}</div>
//                 <div className="stat-value text-lg font-bold">{stat.value}</div>
//               </article>
//             ))}
//           </section>

         
//           {/* Top Selling Products Table
//           <section className="card data-table-card bg-white shadow-md rounded-xl p-6 mt-6">
//             <div className="card-header mb-4">
//               <h2 className="text-lg font-semibold">Top Selling Product</h2>
//             </div>
//             <table className="data-table w-full text-sm">
//               <thead>
//                 <tr>
//                   <th>Rank</th>
//                   <th>SKU</th>
//                   <th>Total Sales</th>
//                   <th>Revenue</th>
//                   <th>Last Sold</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {[
//                   ["1", "SKU001", "500", "$50,000", "29-Dec-2024"],
//                   ["2", "SKU002", "400", "$40,000", "28-Dec-2024"],
//                   ["3", "SKU003", "350", "$35,000", "27-Dec-2024"],
//                   ["4", "SKU004", "400", "$40,000", "28-Dec-2024"],
//                   ["5", "SKU005", "450", "$45,000", "29-Dec-2024"],
//                 ].map(([rank, sku, sales, revenue, sold], idx) => (
//                   <tr key={idx}>
//                     <td>{rank}</td><td>{sku}</td><td>{sales}</td><td>{revenue}</td><td>{sold}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             <div className="pagination flex gap-2 justify-end mt-4">
//               <span className="cursor-pointer">&lt;</span>
//               <span className="active font-bold">1</span>
//               <span>2</span>
//               <span>3</span>
//               <span className="cursor-pointer">&gt;</span>
//             </div> */}
//           {/* </section> */}

//           {/* Products Section */}
//         <section className="content-row grid grid-cols-1 gap-6 mt-6">
//           <article className="card data-table-card bg-white shadow-md rounded-xl p-6">
//             <div className="card-header mb-4">
//               <h2 className="text-lg font-semibold">Low Stock Products</h2>
//             </div>
//             <table className="data-table w-full text-sm">
//               <thead>
//                 <tr>
//                   <th>Product</th>
//                   <th>SKU</th>
//                   <th>Current Stock</th>
//                   <th>Threshold</th>
//                   <th>Category</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {lowStockProducts.map((product, idx) => (
//                   <tr key={idx}>
//                     <td>{product.name}</td>
//                     <td>{product.sku}</td>
//                     <td>{product.stock}</td>
//                     <td>{product.lowStockThreshold || 'N/A'}</td>
//                     <td>{product.category || 'N/A'}</td>
//                   </tr>
//                 ))}
//                 {lowStockProducts.length === 0 && (
//                   <tr>
//                     <td colSpan="5" className="text-center">No low stock products</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//             <div className="pagination flex gap-2 justify-end mt-4">
//               <a href="/products" className="text-blue-500">View All Products</a>
//             </div>
//           </article>
//         </section>

//           {/* Bottom Tables */}
//           <section className="content-row grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//             <article className="card data-table-card small-table bg-white shadow-md rounded-xl p-6">
//               <div className="card-header mb-4">
//                 <h2 className="text-lg font-semibold">Products Out of Stock</h2>
//               </div>
//               <table className="data-table w-full text-sm">
//                 <thead>
//                   <tr>
//                     <th>Product</th>
//                     <th>SKU</th>
//                     <th>Date Out</th>
//                     <th>Restock Date</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr><td>Product 1</td><td>SKU001</td><td>01-Jan-2024</td><td>10-Jan-2024</td></tr>
//                   <tr><td>Product 2</td><td>SKU002</td><td>03-Jan-2024</td><td>12-Jan-2024</td></tr>
//                 </tbody>
//               </table>
//             </article>

//             <article className="card data-table-card small-table bg-white shadow-md rounded-xl p-6">
//               <div className="card-header mb-4">
//                 <h2 className="text-lg font-semibold">Top Payments Received</h2>
//               </div>
//               <table className="data-table w-full text-sm">
//                 <thead>
//                   <tr><th>Date</th><th>Order No</th><th>Customer</th><th>Amount</th></tr>
//                 </thead>
//                 <tbody>
//                   <tr><td>01-Jan-2024</td><td>ORD001</td><td>James Wilson</td><td>$2,000</td></tr>
//                   <tr><td>03-Jan-2024</td><td>ORD002</td><td>Jessica John</td><td>$1,800</td></tr>
//                   <tr><td>05-Jan-2024</td><td>ORD003</td><td>Stella Harper</td><td>$950</td></tr>
//                 </tbody>
//               </table>
//             </article>
//           </section>
//         </main>
//     </Layout>
//   );
// };

// export default MainDashboard;



// // import React, { useState, useEffect } from "react";
// // import Layout from "../components/Layout";
// // import "../components/Dashboard.css";
// // import { salesAPI, productsAPI } from "../services/api";

// // const MainDashboard = () => {
// //   const [salesStats, setSalesStats] = useState({
// //     totalSales: 0,
// //     totalTransactions: 0,
// //     averageSale: 0,
// //   });
// //   const [lowStockProducts, setLowStockProducts] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     fetchDashboardData();
// //   }, []);

// //   const fetchDashboardData = async () => {
// //     try {
// //       setLoading(true);
      
// //       // Fetch sales statistics
// //       const statsResponse = await salesAPI.getStats();
// //       if (statsResponse.data.success) {
// //         setSalesStats({
// //           totalSales: statsResponse.data.overall.totalSalesValue,
// //           totalTransactions: statsResponse.data.overall.totalTransactions,
// //           averageSale: statsResponse.data.overall.averageSaleValue,
// //         });
// //       }

// //       // Fetch low stock products using existing endpoint
// //       const stockResponse = await productsAPI.getLowStock();
// //       if (stockResponse.data.success) {
// //         setLowStockProducts(stockResponse.data.products);
// //       }

// //     } catch (err) {
// //       setError('Failed to fetch dashboard data');
// //       console.error('Error fetching dashboard data:', err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <Layout title="Dashboard">
// //       {error && (
// //         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
// //           <span className="block sm:inline">{error}</span>
// //         </div>
// //       )}
// //       {loading && (
// //         <div className="flex justify-center items-center p-4">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
// //         </div>
// //       )}

// //       <main className="main-content p-6">
// //         {/* Stats Cards */}
// //         <section className="stats-cards grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
// //           {[
// //             { label: "Total Sales", value: salesStats.totalSales },
// //             { label: "Total Transactions", value: salesStats.totalTransactions },
// //             { label: "Average Sale", value: salesStats.averageSale },
// //           ].map((stat, index) => (
// //             <article key={index} className="card stat-card p-4 bg-white shadow-md rounded-xl">
// //               <div className="stat-icon">[Icon]</div>
// //               <div className="stat-label text-sm font-medium text-gray-600">{stat.label}</div>
// //               <div className="stat-value text-lg font-bold">{stat.value}</div>
// //             </article>
// //           ))}
// //         </section>

// //         {/* Sales Report & Alerts */}
// //         <section className="content-row grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
// //           <article className="card sales-report bg-white shadow-md rounded-xl p-6 md:col-span-2">
// //             <div className="card-header flex justify-between items-center mb-4">
// //               <h2 className="text-lg font-semibold">Sales Report</h2>
// //               <select className="report-control border rounded px-2 py-1">
// //                 <option>Monthly</option>
// //               </select>
// //             </div>
// //             <div className="chart-placeholder text-center text-gray-400 py-10">
// //               [Bar Chart Area - Data from salesStats]
// //             </div>
// //           </article>

// //           <aside className="card alerts-section bg-white shadow-md rounded-xl p-6">
// //             <div className="card-header mb-4">
// //               <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
// //             </div>
// //             <ul className="space-y-2 text-sm">
// //               {lowStockProducts||[].slice(0, 5).map((product, index) => (
// //                 <li key={index}>
// //                   <span className="alert-icon">[!]</span> 
// //                   {product.name} - {product.stock} remaining
// //                   <span className="timestamp text-gray-400">SKU: {product.sku}</span>
// //                 </li>
// //               ))}
// //               {lowStockProducts||[].length === 0 && (
// //                 <li>No low stock alerts</li>
// //               )}
// //             </ul>
// //             <a href="/products/low-stock" className="view-all text-blue-500 mt-4 inline-block">View All</a>
// //           </aside>
// //         </section>

// //         {/* Products Section */}
// //         <section className="content-row grid grid-cols-1 gap-6 mt-6">
// //           <article className="card data-table-card bg-white shadow-md rounded-xl p-6">
// //             <div className="card-header mb-4">
// //               <h2 className="text-lg font-semibold">Low Stock Products</h2>
// //             </div>
// //             <table className="data-table w-full text-sm">
// //               <thead>
// //                 <tr>
// //                   <th>Product</th>
// //                   <th>SKU</th>
// //                   <th>Current Stock</th>
// //                   <th>Threshold</th>
// //                   <th>Category</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {lowStockProducts|| []((product, idx) => (
// //                   <tr key={idx}>
// //                     <td>{product.name}</td>
// //                     <td>{product.sku}</td>
// //                     <td>{product.stock}</td>
// //                     <td>{product.lowStockThreshold || 'N/A'}</td>
// //                     <td>{product.category || 'N/A'}</td>
// //                   </tr>
// //                 ))}
// //                 {lowStockProducts.length === 0 && (
// //                   <tr>
// //                     <td colSpan="5" className="text-center">No low stock products</td>
// //                   </tr>
// //                 )}
// //               </tbody>
// //             </table>
// //             <div className="pagination flex gap-2 justify-end mt-4">
// //               <a href="/products" className="text-blue-500">View All Products</a>
// //             </div>
// //           </article>
// //         </section>
// //       </main>
// //     </Layout>
// //   );
// // };


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
