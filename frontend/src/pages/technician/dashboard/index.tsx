import { DashboardLayout } from "@/components/common/dashboard-layout";
import { TechnicianDashboard } from "@/components/features/dashboard/technician-dashboard";

export default function TechnicianDashboardPage() {
  return (
    <DashboardLayout>
      <TechnicianDashboard />
    </DashboardLayout>
  );
}