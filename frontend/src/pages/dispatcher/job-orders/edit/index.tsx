import { Pencil } from "lucide-react";
import { useParams } from "react-router";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { DispatcherPage } from "@/components/features/dispatcher/dispatcher-page";
import { JobOrderForm } from "@/components/features/job-orders/job-order-form";

export default function DispatcherEditJobOrderPage() {
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
        backHref={`/dispatcher/job-orders/${parsedJobOrderId}`}
        description="Update the customer, service information, priority, or schedule."
        icon={Pencil}
        title="Edit job order"
      >
        <JobOrderForm
          jobOrderId={parsedJobOrderId}
          listPath="/dispatcher/job-orders"
        />
      </DispatcherPage>
    </DashboardShell>
  );
}