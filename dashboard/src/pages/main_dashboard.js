
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

import React, { useState } from "react";
import OverviewCard from "../components/OverviewCard";
import SalesChart from "../components/SalesChart";
import StockAlerts from "../components/StockAlerts";
import TopSellingProducts from "../components/TopSellingProducts";
import PaymentsReceived from "../components/PaymentsReceived";
import Alerts from "../components/Alerts";
import Sidebar from "./sidebar";

const MainDashboard = () => {
  const [overviewData] = useState({
    totalSales: "$06,850",
    totalPurchases: "$12,850",
    totalProducts: "14,000",
    totalRevenue: "$80",
  });

  const [alerts] = useState([
    { message: "Stock Alert! Green Shirts are low", timeAgo: "5 min ago" },
    { message: "New Order Received", timeAgo: "10 min ago" },
  ]);

  const [payments] = useState([]);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="p-6 bg-gray-100 min-h-screen">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <OverviewCard title="Total Sales" value={overviewData.totalSales} color="bg-yellow-100 border border-yellow-300" />
          <OverviewCard title="Total Purchases" value={overviewData.totalPurchases} color="bg-purple-100 border border-purple-300" />
          <OverviewCard title="Total Products" value={overviewData.totalProducts} color="bg-green-100 border border-green-300" />
          <OverviewCard title="Total Revenue" value={overviewData.totalRevenue} color="bg-red-100 border border-red-300" />
        </div>

        {/* Sales Report & Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 bg-white shadow-md rounded-xl p-6">
            <SalesChart />
          </div>
          <div className="bg-white shadow-md rounded-xl p-6">
            <Alerts alerts={alerts} />
          </div>
        </div>

        {/* Top Selling Products & Stock Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white shadow-md rounded-xl p-6">
            <TopSellingProducts />
          </div>
          <div className="bg-white shadow-md rounded-xl p-6">
            <StockAlerts alerts={alerts} />
          </div>
        </div>

        {/* Payments Received */}
        <div className="mt-6 bg-white shadow-md rounded-xl p-6">
          <PaymentsReceived payments={payments} />
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
