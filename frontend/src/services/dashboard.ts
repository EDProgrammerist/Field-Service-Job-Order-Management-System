import api from "@/lib/axios";
import { getAdminJobOrders } from "@/services/admin-job-orders";
import type { AdminDashboardData } from "@/types/dashboard";
import type { PaginatedResponse } from "@/types/pagination";

async function getCollectionTotal(
  endpoint: string,
): Promise<number> {
  const response = await api.get<
    PaginatedResponse<unknown>
  >(endpoint, {
    params: { per_page: 1 },
  });
  return response.data.data.total;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [
    recent,
    pending,
    inProgress,
    completed,
    customers,
    technicians,
  ] = await Promise.all([
    getAdminJobOrders({ per_page: 5 }),
    getAdminJobOrders({
      per_page: 1,
      status: "pending_schedule",
    }),
    getAdminJobOrders({
      per_page: 1,
      status: "in_progress",
    }),
    getAdminJobOrders({
      per_page: 1,
      status: "completed",
    }),
    getCollectionTotal("/customers"),
    getCollectionTotal("/technicians"),
  ]);

  return {
    totalJobOrders: recent.data.total,
    pendingScheduleJobOrders: pending.data.total,
    inProgressJobOrders: inProgress.data.total,
    completedJobOrders: completed.data.total,
    totalCustomers: customers,
    totalTechnicians: technicians,
    recentJobOrders: recent.data.data,
  };
}