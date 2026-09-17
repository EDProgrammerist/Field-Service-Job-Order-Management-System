import { ClipboardList } from "lucide-react";
import { useParams } from "react-router";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { DispatcherJobOrderDetails } from "@/components/features/dispatcher/dispatcher-job-order-details";
import { DispatcherPage } from "@/components/features/dispatcher/dispatcher-page";

export default function DispatcherJobOrderDetailsPage() {
  const { jobOrderId } = useParams();
  const parsedJobOrderId = Number(jobOrderId);

  if (
    !Number.isInteger(parsedJobOrderId) ||
    parsedJobOrderId < 1
  ) {
    return null;
  }

  return (
    <DashboardShell>
      <DispatcherPage
        backHref="/dispatcher/job-orders"
        description="Review the service request, customer-selected technician, and official scheduling history."
        icon={ClipboardList}
        title="Scheduling request"
      >
        <DispatcherJobOrderDetails
          jobOrderId={parsedJobOrderId}
        />
      </DispatcherPage>
    </DashboardShell>
  );
}