import React from "react";

const Alerts = ({ alerts }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md w-full">
      <h2 className="text-lg font-semibold mb-3">Alerts</h2>
      <ul>
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <li
              key={index}
              className="p-2 mb-2 border rounded-md bg-red-50 border-red-400 text-red-700"
            >
              {alert.message} <span className="text-sm text-gray-500">({alert.timeAgo})</span>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No new alerts.</p>
        )}
      </ul>
    </div>
  );
};

export default Alerts;
