import { UsersRound } from "lucide-react";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { DispatcherPage } from "@/components/features/dispatcher/dispatcher-page";
import { TechnicianManagement } from "@/components/features/technicians/technician-management";

export default function DispatcherTechniciansPage() {
  return (
    <DashboardShell>
      <DispatcherPage
        description="Review technician availability, contact information, and service specializations."
        hideFeatureHeader
        icon={UsersRound}
        title="Technicians"
      >
        <TechnicianManagement />
      </DispatcherPage>
    </DashboardShell>
  );
}