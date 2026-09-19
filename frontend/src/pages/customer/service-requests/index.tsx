import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { CustomerServiceRequestList } from "@/components/features/customers/customer-service-request-list";

export default function CustomerServiceRequestsPage() {
  return (
    <DashboardShell>
      <CustomerServiceRequestList />
    </DashboardShell>
  );
}