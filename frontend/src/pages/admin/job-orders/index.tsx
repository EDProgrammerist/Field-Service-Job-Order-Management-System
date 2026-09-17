import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { JobOrderList } from "@/components/features/job-orders/job-order-list";

export default function AdminJobOrdersPage() {
  return (
    <DashboardShell>
      <JobOrderList />
    </DashboardShell>
  );
}
