import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Users,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminDashboardData } from "@/services/dashboard";
import type { AdminDashboardData } from "@/types/dashboard";
import type { JobOrderPriority, JobOrderStatus } from "@/types/job-order";

interface DashboardMetric {
  label: string;
  value: number;
  icon: typeof ClipboardList;
}

const statusClassNames: Record<JobOrderStatus, string> = {
  pending_review: "border-amber-200 bg-amber-50 text-amber-700",
  created: "border-slate-300 bg-slate-100 text-slate-700",
  assigned: "border-blue-200 bg-blue-50 text-blue-700",
  in_progress: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  closed: "border-violet-200 bg-violet-50 text-violet-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

const priorityClassNames: Record<JobOrderPriority, string> = {
  low: "border-slate-300 bg-slate-100 text-slate-700",
  normal: "border-blue-200 bg-blue-50 text-blue-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  urgent: "border-red-200 bg-red-50 text-red-700",
};

function formatLabel(value: string) {
  return value
    .split("_")
    .map(
      (word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`,
    )
    .join(" ");
}

function formatScheduledDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-52 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-6">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded bg-muted"
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const dashboardData = await getAdminDashboardData();
      setDashboard(dashboardData);
    } catch {
      setErrorMessage(
        "Unable to load dashboard data. Please check the Laravel API and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDashboard]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!dashboard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard data unavailable</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={loadDashboard}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const metrics: DashboardMetric[] = [
    {
      label: "Total job orders",
      value: dashboard.totalJobOrders,
      icon: ClipboardList,
    },
    {
      label: "Created job orders",
      value: dashboard.createdJobOrders,
      icon: Clock3,
    },
    {
      label: "Jobs in progress",
      value: dashboard.inProgressJobOrders,
      icon: Wrench,
    },
    {
      label: "Completed job orders",
      value: dashboard.completedJobOrders,
      icon: CheckCircle2,
    },
    {
      label: "Total customers",
      value: dashboard.totalCustomers,
      icon: Users,
    },
    {
      label: "Total technicians",
      value: dashboard.totalTechnicians,
      icon: Wrench,
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-muted-foreground">
          Administration overview
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Current job order activity and records from the Laravel API.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="flex items-start justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">
                  {metric.value}
                </p>
              </div>

              <div className="rounded-lg bg-muted p-2.5 text-muted-foreground">
                <metric.icon aria-hidden="true" className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Recent job orders</CardTitle>
            <CardDescription>
              The five most recently created job orders.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Scheduled</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {dashboard.recentJobOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        className="py-10 text-center text-muted-foreground"
                        colSpan={5}
                      >
                        No job orders have been created yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    dashboard.recentJobOrders.map((jobOrder) => (
                      <TableRow key={jobOrder.id}>
                        <TableCell>
                          <p className="font-medium">
                            {jobOrder.job_order_number}
                          </p>
                          <p className="mt-1 max-w-56 truncate text-xs text-muted-foreground">
                            {jobOrder.title}
                          </p>
                        </TableCell>

                        <TableCell>{jobOrder.customer.name}</TableCell>

                        <TableCell>
                          <Badge
                            className={statusClassNames[jobOrder.status]}
                            variant="outline"
                          >
                            {formatLabel(jobOrder.status)}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={priorityClassNames[jobOrder.priority]}
                            variant="outline"
                          >
                            {formatLabel(jobOrder.priority)}
                          </Badge>
                        </TableCell>

                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatScheduledDate(jobOrder.scheduled_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
