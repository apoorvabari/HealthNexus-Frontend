import api from "./api";

export interface DoctorResponse {
  id: string;
  accountId?: string;
  accountName?: string;
  specialization?: string;
  licenseNumber?: string;
  qualification?: string;
  experience?: number;
  consultationFee?: number;
  status?: string;
  hospitalId?: string;
  hospitalName?: string;
  departmentId?: string;
  departmentName?: string;
  [key: string]: any;
}

import { PageResponse } from "./AdminService";

export const getAllDoctors = async (search = "", page = 0, size = 10): Promise<PageResponse<DoctorResponse>> => {
  const response = await api.get<PageResponse<DoctorResponse>>(`/api/doctors?search=${search}&page=${page}&size=${size}`);
  return response.data;
};

export const getDoctorByAccountId = async (accountId: string): Promise<DoctorResponse> => {
  const response = await api.get<DoctorResponse>(`/api/doctors/by-account/${accountId}`);
  return response.data;
};

export const getDoctorById = async (id: string): Promise<DoctorResponse> => {
  const response = await api.get<DoctorResponse>(`/api/doctors/${id}`);
  return response.data;
};

export const createDoctorProfile = async (data: any): Promise<DoctorResponse> => {
  const response = await api.post<DoctorResponse>("/api/doctors", data);
  return response.data;
};

export const updateDoctorProfile = async (id: string, data: any): Promise<DoctorResponse> => {
  const response = await api.put<DoctorResponse>(`/api/doctors/${id}`, data);
  return response.data;
};

export const registerDoctor = createDoctorProfile;
