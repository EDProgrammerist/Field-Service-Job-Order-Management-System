import { DashboardLayout } from "@/components/common/dashboard-layout";
import { UserManagement } from "@/components/features/users/user-management";

export default function AdminUsersPage() {
  return (
    <DashboardLayout>
      <UserManagement />
    </DashboardLayout>
  );
}