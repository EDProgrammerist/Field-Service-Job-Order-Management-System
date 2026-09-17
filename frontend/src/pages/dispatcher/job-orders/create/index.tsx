import { FilePlus2 } from "lucide-react";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { DispatcherPage } from "@/components/features/dispatcher/dispatcher-page";
import { JobOrderForm } from "@/components/features/job-orders/job-order-form";

export default function DispatcherCreateJobOrderPage() {
  return (
    <DashboardShell>
      <DispatcherPage
        backHref="/dispatcher/job-orders"
        description="Record the customer, service location, priority, and preferred schedule."
        icon={FilePlus2}
        title="Create job order"
      >
        <JobOrderForm listPath="/dispatcher/job-orders" />
      </DispatcherPage>
    </DashboardShell>
  );
}