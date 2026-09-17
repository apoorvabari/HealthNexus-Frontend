import api from "./api";
import { ConsultationResponse } from "./ConsultationService";
import { MedicalRecordResponse } from "./MedicalRecordService";
import { PrescriptionResponse } from "./PrescriptionService";

export interface MedicalHistoryResponse {
  visitNumber: number;
  visitId: string;
  appointmentId: string;
  appointmentNumber?: string;
  visitDate?: string;

  doctorId?: string;
  doctorName?: string;
  doctorSpecialization?: string;

  consultation?: ConsultationResponse;

  medicalRecord?: MedicalRecordResponse | null;

  prescriptions?: PrescriptionResponse[];
}

export const getPatientMedicalHistory = async (
  patientId: string,
): Promise<MedicalHistoryResponse[]> => {
  const response = await api.get<MedicalHistoryResponse[]>(
    `/api/patients/${patientId}/medical-history`,
  );

  return response.data;
};

export const getMedicalHistoryPdf = async (
  patientId: string,
): Promise<ArrayBuffer> => {
  const response = await api.get<ArrayBuffer>(
    `/api/patients/${patientId}/medical-history/pdf`,
    {
      responseType: "arraybuffer",
    },
  );

  return response.data;
};
