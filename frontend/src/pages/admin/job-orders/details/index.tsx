import { useParams } from "react-router";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { AdminJobOrderDetails } from "@/components/features/admin/admin-job-order-details";

export default function AdminJobOrderDetailsPage() {
  const { jobOrderId } = useParams();
  const id = Number(jobOrderId);

  return (
    <DashboardShell>
      {Number.isInteger(id) && id > 0 ? (
        <AdminJobOrderDetails jobOrderId={id} />
      ) : (
        <p className="text-sm text-destructive">
          Invalid job order identifier.
        </p>
      )}
    </DashboardShell>
  );
}