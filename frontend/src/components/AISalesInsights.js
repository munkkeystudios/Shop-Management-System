import React, { useState, useEffect } from 'react';
import { FaRobot, FaLightbulb, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';

const AISalesInsights = ({ sales, salesStats }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only generate insights if we have data
    if (sales && sales.length > 0 && salesStats) {
      generateInsights();
    } else {
      setInsights([]);
      setLoading(false);
    }
  }, [sales, salesStats]);

  const generateInsights = () => {
    setLoading(true);

    // This would ideally be an API call to a backend AI service
    // For now, we'll simulate it with some business logic

    setTimeout(() => {
      const generatedInsights = [];

      // Insight 1: Overall sales performance
      const totalSales = salesStats.overall.totalSalesValue;
      const totalTransactions = salesStats.overall.totalTransactions;

      if (totalTransactions > 0) {
        let performanceInsight = {
          id: 1,
          type: 'performance',
          icon: <FaChartLine />,
          title: 'Sales Performance',
          content: `Total sales of $${totalSales.toFixed(2)} across ${totalTransactions} transactions, with an average sale value of $${salesStats.overall.averageSaleValue.toFixed(2)}.`
        };

        // Add recommendation based on average sale value
        if (salesStats.overall.averageSaleValue < 50) {
          performanceInsight.content += ' Consider implementing upselling strategies to increase average transaction value.';
        } else if (salesStats.overall.averageSaleValue > 200) {
          performanceInsight.content += ' Your high average transaction value indicates successful premium product sales or bundling.';
        }

        generatedInsights.push(performanceInsight);
      }

      // Insight 2: Payment method analysis
      if (salesStats.byPaymentMethod && salesStats.byPaymentMethod.length > 0) {
        // Find most popular payment method
        const sortedMethods = [...salesStats.byPaymentMethod].sort((a, b) => b.count - a.count);
        const topMethod = sortedMethods[0];

        if (topMethod) {
          const percentageUsed = (topMethod.count / totalTransactions * 100).toFixed(1);

          let paymentInsight = {
            id: 2,
            type: 'payment',
            icon: <FaLightbulb />,
            title: 'Payment Preferences',
            content: `${topMethod._id.charAt(0).toUpperCase() + topMethod._id.slice(1)} is your customers\' preferred payment method (${percentageUsed}% of transactions).`
          };

          // Add recommendation if one method is heavily dominant
          if (percentageUsed > 80) {
            paymentInsight.content += ' Consider promoting alternative payment methods to provide more options for customers.';
          } else if (salesStats.byPaymentMethod.length === 1) {
            paymentInsight.content += ' Consider adding more payment methods to accommodate different customer preferences.';
          }

          generatedInsights.push(paymentInsight);
        }
      }

      // Insight 3: Sales trend analysis
      if (sales.length >= 5) {
        // Group sales by date
        const salesByDate = {};
        sales.forEach(sale => {
          const date = new Date(sale.createdAt).toLocaleDateString();
          if (!salesByDate[date]) {
            salesByDate[date] = 0;
          }
          salesByDate[date] += sale.total;
        });

        // Convert to array and sort by date
        const dateEntries = Object.entries(salesByDate).sort((a, b) =>
          new Date(a[0]) - new Date(b[0])
        );

        if (dateEntries.length >= 3) {
          // Check if sales are trending up or down
          const recentDays = dateEntries.slice(-3);
          const firstDay = recentDays[0][1];
          const lastDay = recentDays[recentDays.length - 1][1];

          const trendPercentage = ((lastDay - firstDay) / firstDay * 100).toFixed(1);

          let trendInsight = {
            id: 3,
            type: trendPercentage >= 0 ? 'positive' : 'warning',
            icon: trendPercentage >= 0 ? <FaChartLine /> : <FaExclamationTriangle />,
            title: 'Recent Sales Trend',
            content: trendPercentage >= 0
              ? `Sales are trending upward with a ${trendPercentage}% increase over the last few days.`
              : `Sales are trending downward with a ${Math.abs(trendPercentage)}% decrease over the last few days.`
          };

          // Add recommendation based on trend
          if (trendPercentage < 0) {
            trendInsight.content += ' Consider running a promotion or marketing campaign to boost sales.';
          } else if (trendPercentage > 20) {
            trendInsight.content += ' Analyze what\'s driving this growth to replicate success in other areas.';
          }

          generatedInsights.push(trendInsight);
        }
      }

      // Insight 4: Discount analysis
      if (salesStats.overall.totalDiscountValue > 0) {
        const discountPercentage = (salesStats.overall.totalDiscountValue / salesStats.overall.totalSalesValue * 100).toFixed(1);

        let discountInsight = {
          id: 4,
          type: parseFloat(discountPercentage) > 15 ? 'warning' : 'info',
          icon: <FaLightbulb />,
          title: 'Discount Analysis',
          content: `Discounts account for ${discountPercentage}% of your total sales value.`
        };

        // Add recommendation based on discount percentage
        if (parseFloat(discountPercentage) > 15) {
          discountInsight.content += ' Your discount percentage is relatively high. Consider reviewing your pricing strategy or discount policies.';
        } else if (parseFloat(discountPercentage) < 5) {
          discountInsight.content += ' Your low discount rate suggests strong pricing power or premium positioning.';
        }

        generatedInsights.push(discountInsight);
      }

      setInsights(generatedInsights);
      setLoading(false);
    }, 1000); // Simulate API delay
  };

  if (loading) {
    return (
      <div className="ai-insights-container">
        <div className="ai-insights-header">
          <FaRobot className="ai-insights-icon" />
          <h3>AI Sales Insights</h3>
        </div>
        <div className="ai-insights-loading">
          <div className="ai-insights-spinner"></div>
          <p>Analyzing your sales data...</p>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="ai-insights-container">
        <div className="ai-insights-header">
          <FaRobot className="ai-insights-icon" />
          <h3>AI Sales Insights</h3>
        </div>
        <div className="ai-insights-empty">
          <p>Not enough data to generate insights. Try selecting a different date range with more sales data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights-container">
      <div className="ai-insights-header">
        <FaRobot className="ai-insights-icon" />
        <h3>AI Sales Insights</h3>
      </div>
      <div className="ai-insights-list">
        {insights.map(insight => (
          <div key={insight.id} className={`ai-insight-card ${insight.type}`}>
            <div className="ai-insight-icon">{insight.icon}</div>
            <div className="ai-insight-content">
              <h4>{insight.title}</h4>
              <p>{insight.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISalesInsights;
