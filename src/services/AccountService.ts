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
  const response = await api.post(Endpoints.LOGIN, data);
  return response.data;
};

export const logout = async (userId?: string): Promise<LogoutResponse> => {
  const url = userId
    ? `${Endpoints.LOGOUT}?userId=${userId}`
    : Endpoints.LOGOUT;
  const response = await api.post(url);
  return response.data;
};

export const resetPassword = async (data: PasswordResetRequest): Promise<string> => {
  const response = await api.post(Endpoints.RESET_PASSWORD, data);
  return response.data;
};
