import { useParams } from "react-router";

import { DashboardLayout } from "@/components/common/dashboard-layout";
import { TechnicianJobOrderDetails } from "@/components/features/job-orders/technician-job-order-details";

export default function TechnicianJobOrderDetailsPage() {
  const { jobOrderId } = useParams();
  const parsedJobOrderId = Number(jobOrderId);

  if (!Number.isInteger(parsedJobOrderId) || parsedJobOrderId < 1) {
    return null;
  }

  return (
    <DashboardLayout>
      <TechnicianJobOrderDetails jobOrderId={parsedJobOrderId} />
    </DashboardLayout>
  );
}