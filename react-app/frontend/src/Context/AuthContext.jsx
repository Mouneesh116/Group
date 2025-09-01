import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);

  

  const processToken = useCallback((token) => {
    if (!token) {
      setIsLoggedIn(false);
      setUser(null);
      setRole(null);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        console.log('Token expired, logging out');
        setIsLoggedIn(false);
        setUser(null);
        setRole(null);
      } else {
        setIsLoggedIn(true);
        setUser(decoded.user);
        setRole(decoded.user.role);
        setUserName(decoded.user.userName);
        setUserId(decoded.user.id);
      }
    } catch (error) {
      console.log('Error decoding token:', error);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUser(null);
      setRole(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    processToken(token);
  }, [processToken]);

  const signup = async (userData) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/users/signup`,
        userData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        console.log('Signup successful:', response.data.message);
        return { success: true, message: response.data.message };
      } else {
        console.error('Signup failed:', response.data.message);
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Error in AuthContext signup:', error);

      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  const login = async (userData) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/users/login`,
        userData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const token = response.data.token;
      if (token) {
        processToken(token);
        localStorage.setItem('token', token);
        console.log('Login successful in Auth Context', token);

        return {
          success: true,
          message: response.data.message,
          userId: response.data.userId,
          role: jwtDecode(token).user.role,
        };
      } else {
        console.error('Login successful but no token received.');
        return { success: false, error: 'Login failed: No token received from server.' };
      }
    } catch (error) {
      console.log('Error in AuthContext login:', error);

      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    // setRole('user');
    setRole(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        login,
        logout,
        signup,
        user,
        role,
        setRole,
        userId,
        setUserId,
        userName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
