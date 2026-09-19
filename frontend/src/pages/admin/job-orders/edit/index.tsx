import { useParams } from "react-router";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { AdminJobOrderEditForm } from "@/components/features/admin/admin-job-order-edit-form";

export default function AdminEditJobOrderPage() {
  const { jobOrderId } = useParams();
  const id = Number(jobOrderId);

  return (
    <DashboardShell>
      <section className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Operations
          </p>
          <h1 className="mt-1 text-2xl font-semibold">
            Edit Job Order
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update permitted request details and priority.
          </p>
        </div>

        {Number.isInteger(id) && id > 0 ? (
          <AdminJobOrderEditForm jobOrderId={id} />
        ) : (
          <p className="text-sm text-destructive">
            Invalid job order identifier.
          </p>
        )}
      </section>
    </DashboardShell>
  );
}