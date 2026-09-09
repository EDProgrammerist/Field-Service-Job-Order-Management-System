import { DashboardLayout } from "@/components/common/dashboard-layout";
import { JobOrderList } from "@/components/features/job-orders/job-order-list";

export default function AdminJobOrdersPage() {
  return (
    <DashboardLayout>
      <JobOrderList />
    </DashboardLayout>
  );
}