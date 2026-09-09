import { useParams } from "react-router";

import { DashboardLayout } from "@/components/common/dashboard-layout";
import { JobOrderDetails } from "@/components/features/job-orders/job-order-details";

export default function AdminJobOrderDetailsPage() {
  const { jobOrderId } = useParams();
  const parsedJobOrderId = Number(jobOrderId);

  if (!Number.isInteger(parsedJobOrderId) || parsedJobOrderId < 1) {
    return null;
  }

  return (
    <DashboardLayout>
      <JobOrderDetails
        jobOrderId={parsedJobOrderId}
        listPath="/admin/job-orders"
        editPath={`/admin/job-orders/${parsedJobOrderId}/edit`}
      />
    </DashboardLayout>
  );
}