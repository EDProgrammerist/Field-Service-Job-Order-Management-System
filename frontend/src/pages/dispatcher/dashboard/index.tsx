import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { DispatcherDashboard } from "@/components/features/dashboard/dispatcher-dashboard";

export default function DispatcherDashboardPage() {
  return (
    <DashboardShell>
      <DispatcherDashboard />
    </DashboardShell>
  );
}