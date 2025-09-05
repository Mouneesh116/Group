import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
// import { set } from 'mongoose';

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
    setUserName(null);
    setUserId(null);
    return;
  }
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUser(null);
      setRole(null);
      setUserName(null);
      setUserId(null);
    } else {
      setIsLoggedIn(true);
      setUser(decoded.user);
      setRole(decoded.user.role);
      setUserName(decoded.user.userName);
      setUserId(decoded.user.id);
    }
  } catch (e) {
    console.log("Error decoding token:", e);
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    setRole(null);
    setUserName(null);
    setUserId(null);
  }
}, []);


  useEffect(() => {
    const token = localStorage.getItem('token');
    processToken(token);
  }, [processToken]);

 const signup = async (userData) => {
  try {
    const res = await axios.post(
      "http://localhost:8080/api/users/signup",
      userData,
      { headers: { "Content-Type": "application/json" } }
    );

    // Any 2xx is success (backend sends 201 on create)
    if (res.status >= 200 && res.status < 300) {
      const { token, role, userId, userName, email } = res.data || {};

      // If backend returns a token, persist and hydrate context
      if (token) {
        localStorage.setItem("token", token);
        processToken(token); // sets isLoggedIn, user, role, userName, userId
      }

      return { success: true, message: res.data?.message || "Signup successful", role, userId, userName, email };
    }

    // Fallback (shouldn't hit with axios unless you throw above)
    return { success: false, error: res.data?.message || "Unexpected signup response" };
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Signup failed";
    console.error("AuthContext signup error:", msg);
    return { success: false, error: msg };
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
