import {
  ClipboardList,
  LayoutDashboard,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
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
import type { UserRole } from "@/types/auth";

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navigationByRole: Record<UserRole, NavigationItem[]> = {
  admin: [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Job Orders",
      href: "/admin/job-orders",
      icon: ClipboardList,
    },
    {
      label: "Customers",
      href: "/admin/customers",
      icon: UsersRound,
    },
    {
      label: "Technicians",
      href: "/admin/technicians",
      icon: UsersRound,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: UsersRound,
    },
  ],
  dispatcher: [
    {
      label: "Dashboard",
      href: "/dispatcher/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Job Orders",
      href: "/dispatcher/job-orders",
      icon: ClipboardList,
    },
    {
      label: "Technicians",
      href: "/dispatcher/technicians",
      icon: UsersRound,
    },
  ],
  technician: [
    {
      label: "Dashboard",
      href: "/technician/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Jobs",
      href: "/technician/my-jobs",
      icon: ClipboardList,
    },
  ],
  customer: [
    {
      label: "Dashboard",
      href: "/customer/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "New Request",
      href: "/customer/service-requests/new",
      icon: ClipboardList,
    },

    {
      label: "My Requests",
      href: "/customer/service-requests",
      icon: ClipboardList,
    },
  ],
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase();
}

function formatRole(role: string) {
  return `${role.charAt(0).toUpperCase()}${role.slice(1)}`;
}

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const navigationItems = navigationByRole[user.role];

  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={location.pathname === navigationItems[0].href}
              render={<Link to={navigationItems[0].href} />}
            >
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-600 text-white">
                <Wrench aria-hidden="true" className="size-4" />
              </div>
              <span className="font-semibold">Field Service</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.href}
                    render={<Link to={item.href} />}
                  >
                    <item.icon aria-hidden="true" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 group-data-[collapsible=offcanvas]:hidden">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {formatRole(user.role)}
            </p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}