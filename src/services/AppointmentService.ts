import api from "./api";

export interface AppointmentRequest {
  hospitalId?: string;
  departmentId?: string;
  doctorId?: string;
  patientId?: string;
  bookedByReceptionistId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentType?: string;
  appointmentStatus?: string;
  consultationMode?: string;
  remarks?: string;
  reasonForVisit?: string;
}

export interface AppointmentResponse {
  id: string;
  appointmentNumber?: string;
  hospitalId?: string;
  hospitalName?: string;
  departmentId?: string;
  departmentName?: string;
  doctorId?: string;
  doctorName?: string;
  patientId?: string;
  patientName?: string;
  bookedByReceptionistId?: string;
  bookedByReceptionistName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentType?: string;
  appointmentStatus?: string;
  consultationMode?: string;
  remarks?: string;
  message?: string;
}

export const createAppointment = async (data: AppointmentRequest): Promise<AppointmentResponse> => {
  const payload = {
    ...data,
    remarks: data.remarks || data.reasonForVisit,
    appointmentType: data.appointmentType || "WALK_IN",
    consultationMode: data.consultationMode || "OPD",
  };
  const response = await api.post<AppointmentResponse>("/api/appointments", payload);
  return response.data;
};

export const getAppointmentById = async (id: string): Promise<AppointmentResponse> => {
  const response = await api.get<AppointmentResponse>(`/api/appointments/${id}`);
  return response.data;
};

export const getAllAppointments = async (): Promise<AppointmentResponse[]> => {
  const response = await api.get<AppointmentResponse[]>("/api/appointments");
  return response.data;
};

export const updateAppointment = async (id: string, data: AppointmentRequest): Promise<AppointmentResponse> => {
  const response = await api.put<AppointmentResponse>(`/api/appointments/${id}`, data);
  return response.data;
};

export const deleteAppointment = async (id: string): Promise<string> => {
  const response = await api.delete<string>(`/api/appointments/${id}`);
  return response.data;
};

export const getTodayAppointments = async (): Promise<AppointmentResponse[]> => {
  const response = await api.get<AppointmentResponse[]>("/api/appointments/today");
  return response.data;
};

export const getAppointmentsByDoctor = async (doctorId: string): Promise<AppointmentResponse[]> => {
  const response = await api.get<AppointmentResponse[]>(`/api/appointments/doctor/${doctorId}`);
  return response.data;
};

export const getAppointmentsByPatient = async (patientId: string): Promise<AppointmentResponse[]> => {
  const response = await api.get<AppointmentResponse[]>(`/api/appointments/patient/${patientId}`);
  return response.data;
};
