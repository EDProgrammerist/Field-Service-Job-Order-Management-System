import api from "@/lib/axios";
import type {
  Conversation,
  ConversationMessage,
  ConversationMessageResponse,
  ConversationResponse,
  ConversationScope,
  MarkConversationReadResponse,
} from "@/types/conversation";
import type { PaginatedResponse } from "@/types/pagination";

interface PaginationParams {
  page?: number;
  per_page?: number;
}

interface GetConversationsParams extends PaginationParams {
  scope?: ConversationScope;
}

export async function getConversations(
  params: GetConversationsParams = {},
): Promise<PaginatedResponse<Conversation>> {
  const response = await api.get<PaginatedResponse<Conversation>>(
    "/conversations",
    { params },
  );

  return response.data;
}

export async function getConversation(
  conversationId: number,
): Promise<ConversationResponse> {
  const response = await api.get<ConversationResponse>(
    `/conversations/${conversationId}`,
  );

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
  const response = await api.post<ConversationMessageResponse>(
    `/conversations/${conversationId}/messages`,
    { body },
  );

  return response.data;
}

export async function markConversationRead(
  conversationId: number,
): Promise<MarkConversationReadResponse> {
  const response = await api.patch<MarkConversationReadResponse>(
    `/conversations/${conversationId}/read`,
  );

  return response.data;
}