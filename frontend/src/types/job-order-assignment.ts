import type {
  JobOrderCreator,
  JobOrderStatus,
  JobOrderTechnician,
} from "@/types/job-order";

export interface JobOrderAssignmentJobOrder {
  id: number;
  job_order_number: string;
  status: JobOrderStatus;
}

export interface JobOrderAssignment {
  id: number;
  job_order_id: number;
  technician_id: number;
  assigned_by: JobOrderCreator;
  assigned_at: string;
  unassigned_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  technician: JobOrderTechnician;
  job_order?: JobOrderAssignmentJobOrder;
}

export interface CreateJobOrderAssignmentPayload {
  technician_id: number;
  notes: string | null;
}

export interface JobOrderAssignmentResponse {
  message: string;
  data: JobOrderAssignment;
}