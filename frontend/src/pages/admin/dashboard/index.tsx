import { DashboardLayout } from "@/components/common/dashboard-layout";
import { AdminDashboard } from "@/components/features/dashboard/admin-dashboard";

export default function AdminDashboardPage() {
  return (
    <DashboardLayout>
      <AdminDashboard />
    </DashboardLayout>
  );
}