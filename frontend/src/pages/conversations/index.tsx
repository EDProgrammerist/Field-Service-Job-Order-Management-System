import { DashboardLayout } from "@/components/common/dashboard-layout";
import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { ConversationInbox } from "@/components/features/conversations/conversation-inbox";
import { useAuth } from "@/contexts/auth-context";

export default function ConversationsPage() {
  const { user } = useAuth();

  if (user?.role === "customer") {
    return (
      <DashboardLayout>
        <ConversationInbox />
      </DashboardLayout>
    );
  }

  return (
    <DashboardShell>
      <ConversationInbox />
    </DashboardShell>
  );
}