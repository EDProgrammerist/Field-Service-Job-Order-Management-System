import api from "@/lib/axios";
import type {
  Conversation,
  ConversationMessage,
  ConversationMessageResponse,
  ConversationResponse,
  MarkConversationReadResponse,
} from "@/types/conversation";
import type { PaginatedResponse } from "@/types/pagination";

interface PaginationParams {
  page?: number;
  per_page?: number;
}

export async function getConversations(
  params: PaginationParams = {},
): Promise<PaginatedResponse<Conversation>> {
  const response = await api.get<
    PaginatedResponse<Conversation>
  >("/conversations", {
    params,
  });

  return response.data;
}

export async function getJobOrderConversation(
  jobOrderId: number,
): Promise<ConversationResponse> {
  const response = await api.get<ConversationResponse>(
    `/job-orders/${jobOrderId}/conversation`,
  );

  return response.data;
}

export async function getConversationMessages(
  conversationId: number,
  params: PaginationParams = {},
): Promise<PaginatedResponse<ConversationMessage>> {
  const response = await api.get<
    PaginatedResponse<ConversationMessage>
  >(`/conversations/${conversationId}/messages`, {
    params,
  });

  return response.data;
}

export async function sendConversationMessage(
  conversationId: number,
  body: string,
): Promise<ConversationMessageResponse> {
  const response = await api.post<
    ConversationMessageResponse
  >(`/conversations/${conversationId}/messages`, {
    body,
  });

  return response.data;
}

export async function markConversationRead(
  conversationId: number,
): Promise<MarkConversationReadResponse> {
  const response =
    await api.patch<MarkConversationReadResponse>(
      `/conversations/${conversationId}/read`,
    );

  return response.data;
}