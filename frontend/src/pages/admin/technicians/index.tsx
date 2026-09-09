import { DashboardLayout } from "@/components/common/dashboard-layout";
import { TechnicianManagement } from "@/components/features/technicians/technician-management";

export default function AdminTechniciansPage() {
  return (
    <DashboardLayout>
      <TechnicianManagement />
    </DashboardLayout>
  );
}