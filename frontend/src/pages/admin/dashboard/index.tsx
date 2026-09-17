import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { AdminDashboard } from "@/components/features/dashboard/admin-dashboard";

export default function AdminDashboardPage() {
  return (
    <DashboardShell>
      <AdminDashboard />
    </DashboardShell>
  );
}
