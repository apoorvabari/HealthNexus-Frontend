import api from "./api";

export interface DepartmentResponse {
  id: string;
  departmentName: string;
  departmentCode?: string;
  hospitalId?: string;
  [key: string]: any;
}

export interface DepartmentDoctorResponse {
  id: string;
  accountId?: string;
  accountName?: string;
  hospitalId?: string;
  hospitalName?: string;
  departmentId?: string;
  departmentName?: string;
  specialization?: string;
  qualification?: string;
  experience?: number;
  consultationFee?: number;
  licenseNumber?: string;
  status?: string;
  verificationStatus?: string;
  licenseVerified?: boolean;
  degreeVerified?: boolean;
  specializationVerified?: boolean;
  verificationRemarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  message?: string;
}

export interface DepartmentAnalyticsResponse {
  totalDoctors: number;
  activeDoctors: number;
  inactiveDoctors: number;
  suspendedDoctors: number;
}

import { PageResponse } from "./AdminService";

export const getAllDepartments = async (search = "", page = 0, size = 10): Promise<PageResponse<DepartmentResponse>> => {
  const response = await api.get<PageResponse<DepartmentResponse>>(`/api/departments?search=${search}&page=${page}&size=${size}`);
  return response.data;
};

export const getDepartmentById = async (id: string): Promise<DepartmentResponse> => {
  const response = await api.get<DepartmentResponse>(`/api/departments/${id}`);
  return response.data;
};

export const getDepartmentsByHospital = async (hospitalId: string): Promise<DepartmentResponse[]> => {
  const allDepts = await getAllDepartments();
  return allDepts.content.filter(d => d.hospitalId === hospitalId);
};

export const createDepartment = async (data: any): Promise<DepartmentResponse> => {
  const response = await api.post<DepartmentResponse>("/api/departments", data);
  return response.data;
};

export const updateDepartment = async (id: string, data: any): Promise<DepartmentResponse> => {
  const response = await api.put<DepartmentResponse>(`/api/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: string): Promise<string> => {
  const response = await api.delete<string>(`/api/departments/${id}`);
  return response.data;
};

export const getDoctorsByDepartment = async (
  departmentId: string,
  page = 0,
  size = 10
): Promise<PageResponse<DepartmentDoctorResponse>> => {
  const response = await api.get<PageResponse<DepartmentDoctorResponse>>(
    `/api/departments/${departmentId}/doctors?page=${page}&size=${size}`
  );

  return response.data;
};

export const getDepartmentAnalytics = async (
  departmentId: string
): Promise<DepartmentAnalyticsResponse> => {
  const response = await api.get<DepartmentAnalyticsResponse>(
    `/api/departments/${departmentId}/analytics`
  );

  return response.data;
};