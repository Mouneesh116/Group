import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PieController, ArcElement } from 'chart.js';
import axios from 'axios';
import './Dashboard.css';

// Register the necessary Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PieController,
  ArcElement
);

const Dashboard = () => {
  const [salesData, setSalesData] = useState(null); // Monthly sales data
  const [orderData, setOrderData] = useState(null); // Order distribution data
  const [categorySalesData, setCategorySalesData] = useState(null); // Category sales data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const token = localStorage.getItem('token');

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch sales analytics
        const salesResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/sales`,{
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const ordersResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/orders`,{
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const categoryResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/category-sales`,{
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        setSalesData(salesResponse.data); // Example: { labels: [...], data: [...] }
        setOrderData(ordersResponse.data); // Example: { labels: [...], data: [...] }
        setCategorySalesData(categoryResponse.data); // Example: { labels: [...], data: [...] }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart options for sales analytics
  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#555',
          font: {
            size: 12,
          }
        },
        grid: {
          borderColor: '#eee',
          borderDash: [2, 2],
          zeroLineColor: '#333',
          zeroLineWidth: 2,
        }
      },
      x: {
        ticks: {
          color: '#555',
          font: {
            size: 12,
          }
        },
        grid: {
          display: false,
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#333',
          font: {
            size: 14,
          }
        }
      },
      title: {
        display: true,
        text: 'Monthly Sales Performance',
        color: '#333',
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 15 }
      }
    }
  };

  // Chart options for order distribution
  const orderChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#333',
          font: {
            size: 14
          }
        }
      }
    }
  };

  // Chart options for category sales
  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Product Sales by Category',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return <div className="dashboard-content">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="dashboard-content error">{error}</div>;
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-card">
        <h3>Welcome, Admin</h3>
        <p>Use the sidebar to manage products, orders, and view reports.</p>
      </div>

      <div className="dashboard-charts-container">
        <div className="dashboard-chart-wrapper">
          <h3>Sales Analytics</h3>
          <Bar
            data={{
              labels: salesData.labels,
              datasets: [{
                label: "Sales ($)",
                data: salesData.data,
                backgroundColor: [
                  'rgba(54, 162, 235, 0.8)',
                  'rgba(255, 99, 132, 0.8)',
                  'rgba(255, 206, 86, 0.8)',
                  'rgba(75, 192, 192, 0.8)',
                  'rgba(153, 102, 255, 0.8)',
                  'rgba(255, 159, 64, 0.8)',
                  'rgba(199, 214, 224, 0.8)',
                  'rgba(77, 208, 225, 0.8)',
                ],
                borderColor: [
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 99, 132, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
                  'rgba(199, 214, 224, 1)',
                  'rgba(77, 208, 225, 1)',
                ],
                borderWidth: 1,
                borderRadius: 5,
                borderSkipped: false,
                hoverBackgroundColor: 'rgba(26, 117, 188, 1)',
                hoverBorderColor: '#333',
              }]
            }}
            options={salesChartOptions}
          />
        </div>
        <div className="dashboard-chart-wrapper">
          <h3>Order Distribution</h3>
          <Pie
            data={{
              labels: orderData.labels,
              datasets: [{
                data: orderData.data,
                backgroundColor: [
                  'rgba(241, 196, 15, 0.8)',
                  'rgba(230, 126, 34, 0.8)',
                  'rgba(46, 204, 113, 0.8)',
                ],
                borderColor: [
                  'rgba(241, 196, 15, 1)',
                  'rgba(230, 126, 34, 1)',
                  'rgba(46, 204, 113, 1)',
                ],
                borderWidth: 1,
                hoverOffset: 10,
              }]
            }}
            options={orderChartOptions}
          />
        </div>
        <div className="dashboard-chart-wrapper">
          <h3>Category Sales</h3>
          <Bar
            data={{
              labels: categorySalesData.labels,
              datasets: [{
                label: 'Sales by Category',
                data: categorySalesData.data,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.8)',
                  'rgba(54, 162, 235, 0.8)',
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1,
              }]
            }}
            options={categoryChartOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;