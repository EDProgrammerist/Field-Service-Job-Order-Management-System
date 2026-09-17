import type { CSSProperties, ReactNode } from "react";

import { DashboardHeader } from "@/components/common/dashboard-shell/dashboard-header";
import { DashboardSidebar } from "@/components/common/dashboard-shell/dashboard-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3.25rem",
        } as CSSProperties
      }
    >
      <DashboardSidebar />

      <SidebarInset className="min-h-svh overflow-hidden rounded-none! outline outline-border">
        <DashboardHeader />

        <main className="flex flex-1 flex-col bg-muted/30 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-[1367px]">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}