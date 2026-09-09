export type JobOrderPriority = "low" | "normal" | "high" | "urgent";

export type JobOrderStatus =
  | "created"
  | "assigned"
  | "in_progress"
  | "completed"
  | "closed"
  | "cancelled";

export interface JobOrderCustomer {
  id: number;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string;
}

export interface JobOrder {
  id: number;
  job_order_number: string;
  customer_id: number;
  created_by: number;
  title: string;
  description: string | null;
  service_address: string | null;
  priority: JobOrderPriority;
  status: JobOrderStatus;
  scheduled_at: string | null;
  completed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  customer: JobOrderCustomer;
}