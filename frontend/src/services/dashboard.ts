import api from "@/lib/axios";
import type { AdminDashboardData } from "@/types/dashboard";
import type { JobOrder, JobOrderStatus } from "@/types/job-order";
import type { PaginatedResponse } from "@/types/pagination";

async function getCollectionTotal(
  endpoint: string,
  params?: Record<string, number | string>,
): Promise<number> {
  const response = await api.get<PaginatedResponse<unknown>>(endpoint, {
    params: {
      per_page: 1,
      ...params,
    },
  });

  return response.data.data.total;
}

async function getJobOrderTotal(status?: JobOrderStatus): Promise<number> {
  return getCollectionTotal(
    "/job-orders",
    status ? { status } : undefined,
  );
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [
    recentJobOrdersResponse,
    totalJobOrders,
    createdJobOrders,
    inProgressJobOrders,
    completedJobOrders,
    totalCustomers,
    totalTechnicians,
  ] = await Promise.all([
    api.get<PaginatedResponse<JobOrder>>("/job-orders", {
      params: {
        per_page: 5,
      },
    }),
    getJobOrderTotal(),
    getJobOrderTotal("created"),
    getJobOrderTotal("in_progress"),
    getJobOrderTotal("completed"),
    getCollectionTotal("/customers"),
    getCollectionTotal("/technicians"),
  ]);

  return {
    totalJobOrders,
    createdJobOrders,
    inProgressJobOrders,
    completedJobOrders,
    totalCustomers,
    totalTechnicians,
    recentJobOrders: recentJobOrdersResponse.data.data.data,
  };
}