// // src/components/SalesChart.js
// import React from "react";
// import { Bar } from "react-chartjs-2";

// const SalesChart = ({ data }) => {
//   const chartData = {
//     labels: data.map((d) => d.month),
//     datasets: [
//       {
//         label: "Sales",
//         data: data.map((d) => d.sales),
//         backgroundColor: "rgba(54, 162, 235, 0.6)",
//       },
//     ],
//   };

//   return <Bar data={chartData} />;
// };

// export default SalesChart;

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { month: "Jan", sales: 40 },
  { month: "Feb", sales: 50 },
  { month: "Mar", sales: 60 },
  { month: "Apr", sales: 30 },
  { month: "May", sales: 90 },
  { month: "Jun", sales: 40 },
];

const SalesChart = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Sales Report</h3>
      <BarChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="sales" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default SalesChart;
