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

                if (!isExpired) return req; // Token còn hạn

                // Nếu token hết hạn, gọi API refresh
                try {
                    const response = await axios.post(`${API_BASE_URL}/user/token/refresh/`, {
                        refresh: authTokens.refresh
                    });

                    // Cập nhật state và Cookies
                    const newAuthTokens = { access: response.data.access, refresh: authTokens.refresh };
                    setAuthTokens(newAuthTokens);
                    setUser(jwtDecode(response.data.access));
                    Cookies.set('authTokens', JSON.stringify(newAuthTokens), { expires: 7 }); 

                    // Cập nhật header của yêu cầu hiện tại
                    req.headers.Authorization = `Bearer ${response.data.access}`;
                    return req;

                } catch (error) {
                    console.error("Refresh token failed, logging out:", error);
                    logoutUser(); // Đăng xuất nếu refresh thất bại
                    return Promise.reject(error);
                }
            }
            return req;
        },
        error => {
            return Promise.reject(error);
        }
    );

    // 4. CÁC HÀM LOGIN/LOGOUT
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
            return { success: false, error: error.response?.data?.detail || "Đăng nhập thất bại" };
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        Cookies.remove('authTokens');
    };

    // 5. DỮ LIỆU CONTEXT
    const contextData = {
        user,
        authTokens,
        api: axiosInstance, 
        loginUser,
        logoutUser
    };

    // 6. TẢI DỮ LIỆU BAN ĐẦU
    useEffect(() => {
        // Cập nhật axios header mỗi khi token thay đổi
        if (axiosInstance.defaults.headers) {
             axiosInstance.defaults.headers['Authorization'] = `Bearer ${authTokens?.access}`;
        }
        setLoading(false);
    }, [authTokens, axiosInstance]);


    return (
        <AuthContext.Provider value={contextData}>
            {loading ? <p>Đang tải ứng dụng...</p> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
