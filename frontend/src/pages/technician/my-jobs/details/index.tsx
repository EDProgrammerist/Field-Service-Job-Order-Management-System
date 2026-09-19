import { useParams } from "react-router";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { TechnicianJobDetails } from "@/components/features/technician/technician-job-details";

export default function TechnicianJobOrderDetailsPage() {
  const { jobOrderId } = useParams();
  const parsedJobOrderId = Number(jobOrderId);

  if (
    !Number.isInteger(parsedJobOrderId) ||
    parsedJobOrderId < 1
  ) {
    return null;
  }

  return (
    <DashboardShell>
      <TechnicianJobDetails
        jobOrderId={parsedJobOrderId}
      />
    </DashboardShell>
  );
}