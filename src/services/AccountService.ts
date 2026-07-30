import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/axios";
import Endpoints from "../constants/Endpoints";
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  PasswordResetRequest,
} from "../types/Account";

export const register = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await api.post(Endpoints.REGISTER, data);
  return response.data;
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  await AsyncStorage.removeItem("accessToken");
  const response = await api.post(Endpoints.LOGIN, data);
  const loginResponse: LoginResponse = response.data;
  if (loginResponse.accessToken) {
    await AsyncStorage.setItem("accessToken", loginResponse.accessToken);
  }
  return loginResponse;
};

export const logout = async (userId?: string): Promise<LogoutResponse> => {
  const url = userId
    ? `${Endpoints.LOGOUT}?userId=${userId}`
    : Endpoints.LOGOUT;
  try {
    const response = await api.post(url);
    return response.data;
  } finally {
    await AsyncStorage.removeItem("accessToken");
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
