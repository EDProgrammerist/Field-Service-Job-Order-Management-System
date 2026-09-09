import { DashboardLayout } from "@/components/common/dashboard-layout";
import { DispatcherDashboard } from "@/components/features/dashboard/dispatcher-dashboard";

export default function DispatcherDashboardPage() {
  return (
    <DashboardLayout>
      <DispatcherDashboard />
    </DashboardLayout>
  );
}