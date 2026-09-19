import type { AdminJobOrder } from "@/types/admin-job-order";

export interface AdminDashboardData {
  totalJobOrders: number;
  pendingScheduleJobOrders: number;
  inProgressJobOrders: number;
  completedJobOrders: number;
  totalCustomers: number;
  totalTechnicians: number;
  recentJobOrders: AdminJobOrder[];
}
