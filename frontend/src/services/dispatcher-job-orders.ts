import api from "@/lib/axios";
import { getTechnicians } from "@/services/technicians";
import type {
  DispatcherDashboardData,
  DispatcherJobOrder,
  DispatcherJobOrderResponse,
  DispatcherQueueStatus,
  ScheduleDispatcherJobOrderPayload,
  TechnicianAvailabilityResponse,
} from "@/types/dispatcher-job-order";
import type { JobOrderStatusHistory } from "@/types/job-order";
import type { PaginatedResponse } from "@/types/pagination";

export interface GetDispatcherJobOrdersParams {
  page?: number;
  per_page?: number;
  status?: DispatcherQueueStatus;
}

export async function getDispatcherJobOrders(
  params: GetDispatcherJobOrdersParams = {},
): Promise<PaginatedResponse<DispatcherJobOrder>> {
  const response = await api.get<
    PaginatedResponse<DispatcherJobOrder>
  >("/dispatcher/job-orders", {
    params,
  });

  return response.data;
}

export async function getDispatcherJobOrder(
  jobOrderId: number,
): Promise<DispatcherJobOrderResponse> {
  const response = await api.get<DispatcherJobOrderResponse>(
    `/dispatcher/job-orders/${jobOrderId}`,
  );

  return response.data;
}

export async function scheduleDispatcherJobOrder(
  jobOrderId: number,
  payload: ScheduleDispatcherJobOrderPayload,
): Promise<DispatcherJobOrderResponse> {
  const response = await api.patch<DispatcherJobOrderResponse>(
    `/dispatcher/job-orders/${jobOrderId}/schedule`,
    payload,
  );

  return response.data;
}

export async function getDispatcherTechnicianAvailability(
  technicianId: number,
  from: string,
  to: string,
): Promise<TechnicianAvailabilityResponse> {
  const response = await api.get<TechnicianAvailabilityResponse>(
    `/dispatcher/technicians/${technicianId}/availability`,
    {
      params: {
        from,
        to,
      },
    },
  );

  return response.data;
}

export async function getDispatcherJobOrderStatusHistory(
  jobOrderId: number,
): Promise<PaginatedResponse<JobOrderStatusHistory>> {
  const response = await api.get<
    PaginatedResponse<JobOrderStatusHistory>
  >(`/job-orders/${jobOrderId}/status-history`, {
    params: {
      per_page: 100,
    },
  });

  return response.data;
}

export async function getDispatcherDashboardData(): Promise<DispatcherDashboardData> {
  const [
    pendingScheduleResponse,
    awaitingTechnicianResponse,
    rejectedScheduleResponse,
    activeTechniciansResponse,
  ] = await Promise.all([
    getDispatcherJobOrders({
      status: "pending_schedule",
      per_page: 5,
    }),
    getDispatcherJobOrders({
      status: "pending_technician_response",
      per_page: 5,
    }),
    getDispatcherJobOrders({
      status: "technician_rejected",
      per_page: 5,
    }),
    getTechnicians({
      is_active: true,
      per_page: 1,
    }),
  ]);

  return {
    pendingScheduleCount: pendingScheduleResponse.data.total,
    awaitingTechnicianCount:
      awaitingTechnicianResponse.data.total,
    rejectedScheduleCount: rejectedScheduleResponse.data.total,
    activeTechnicianCount: activeTechniciansResponse.data.total,
    pendingScheduleRequests:
      pendingScheduleResponse.data.data,
    rejectedScheduleRequests:
      rejectedScheduleResponse.data.data,
    awaitingTechnicianRequests:
      awaitingTechnicianResponse.data.data,
  };
}