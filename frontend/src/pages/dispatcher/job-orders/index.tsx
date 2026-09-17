import { ClipboardList } from "lucide-react";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { DispatcherJobOrderList } from "@/components/features/dispatcher/dispatcher-job-order-list";
import { DispatcherPage } from "@/components/features/dispatcher/dispatcher-page";

export default function DispatcherJobOrdersPage() {
  return (
    <DashboardShell>
      <DispatcherPage
        description="Review requests that need scheduling, reschedule rejected requests, and monitor technician responses."
        icon={ClipboardList}
        title="Scheduling queue"
      >
        <DispatcherJobOrderList />
      </DispatcherPage>
    </DashboardShell>
  );
}