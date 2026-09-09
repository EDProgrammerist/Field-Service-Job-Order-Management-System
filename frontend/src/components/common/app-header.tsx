import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { UserMenu } from "@/components/common/user-menu";

function formatRole(role: string) {
  return `${role.charAt(0).toUpperCase()}${role.slice(1)}`;
}

export function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />

        <div className="h-5 w-px bg-border" />

        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">
            {user ? `${formatRole(user.role)} workspace` : "Workspace"}
          </p>
          <h1 className="truncate text-sm font-semibold sm:text-base">
            Dashboard
          </h1>
        </div>
      </div>

      <UserMenu />
    </header>
  );
}