// // src/components/StockAlerts.js
// import React from "react";

// const StockAlerts = ({ products }) => {
//   return (
//     <div className="p-4 bg-white shadow rounded-lg">
//       <h3 className="text-lg font-semibold mb-3">Stock Alerts</h3>
//       <ul>
//         {products.map((product, index) => (
//           <li key={index} className="text-red-500">
//             ⚠️ {product.name} is running low
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default StockAlerts;

import React from "react";

const StockAlerts = ({ alerts = [] }) => {
  if (!alerts || !Array.isArray(alerts)) {
    return <p>No stock alerts available.</p>;
  }

  return (
    <div>
      {alerts.map((alert, index) => (
        <div key={index}>
          <p>{alert.message}</p>
          <small>{alert.timeAgo}</small>
        </div>
      ))}
    </div>
  );
};

export default StockAlerts;
