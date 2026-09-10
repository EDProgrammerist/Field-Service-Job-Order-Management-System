import api from "@/lib/axios";
import type {
  AuthenticatedUser,
  CustomerRegistrationPayload,
  CurrentUserResponse,
  LoginPayload,
  LoginResponse,
  LogoutResponse,
} from "@/types/auth";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/login", payload);

  return response.data;
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const response = await api.get<CurrentUserResponse>("/user");

  return response.data.data;
}

export async function logout(): Promise<LogoutResponse> {
  const response = await api.post<LogoutResponse>("/logout");

  return response.data;
}

export async function registerCustomer(
  payload: CustomerRegistrationPayload,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/customer/register", payload);

  return response.data;
}
