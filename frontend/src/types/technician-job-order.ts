import type {
  JobOrderCustomer,
  JobOrderPriority,
  JobOrderStatus,
  JobOrderStatusHistory,
} from "@/types/job-order";

export interface TechnicianScheduleRevision {
  id: number;
  version: number;
  scheduled_at: string;
  scheduled_end_at: string;
  remarks: string | null;
}

export interface TechnicianResponseRecord {
  id: number;
  response: "accepted" | "rejected";
  response_notes: string | null;
  responded_at: string;
}

export interface TechnicianAllowedActions {
  accept: boolean;
  reject: boolean;
  start: boolean;
  complete: boolean;
}

export interface TechnicianJobOrder {
  id: number;
  job_order_number: string;
  title: string;
  description: string | null;
  service_address: string | null;
  priority: JobOrderPriority;
  status: JobOrderStatus;
  selected_technician_id: number;
  scheduled_at: string | null;
  scheduled_end_at: string | null;
  schedule_version: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  customer: JobOrderCustomer;
  latest_schedule_revision: TechnicianScheduleRevision | null;
  latest_technician_response: TechnicianResponseRecord | null;
  allowed_actions: TechnicianAllowedActions;
}

export interface TechnicianJobOrderResponse {
  message: string;
  data: TechnicianJobOrder;
}

export interface TechnicianJobOrderHistoryResponse {
  message: string;
  data: JobOrderStatusHistory[];
}

export interface TechnicianScheduleResponse {
  message: string;
  data: {
    from: string;
    to: string;
    job_orders: TechnicianJobOrder[];
  };
}

export interface AcceptTechnicianSchedulePayload {
  schedule_version: number;
  remarks: string | null;
}

export interface RejectTechnicianSchedulePayload {
  schedule_version: number;
  reason: string;
}

export interface TechnicianJobActionPayload {
  remarks: string | null;
}