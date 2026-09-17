import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { TechnicianManagement } from "@/components/features/technicians/technician-management";

export default function AdminTechniciansPage() {
  return (
    <DashboardShell>
      <TechnicianManagement />
    </DashboardShell>
  );
}
