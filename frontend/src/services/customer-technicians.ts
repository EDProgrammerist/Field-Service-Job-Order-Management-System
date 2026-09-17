import api from "@/lib/axios";
import type {
  CustomerTechnicianCollectionResponse,
  CustomerTechnicianResponse,
} from "@/types/customer-technician";

export interface GetCustomerTechniciansParams {
  page?: number;
  per_page?: number;
  search?: string;
  specialization?: string;
}

export async function getCustomerTechnicians(
  params: GetCustomerTechniciansParams = {},
): Promise<CustomerTechnicianCollectionResponse> {
  const response =
    await api.get<CustomerTechnicianCollectionResponse>(
      "/customer/technicians",
      {
        params,
      },
    );

  return response.data;
}

export async function getCustomerTechnician(
  technicianId: number,
): Promise<CustomerTechnicianResponse> {
  const response = await api.get<CustomerTechnicianResponse>(
    `/customer/technicians/${technicianId}`,
  );

  return response.data;
}