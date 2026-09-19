import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { TechnicianSchedule } from "@/components/features/technician/technician-schedule";

export default function TechnicianSchedulePage() {
  return (
    <DashboardShell>
      <TechnicianSchedule />
    </DashboardShell>
  );
}