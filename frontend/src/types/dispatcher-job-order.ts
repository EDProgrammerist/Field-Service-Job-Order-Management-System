import type { CustomerTechnicianProfile } from "@/types/customer-technician";
import type {
  JobOrderCustomer,
  JobOrderPriority,
  JobOrderStatus,
} from "@/types/job-order";

export type DispatcherQueueStatus =
  | "pending_schedule"
  | "pending_technician_response"
  | "technician_rejected";

export interface DispatcherScheduledByUser {
  id: number;
  name: string;
}

export interface DispatcherScheduleRevision {
  id: number;
  version: number;
  scheduled_at: string;
  scheduled_end_at: string;
  remarks: string | null;
  scheduled_by: DispatcherScheduledByUser;
}

export interface DispatcherJobOrder {
  id: number;
  job_order_number: string;
  title: string;
  description: string | null;
  service_address: string | null;
  priority: JobOrderPriority;
  status: DispatcherQueueStatus;
  selected_technician_id: number | null;
  scheduled_at: string | null;
  scheduled_end_at: string | null;
  schedule_version: number;
  created_at: string;
  updated_at: string;
  customer: JobOrderCustomer;
  selected_technician: CustomerTechnicianProfile | null;
  scheduled_by_user: DispatcherScheduledByUser | null;
  latest_schedule_revision: DispatcherScheduleRevision | null;
  can_schedule: boolean;
}

export interface DispatcherJobOrderResponse {
  message: string;
  data: DispatcherJobOrder;
}

export interface ScheduleDispatcherJobOrderPayload {
  scheduled_at: string;
  scheduled_end_at: string;
  remarks: string | null;
}

export interface TechnicianAvailabilityConflict {
  id: number;
  job_order_number: string;
  title: string;
  status: JobOrderStatus;
  scheduled_at: string;
  scheduled_end_at: string;
}

export interface TechnicianAvailability {
  technician_id: number;
  is_active: boolean;
  from: string;
  to: string;
  is_available: boolean;
  conflicts: TechnicianAvailabilityConflict[];
}

export interface TechnicianAvailabilityResponse {
  message: string;
  data: TechnicianAvailability;
}

export interface DispatcherDashboardData {
  pendingScheduleCount: number;
  awaitingTechnicianCount: number;
  rejectedScheduleCount: number;
  activeTechnicianCount: number;
  pendingScheduleRequests: DispatcherJobOrder[];
  rejectedScheduleRequests: DispatcherJobOrder[];
  awaitingTechnicianRequests: DispatcherJobOrder[];
}