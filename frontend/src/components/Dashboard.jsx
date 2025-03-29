import React from "react";
import OverviewCard from "./OverviewCard";

const Dashboard = () => {
  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <OverviewCard title="Total Sales" value="$06,850" color="bg-yellow-100" />
        <OverviewCard title="Total Purchase" value="$12,850" color="bg-purple-100" />
        <OverviewCard title="Total Products" value="14,000" color="bg-green-100" />
        <OverviewCard title="Total Revenue" value="$80" color="bg-red-100" />
      </div>
    </main>
  );
};

export default Dashboard;
