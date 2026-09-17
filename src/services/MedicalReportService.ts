import api from "./api";

export interface MedicalReportResponse {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  reportName: string;
  reportType: string;
  fileData?: string;
  createdAt: string;
}

export const getPatientMedicalReports = async (
  patientId: string,
): Promise<MedicalReportResponse[]> => {
  const response = await api.get(`/api/medical-reports/patient/${patientId}`);
  return response.data;
};

export const getMedicalReportById = async (
  reportId: string,
): Promise<MedicalReportResponse> => {
  const response = await api.get(`/api/medical-reports/${reportId}`);
  return response.data;
};
