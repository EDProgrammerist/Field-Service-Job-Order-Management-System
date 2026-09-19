import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { TechnicianJobList } from "@/components/features/technician/technician-job-list";

export default function TechnicianMyJobsPage() {
  return (
    <DashboardShell>
      <TechnicianJobList />
    </DashboardShell>
  );
}