import api from "./api";

export const login = async (credentials: any): Promise<any> => {
  const response = await api.post("/api/users/login", credentials);
  return response.data;
};

export const register = async (userData: any): Promise<any> => {
  const response = await api.post("/api/users/register", userData);
  return response.data;
};

export const resetPassword = async (data: any): Promise<any> => {
  const response = await api.post("/api/users/reset-password", data);
  return response.data;
};

export const logout = async (userId?: string): Promise<any> => {
  try {
    const response = await api.post("/api/users/logout", null, {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    return { success: true };
  }
};

export interface UserResponse {
  id: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  lastLogin?: string;
  [key: string]: any;
}

import { PageResponse } from "./AdminService";

export const getAllUsers = async (search = "", page = 0, size = 10): Promise<PageResponse<UserResponse>> => {
  const response = await api.get<PageResponse<UserResponse>>(`/api/users?search=${search}&page=${page}&size=${size}`);
  return response.data;
};
