import {
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/types/auth";

export interface DashboardNavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  matchNested?: boolean;
  excludedPaths?: string[];
}

export interface DashboardNavigationSection {
  label: string;
  items: DashboardNavigationItem[];
}

export interface DashboardNotification {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  read: boolean;
}

export interface DashboardPageInformation {
  eyebrow: string;
  title: string;
}

export interface DashboardRoleConfig {
  roleLabel: string;
  workspaceLabel: string;
  badgeLabel: string;
  homeHref: string;
  navigationSections: DashboardNavigationSection[];
  notifications: DashboardNotification[];
}

export const dashboardRoleConfigs: Record<
  UserRole,
  DashboardRoleConfig
> = {
  admin: {
    roleLabel: "Administrator",
    workspaceLabel: "Administration",
    badgeLabel: "Admin",
    homeHref: "/admin/dashboard",
    navigationSections: [
      {
        label: "Overview",
        items: [
          {
            label: "Dashboard",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
            exact: true,
          },
        ],
      },
      {
        label: "Operations",
        items: [
          {
            label: "Job Orders",
            href: "/admin/job-orders",
            icon: ClipboardList,
            matchNested: true,
          },
        ],
      },
      {
        label: "People",
        items: [
          {
            label: "Customers",
            href: "/admin/customers",
            icon: UsersRound,
            exact: true,
          },
          {
            label: "Technicians",
            href: "/admin/technicians",
            icon: Wrench,
            exact: true,
          },
        ],
      },
      {
        label: "Administration",
        items: [
          {
            label: "Users",
            href: "/admin/users",
            icon: ShieldCheck,
            exact: true,
          },
        ],
      },
    ],
    notifications: [
      {
        id: 1,
        title: "Job orders need review",
        description: "Review recently submitted service requests.",
        icon: ClipboardList,
        read: false,
      },
      {
        id: 2,
        title: "Technician records",
        description: "Check the current technician directory.",
        icon: Wrench,
        read: false,
      },
      {
        id: 3,
        title: "User administration",
        description: "Review user access and role assignments.",
        icon: ShieldCheck,
        read: true,
      },
    ],
  },

  dispatcher: {
    roleLabel: "Dispatcher",
    workspaceLabel: "Dispatch Center",
    badgeLabel: "Dispatch",
    homeHref: "/dispatcher/dashboard",
    navigationSections: [
      {
        label: "Overview",
        items: [
          {
            label: "Dashboard",
            href: "/dispatcher/dashboard",
            icon: LayoutDashboard,
            exact: true,
          },
        ],
      },
      {
        label: "Operations",
        items: [
          {
            label: "Scheduling Queue",
            href: "/dispatcher/job-orders",
            icon: ClipboardList,
            matchNested: true,
          },
        ],
      },
      {
        label: "Workforce",
        items: [
          {
            label: "Technicians",
            href: "/dispatcher/technicians",
            icon: UsersRound,
            exact: true,
          },
        ],
      },
    ],
    notifications: [
      {
        id: 1,
        title: "Scheduling queue",
        description:
          "Review requests that need an official schedule.",
        icon: ClipboardList,
        read: false,
      },
      {
        id: 2,
        title: "Technician responses",
        description:
          "Monitor schedules awaiting technician approval.",
        icon: UsersRound,
        read: false,
      },
      {
        id: 3,
        title: "Rejected schedules",
        description:
          "Reschedule requests rejected by technicians.",
        icon: Wrench,
        read: true,
      },
    ],
  },

  technician: {
    roleLabel: "Technician",
    workspaceLabel: "Field Workspace",
    badgeLabel: "Field",
    homeHref: "/technician/dashboard",
    navigationSections: [
      {
        label: "Overview",
        items: [
          {
            label: "Dashboard",
            href: "/technician/dashboard",
            icon: LayoutDashboard,
            exact: true,
          },
        ],
      },
      {
        label: "Work",
        items: [
          {
            label: "My Jobs",
            href: "/technician/my-jobs",
            icon: ClipboardList,
            matchNested: true,
          },
        ],
      },
    ],
    notifications: [
      {
        id: 1,
        title: "Assigned job",
        description: "A job order has been assigned to you.",
        icon: ClipboardList,
        read: false,
      },
      {
        id: 2,
        title: "Schedule reminder",
        description: "Review the scheduled time for your next job.",
        icon: Wrench,
        read: false,
      },
    ],
  },

  customer: {
    roleLabel: "Customer",
    workspaceLabel: "Customer Portal",
    badgeLabel: "Customer",
    homeHref: "/customer/dashboard",
    navigationSections: [
      {
        label: "Overview",
        items: [
          {
            label: "Dashboard",
            href: "/customer/dashboard",
            icon: LayoutDashboard,
            exact: true,
          },
        ],
      },
      {
        label: "Service Requests",
        items: [
          {
            label: "New Request",
            href: "/customer/service-requests/new",
            icon: FilePlus2,
            exact: true,
          },
          {
            label: "My Requests",
            href: "/customer/service-requests",
            icon: ClipboardList,
            matchNested: true,
            excludedPaths: ["/customer/service-requests/new"],
          },
        ],
      },
    ],
    notifications: [
      {
        id: 1,
        title: "Request received",
        description: "Your service request has been received.",
        icon: ClipboardList,
        read: false,
      },
      {
        id: 2,
        title: "Service update",
        description: "A service request status has been updated.",
        icon: Wrench,
        read: false,
      },
    ],
  },
};

export function isDashboardNavigationItemActive(
  pathname: string,
  item: DashboardNavigationItem,
) {
  if (
    item.excludedPaths?.some(
      (excludedPath) =>
        pathname === excludedPath ||
        pathname.startsWith(`${excludedPath}/`),
    )
  ) {
    return false;
  }

  if (item.exact) {
    return pathname === item.href;
  }

  if (item.matchNested) {
    return (
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`)
    );
  }

  return pathname === item.href;
}

export function getDashboardPageInformation(
  role: UserRole,
  pathname: string,
): DashboardPageInformation {
  if (role === "admin") {
    if (pathname === "/admin/dashboard") {
      return {
        eyebrow: "Administration",
        title: "Dashboard",
      };
    }

    if (
      pathname.startsWith("/admin/job-orders/") &&
      pathname.endsWith("/edit")
    ) {
      return {
        eyebrow: "Operations",
        title: "Edit Job Order",
      };
    }

    if (pathname.startsWith("/admin/job-orders/")) {
      return {
        eyebrow: "Operations",
        title: "Job Order Details",
      };
    }

    if (pathname === "/admin/job-orders") {
      return {
        eyebrow: "Operations",
        title: "Job Orders",
      };
    }

    if (pathname === "/admin/customers") {
      return {
        eyebrow: "People",
        title: "Customers",
      };
    }

    if (pathname === "/admin/technicians") {
      return {
        eyebrow: "People",
        title: "Technicians",
      };
    }

    if (pathname === "/admin/users") {
      return {
        eyebrow: "Administration",
        title: "Users",
      };
    }
  }

  if (role === "dispatcher") {
    if (pathname === "/dispatcher/dashboard") {
      return {
        eyebrow: "Dispatch Center",
        title: "Dashboard",
      };
    }

    if (
      pathname.startsWith("/dispatcher/job-orders/") &&
      pathname.endsWith("/schedule")
    ) {
      return {
        eyebrow: "Operations",
        title: "Official Schedule",
      };
    }

    if (pathname.startsWith("/dispatcher/job-orders/")) {
      return {
        eyebrow: "Operations",
        title: "Scheduling Request",
      };
    }

    if (pathname === "/dispatcher/job-orders") {
      return {
        eyebrow: "Operations",
        title: "Scheduling Queue",
      };
    }

    if (pathname === "/dispatcher/technicians") {
      return {
        eyebrow: "Workforce",
        title: "Technicians",
      };
    }
  }

  if (role === "technician") {
    if (pathname === "/technician/dashboard") {
      return {
        eyebrow: "Field Workspace",
        title: "Dashboard",
      };
    }

    if (pathname.startsWith("/technician/my-jobs/")) {
      return {
        eyebrow: "Work",
        title: "Job Details",
      };
    }

    if (pathname === "/technician/my-jobs") {
      return {
        eyebrow: "Work",
        title: "My Jobs",
      };
    }
  }

  if (role === "customer") {
    if (pathname === "/customer/dashboard") {
      return {
        eyebrow: "Customer Portal",
        title: "Dashboard",
      };
    }

    if (pathname === "/customer/service-requests/new") {
      return {
        eyebrow: "Service Requests",
        title: "New Request",
      };
    }

    if (pathname.startsWith("/customer/service-requests/")) {
      return {
        eyebrow: "Service Requests",
        title: "Request Details",
      };
    }

    if (pathname === "/customer/service-requests") {
      return {
        eyebrow: "Service Requests",
        title: "My Requests",
      };
    }
  }

  return {
    eyebrow: dashboardRoleConfigs[role].workspaceLabel,
    title: "Workspace",
  };
}