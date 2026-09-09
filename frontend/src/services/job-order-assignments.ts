import api from "@/lib/axios";
import type {
  CreateJobOrderAssignmentPayload,
  JobOrderAssignment,
  JobOrderAssignmentResponse,
} from "@/types/job-order-assignment";
import type { PaginatedResponse } from "@/types/pagination";

export async function getJobOrderAssignments(
  jobOrderId: number,
): Promise<PaginatedResponse<JobOrderAssignment>> {
  const response = await api.get<PaginatedResponse<JobOrderAssignment>>(
    `/job-orders/${jobOrderId}/assignments`,
    {
      params: {
        per_page: 100,
      },
    },
  );

  return response.data;
}

export async function assignJobOrder(
  jobOrderId: number,
  payload: CreateJobOrderAssignmentPayload,
): Promise<JobOrderAssignmentResponse> {
  const response = await api.post<JobOrderAssignmentResponse>(
    `/job-orders/${jobOrderId}/assignments`,
    payload,
  );

  return response.data;
}

export async function unassignJobOrder(
  assignmentId: number,
): Promise<JobOrderAssignmentResponse> {
  const response = await api.patch<JobOrderAssignmentResponse>(
    `/job-order-assignments/${assignmentId}/unassign`,
  );

  return response.data;
}