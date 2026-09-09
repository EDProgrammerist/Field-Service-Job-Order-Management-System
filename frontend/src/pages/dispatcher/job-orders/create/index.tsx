import { DashboardLayout } from "@/components/common/dashboard-layout";
import { JobOrderForm } from "@/components/features/job-orders/job-order-form";

export default function DispatcherCreateJobOrderPage() {
  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Operations
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Create Job Order
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Add a new customer service request.
          </p>
        </div>

        <JobOrderForm listPath="/dispatcher/job-orders" />
      </section>
    </DashboardLayout>
  );
}