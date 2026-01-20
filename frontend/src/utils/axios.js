import axios from "axios";
import Cookies from "js-cookie";
import { logout, setAuthUser, getRefreshToken } from "./auth";

import { API_BASE_URL } from "./constants";

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

console.log("Axios instance created with baseURL:", API_BASE_URL);

apiInstance.interceptors.request.use(
  (config) => {
    const access_token = Cookies.get("access_token");
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    // If data is FormData, let browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("user/token/refresh/")
    ) {
      originalRequest._retry = true;
      try {
        const response = await getRefreshToken();
        setAuthUser(response.access, response.refresh);
        originalRequest.headers.Authorization = `Bearer ${response.access}`;
        return apiInstance(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default apiInstance;
