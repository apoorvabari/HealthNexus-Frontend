import axios, { InternalAxiosRequestConfig } from "axios";
import { getAuthToken, clearSession } from "../storage/AuthStorage";
import { router } from "expo-router";

const API_BASE_URL = "http://localhost:8081";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      await clearSession();
      if (router && typeof router.replace === "function") {
          setTimeout(() => router.replace("/login"), 0);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
