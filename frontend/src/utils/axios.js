import axios from "axios";
import Cookies from "js-cookie";
import { logout, setAuthUser, getRefreshToken } from "./auth";

const apiInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1/",
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiInstance.interceptors.request.use(
  (config) => {
    const access_token = Cookies.get("access_token");
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await getRefreshToken();
        setAuthUser(response.access, response.refresh);
        originalRequest.headers.Authorization = `Bearer ${response.access}`;
        return apiInstance(originalRequest);
      } catch (refreshError) {
        logout();
        window.location.href = "/login/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiInstance;
