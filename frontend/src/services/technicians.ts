import api from "@/lib/axios";
import type {
  CreateTechnicianPayload,
  Technician,
  TechnicianResponse,
  TechnicianUser,
  TechnicianPayload,
} from "@/types/technician";
import type { PaginatedResponse } from "@/types/pagination";

interface GetTechniciansParams {
  page?: number;
  per_page?: number;
  is_active?: boolean;
}

interface UserListResponse {
  message: string;
  data: {
    current_page: number;
    data: TechnicianUser[];
    last_page: number;
  };
}

export async function getTechnicians(
  params: GetTechniciansParams = {},
): Promise<PaginatedResponse<Technician>> {
  const response = await api.get<PaginatedResponse<Technician>>(
    "/technicians",
    { params },
  );

  return response.data;
}

export async function getTechnicianUsers(): Promise<TechnicianUser[]> {
  const firstResponse = await api.get<UserListResponse>("/users");
  const firstPage = firstResponse.data.data;

  const remainingPageRequests = Array.from(
    { length: Math.max(firstPage.last_page - 1, 0) },
    (_, index) =>
      api.get<UserListResponse>("/users", {
        params: { page: index + 2 },
      }),
  );

  const remainingResponses = await Promise.all(remainingPageRequests);

  const users = [
    ...firstPage.data,
    ...remainingResponses.flatMap((response) => response.data.data.data),
  ];

  return users.filter((user) => user.role === "technician");
}

export async function createTechnician(
  payload: CreateTechnicianPayload,
): Promise<TechnicianResponse> {
  const response = await api.post<TechnicianResponse>("/technicians", payload);

  return response.data;
}

export async function updateTechnician(
  technicianId: number,
  payload: TechnicianPayload,
): Promise<TechnicianResponse> {
  const response = await api.put<TechnicianResponse>(
    `/technicians/${technicianId}`,
    payload,
  );

  return response.data;
}