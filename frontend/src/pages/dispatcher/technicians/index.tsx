import { UsersRound } from "lucide-react";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { DispatcherPage } from "@/components/features/dispatcher/dispatcher-page";
import { DispatcherTechnicianDirectory } from "@/components/features/dispatcher/dispatcher-technician-directory";

export default function DispatcherTechniciansPage() {
  return (
    <DashboardShell>
      <DispatcherPage
        description="Review technician profiles, contact details, and specializations."
        hideFeatureHeader
        icon={UsersRound}
        title="Technicians"
      >
        <DispatcherTechnicianDirectory />
      </DispatcherPage>
    </DashboardShell>
  );
}