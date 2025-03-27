// src/components/OverviewCard.js
import React from "react";

const OverviewCard = ({ title, value, color }) => {
  const colors = {
    yellow: "bg-yellow-100",
    purple: "bg-purple-100",
    green: "bg-green-100",
    red: "bg-red-100",
  };
  return (
    <div className={`${colors[color]} p-4 rounded-lg shadow`}>
      <h3 className="text-gray-700 font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default OverviewCard;
