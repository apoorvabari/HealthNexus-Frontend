import api from "../api/axios";
import Endpoints from "../constants/Endpoints";
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
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
