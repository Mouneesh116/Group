import React, { useEffect,useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';



const RouteGuard = () => {
    const { role, isLoggedIn, logout, loading, setIsLoggedIn, setRole} = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        if (isLoggedIn && role === 'admin') {
            const currentPath = location.pathname;
            const isAdminRoute = currentPath.startsWith('/admin');
            const allowedPublicRoutesForAdmin = ['/', '/login', '/signup', '/notfound'];
            const isAllowedPublicRoute = allowedPublicRoutesForAdmin.includes(currentPath);

            if (!isAdminRoute && !isAllowedPublicRoute) {
                console.warn(`Admin attempting to access non-admin/non-public route: ${currentPath}. Logging out.`);
                setIsLoggedIn(false);
                setRole("user");
                logout();
                navigate('/login');
            }
        }
    },[location.pathname, isLoggedIn, role, loading, logout, navigate])
  return null
}

export default RouteGuard;