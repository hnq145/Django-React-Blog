import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants.js'; 
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [tokens, setTokens] = useState({
        access: Cookies.get('access_token') || null,
        refresh: Cookies.get('refresh_token') || null,
    });
    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: API_BASE_URL,
    });

    useEffect(() => {
        if (tokens.access) {
            try {
                const decodedUser = jwtDecode(tokens.access);
                setUser(decodedUser);
                api.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
            } catch (error) {
                console.error("Token không hợp lệ:", error);
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');
                setTokens({ access: null, refresh: null });
            }
        } else {
            setUser(null);
            delete api.defaults.headers.common['Authorization'];
        }
        setLoading(false);
    }, [tokens, api]); 

    const setAuthUser = useCallback((access, refresh) => {
        Cookies.set('access_token', access, { expires: 1, sameSite: 'strict' });
        Cookies.set('refresh_token', refresh, { expires: 7, sameSite: 'strict' });
        
        setTokens({ access, refresh });
    }, []);

    const logout = useCallback(() => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        setTokens({ access: null, refresh: null });
        // (Bạn có thể thêm lệnh chuyển hướng về trang chủ ở đây)
    }, [setTokens]);

    // **LOGIC REFRESH TOKEN**
    useEffect(() => {
        const interceptor = api.interceptors.request.use(
            async (config) => {
                if (!tokens.access) {
                    return config;
                }

                const accessTokenExpires = new Date(jwtDecode(tokens.access).exp * 1000);
                const now = new Date();

                if (accessTokenExpires.getTime() - now.getTime() < 60000) {
                    console.log("Access Token is about to expire, refreshing...");
                    try {
                        const response = await axios.post(`${API_BASE_URL}/user/token/refresh/`, {
                            refresh: tokens.refresh,
                        });
                        
                        const { access, refresh } = response.data;
                        
                        setAuthUser(access, refresh);
                        
                        config.headers.Authorization = `Bearer ${access}`;
                        
                    } catch (error) {
                        console.error("Unable to refresh token:", error);
                        logout(); 
                        return Promise.reject(error);
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => api.interceptors.request.eject(interceptor);

    }, [tokens, api, setAuthUser, logout]); 

    const contextData = {
        api, 
        user,
        setAuthUser,
        logout
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? <div>Loading authentication information...</div> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;