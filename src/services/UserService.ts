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

export const logout = async (userEmail?: string): Promise<any> => {
  try {
    const response = await api.post("/api/users/logout", { email: userEmail });
    return response.data;
  } catch (error) {
    return { success: true };
  }
};

