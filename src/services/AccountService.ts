import api from "../api/axios";
import axios from "axios";
import Endpoints from "../constants/Endpoints";
import ApiConfig from "../config/ApiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  PasswordResetRequest,
} from "../types/Account";

const decodeToken = (token: string): any => {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (e) {
    console.error("JWT token decoding failed", e);
    return null;
  }
};

export const register = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await api.post(Endpoints.REGISTER, data);
  return response.data;
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const body = `client_id=${encodeURIComponent(ApiConfig.KEYCLOAK_CLIENT_ID)}&grant_type=password&username=${encodeURIComponent(data.email)}&password=${encodeURIComponent(data.password)}`;
    
    const response = await axios.post(ApiConfig.KEYCLOAK_TOKEN_URL, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;

    await AsyncStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem("refreshToken", refreshToken);
    }

    const decoded = decodeToken(accessToken);
    const realmRoles = decoded?.realm_access?.roles || [];
    
    let matchedRole = "PATIENT";
    if (realmRoles.includes("DOCTOR")) {
      matchedRole = "DOCTOR";
    } else if (realmRoles.includes("RECEPTIONIST")) {
      matchedRole = "RECEPTIONIST";
    } else if (realmRoles.includes("ADMIN")) {
      matchedRole = "ADMIN";
    }

    try {
      await api.post("/accounts/update-last-login");
    } catch (syncError) {
      console.error("Last login synchronization failed", syncError);
    }

    return {
      userId: decoded?.sub ?? "",
      firstName: decoded?.given_name || decoded?.preferred_username || "",
      lastName: decoded?.family_name || "",
      email: decoded?.email || "",
      role: matchedRole,
      message: "Login successful"
    };

  } catch (error: any) {
    if (error.response && error.response.data) {
      const keycloakError = error.response.data.error;
      const keycloakDesc = error.response.data.error_description;

      let userFriendlyMessage = "Login failed. Please try again.";
      if (keycloakError === "invalid_grant") {
        userFriendlyMessage = "Invalid email or password.";
      } else if (keycloakError === "unauthorized_client") {
        userFriendlyMessage = "Client configuration error. Direct Access Grants disabled.";
      } else if (keycloakDesc) {
        userFriendlyMessage = keycloakDesc;
      }
      throw new Error(userFriendlyMessage);
    }
    throw error;
  }
};

export const logout = async (userId?: string): Promise<LogoutResponse> => {
  try {
    const url = userId
      ? `${Endpoints.LOGOUT}?userId=${userId}`
      : Endpoints.LOGOUT;
    const response = await api.post(url);
    return response.data;
  } finally {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
  }
};

export const resetPassword = async (data: PasswordResetRequest): Promise<string> => {
  const response = await api.post(Endpoints.RESET_PASSWORD, data);
  return response.data;
};

export const getProfile = async (): Promise<any> => {
  const response = await api.get("/accounts/profile");
  return response.data;
};

export const updateAccount = async (id: number | string, data: any): Promise<any> => {
  const response = await api.put(`/accounts/${id}`, data);
  return response.data;
};

