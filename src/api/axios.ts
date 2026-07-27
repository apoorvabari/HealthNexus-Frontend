import axios from "axios";
import ApiConfig from "../config/ApiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isTokenExpired = (token: string): boolean => {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return (decoded.exp * 1000) < (Date.now() + 10000);
    } catch (e) {
        return true;
    }
};

const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
    try {
        const body = `client_id=${encodeURIComponent(ApiConfig.KEYCLOAK_CLIENT_ID)}&grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`;
        const response = await axios.post(ApiConfig.KEYCLOAK_TOKEN_URL, body, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        await AsyncStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
            await AsyncStorage.setItem("refreshToken", newRefreshToken);
        }
        return newAccessToken;
    } catch (e) {
        console.error("Failed to refresh access token", e);
        return null;
    }
};

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
            let token = await AsyncStorage.getItem("accessToken");
            if (token) {
                if (isTokenExpired(token)) {
                    const refreshToken = await AsyncStorage.getItem("refreshToken");
                    if (refreshToken) {
                        const newToken = await refreshAccessToken(refreshToken);
                        if (newToken) {
                            token = newToken;
                        } else {
                            await AsyncStorage.removeItem("accessToken");
                            await AsyncStorage.removeItem("refreshToken");
                            token = null;
                        }
                    } else {
                        token = null;
                    }
                }

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
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