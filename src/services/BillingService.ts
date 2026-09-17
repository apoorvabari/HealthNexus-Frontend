import api from "./api";

export interface BillingResponse {
  id: string;

  appointmentId: string;

  patientId: string;

  patientName: string;

  doctorName: string;

  amount: number;

  paymentStatus: string;

  paymentMethod: string | null;

  invoiceNumber: string;

  billingDate: string;

  paymentDate: string | null;
}

export const getPatientBillings = async (
  patientId: string,
): Promise<BillingResponse[]> => {

  const response =
    await api.get<BillingResponse[]>(
      `/api/billing/patient/${patientId}`,
    );

  return response.data;
};

export const payBilling = async (
  billingId: string,
  paymentMethod: string,
): Promise<BillingResponse> => {

  const response =
    await api.post<BillingResponse>(
      `/api/billing/${billingId}/pay`,
      {
        paymentMethod,
      },
    );

  return response.data;
};

export const getBillingById = async (
  billingId: string,
): Promise<BillingResponse> => {

  const response =
    await api.get<BillingResponse>(
      `/api/billing/${billingId}`,
    );

  return response.data;
};

export const getBillingReceipt = async (
  billingId: string,
): Promise<ArrayBuffer> => {

  const response =
    await api.get<ArrayBuffer>(
      `/api/billing/${billingId}/receipt`,
      {
        responseType: "arraybuffer",
      },
    );

  return response.data;
};
