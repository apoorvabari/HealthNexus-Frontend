import api from "./api";

export interface HospitalResponse {
  id: string;
  hospitalName: string;
  hospitalCode?: string;
  address?: string;
  [key: string]: any;
}

import { PageResponse } from "./AdminService";

export const getAllHospitals = async (search = "", page = 0, size = 10): Promise<PageResponse<HospitalResponse>> => {
  const response = await api.get<PageResponse<HospitalResponse>>(`/api/hospitals?search=${search}&page=${page}&size=${size}`);
  return response.data;
};

export const getHospitalById = async (id: string): Promise<HospitalResponse> => {
  const response = await api.get<HospitalResponse>(`/api/hospitals/${id}`);
  return response.data;
};

export const createHospital = async (data: any): Promise<HospitalResponse> => {
  const response = await api.post<HospitalResponse>("/api/hospitals", data);
  return response.data;
};

export const updateHospital = async (id: string, data: any): Promise<HospitalResponse> => {
  const response = await api.put<HospitalResponse>(`/api/hospitals/${id}`, data);
  return response.data;
};

export const deleteHospital = async (id: string): Promise<string> => {
  const response = await api.delete<string>(`/api/hospitals/${id}`);
  return response.data;
};
