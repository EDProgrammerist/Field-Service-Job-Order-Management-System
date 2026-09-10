import { useCallback, useEffect, useState } from "react";
import {
  CalendarClock,
  ClipboardList,
  RefreshCw,
  UserRoundCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router";

import {
  JobOrderPriorityBadge,
  JobOrderStatusBadge,
} from "@/components/features/job-orders/job-order-badges";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDispatcherDashboardData } from "@/services/dashboard";
import type { DispatcherDashboardData } from "@/types/dashboard";
import type { JobOrder } from "@/types/job-order";

interface DashboardMetric {
  label: string;
  value: number;
  icon: typeof ClipboardList;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-44 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-44 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function JobOrderItem({
  jobOrder,
  onView,
}: {
  jobOrder: JobOrder;
  onView: () => void;
}) {
  return (
    <article className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {jobOrder.job_order_number}
          </p>
          <h3 className="mt-1 truncate font-semibold">{jobOrder.title}</h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {jobOrder.customer.name}
          </p>
        </div>

        <JobOrderStatusBadge status={jobOrder.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <JobOrderPriorityBadge priority={jobOrder.priority} />

        <Button type="button" size="sm" variant="outline" onClick={onView}>
          View
        </Button>
      </div>
    </article>
  );
}

export function DispatcherDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<DispatcherDashboardData | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const dashboardData = await getDispatcherDashboardData();
      setDashboard(dashboardData);
    } catch {
      setErrorMessage(
        "Unable to load dispatcher dashboard data. Please check the Laravel API and try again.",
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
          <Button type="button" onClick={() => void loadDashboard()}>
            <RefreshCw />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const metrics: DashboardMetric[] = [
    {
      label: "Unassigned work",
      value: dashboard.unassignedJobOrderCount,
      icon: ClipboardList,
    },
    {
      label: "Assigned work",
      value: dashboard.assignedJobOrderCount,
      icon: UserRoundCheck,
    },
    {
      label: "Active jobs",
      value: dashboard.activeJobOrderCount,
      icon: Wrench,
    },
    {
      label: "Active technicians",
      value: dashboard.activeTechnicianCount,
      icon: UsersRound,
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-muted-foreground">
          Operations overview
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Dispatcher Dashboard
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Monitor unassigned work, technician availability, and the current job
          order queue.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Unassigned work queue</CardTitle>
            <CardDescription>
              Created job orders that need a technician assignment.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {dashboard.unassignedJobOrders.length === 0 ? (
              <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                No unassigned job orders are waiting.
              </p>
            ) : (
              dashboard.unassignedJobOrders.map((jobOrder) => (
                <JobOrderItem
                  key={jobOrder.id}
                  jobOrder={jobOrder}
                  onView={() =>
                    navigate(`/dispatcher/job-orders/${jobOrder.id}`)
                  }
                />
              ))
            )}

            <Button
              className="w-full"
              type="button"
              variant="outline"
              onClick={() => navigate("/dispatcher/job-orders")}
            >
              View all job orders
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-5" />
              Recent work schedules
            </CardTitle>
            <CardDescription>
              Scheduled date and time from the latest job-order records.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {dashboard.recentJobOrders.length === 0 ? (
              <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                No job orders have been created yet.
              </p>
            ) : (
              dashboard.recentJobOrders.map((jobOrder) => (
                <article
                  key={jobOrder.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{jobOrder.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {jobOrder.customer.name}
                    </p>
                    <p className="mt-2 text-sm">{formatDate(jobOrder.scheduled_at)}</p>
                  </div>

                  <JobOrderStatusBadge status={jobOrder.status} />
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
