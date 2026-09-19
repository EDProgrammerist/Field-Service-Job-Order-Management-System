import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { ConversationInbox } from "@/components/features/conversations/conversation-inbox";

export default function ConversationsPage() {
  return (
    <DashboardShell>
      <ConversationInbox />
    </DashboardShell>
  );
}