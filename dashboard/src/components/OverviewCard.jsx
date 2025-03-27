import React from "react";

const OverviewCard = ({ title, value, color }) => {
  return (
    <div className={`p-6 rounded-xl shadow-md ${color}`}>
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default OverviewCard;
