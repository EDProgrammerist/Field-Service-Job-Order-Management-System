import { useParams } from "react-router";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { CustomerServiceRequestDetails } from "@/components/features/customers/customer-service-request-details";

export default function CustomerServiceRequestDetailsPage() {
  const { jobOrderId } = useParams();

  const parsedJobOrderId = Number(jobOrderId);

  if (!Number.isInteger(parsedJobOrderId) || parsedJobOrderId <= 0) {
    return (
      <DashboardShell>
        <p className="text-sm text-destructive">
          Invalid service request identifier.
        </p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <CustomerServiceRequestDetails jobOrderId={parsedJobOrderId} />
    </DashboardShell>
  );
}