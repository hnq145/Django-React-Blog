import { useAuthStore } from "../store/auth";
import axios from "./axios";
import i18n from "../i18n";

import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
});

export const login = async (email, password) => {
  try {
    const { data, status } = await axios.post("user/token/", {
      email,
      password,
    });

    if (status === 200) {
      setAuthUser(data.access, data.refresh);

      Toast.fire({
        icon: "success",
        title: i18n.t("login.signedInSuccess"),
      });
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error.response?.data?.detail || error.message || "Something went wrong",
    };
  }
};

export const register = async (full_name, email, password, password2) => {
  try {
    const { data } = await axios.post("user/register/", {
      full_name,
      email,
      password,
      password2,
    });

    await login(email, password);

    Toast.fire({
      icon: "success",
      title: i18n.t("register.signedUpSuccess"),
    });

    return { data, error: null };
  } catch (error) {
    let errorMessage = "";
    if (error.response?.data) {
      const errorData = error.response.data;
      if (typeof errorData === "object") {
        errorMessage = Object.entries(errorData)
          .map(
            ([field, messages]) =>
              `${field}: ${Array.isArray(messages) ? messages.join(" ") : messages}`,
          )
          .join("; ");
      } else {
        errorMessage = errorData;
      }
    } else {
      errorMessage = "Something went wrong";
    }

    Toast.fire({
      icon: "error",
      title: errorMessage,
    });

    return {
      data: null,
      error: errorMessage,
    };
  }
};

export const logout = () => {
  const accessToken = Cookies.get("access_token");
  const refreshToken = Cookies.get("refresh_token");

  if (!accessToken && !refreshToken) {
    return;
  }

  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  useAuthStore.getState().setUser(null);

  Toast.fire({
    icon: "success",
    title: i18n.t("login.loggedOutSuccess"),
  });

  // Force redirect to login
  window.location.href = "/login";
};

export const setUser = async () => {
  const accessToken = Cookies.get("access_token");
  const refreshToken = Cookies.get("refresh_token");

  if (!accessToken || !refreshToken) {
    useAuthStore.getState().setLoading(false);
    return;
  }

  if (isAccessTokenExpired(accessToken)) {
    try {
      const response = await getRefreshToken(refreshToken);
      setAuthUser(response.access, response.refresh);
    } catch (err) {
      console.log("Failed to refresh token", err);
      logout();
    }
  } else {
    setAuthUser(accessToken, refreshToken);
  }
};

export const setAuthUser = (access_token, refresh_token) => {
  Cookies.set("access_token", access_token, {
    expires: 1,
  });

  Cookies.set("refresh_token", refresh_token, {
    expires: 7,
  });
  const user = jwtDecode(access_token) ?? null;

  if (user) {
    useAuthStore.getState().setUser(user);
  }
  useAuthStore.getState().setLoading(false);
};

import axiosOriginal from "axios";
import { API_BASE_URL } from "./constants";

export const getRefreshToken = async (token) => {
  const refresh_token = token || Cookies.get("refresh_token");
  const response = await axiosOriginal.post(
    `${API_BASE_URL}user/token/refresh/`,
    {
      refresh: refresh_token,
    },
  );

  return response.data;
};

export const isAccessTokenExpired = (accessToken) => {
  try {
    const decodedToken = jwtDecode(accessToken);
    return decodedToken.exp < Date.now() / 1000;
  } catch (err) {
    return true;
  }
};
