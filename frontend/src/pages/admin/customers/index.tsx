import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { CustomerManagement } from "@/components/features/customers/customer-management";

export default function AdminCustomersPage() {
  return (
    <DashboardShell>
      <CustomerManagement />
    </DashboardShell>
  );
}
