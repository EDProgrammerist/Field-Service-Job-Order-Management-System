import api from "@/lib/axios";
import type {
  AdminJobOrderResponse,
  AdminJobOrdersResponse,
  AdminStatusResponse,
  UpdateAdminJobOrderPayload,
} from "@/types/admin-job-order";
import type {
  JobOrderPriority,
  JobOrderStatus,
  JobOrderStatusHistory,
} from "@/types/job-order";
import type { PaginatedResponse } from "@/types/pagination";

interface AdminJobOrderFilters {
  page?: number;
  per_page?: number;
  status?: JobOrderStatus;
  priority?: JobOrderPriority;
}

export async function getAdminJobOrders(
  params: AdminJobOrderFilters = {},
): Promise<AdminJobOrdersResponse> {
  const response = await api.get<AdminJobOrdersResponse>(
    "/job-orders",
    { params },
  );
  return response.data;
}

export async function getAdminJobOrder(
  id: number,
): Promise<AdminJobOrderResponse> {
  const response = await api.get<AdminJobOrderResponse>(
    `/job-orders/${id}`,
  );
  return response.data;
}

export async function getAdminJobOrderHistory(
  id: number,
): Promise<PaginatedResponse<JobOrderStatusHistory>> {
  const response = await api.get<
    PaginatedResponse<JobOrderStatusHistory>
  >(`/job-orders/${id}/status-history`, {
    params: { per_page: 100 },
  });
  return response.data;
}

export async function updateAdminJobOrder(
  id: number,
  payload: UpdateAdminJobOrderPayload,
): Promise<AdminJobOrderResponse> {
  const response = await api.patch<AdminJobOrderResponse>(
    `/job-orders/${id}`,
    payload,
  );
  return response.data;
}

export async function updateAdminJobOrderStatus(
  id: number,
  status: "cancelled" | "closed",
  remarks: string | null,
): Promise<AdminStatusResponse> {
  const response = await api.patch<AdminStatusResponse>(
    `/job-orders/${id}/status`,
    { status, remarks },
  );
  return response.data;
}