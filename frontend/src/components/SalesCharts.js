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
      display: false, // Hide legend
    },
    title: {
      display: true,
      text: 'Sales Report',
      font: {
        size: 18,
        weight: 'bold'
      },
      padding: {
        top: 10,
        bottom: 20
      },
      align: 'start'
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#333',
      bodyColor: '#333',
      borderColor: '#ddd',
      borderWidth: 1,
      cornerRadius: 4,
      displayColors: false,
      callbacks: {
        label: function(context) {
          return `$${context.parsed.y.toFixed(2)}`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        font: {
          size: 12
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false,
        borderDash: [3, 3]
      },
      ticks: {
        font: {
          size: 12
        },
        callback: function(value) {
          return value;
        }
      },
      beginAtZero: true
    }
  },
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 0,
      bottom: 10
    }
  },
  barPercentage: 0.6,
  categoryPercentage: 0.8
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12
        }
      }
    },
    title: {
      display: true,
      text: 'Sales by Payment Method',
      font: {
        size: 18,
        weight: 'bold'
      },
      padding: {
        top: 10,
        bottom: 20
      },
      align: 'start'
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#333',
      bodyColor: '#333',
      borderColor: '#ddd',
      borderWidth: 1,
      cornerRadius: 4,
      callbacks: {
        label: function(context) {
          const value = context.raw;
          const total = context.chart.getDatasetMeta(0).total;
          const percentage = ((value / total) * 100).toFixed(1);
          return `$${value.toFixed(2)} (${percentage}%)`;
        }
      }
    }
  },
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 0,
      bottom: 10
    }
  },
  cutout: '40%',
  borderWidth: 1,
  borderColor: '#fff'
};

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        boxWidth: 6,
        font: {
          size: 12
        }
      }
    },
    title: {
      display: true,
      text: 'Sales Trend',
      font: {
        size: 18,
        weight: 'bold'
      },
      padding: {
        top: 10,
        bottom: 20
      },
      align: 'start'
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#333',
      bodyColor: '#333',
      borderColor: '#ddd',
      borderWidth: 1,
      cornerRadius: 4,
      displayColors: false,
      callbacks: {
        label: function(context) {
          return `$${context.parsed.y.toFixed(2)}`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        font: {
          size: 12
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false,
        borderDash: [3, 3]
      },
      ticks: {
        font: {
          size: 12
        },
        callback: function(value) {
          return value;
        }
      },
      beginAtZero: true
    }
  },
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 0,
      bottom: 10
    }
  },
  elements: {
    line: {
      tension: 0.3
    }
  }
};

// Helper function to group sales by month
const groupSalesByMonth = (sales) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const groupedSales = {};

  // Initialize all months with 0
  months.forEach(month => {
    groupedSales[month] = 0;
  });

  // Group sales by month
  sales.forEach(sale => {
    const date = new Date(sale.createdAt);
    const month = months[date.getMonth()];
    groupedSales[month] += sale.total;
  });

  return {
    labels: months,
    data: months.map(month => groupedSales[month])
  };
};

// Helper function to prepare payment method data
const preparePaymentMethodData = (paymentMethodStats) => {
  const labels = paymentMethodStats.map(method =>
    method._id.charAt(0).toUpperCase() + method._id.slice(1)
  );

  const data = paymentMethodStats.map(method => method.totalValue);

  // Generate blue-themed colors
  const backgroundColors = [
    'rgba(13, 110, 253, 0.8)',   // Primary blue (POS button color)
    'rgba(25, 91, 183, 0.7)',    // Dark blue
    'rgba(66, 135, 245, 0.8)',   // Medium blue
    'rgba(173, 216, 230, 0.8)',  // Light blue
    'rgba(0, 123, 255, 0.7)',    // Bootstrap blue
    'rgba(209, 229, 255, 0.8)',  // Pale blue
  ];

  return {
    labels,
    data,
    backgroundColors
  };
};

// Helper function to prepare sales trend data
const prepareSalesTrendData = (sales) => {
  // Group sales by month
  const salesByMonth = groupSalesByMonth(sales);

  // Calculate 3-month moving average
  const movingAverage = [];
  const windowSize = 3;

  for (let i = 0; i < salesByMonth.data.length; i++) {
    let sum = 0;
    let count = 0;

    for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
      sum += salesByMonth.data[j];
      count++;
    }

    movingAverage.push(sum / count);
  }

  return {
    labels: salesByMonth.labels,
    salesData: salesByMonth.data,
    trendData: movingAverage
  };
};

export const SalesBarChart = ({ sales }) => {
  const salesByMonth = sales && sales.length > 0 ? groupSalesByMonth(sales) : { labels: [], data: [] };

  // Use default chart options
  const chartOptions = barOptions;

  // Find the month with the highest sales to highlight it
  let highestMonth = '';
  let highestValue = 0;

  if (salesByMonth.data.length > 0) {
    salesByMonth.data.forEach((value, index) => {
      if (value > highestValue) {
        highestValue = value;
        highestMonth = salesByMonth.labels[index];
      }
    });
  }

  // Create background colors array with the highest month highlighted
  const backgroundColors = salesByMonth.labels.map(month => {
    return month === highestMonth ?
      '#0d6efd' : // Blue for highest month (matching POS button)
      'rgba(209, 229, 255, 0.8)'; // Light blue for other months
  });

  const data = {
    labels: salesByMonth.labels,
    datasets: [
      {
        label: 'Sales Amount',
        data: salesByMonth.data,
        backgroundColor: backgroundColors,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="chart-container">
      {sales && sales.length > 0 ? (
        <Bar options={chartOptions} data={data} />
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

  // Use default chart options
  const chartOptions = lineOptions;

  const data = {
    labels,
    datasets: [
      {
        label: 'Monthly Sales',
        data: salesData,
        borderColor: 'rgba(13, 110, 253, 1)',
        backgroundColor: 'rgba(209, 229, 255, 0.4)',
        pointRadius: 4,
        pointBackgroundColor: 'rgba(13, 110, 253, 1)',
        tension: 0.3, // Smoother curve
      },
      {
        label: 'Trend (3-month avg)',
        data: trendData,
        borderColor: 'rgba(25, 91, 183, 0.7)',
        backgroundColor: 'rgba(25, 91, 183, 0.1)',
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="chart-container">
      {hasData ? (
        <Line options={chartOptions} data={data} />
      ) : (
        <div className="no-data-message">No sales data available for trend chart</div>
      )}
    </div>
  );
};
