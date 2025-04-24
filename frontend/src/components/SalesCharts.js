import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Chart options
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Sales by Date',
      font: {
        size: 16
      }
    },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Sales by Payment Method',
      font: {
        size: 16
      }
    },
  },
};

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Sales Trend',
      font: {
        size: 16
      }
    },
  },
};

// Helper function to group sales by date
const groupSalesByDate = (sales) => {
  const groupedSales = {};

  sales.forEach(sale => {
    const date = new Date(sale.createdAt).toLocaleDateString();
    if (!groupedSales[date]) {
      groupedSales[date] = 0;
    }
    groupedSales[date] += sale.total;
  });

  // Sort dates
  const sortedDates = Object.keys(groupedSales).sort((a, b) => new Date(a) - new Date(b));

  return {
    labels: sortedDates,
    data: sortedDates.map(date => groupedSales[date])
  };
};

// Helper function to prepare payment method data
const preparePaymentMethodData = (paymentMethodStats) => {
  const labels = paymentMethodStats.map(method =>
    method._id.charAt(0).toUpperCase() + method._id.slice(1)
  );

  const data = paymentMethodStats.map(method => method.totalValue);

  // Generate colors
  const backgroundColors = [
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 99, 132, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
  ];

  return {
    labels,
    data,
    backgroundColors
  };
};

// Helper function to prepare sales trend data
const prepareSalesTrendData = (sales) => {
  // Group sales by date
  const salesByDate = groupSalesByDate(sales);

  // Calculate 7-day moving average
  const movingAverage = [];
  const windowSize = Math.min(7, salesByDate.data.length);

  for (let i = 0; i < salesByDate.data.length; i++) {
    let sum = 0;
    let count = 0;

    for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
      sum += salesByDate.data[j];
      count++;
    }

    movingAverage.push(sum / count);
  }

  return {
    labels: salesByDate.labels,
    salesData: salesByDate.data,
    trendData: movingAverage
  };
};

export const SalesBarChart = ({ sales }) => {
  const salesByDate = sales && sales.length > 0 ? groupSalesByDate(sales) : { labels: [], data: [] };

  const data = {
    labels: salesByDate.labels,
    datasets: [
      {
        label: 'Sales Amount',
        data: salesByDate.data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  return (
    <div className="chart-container">
      {sales && sales.length > 0 ? (
        <Bar options={barOptions} data={data} />
      ) : (
        <div className="no-data-message">No sales data available for chart</div>
      )}
    </div>
  );
};

export const PaymentMethodPieChart = ({ paymentMethodStats }) => {
  const hasData = paymentMethodStats && paymentMethodStats.length > 0;
  const { labels, data, backgroundColors } = hasData ?
    preparePaymentMethodData(paymentMethodStats) :
    { labels: [], data: [], backgroundColors: [] };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Sales Amount',
        data,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="chart-container">
      {hasData ? (
        <Pie options={pieOptions} data={chartData} />
      ) : (
        <div className="no-data-message">No payment method data available for chart</div>
      )}
    </div>
  );
};

export const SalesTrendLineChart = ({ sales }) => {
  const hasData = sales && sales.length > 0;
  const { labels, salesData, trendData } = hasData ?
    prepareSalesTrendData(sales) :
    { labels: [], salesData: [], trendData: [] };

  const data = {
    labels,
    datasets: [
      {
        label: 'Daily Sales',
        data: salesData,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        pointRadius: 3,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      },
      {
        label: 'Trend (7-day avg)',
        data: trendData,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className="chart-container">
      {hasData ? (
        <Line options={lineOptions} data={data} />
      ) : (
        <div className="no-data-message">No sales data available for trend chart</div>
      )}
    </div>
  );
};
