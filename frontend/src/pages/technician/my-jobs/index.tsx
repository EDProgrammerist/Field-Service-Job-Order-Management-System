import { DashboardLayout } from "@/components/common/dashboard-layout";
import { TechnicianMyJobs } from "@/components/features/job-orders/technician-my-jobs";

export default function TechnicianMyJobsPage() {
  return (
    <DashboardLayout>
      <TechnicianMyJobs />
    </DashboardLayout>
  );
}