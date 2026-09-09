import type { UserRole } from "@/types/auth";

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  password_confirmation: string;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  password_confirmation?: string;
}

export interface UserResponse {
  message: string;
  data: User;
}