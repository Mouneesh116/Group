import React, { useContext, useEffect, useState } from 'react';
import './AdminDetails.css';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const AdminDetails = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if(response.status !== 200) {
          throw new Error('Failed to fetch admin stats');
        }
        else{
          setStats(response.data.stats);
          toast.success('Statistics fetched successfully!');
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    fetchAdminStats();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-profile-container">
      {/* <div className="admin-profile-header">
        <img
          src={user?.profilePicture || 'https://via.placeholder.com/150'}
          alt="Admin Profile"
          className="admin-profile-picture"
        />
        <h2>{user?.name || 'Admin Name'}</h2>
        <p>{user?.email || 'admin@example.com'}</p>
        <p className="admin-role">Role: Admin</p>
      </div> */}

      <div className="admindetails-profile-stats">
        <h3>Admin Statistics</h3>
        <div className="admindetails-stats-grid">
          <div className="admindetails-stat-card">
            <h4>Total Users</h4>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="admindetails-stat-card">
            <h4>Total Products</h4>
            <p>{stats.totalProducts}</p>
          </div>
          <div className="admindetails-stat-card">
            <h4>Total Orders</h4>
            <p>{stats.totalOrders}</p>
          </div>
          <div className="admindetails-stat-card">
            <h4>Total Revenue</h4>
            <p>₹{stats.totalRevenue}</p>
          </div>
        </div>
      </div>

      <div className="admindetails-profile-actions">
        <h3>Actions</h3>
        <button className="admindetails-action-button" onClick={() => alert('Change Password')}>
          Change Password
        </button>
        <button className="admindetails-action-button" onClick={() => alert('Edit Profile')}>
          Edit Profile
        </button>
        <button className="admindetails-action-button admindetails-logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDetails;