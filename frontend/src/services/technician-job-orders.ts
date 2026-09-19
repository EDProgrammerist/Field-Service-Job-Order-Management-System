import api from "@/lib/axios";
import type { JobOrderStatus } from "@/types/job-order";
import type { PaginatedResponse } from "@/types/pagination";
import type {
  AcceptTechnicianSchedulePayload,
  RejectTechnicianSchedulePayload,
  TechnicianJobActionPayload,
  TechnicianJobOrder,
  TechnicianJobOrderHistoryResponse,
  TechnicianJobOrderResponse,
  TechnicianScheduleResponse,
} from "@/types/technician-job-order";

export interface GetTechnicianJobOrdersParams {
  page?: number;
  per_page?: number;
  status?: JobOrderStatus;
}

export interface GetTechnicianScheduleParams {
  from?: string;
  to?: string;
}

export async function getTechnicianJobOrders(
  params: GetTechnicianJobOrdersParams = {},
): Promise<PaginatedResponse<TechnicianJobOrder>> {
  const response = await api.get<
    PaginatedResponse<TechnicianJobOrder>
  >("/technician/job-orders", {
    params,
  });

  return response.data;
}

export async function getTechnicianJobOrder(
  jobOrderId: number,
): Promise<TechnicianJobOrderResponse> {
  const response = await api.get<TechnicianJobOrderResponse>(
    `/technician/job-orders/${jobOrderId}`,
  );

  return response.data;
}

export async function getTechnicianJobOrderHistory(
  jobOrderId: number,
): Promise<TechnicianJobOrderHistoryResponse> {
  const response =
    await api.get<TechnicianJobOrderHistoryResponse>(
      `/technician/job-orders/${jobOrderId}/status-history`,
    );

  return response.data;
}

export async function getTechnicianSchedule(
  params: GetTechnicianScheduleParams = {},
): Promise<TechnicianScheduleResponse> {
  const response = await api.get<TechnicianScheduleResponse>(
    "/technician/schedule",
    {
      params,
    },
  );

  return response.data;
}

export async function acceptTechnicianSchedule(
  jobOrderId: number,
  payload: AcceptTechnicianSchedulePayload,
): Promise<TechnicianJobOrderResponse> {
  const response = await api.post<TechnicianJobOrderResponse>(
    `/technician/job-orders/${jobOrderId}/accept`,
    payload,
  );

  return response.data;
}

export async function rejectTechnicianSchedule(
  jobOrderId: number,
  payload: RejectTechnicianSchedulePayload,
): Promise<TechnicianJobOrderResponse> {
  const response = await api.post<TechnicianJobOrderResponse>(
    `/technician/job-orders/${jobOrderId}/reject`,
    payload,
  );

  return response.data;
}

export async function startTechnicianWork(
  jobOrderId: number,
  payload: TechnicianJobActionPayload,
): Promise<TechnicianJobOrderResponse> {
  const response = await api.post<TechnicianJobOrderResponse>(
    `/technician/job-orders/${jobOrderId}/start`,
    payload,
  );

  return response.data;
}

export async function completeTechnicianWork(
  jobOrderId: number,
  payload: TechnicianJobActionPayload,
): Promise<TechnicianJobOrderResponse> {
  const response = await api.post<TechnicianJobOrderResponse>(
    `/technician/job-orders/${jobOrderId}/complete`,
    payload,
  );

  return response.data;
}