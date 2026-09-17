import api from "./api";

export interface ConsultationResponse {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName?: string;
  patientId: string;
  patientName?: string;
  status: string;
  startTime?: string;
  endTime?: string;
  remarks?: string;
  visitSaved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const saveVisit = async (
  consultationId: string,
  remarks: string,
): Promise<ConsultationResponse> => {
  const response = await api.put<ConsultationResponse>(
    `/api/consultations/${consultationId}/visit`,
    { remarks },
  );
  return response.data;
};

export const getConsultationByAppointmentId = async (
  appointmentId: string,
): Promise<ConsultationResponse> => {
  const response = await api.get<ConsultationResponse>(
    `/api/consultations/appointment/${appointmentId}`,
  );
  return response.data;
};
