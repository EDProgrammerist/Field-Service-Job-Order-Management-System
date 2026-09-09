export interface TechnicianUser {
  id: number;
  name: string;
  email: string;
  role: "technician";
}

export interface Technician {
  id: number;
  user_id: number;
  employee_number: string;
  phone: string | null;
  specialization: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user: TechnicianUser;
}

export interface TechnicianPayload {
  employee_number: string;
  phone: string | null;
  specialization: string | null;
  is_active: boolean;
}

export interface CreateTechnicianPayload extends TechnicianPayload {
  user_id: number;
}

export interface TechnicianResponse {
  message: string;
  data: Technician;
}