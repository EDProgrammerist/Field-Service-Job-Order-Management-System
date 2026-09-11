export interface Customer {
  id: number;
  user_id: number | null;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerPayload {
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string;
  address: string | null;
}

export interface CustomerResponse {
  message: string;
  data: Customer;
}

export interface DeleteCustomerResponse {
  message: string;
}