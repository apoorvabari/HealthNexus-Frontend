import api from "./api";

export interface MedicalRecordResponse {
  id: string;
  patientId?: string;
  patientName?: string;
  patientCode?: string;
  doctorId?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  appointmentId?: string;
  appointmentNumber?: string;
  diagnosis?: string;
  notes?: string;
  recordDate?: string;
  createdAt?: string;
  message?: string;
}

export const getMedicalRecordById = async (
  id: string,
): Promise<MedicalRecordResponse> => {
  const response = await api.get<MedicalRecordResponse>(
    `/api/medical-records/${id}`,
  );
  return response.data;
};

export const getPatientMedicalRecords = async (
  patientId: string,
): Promise<MedicalRecordResponse[]> => {
  const response = await api.get<MedicalRecordResponse[]>(
    `/api/medical-records/patient/${patientId}`,
  );
  return response.data;
};

export interface MedicalRecordRequest {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  diagnosis: string;
  notes?: string;
  recordDate: string;
}

export const createMedicalRecord = async (
  data: MedicalRecordRequest,
): Promise<MedicalRecordResponse> => {
  const response = await api.post<MedicalRecordResponse>(
    "/api/medical-records",
    data,
  );
  return response.data;
};
