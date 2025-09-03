import React, { useState, useContext } from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaUser,
  FaTachometerAlt,
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaSignOutAlt,
} from 'react-icons/fa';
import { AuthContext } from '../../Context/AuthContext';
import { useTheme } from '../../Context/ThemeContext'; // ✅ theme support

const Sidebar = ({ activeSection, setActiveSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setIsLoggedIn, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme(); // ✅ theme context

  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggedIn(false);
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
    setIsOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Hamburger Menu (mobile only) */}
      <div className="sidebar-hamburger" onClick={toggleSidebar}>
        <FaBars />
      </div>

      {/* Sidebar */}
      <aside className={`sidebar-container ${isOpen ? 'open' : ''} ${theme}`}>
        <nav className="sidebar-nav">
          <a
            href="#admin"
            onClick={() => handleSectionClick('Admin')}
            className={activeSection === 'Admin' ? 'active' : ''}
          >
            <FaUser /> <span>Admin</span>
          </a>
          <a
            href="#dashboard"
            onClick={() => handleSectionClick('Dashboard')}
            className={activeSection === 'Dashboard' ? 'active' : ''}
          >
            <FaTachometerAlt /> <span>Dashboard</span>
          </a>
          <a
            href="#user-activity"
            onClick={() => handleSectionClick('User Activity')}
            className={activeSection === 'User Activity' ? 'active' : ''}
          >
            <FaUsers /> <span>Users</span>
          </a>
          <a
            href="#products"
            onClick={() => handleSectionClick('Products')}
            className={activeSection === 'Products' ? 'active' : ''}
          >
            <FaBox /> <span>Products</span>
          </a>
          <a
            href="#orders"
            onClick={() => handleSectionClick('Orders')}
            className={activeSection === 'Orders' ? 'active' : ''}
          >
            <FaShoppingCart /> <span>Orders</span>
          </a>
          <a
            href="#logout"
            onClick={handleLogout}
            className="sidebar-logout-link"
          >
            <FaSignOutAlt /> <span>Logout</span>
          </a>
        </nav>

        {/* ✅ Theme Toggle */}
        <div className="sidebar-theme-toggle">
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
