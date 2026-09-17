import api from "./api";

export type ConsentType =
  "APPOINTMENT_BOOKING" | "MEDICAL_RECORD_SHARING" | "PRESCRIPTION_ACCESS";
export type ConsentStatus = "GRANTED" | "DECLINED" | "REVOKED";

export interface ConsentRequest {
  consentType: ConsentType;
  status: ConsentStatus;
}

export interface ConsentResponse {
  id: string;
  consentType: ConsentType;
  status: ConsentStatus;
  consentedAt?: string;
  revokedAt?: string;
}

export const getMyConsents = async (): Promise<ConsentResponse[]> => {
  const response = await api.get<ConsentResponse[]>("/api/consents");
  return response.data;
};

export const getConsentByType = async (
  type: ConsentType,
): Promise<ConsentResponse> => {
  const response = await api.get<ConsentResponse>(`/api/consents/${type}`);
  return response.data;
};

export const updateConsent = async (
  data: ConsentRequest,
): Promise<ConsentResponse> => {
  const response = await api.post<ConsentResponse>("/api/consents", data);
  return response.data;
};

export const revokeConsent = async (
  type: ConsentType,
): Promise<ConsentResponse> => {
  const response = await api.patch<ConsentResponse>(
    `/api/consents/${type}/revoke`,
  );
  return response.data;
};
