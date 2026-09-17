import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { UserManagement } from "@/components/features/users/user-management";

export default function AdminUsersPage() {
  return (
    <DashboardShell>
      <UserManagement />
    </DashboardShell>
  );
}
