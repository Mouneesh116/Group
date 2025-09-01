import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';


const AdminRoute = ({ children }) => {
  
  // const { role } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  const role = token ? JSON.parse(atob(token.split('.')[1])).user.role : null;

  // const isAdmin = localStorage.getItem('isAdmin') === 'true';

  // Check if the user is logged in and is an admin
  if (role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
