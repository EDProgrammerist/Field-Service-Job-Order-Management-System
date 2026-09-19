import { useParams } from "react-router";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { ConversationThread } from "@/components/features/conversations/conversation-thread";

export default function JobOrderConversationPage() {
  const { jobOrderId } = useParams();
  const parsedJobOrderId = Number(jobOrderId);

  return (
    <DashboardShell>
      {Number.isInteger(parsedJobOrderId) && parsedJobOrderId > 0 ? (
        <ConversationThread jobOrderId={parsedJobOrderId} />
      ) : (
        <p className="text-sm text-destructive" role="alert">
          Invalid service request identifier.
        </p>
      )}
    </DashboardShell>
  );
}