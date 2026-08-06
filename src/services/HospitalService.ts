import api from "./api";

export interface HospitalResponse {
  id: string;
  hospitalName: string;
  hospitalCode?: string;
  address?: string;
  [key: string]: any;
}

export const getAllHospitals = async (): Promise<HospitalResponse[]> => {
  const response = await api.get<HospitalResponse[]>("/api/hospitals");
  return response.data;
};

export const getHospitalById = async (id: string): Promise<HospitalResponse> => {
  const response = await api.get<HospitalResponse>(`/api/hospitals/${id}`);
  return response.data;
};
