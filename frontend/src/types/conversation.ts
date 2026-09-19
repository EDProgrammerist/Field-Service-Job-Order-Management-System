import type { UserRole } from "@/types/auth";
import type { JobOrderStatus } from "@/types/job-order";

export interface ConversationMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  read_at: string | null;
  is_read: boolean;
  is_mine: boolean;
  created_at: string;
  updated_at: string;
  sender: {
    id: number;
    name: string;
    role: UserRole;
  };
}

export interface ConversationParticipant {
  id: number;
  name: string;
  role: UserRole;
  participant_role: "customer" | "technician";
  last_read_at: string | null;
}

export interface Conversation {
  id: number;
  job_order_id: number;
  unread_messages_count: number;
  created_at: string;
  updated_at: string;
  job_order: {
    id: number;
    job_order_number: string;
    title: string;
    status: JobOrderStatus;
    customer: {
      id: number;
      name: string;
    };
    selected_technician: {
      id: number;
      name: string;
    };
  };
  participants: ConversationParticipant[];
  latest_message: ConversationMessage | null;
}

export interface ConversationResponse {
  message: string;
  data: Conversation;
}

export interface ConversationMessageResponse {
  message: string;
  data: ConversationMessage;
}

export interface MarkConversationReadResponse {
  message: string;
  data: {
    conversation_id: number;
    marked_read_count: number;
  };
}