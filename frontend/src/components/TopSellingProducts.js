// // src/components/TopSellingProducts.js
// import React from "react";

// const TopSellingProducts = ({ products }) => {
//   return (
//     <div className="p-4 bg-white shadow rounded-lg">
//       <h3 className="text-lg font-semibold mb-3">Top Selling Products</h3>
//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="p-2">SKU</th>
//             <th className="p-2">Sales</th>
//             <th className="p-2">Revenue</th>
//           </tr>
//         </thead>
//         <tbody>
//           {products.map((product) => (
//             <tr key={product.sku} className="border-t">
//               <td className="p-2">{product.sku}</td>
//               <td className="p-2">{product.sales}</td>
//               <td className="p-2">${product.revenue}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default TopSellingProducts;

import React from "react";

const products = [
  { rank: 1, sku: "SKU001", sales: 500, revenue: "$50,000", lastSold: "29-Dec-2024" },
  { rank: 2, sku: "SKU002", sales: 400, revenue: "$40,000", lastSold: "28-Dec-2024" },
];

const TopSellingProducts = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Rank</th>
            <th className="text-left p-2">SKU</th>
            <th className="text-left p-2">Sales</th>
            <th className="text-left p-2">Revenue</th>
            <th className="text-left p-2">Last Sold</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">{item.rank}</td>
              <td className="p-2">{item.sku}</td>
              <td className="p-2">{item.sales}</td>
              <td className="p-2">{item.revenue}</td>
              <td className="p-2">{item.lastSold}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopSellingProducts;

