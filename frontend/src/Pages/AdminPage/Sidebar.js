import React, { useState, useContext } from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaUser, FaTachometerAlt, FaUsers, FaBox, FaShoppingCart, FaSignOutAlt } from 'react-icons/fa';
import { AuthContext } from '../../Context/AuthContext'; // Adjust the import path as necessary
const Sidebar = ({ activeSection, setActiveSection }) => {
  const [isOpen, setIsOpen] = useState(false); // State to toggle sidebar
  const { role, setRole, setIsLoggedIn, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = async () => {

    setIsLoggedIn(false);
    await logout();


    navigate('/login');

  }
 
 
  const toggleSidebar = () => {
    console.log('Toggling sidebar'); // Debugging
    setIsOpen(!isOpen);
  };
 
  const handleSectionClick = (section) => {
    setActiveSection(section);
    setIsOpen(false); // Close the sidebar after clicking a section
  };
 
  return (
    <>
      {/* Hamburger Menu */}
      <div className="sidebar-hamburger" onClick={toggleSidebar}>
        <FaBars />
      </div>
 
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav>
          <a
            href="#admin"
            onClick={() => handleSectionClick("Admin")}
            className={activeSection === "Admin" ? "active" : ""}
            title="Admin"
          >
            <FaUser />
          </a>
          <a
            href="#dashboard"
            onClick={() => handleSectionClick("Dashboard")}
            className={activeSection === "Dashboard" ? "active" : ""}
            title="Dashboard"
          >
            <FaTachometerAlt />
          </a>
          <a
            href="#user-activity"
            onClick={() => handleSectionClick("User Activity")}
            className={activeSection === "User Activity" ? "active" : ""}
            title="User Activity"
          >
            <FaUsers />
          </a>
          <a
            href="#products"
            onClick={() => handleSectionClick("Products")}
            className={activeSection === "Products" ? "active" : ""}
            title="Products"
          >
            <FaBox />
          </a>
          <a
            href="#orders"
            onClick={() => handleSectionClick("Orders")}
            className={activeSection === "Orders" ? "active" : ""}
            title="Orders"
          >
            <FaShoppingCart />
          </a>
          <a
            href="#logout"
            onClick={handleLogout}
            className="sidebar-logout-link"
            title="Logout"
          >
            <FaSignOutAlt />
          </a>
        </nav>
      </div>
    </>
  );
};
 
export default Sidebar;