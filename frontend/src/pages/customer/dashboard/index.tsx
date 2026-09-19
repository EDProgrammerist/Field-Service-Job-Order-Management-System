import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { CustomerDashboard } from "@/components/features/dashboard/customer-dashboard";

export default function CustomerDashboardPage() {
  return (
    <DashboardShell>
      <CustomerDashboard />
    </DashboardShell>
  );
}