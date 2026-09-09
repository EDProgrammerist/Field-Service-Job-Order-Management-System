import api from "@/lib/axios";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserResponse,
} from "@/types/user";
import type { PaginatedResponse } from "@/types/pagination";

export async function getUsers(
  page = 1,
): Promise<PaginatedResponse<User>> {
  const response = await api.get<PaginatedResponse<User>>("/users", {
    params: {
      page,
    },
  });

  return response.data;
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<UserResponse> {
  const response = await api.post<UserResponse>("/users", payload);

  return response.data;
}

export async function updateUser(
  userId: number,
  payload: UpdateUserPayload,
): Promise<UserResponse> {
  const response = await api.put<UserResponse>(`/users/${userId}`, payload);

  return response.data;
}