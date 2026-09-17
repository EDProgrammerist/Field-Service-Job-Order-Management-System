import { Wrench } from "lucide-react";
import { Link, useLocation } from "react-router";

import {
  dashboardRoleConfigs,
  isDashboardNavigationItemActive,
} from "@/components/common/dashboard-shell/dashboard-config";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase();
}

export function DashboardSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const config = dashboardRoleConfigs[user.role];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to={config.homeHref} />}
              size="lg"
              tooltip={`Field Service ${config.roleLabel}`}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground transition-transform duration-200 group-hover/menu-button:scale-105 motion-reduce:transform-none">
                <Wrench aria-hidden="true" className="size-4" />
              </div>

              <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold">
                  Field Service
                </span>

                <span className="truncate text-xs text-sidebar-foreground/60">
                  {config.workspaceLabel}
                </span>
              </div>

              <Badge
                className="group-data-[collapsible=icon]:hidden"
                variant="secondary"
              >
                {config.badgeLabel}
              </Badge>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {config.navigationSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive =
                    isDashboardNavigationItemActive(
                      location.pathname,
                      item,
                    );

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        className="h-9 transition-all duration-200 hover:translate-x-0.5 group-data-[collapsible=icon]:hover:translate-x-0 motion-reduce:transform-none"
                        isActive={isActive}
                        render={<Link to={item.href} />}
                        tooltip={item.label}
                      >
                        <item.icon
                          aria-hidden={true}
                          className="transition-transform duration-200 group-hover/menu-button:scale-110 motion-reduce:transform-none"
                        />

                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex min-w-0 items-center gap-2 rounded-md px-1 py-1.5">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {config.roleLabel}
            </p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}