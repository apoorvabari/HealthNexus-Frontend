import api from "./api";

export interface ReceptionistResponse {
  id: string;
  accountId?: string;
  accountName?: string;
  employeeCode?: string;
  shift?: string;
  joiningDate?: string;
  status?: string;
  hospitalId?: string;
  hospitalName?: string;
  departmentId?: string;
  departmentName?: string;
  [key: string]: any;
}

export const getAllReceptionists = async (): Promise<ReceptionistResponse[]> => {
  const response = await api.get<ReceptionistResponse[]>("/api/receptionists");
  return response.data;
};

export const getReceptionistById = async (id: string): Promise<ReceptionistResponse> => {
  const response = await api.get<ReceptionistResponse>(`/api/receptionists/${id}`);
  return response.data;
};

export const createReceptionistProfile = async (data: any): Promise<ReceptionistResponse> => {
  const response = await api.post<ReceptionistResponse>("/api/receptionists", data);
  return response.data;
};

export const registerReceptionist = createReceptionistProfile;
