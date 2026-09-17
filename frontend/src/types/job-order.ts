import type { UserRole } from "@/types/auth";
import type { CustomerTechnicianProfile } from "@/types/customer-technician";

export type JobOrderPriority = "low" | "normal" | "high" | "urgent";

export type WorkflowJobOrderStatus =
  | "pending_schedule"
  | "pending_technician_response"
  | "accepted"
  | "technician_rejected"
  | "in_progress"
  | "completed"
  | "closed"
  | "cancelled";

export type LegacyJobOrderStatus =
  | "pending_review"
  | "created"
  | "assigned";

export type JobOrderStatus =
  | WorkflowJobOrderStatus
  | LegacyJobOrderStatus;

export interface JobOrderCustomer {
  id: number;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string;
}

export interface JobOrderCreator {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface JobOrderTechnicianUser {
  id: number;
  name: string;
  email: string;
  role: "technician";
}

export interface JobOrderTechnician {
  id: number;
  employee_number: string;
  phone: string | null;
  specialization: string | null;
  is_active: boolean;
  user: JobOrderTechnicianUser;
}

export interface ActiveJobOrderAssignment {
  id: number;
  job_order_id: number;
  technician_id: number;
  assigned_by: number;
  assigned_at: string;
  unassigned_at: string | null;
  notes: string | null;
  technician: JobOrderTechnician;
}

export interface JobOrderStatusHistory {
  id: number;
  job_order_id: number;
  previous_status: JobOrderStatus | null;
  status: JobOrderStatus;
  action: string;
  changed_by: JobOrderCreator;
  remarks: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface JobOrder {
  id: number;
  job_order_number: string;
  customer_id: number;
  selected_technician_id: number | null;
  created_by: number;
  title: string;
  description: string | null;
  service_address: string | null;
  priority: JobOrderPriority;
  status: JobOrderStatus;
  scheduled_at: string | null;
  scheduled_end_at: string | null;
  schedule_version: number;
  scheduled_by: number | null;
  completed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  customer: JobOrderCustomer;
  creator: JobOrderCreator;
  selected_technician: CustomerTechnicianProfile | null;

  /**
   * Temporary backend compatibility field.
   * New UI must use selected_technician instead.
   */
  active_assignment: ActiveJobOrderAssignment | null;
}

export interface CreateJobOrderPayload {
  customer_id: number;
  title: string;
  description: string | null;
  service_address: string | null;
  priority: JobOrderPriority;
  scheduled_at: string | null;
}

export type UpdateJobOrderPayload = CreateJobOrderPayload;

export interface CustomerServiceRequestPayload {
  selected_technician_id: number;
  title: string;
  description: string;
  service_address: string;
}

export interface UpdateJobOrderStatusPayload {
  status: JobOrderStatus;
  remarks: string | null;
}

export interface JobOrderResponse {
  message: string;
  data: JobOrder;
}

export interface DeleteJobOrderResponse {
  message: string;
}

export interface UpdateJobOrderStatusResponse {
  message: string;
  data: {
    job_order: JobOrder;
    status_history: JobOrderStatusHistory;
  };
}

export interface CustomerServiceRequestDetails extends JobOrder {
  status_histories: JobOrderStatusHistory[];
}

export interface CustomerServiceRequestDetailsResponse {
  message: string;
  data: CustomerServiceRequestDetails;
}