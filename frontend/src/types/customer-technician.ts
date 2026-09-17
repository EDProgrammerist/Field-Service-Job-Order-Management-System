import type { ResourceCollectionResponse } from "@/types/pagination";

export interface CustomerTechnicianProfile {
  id: number;
  name: string;
  employee_number: string;
  profile_photo_url: string | null;
  introduction: string | null;
  specialization: string | null;
  qualifications: string | null;
  phone: string | null;
  availability_notes: string | null;
  is_active: boolean;
}

export type CustomerTechnicianCollectionResponse =
  ResourceCollectionResponse<CustomerTechnicianProfile>;

export interface CustomerTechnicianResponse {
  data: CustomerTechnicianProfile;
  message: string;
}