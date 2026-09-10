import api from "@/lib/axios";
import type {
  CustomerServiceRequestDetailsResponse,
  CustomerServiceRequestPayload,
  JobOrder,
  JobOrderResponse,
} from "@/types/job-order";
import type { PaginatedResponse } from "@/types/pagination";

export interface GetCustomerServiceRequestsParams {
  page?: number;
  per_page?: number;
}

export async function createCustomerServiceRequest(
  payload: CustomerServiceRequestPayload,
): Promise<JobOrderResponse> {
  const response = await api.post<JobOrderResponse>(
    "/customer/service-requests",
    payload,
  );

  return response.data;
}

export async function getCustomerServiceRequests(
  params: GetCustomerServiceRequestsParams = {},
): Promise<PaginatedResponse<JobOrder>> {
  const response = await api.get<PaginatedResponse<JobOrder>>(
    "/customer/service-requests",
    {
      params,
    },
  );

  return response.data;
}

export async function getCustomerServiceRequest(
  jobOrderId: number,
): Promise<CustomerServiceRequestDetailsResponse> {
  const response = await api.get<CustomerServiceRequestDetailsResponse>(
    `/customer/service-requests/${jobOrderId}`,
  );

  return response.data;
}