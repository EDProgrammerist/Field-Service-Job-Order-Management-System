import { DashboardLayout } from "@/components/common/dashboard-layout";
import { TechnicianManagement } from "@/components/features/technicians/technician-management";

export default function DispatcherTechniciansPage() {
  return (
    <DashboardLayout>
      <TechnicianManagement />
    </DashboardLayout>
  );
}