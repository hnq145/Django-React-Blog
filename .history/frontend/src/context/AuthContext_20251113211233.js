import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
// Sửa lỗi 1: Thêm đuôi .js để trình biên dịch Vite dễ dàng tìm thấy file
import { API_BASE_URL } from '../utils/constants.js'; 
import Cookies from 'js-cookie';
// Sửa lỗi 2: Dòng này đúng, nhưng bạn cần chạy "npm install jwt-decode"
import { jwtDecode } from 'jwt-decode'; 

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider (Component "Não")
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [tokens, setTokens] = useState({
        access: Cookies.get('access_token') || null,
        refresh: Cookies.get('refresh_token') || null,
    });
    const [loading, setLoading] = useState(true);

    // Tạo một axiosInstance DUY NHẤT
    // (Giữ nguyên logic của bạn)
    const api = axios.create({
        baseURL: API_BASE_URL,
    });

    // Cập nhật User khi Token thay đổi
    useEffect(() => {
        if (tokens.access) {
            try {
                const decodedUser = jwtDecode(tokens.access);
                setUser(decodedUser);
                // Đặt token vào header mặc định của axiosInstance
                api.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
            } catch (error) {
                console.error("Token không hợp lệ:", error);
                // Xóa token hỏng
                // Đảm bảo hàm logout() được định nghĩa TRƯỚC useEffect này nếu bạn muốn gọi nó ở đây
                // Hoặc gọi trực tiếp:
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');
                setTokens({ access: null, refresh: null });
            }
        } else {
            setUser(null);
            delete api.defaults.headers.common['Authorization'];
        }
        setLoading(false);
    }, [tokens, api]); // Thêm 'api' vào dependency array

    // Hàm set token (dùng trong Login, Register, và Refresh)
    const setAuthUser = (access, refresh) => {
        Cookies.set('access_token', access, { expires: 1, sameSite: 'strict' });
        Cookies.set('refresh_token', refresh, { expires: 7, sameSite: 'strict' });
        
        setTokens({ access, refresh });
    };

    // Hàm Logout
    const logout = () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        setTokens({ access: null, refresh: null });
        // (Bạn có thể thêm lệnh chuyển hướng về trang chủ ở đây)
    };

    // **LOGIC REFRESH TOKEN (Cực kỳ quan trọng)**
    useEffect(() => {
        const interceptor = api.interceptors.request.use(
            async (config) => {
                if (!tokens.access) {
                    return config;
                }

                const accessTokenExpires = new Date(jwtDecode(tokens.access).exp * 1000);
                const now = new Date();

                // Kiểm tra nếu token sắp hết hạn (ví dụ: còn 1 phút)
                if (accessTokenExpires.getTime() - now.getTime() < 60000) {
                    console.log("Phát hiện Access Token sắp hết hạn, đang làm mới...");
                    try {
                        // Gọi API refresh token (sử dụng axios gốc, không phải instance 'api')
                        const response = await axios.post(`${API_BASE_URL}/user/token/refresh/`, {
                            refresh: tokens.refresh,
                        });
                        
                        // Lấy token mới
                        const { access, refresh } = response.data;
                        
                        // Cập nhật state và cookies
                        setAuthUser(access, refresh);
                        
                        // Cập nhật header cho request hiện tại
                        config.headers.Authorization = `Bearer ${access}`;
                        
                    } catch (error) {
                        console.error("Không thể làm mới token:", error);
                        logout(); // Đăng xuất nếu refresh thất bại
                        return Promise.reject(error);
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Hủy interceptor khi component unmount
        return () => api.interceptors.request.eject(interceptor);

    }, [tokens, api, setAuthUser, logout]); // Thêm các hàm vào dependency array

    const contextData = {
        api, // Đây là axiosInstance đã được cấu hình
        user,
        setAuthUser,
        logout
    };

    // 3. Trả về Provider
    return (
        <AuthContext.Provider value={contextData}>
            {loading ? <div>Đang tải thông tin xác thực...</div> : children}
        </AuthContext.Provider>
    );
};

// 4. Tạo Hook tùy chỉnh (để các component con sử dụng)
export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;