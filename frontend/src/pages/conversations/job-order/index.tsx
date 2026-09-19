import { useParams } from "react-router";

import { DashboardLayout } from "@/components/common/dashboard-layout";
import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { ConversationThread } from "@/components/features/conversations/conversation-thread";
import { useAuth } from "@/contexts/auth-context";

export default function JobOrderConversationPage() {
  const { user } = useAuth();
  const { jobOrderId } = useParams();
  const parsedJobOrderId = Number(jobOrderId);

  const content =
    Number.isInteger(parsedJobOrderId) &&
    parsedJobOrderId > 0 ? (
      <ConversationThread
        jobOrderId={parsedJobOrderId}
      />
    ) : (
      <p className="text-sm text-destructive">
        Invalid service request identifier.
      </p>
    );

  if (user?.role === "customer") {
    return (
      <DashboardLayout>{content}</DashboardLayout>
    );
  }

  return <DashboardShell>{content}</DashboardShell>;
}