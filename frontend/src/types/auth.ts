export type UserRole = "admin" | "dispatcher" | "technician" | "customer";

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  device_name?: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: AuthenticatedUser;
    token: string;
    token_type: "Bearer";
  };
}

export interface CurrentUserResponse {
  message: string;
  data: AuthenticatedUser;
}

export interface LogoutResponse {
  message: string;
}

export interface CustomerRegistrationPayload {
  name: string;
  email: string;
  phone: string;
  address: string | null;
  password: string;
  password_confirmation: string;
  device_name?: string;
}
