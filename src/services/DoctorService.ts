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

export const getAllDoctors = async (): Promise<DoctorResponse[]> => {
  const response = await api.get<DoctorResponse[]>("/api/doctors");
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

export const registerDoctor = createDoctorProfile;
