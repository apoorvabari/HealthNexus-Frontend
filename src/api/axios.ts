import axios from "axios";
import ApiConfig from "../config/ApiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
    baseURL: ApiConfig.BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.error("Error managing token inside request interceptor", e);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;