import type { JobOrder } from "@/types/job-order";

export interface AdminDashboardData {
  totalJobOrders: number;
  createdJobOrders: number;
  inProgressJobOrders: number;
  completedJobOrders: number;
  totalCustomers: number;
  totalTechnicians: number;
  recentJobOrders: JobOrder[];
}