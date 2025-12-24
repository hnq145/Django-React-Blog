import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants.js'; 
import { jwtDecode } from 'jwt-decode'; 
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. STATE MANAGEMENT
  const [authTokens, setAuthTokens] = useState(() => 
    Cookies.get('authTokens') ? JSON.parse(Cookies.get('authTokens')) : null
  );
  const [user, setUser] = useState(() => 
    Cookies.get('authTokens') ? jwtDecode(JSON.parse(Cookies.get('authTokens')).access) : null
  );
  const [loading, setLoading] = useState(true);

  // 2. AXIOS INSTANCE
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${authTokens?.access}`
    }
  });

  // 3. LOGIC REFRESH TOKEN 
  axiosInstance.interceptors.request.use(
    async req => {
      if (authTokens?.access) {
       
        const userToken = jwtDecode(authTokens.access);
        const isExpired = userToken.exp * 1000 < Date.now();

        if (!isExpired) return req; 

        // API refresh
        try {
          const response = await axios.post(`${API_BASE_URL}/user/token/refresh/`, {
            refresh: authTokens.refresh
          });

          const newAuthTokens = { access: response.data.access, refresh: authTokens.refresh };
          setAuthTokens(newAuthTokens);
          setUser(jwtDecode(response.data.access));
          Cookies.set('authTokens', JSON.stringify(newAuthTokens), { expires: 7 }); 

          req.headers.Authorization = `Bearer ${response.data.access}`;
          return req;

        } catch (error) {
          console.error("Refresh token failed, logging out:", error);
          logoutUser(); 
          return Promise.reject(error);
        }
      }
      return req;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // LOGIN/LOGOUT
  const loginUser = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/token/`, {
        username,
        password
      });
      
      const data = response.data;
      setAuthTokens(data);
      setUser(jwtDecode(data.access));
      Cookies.set('authTokens', JSON.stringify(data), { expires: 7 });
      
      return { success: true };

    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.response?.data?.detail || "Login failed" };
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    Cookies.remove('authTokens');
  };

  // CONTEXT
  const contextData = {
    user,
    authTokens,
    api: axiosInstance, 
    loginUser,
    logoutUser
  };

  useEffect(() => {
    if (axiosInstance.defaults.headers) {
      axiosInstance.defaults.headers['Authorization'] = `Bearer ${authTokens?.access}`;
    }
    setLoading(false);
  }, [authTokens, axiosInstance]);


  return (
    <AuthContext.Provider value={contextData}>
      {loading ? <p>Loading app...</p> : children}
    </AuthContext.Provider>
  );
};

export default AuthContext;