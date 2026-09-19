import type {
  JobOrderPriority,
  JobOrderStatus,
  JobOrderStatusHistory,
} from "@/types/job-order";
import type { PaginatedResponse } from "@/types/pagination";

export interface AdminJobOrder {
  id: number;
  job_order_number: string;
  title: string;
  description: string | null;
  service_address: string | null;
  priority: JobOrderPriority;
  status: JobOrderStatus;
  scheduled_at: string | null;
  scheduled_end_at: string | null;
  schedule_version: number;
  completed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  customer: {
    id: number;
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string;
  };
  creator: {
    id: number;
    name: string;
  };
  selected_technician: {
    id: number;
    employee_number: string;
    phone: string | null;
    user: {
      id: number;
      name: string;
      email: string;
    };
  } | null;
}

export interface UpdateAdminJobOrderPayload {
  title: string;
  description: string | null;
  service_address: string;
  priority: JobOrderPriority;
}

export interface AdminJobOrderResponse {
  message: string;
  data: AdminJobOrder;
}

export interface AdminStatusResponse {
  message: string;
  data: {
    job_order: AdminJobOrder;
    status_history: JobOrderStatusHistory;
  };
}

export type AdminJobOrdersResponse =
  PaginatedResponse<AdminJobOrder>;