import { DashboardLayout } from "@/components/common/dashboard-layout";
import { CustomerManagement } from "@/components/features/customers/customer-management";

export default function AdminCustomersPage() {
  return (
    <DashboardLayout>
      <CustomerManagement />
    </DashboardLayout>
  );
}