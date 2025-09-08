// Dashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PieController,
  ArcElement
} from 'chart.js';
import axios from 'axios';
import './Dashboard.css';

// Register Chart.js modules
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
  const [salesData, setSalesData] = useState({ labels: [], data: [] });
  const [orderData, setOrderData] = useState({ labels: [], data: [] });
  const [categorySalesData, setCategorySalesData] = useState({ labels: [], data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // theme vars read from CSS custom properties
  const getThemeVars = () => {
    try {
      // check documentElement first, then body
      const root = window.getComputedStyle(document.documentElement);
      const body = window.getComputedStyle(document.body);

      const read = (name, fallback) =>
        (root.getPropertyValue(name) || body.getPropertyValue(name) || fallback).trim();

      return {
        tickColor: read('--chart-tick-color', '#555'),
        gridColor: read('--chart-grid-color', 'rgba(0,0,0,0.06)'),
        legendColor: read('--chart-legend-color', '#ffffffff'),
        cardBg: read('--card-bg', '#fff'),
        textColor: read('--text-color', '#222'),
        primary: read('--primary', '#2196f3'),
        accent: read('--accent', '#007bff')
      };
    } catch (e) {
      return {
        tickColor: '#555',
        gridColor: 'rgba(0,0,0,0.06)',
        legendColor: '#333',
        cardBg: '#fff',
        textColor: '#2ea3baff',
        primary: '#2196f3',
        accent: '#007bff'
      };
    }
  };

  const [themeVars, setThemeVars] = useState(getThemeVars());

  useEffect(() => {
    const applyTheme = () => setThemeVars(getThemeVars());

    const observer = new MutationObserver(() => {
      applyTheme();
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });

    window.addEventListener('resize', applyTheme);

    applyTheme();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', applyTheme);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [salesResponse, ordersResponse, categoryResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/admin/sales`, { headers }),
          axios.get(`http://localhost:8080/api/admin/orders`, { headers }),
          axios.get(`http://localhost:8080/api/admin/category-sales`, { headers })
        ]);

        const toSeries = (resp) => {
          const data = resp?.data;
          if (!data) return { labels: [], data: [] };
          if (Array.isArray(data.labels) && Array.isArray(data.data)) return data;
          if (Array.isArray(data)) {
            return {
              labels: data.map((d) => d.label ?? d._id ?? ''),
              data: data.map((d) => d.value ?? d.count ?? d.sales ?? 0)
            };
          }
          if (typeof data === 'object') {
            const keys = Object.keys(data || {});
            if (keys.length && typeof data[keys[0]] === 'number') {
              return { labels: keys, data: keys.map((k) => data[k]) };
            }
          }
          return { labels: [], data: [] };
        };

        setSalesData(toSeries(salesResponse));
        setOrderData(toSeries(ordersResponse));
        setCategorySalesData(toSeries(categoryResponse));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); 
  const salesChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: themeVars.tickColor, font: { size: 12 } },
        grid: { color: themeVars.gridColor, borderDash: [2, 2] }
      },
      x: {
        ticks: { color: themeVars.tickColor, font: { size: 12 } },
        grid: { display: false }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: themeVars.legendColor, font: { size: 12 } }
      },
      title: {
        display: true,
        text: 'Monthly Sales Performance',
        color: themeVars.legendColor,
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 15 }
      },
      tooltip: {
        titleColor: themeVars.textColor,
        bodyColor: themeVars.textColor
      }
    }
  }), [themeVars]);

  const orderChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: themeVars.legendColor, font: { size: 12 } }
      },
      tooltip: {
        titleColor: themeVars.textColor,
        bodyColor: themeVars.textColor
      }
    }
  }), [themeVars]);

  const categoryChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: themeVars.legendColor }
      },
      title: {
        display: true,
        text: 'Product Sales by Category',
        color: themeVars.legendColor,
        font: { size: 16 }
      },
      tooltip: {
        titleColor: themeVars.textColor,
        bodyColor: themeVars.textColor
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: themeVars.tickColor },
        grid: { color: themeVars.gridColor }
      },
      x: { ticks: { color: themeVars.tickColor } }
    }
  }), [themeVars]);

  if (loading) return <div className="dashboard-content">Loading dashboard data...</div>;
  if (error) return <div className="dashboard-content error">{error}</div>;

  const salesLabels = salesData?.labels || [];
  const salesValues = salesData?.data || [];
  const orderLabels = orderData?.labels || [];
  const orderValues = orderData?.data || [];
  const categoryLabels = categorySalesData?.labels || [];
  const categoryValues = categorySalesData?.data || [];

  // Keys ensure remount when themeVars.legendColor changes — forces chart to completely redraw
  const salesKey = `sales-${themeVars.legendColor}-${themeVars.tickColor}`;
  const orderKey = `orders-${themeVars.legendColor}-${themeVars.tickColor}`;
  const categoryKey = `category-${themeVars.legendColor}-${themeVars.tickColor}`;

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
            key={salesKey}
            data={{
              labels: salesLabels,
              datasets: [
                {
                  label: 'Sales ($)',
                  data: salesValues,
                  backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                  ],
                  borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                  ],
                  borderWidth: 1,
                  borderRadius: 5,
                  borderSkipped: false
                }
              ]
            }}
            options={salesChartOptions}
            redraw={true}
          />
        </div>

        <div className="dashboard-chart-wrapper">
          <h3>Order Distribution</h3>
          <Pie
            key={orderKey}
            data={{
              labels: orderLabels,
              datasets: [
                {
                  data: orderValues,
                  backgroundColor: [
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(230, 126, 34, 0.8)',
                    'rgba(46, 204, 113, 0.8)'
                  ],
                  borderColor: [
                    'rgba(241, 196, 15, 1)',
                    'rgba(230, 126, 34, 1)',
                    'rgba(46, 204, 113, 1)'
                  ],
                  borderWidth: 1
                }
              ]
            }}
            options={orderChartOptions}
            redraw={true}
          />
        </div>

        <div className="dashboard-chart-wrapper">
          <h3>Category Sales</h3>
          <Bar
            key={categoryKey}
            data={{
              labels: categoryLabels,
              datasets: [
                {
                  label: 'Sales by Category',
                  data: categoryValues,
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)'
                  ],
                  borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)'
                  ],
                  borderWidth: 1
                }
              ]
            }}
            options={categoryChartOptions}
            redraw={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
