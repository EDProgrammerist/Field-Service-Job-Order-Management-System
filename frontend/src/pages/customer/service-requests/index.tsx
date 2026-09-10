import { DashboardLayout } from "@/components/common/dashboard-layout";
import { CustomerServiceRequestList } from "@/components/features/customers/customer-service-request-list";

export default function CustomerServiceRequestsPage() {
  return (
    <DashboardLayout>
      <CustomerServiceRequestList />
    </DashboardLayout>
  );
}