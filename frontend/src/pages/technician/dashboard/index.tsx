import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { TechnicianDashboard } from "@/components/features/dashboard/technician-dashboard";

export default function TechnicianDashboardPage() {
  return (
    <DashboardShell>
      <TechnicianDashboard />
    </DashboardShell>
  );
}