import React, { useState } from 'react';
import './AdminDashboard.css';
import Sidebar from './Sidebar';
import AdminDetails from './AdminDetails';
import Dashboard from './Dashboard';
import Products from './Products';
import Orders from './Orders';
import UserActivity from './UserActivity'; // Corrected import path
import './AdminDashboard.css'; // Optional: Add specific styles for the admin dashboard

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("Dashboard");

 

  const renderMainContent = () => {
    switch (activeSection) {
      case "Admin":
        return <AdminDetails />;
      case "Dashboard":
        return <Dashboard  />;
      case "Products":
        return <Products />;
      case "Orders":
        return <Orders />;
      case "User Activity": // Added UserActivity case
        return <UserActivity />;
      default:
        return <div>Content for {activeSection}</div>;
    }
  };

  return (
    <div className="admindashboard">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="admindashboard-main-content">
        {renderMainContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;