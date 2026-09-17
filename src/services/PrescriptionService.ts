import api from "./api";

export interface PrescriptionMedicineResponse {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionResponse {
  id: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  appointmentId?: string;
  medicalRecordId?: string;
  prescriptionDate?: string;
  instructions?: string;
  medicines?: PrescriptionMedicineResponse[];
}

export const getPatientPrescriptions = async (
  patientId: string,
): Promise<PrescriptionResponse[]> => {
  const response = await api.get<PrescriptionResponse[]>(
    `/api/prescriptions/patient/${patientId}`,
  );
  return response.data;
};

export const getPrescriptionById = async (
  id: string,
): Promise<PrescriptionResponse> => {
  const response = await api.get<PrescriptionResponse>(
    `/api/prescriptions/${id}`,
  );
  return response.data;
};

export interface PrescriptionMedicineRequest {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionRequest {
  appointmentId: string;
  medicalRecordId?: string;
  instructions?: string;
  medicines: PrescriptionMedicineRequest[];
}

export const createPrescription = async (
  data: PrescriptionRequest,
): Promise<PrescriptionResponse> => {
  const response = await api.post<PrescriptionResponse>(
    "/api/prescriptions",
    data,
  );
  return response.data;
};
