import { useLocation } from "react-router";

import {
  dashboardRoleConfigs,
  getDashboardPageInformation,
} from "@/components/common/dashboard-shell/dashboard-config";
import { DashboardNotifications } from "@/components/common/dashboard-shell/dashboard-notifications";
import { DashboardThemeToggle } from "@/components/common/dashboard-shell/dashboard-theme-toggle";
import { UserMenu } from "@/components/common/user-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";

export function DashboardHeader() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const config = dashboardRoleConfigs[user.role];
  const pageInformation = getDashboardPageInformation(
    user.role,
    location.pathname,
  );

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-3 backdrop-blur sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:transform-none" />

        <div className="h-4 w-px bg-border" />

        <div className="min-w-0">
          <p className="truncate text-[11px] text-muted-foreground">
            {pageInformation.eyebrow}
          </p>

          <h1 className="truncate text-sm font-semibold">
            {pageInformation.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <DashboardThemeToggle />

        <DashboardNotifications
          key={user.role}
          label={`${config.roleLabel} notifications`}
          notifications={config.notifications}
        />

        <UserMenu compact />
      </div>
    </header>
  );
}