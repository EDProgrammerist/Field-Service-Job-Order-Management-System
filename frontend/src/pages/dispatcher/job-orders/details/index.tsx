import { useParams } from "react-router";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { DispatcherSurface } from "@/components/features/dispatcher/dispatcher-page";
import { JobOrderDetails } from "@/components/features/job-orders/job-order-details";

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
      <DispatcherSurface>
        <JobOrderDetails
          jobOrderId={parsedJobOrderId}
          listPath="/dispatcher/job-orders"
          editPath={`/dispatcher/job-orders/${parsedJobOrderId}/edit`}
        />
      </DispatcherSurface>
    </DashboardShell>
  );
}