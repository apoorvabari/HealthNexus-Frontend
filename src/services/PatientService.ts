import api from "./api";

export interface PatientResponse {
  id: string;
  accountId?: string;
  accountName?: string;
  patientCode?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  relationship?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  status?: string;
  hospitalId?: string;
  hospitalName?: string;
  [key: string]: any;
}

export const getAllPatients = async (): Promise<PatientResponse[]> => {
  const response = await api.get<PatientResponse[]>("/api/patients");
  return response.data;
};

export const getPatientById = async (id: string): Promise<PatientResponse> => {
  const response = await api.get<PatientResponse>(`/api/patients/${id}`);
  return response.data;
};

export const createPatientProfile = async (data: any): Promise<PatientResponse> => {
  const response = await api.post<PatientResponse>("/api/patients", data);
  return response.data;
};

export const updatePatientProfile = async (id: string, data: any): Promise<PatientResponse> => {
  const response = await api.put<PatientResponse>(`/api/patients/${id}`, data);
  return response.data;
};

export const registerPatient = createPatientProfile;
