import api from "./api";

export interface DepartmentResponse {
  id: string;
  departmentName: string;
  departmentCode?: string;
  hospitalId?: string;
  [key: string]: any;
}

export const getAllDepartments = async (): Promise<DepartmentResponse[]> => {
  const response = await api.get<DepartmentResponse[]>("/api/departments");
  return response.data;
};

export const getDepartmentById = async (id: string): Promise<DepartmentResponse> => {
  const response = await api.get<DepartmentResponse>(`/api/departments/${id}`);
  return response.data;
};

export const getDepartmentsByHospital = async (hospitalId: string): Promise<DepartmentResponse[]> => {
  const allDepts = await getAllDepartments();
  return allDepts.filter(d => d.hospitalId === hospitalId);
};
