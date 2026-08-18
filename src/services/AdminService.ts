import api from "./api";
import { DoctorResponse } from "./DoctorService";
import { HospitalResponse } from "./HospitalService";

export interface AnalyticsResponse {
  totalDoctors: number;
  totalPatients: number;
  totalHospitals: number;
  totalAppointments: number;
  appointmentsToday: number;
}

export interface AdminDashboardStatsResponse {
  // Doctors
  totalDoctors: number;
  pendingDoctors: number;
  approvedDoctors: number;
  rejectedDoctors: number;

  // Hospitals / Clinics
  totalHospitals: number;
  pendingHospitals: number;
  approvedHospitals: number;
  rejectedHospitals: number;

  // Users
  totalUsers: number;
  activeUsers: number;
  deletedUsers: number;
}

export type DoctorStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";

export interface StatusUpdateRequest {
  status: DoctorStatus;
}

export type HospitalVerificationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface HospitalVerificationRequest {
  verificationStatus: HospitalVerificationStatus;

  detailsVerified: boolean;

  locationVerified: boolean;

  verificationRemarks?: string;
}

export type DoctorVerificationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface DoctorVerificationRequest {
  verificationStatus: DoctorVerificationStatus;
  licenseVerified: boolean;
  degreeVerified: boolean;
  specializationVerified: boolean;
  verificationRemarks?: string;
}

export interface SystemSettingsResponse {
  id: string;
  settingKey: string;
  settingValue: string;
  description?: string;
  updatedAt?: string;
}

export interface SystemSettingsRequest {
  settingKey: string;
  settingValue: string;
  description?: string;
}

export interface AuditLogResponse {
  id: string;
  action: string;
  entityName: string;
  entityId: string;
  performedBy: string;
  details?: string;
  timestamp: string;
}


export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const getPlatformAnalytics =
  async (): Promise<AnalyticsResponse> => {
    const response = await api.get<AnalyticsResponse>("/api/admin/analytics");
    return response.data;
  };

export const getDashboardStats =
  async (): Promise<AdminDashboardStatsResponse> => {
    const response = await api.get<AdminDashboardStatsResponse>(
      "/api/admin/dashboard/stats"
    );

    return response.data;
  };

export const updateDoctorStatus = async (
  id: string,
  request: StatusUpdateRequest
): Promise<DoctorResponse> => {
  const response = await api.put<DoctorResponse>(
    `/api/admin/doctors/${id}/status`,
    request
  );
  return response.data;
};

export const updateDoctorVerification = async (
  id: string,
  request: DoctorVerificationRequest
): Promise<DoctorResponse> => {
  const response = await api.put<DoctorResponse>(
    `/api/admin/doctors/${id}/verification`,
    request
  );

  return response.data;
};

export const updateHospitalStatus = async (
  id: string,
  request: StatusUpdateRequest
): Promise<HospitalResponse> => {
  const response = await api.put<HospitalResponse>(
    `/api/admin/hospitals/${id}/status`,
    request
  );
  return response.data;
};

export const updateHospitalVerification = async (
  id: string,
  request: HospitalVerificationRequest
): Promise<HospitalResponse> => {
  const response = await api.put<HospitalResponse>(
    `/api/admin/hospitals/${id}/verification`,
    request
  );

  return response.data;
};

export const toggleUserBlock = async (
  id: string,
  block: boolean
): Promise<any> => {
  const response = await api.put<any>(
    `/api/admin/users/${id}/toggle-block?block=${block}`
  );
  return response.data;
};

export const getAllSystemSettings = async (): Promise<SystemSettingsResponse[]> => {
  const response = await api.get<SystemSettingsResponse[]>("/api/admin/settings");
  return response.data;
};

export const updateSystemSetting = async (
  request: SystemSettingsRequest
): Promise<SystemSettingsResponse> => {
  const response = await api.put<SystemSettingsResponse>(
    "/api/admin/settings",
    request
  );
  return response.data;
};


export const getAuditLogs = async (search = "", page = 0, size = 10): Promise<PageResponse<AuditLogResponse>> => {
  const response = await api.get<PageResponse<AuditLogResponse>>(`/api/admin/audit-logs?search=${search}&page=${page}&size=${size}`);
  return response.data;
};
