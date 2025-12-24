import axios from "axios";

import { 
    getRefreshToken, 
    isAccessTokenExpired, 
    setAuthUser 
} from "./auth";
import { useAuthStore } from "../store/auth";
import { API_BASE_URL } from "./constants";
import Cookies from "js-cookie";

let axiosInstance = null;

const useAxios = () => {
    const { accessToken, refreshToken } = useAuthStore((state) => ({
        user: state.user,
        accessToken: Cookies.get("access_token"), 
        refreshToken: Cookies.get("refresh_token"),
    }));

    if (!axiosInstance) {
        axiosInstance = axios.create({
            baseURL: API_BASE_URL,
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        axiosInstance.interceptors.request.use(async (req) => {
            if (!accessToken) {
                return req;
            }

            if (!isAccessTokenExpired(accessToken)) {
                return req;
            }

            try {
                const response = await getRefreshToken(refreshToken);
                setAuthUser(response.access, response.refresh);

                req.headers.Authorization = `Bearer ${response.access}`;
                return req;
            } catch (error) {
                console.error("Lỗi refresh token trong interceptor:", error);
                useAuthStore.getState().setUser(null); 
                Cookies.remove("access_token");
                Cookies.remove("refresh_token");
                return Promise.reject(error);
            }
        });
    } else {
        axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
    }

    return axiosInstance;
};

export default useAxios;