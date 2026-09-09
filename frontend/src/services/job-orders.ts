import api from "@/lib/axios";
import type {
  CreateJobOrderPayload,
  JobOrder,
  JobOrderPriority,
  JobOrderResponse,
  JobOrderStatus,
  JobOrderStatusHistory,
  UpdateJobOrderPayload,
  UpdateJobOrderStatusPayload,
  UpdateJobOrderStatusResponse,
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

export async function getJobOrder(
  jobOrderId: number,
): Promise<JobOrderResponse> {
  const response = await api.get<JobOrderResponse>(
    `/job-orders/${jobOrderId}`,
  );

  return response.data;
}

export async function getJobOrderStatusHistory(
  jobOrderId: number,
): Promise<PaginatedResponse<JobOrderStatusHistory>> {
  const response = await api.get<PaginatedResponse<JobOrderStatusHistory>>(
    `/job-orders/${jobOrderId}/status-history`,
    {
      params: {
        per_page: 100,
      },
    },
  );

  return response.data;
}

export async function createJobOrder(
  payload: CreateJobOrderPayload,
): Promise<JobOrderResponse> {
  const response = await api.post<JobOrderResponse>("/job-orders", payload);

  return response.data;
}

export async function updateJobOrder(
  jobOrderId: number,
  payload: UpdateJobOrderPayload,
): Promise<JobOrderResponse> {
  const response = await api.put<JobOrderResponse>(
    `/job-orders/${jobOrderId}`,
    payload,
  );

  return response.data;
}

export async function updateJobOrderStatus(
  jobOrderId: number,
  payload: UpdateJobOrderStatusPayload,
): Promise<UpdateJobOrderStatusResponse> {
  const response = await api.patch<UpdateJobOrderStatusResponse>(
    `/job-orders/${jobOrderId}/status`,
    payload,
  );

  return response.data;
}