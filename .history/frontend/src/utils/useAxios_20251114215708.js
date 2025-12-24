// frontend/src/utils/useAxios.js

import axios from "axios";
// SỬA LỖI 1: Import các hàm auth và store ZUSTAND
import { 
    getRefreshToken, 
    isAccessTokenExpired, 
    setAuthUser 
} from "./auth";
import { useAuthStore } from "../store/auth";
import { API_BASE_URL } from "./constants";
import Cookies from "js-cookie";

const useAxios = () => {
    // SỬA LỖI 2: Lấy token từ Zustand store, không phải Cookies
    const { user, accessToken, refreshToken } = useAuthStore((state) => ({
        user: state.user,
        accessToken: Cookies.get("access_token"), // Vẫn lấy từ Cookie để khởi tạo
        refreshToken: Cookies.get("refresh_token"),
    }));

    const axiosInstance = axios.create({
        baseURL: API_BASE_URL,
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    axiosInstance.interceptors.request.use(async (req) => {
        // Nếu không có user (đang gọi API public), bỏ qua
        if (!accessToken) {
            return req;
        }

        if (!isAccessTokenExpired(accessToken)) {
            return req;
        }

        // Token hết hạn, gọi refresh
        try {
            const response = await getRefreshToken(refreshToken);
            setAuthUser(response.access, response.refresh);

            req.headers.Authorization = `Bearer ${response.access}`;
            return req;
        } catch (error) {
            console.error("Lỗi refresh token trong interceptor:", error);
            // Nếu refresh hỏng, logout
            useAuthStore.getState().setUser(null); // Logout
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            return Promise.reject(error);
        }
    });

    return axiosInstance;
};

export default useAxios;