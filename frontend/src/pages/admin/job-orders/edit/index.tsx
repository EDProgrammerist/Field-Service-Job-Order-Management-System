import { useParams } from "react-router";

import { DashboardLayout } from "@/components/common/dashboard-layout";
import { JobOrderForm } from "@/components/features/job-orders/job-order-form";

export default function AdminEditJobOrderPage() {
  const { jobOrderId } = useParams();
  const parsedJobOrderId = Number(jobOrderId);

  if (!Number.isInteger(parsedJobOrderId) || parsedJobOrderId < 1) {
    return null;
  }

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Operations
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Edit Job Order
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Update the customer, service details, priority, or schedule.
          </p>
        </div>

        <JobOrderForm
          jobOrderId={parsedJobOrderId}
          listPath="/admin/job-orders"
        />
      </section>
    </DashboardLayout>
  );
}