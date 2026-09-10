import { useParams } from "react-router";

import { DashboardLayout } from "@/components/common/dashboard-layout";
import { CustomerServiceRequestDetails } from "@/components/features/customers/customer-service-request-details";

export default function CustomerServiceRequestDetailsPage() {
  const { jobOrderId } = useParams();

  const parsedJobOrderId = Number(jobOrderId);

  if (!Number.isInteger(parsedJobOrderId) || parsedJobOrderId <= 0) {
    return (
      <DashboardLayout>
        <p className="text-sm text-destructive">
          Invalid service request identifier.
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <CustomerServiceRequestDetails jobOrderId={parsedJobOrderId} />
    </DashboardLayout>
  );
}