import api from "./api";

export interface DepartmentResponse {
  id: string;
  departmentName: string;
  departmentCode?: string;
  hospitalId?: string;
  [key: string]: any;
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
