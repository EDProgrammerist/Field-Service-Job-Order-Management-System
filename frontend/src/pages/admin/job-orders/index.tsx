import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { AdminJobOrderList } from "@/components/features/admin/admin-job-order-list";

export default function AdminJobOrdersPage() {
  return (
    <DashboardShell>
      <AdminJobOrderList />
    </DashboardShell>
  );
}