import api from "./api";

export interface QueueResponse {
  id: string;
  tokenNumber?: number;
  queueNumber?: number;
  appointmentNumber?: string;
  queueStatus?: string;
  patientName?: string;
  patientId?: string;
  doctorId?: string;
  [key: string]: any;
}
export const checkIn = async (data: { appointmentId: string }): Promise<QueueResponse> => {
  const response = await api.post<QueueResponse>("/api/queue/check-in", data);
  return response.data;
};

export const getTodayQueue = async (): Promise<QueueResponse[]> => {
  const response = await api.get<QueueResponse[]>("/api/queue/today");
  return response.data;
};

export const getTodayQueueByDoctor = async (doctorId: string): Promise<QueueResponse[]> => {
  const response = await api.get<QueueResponse[]>(`/api/queue/doctor/${doctorId}`);
  return response.data;
};

export const callNextPatient = async (doctorId: string): Promise<QueueResponse> => {
  const response = await api.put<QueueResponse>(`/api/queue/call-next?doctorId=${doctorId}`);
  return response.data;
};

export const startConsultation = async (queueId: string): Promise<QueueResponse> => {
  const response = await api.put<QueueResponse>(`/api/queue/start/${queueId}`);
  return response.data;
};

export const completeConsultation = async (queueId: string): Promise<QueueResponse> => {
  const response = await api.put<QueueResponse>(`/api/queue/complete/${queueId}`);
  return response.data;
};

export const skipQueuePatient = async (queueId: string): Promise<QueueResponse> => {
  const response = await api.put<QueueResponse>(`/api/queue/skip/${queueId}`);
  return response.data;
};
