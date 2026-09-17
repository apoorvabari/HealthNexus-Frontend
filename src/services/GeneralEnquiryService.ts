import api from "./api";

export interface GeneralEnquiryRequest {
  inquirerName: string;
  contactNumber: string;
  enquiryText: string;
  resolutionNotes?: string;
  status?: string;
}

export interface GeneralEnquiryResponse {
  id: string;
  hospitalId: string;
  hospitalName?: string;
  inquirerName: string;
  contactNumber: string;
  enquiryText: string;
  resolutionNotes?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createEnquiry = async (
  data: GeneralEnquiryRequest,
): Promise<GeneralEnquiryResponse> => {
  const response = await api.post<GeneralEnquiryResponse>(
    "/api/enquiries",
    data,
  );
  return response.data;
};

export const getHospitalEnquiries = async (): Promise<GeneralEnquiryResponse[]> => {
  const response = await api.get<GeneralEnquiryResponse[]>(
    "/api/enquiries",
  );
  return response.data;
};

export const updateEnquiryStatus = async (
  id: string,
  data: Partial<GeneralEnquiryRequest>,
): Promise<GeneralEnquiryResponse> => {
  const response = await api.put<GeneralEnquiryResponse>(
    `/api/enquiries/${id}`,
    data,
  );
  return response.data;
};
