import api from "@/lib/axios";
import type {
  CreateJobOrderPayload,
  JobOrder,
  JobOrderPriority,
  JobOrderResponse,
  JobOrderStatus,
} from "@/types/job-order";
import type { PaginatedResponse } from "@/types/pagination";

export interface GetJobOrdersParams {
  page?: number;
  per_page?: number;
  priority?: JobOrderPriority;
  status?: JobOrderStatus;
}

export async function getJobOrders(
  params: GetJobOrdersParams = {},
): Promise<PaginatedResponse<JobOrder>> {
  const response = await api.get<PaginatedResponse<JobOrder>>("/job-orders", {
    params,
  });

  return response.data;
}

export async function createJobOrder(
  payload: CreateJobOrderPayload,
): Promise<JobOrderResponse> {
  const response = await api.post<JobOrderResponse>("/job-orders", payload);

  return response.data;
}