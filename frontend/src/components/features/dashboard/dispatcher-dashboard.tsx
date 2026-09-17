import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Plus,
  RefreshCcw,
  UserRoundCheck,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";

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
import { useAuth } from "@/contexts/auth-context";
import { getDispatcherDashboardData } from "@/services/dashboard";
import type { DispatcherDashboardData } from "@/types/dashboard";
import type { JobOrder } from "@/types/job-order";

interface QueueOverviewItem {
  label: string;
  value: number;
  description: string;
  className: string;
}

interface DispatcherMetricCardProps {
  label: string;
  value: number;
  description: string;
  href: string;
  icon: LucideIcon;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getPercentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((value / total) * 100));
}

function DashboardCard({
  className = "",
  ...props
}: ComponentProps<typeof Card>) {
  return (
    <Card
      className={[
        "gap-0 rounded-none bg-background py-0 shadow-none ring-0",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

function DispatcherMetricCard({
  label,
  value,
  description,
  href,
  icon: Icon,
}: DispatcherMetricCardProps) {
  return (
    <DashboardCard className="min-h-48 xl:col-span-4">
      <CardContent className="flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>

            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {value.toLocaleString()}
            </p>
          </div>

          <div className="flex size-9 items-center justify-center rounded-md border bg-background">
            <Icon
              aria-hidden={true}
              className="size-4 text-muted-foreground"
            />
          </div>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <p className="max-w-48 text-xs leading-5 text-muted-foreground">
            {description}
          </p>

          <Button
            render={<Link to={href} />}
            size="sm"
            variant="outline"
          >
            View
            <ArrowRight aria-hidden={true} />
          </Button>
        </div>
      </CardContent>
    </DashboardCard>
  );
}

function JobOrderQueueItem({
  jobOrder,
}: {
  jobOrder: JobOrder;
}) {
  return (
    <article className="flex flex-col gap-4 border-b p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-xs font-medium text-muted-foreground">
            {jobOrder.job_order_number}
          </p>

          <JobOrderPriorityBadge priority={jobOrder.priority} />
        </div>

        <p className="mt-2 truncate font-medium">{jobOrder.title}</p>

        <p className="mt-1 truncate text-sm text-muted-foreground">
          {jobOrder.customer.name}
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
        <JobOrderStatusBadge status={jobOrder.status} />

        <Button
          render={
            <Link to={`/dispatcher/job-orders/${jobOrder.id}`} />
          }
          size="sm"
          variant="ghost"
        >
          View
          <ArrowRight aria-hidden={true} />
        </Button>
      </div>
    </article>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-7 w-56 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
        </div>

        <div className="flex gap-2">
          <div className="size-8 animate-pulse rounded bg-muted" />
          <div className="h-8 w-36 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="h-24 animate-pulse rounded-none bg-muted" />

      <div className="grid gap-px bg-border p-px xl:grid-cols-12">
        <div className="min-h-80 animate-pulse bg-background xl:col-span-7" />
        <div className="min-h-80 animate-pulse bg-background xl:col-span-5" />

        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="min-h-48 animate-pulse bg-background xl:col-span-4"
            key={index}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="h-96 animate-pulse bg-muted xl:col-span-7" />
        <div className="h-96 animate-pulse bg-muted xl:col-span-5" />
      </div>
    </div>
  );
}

export function DispatcherDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] =
    useState<DispatcherDashboardData | null>(null);
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
        "Unable to load dispatcher data. Check the Laravel API connection and try again.",
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

  const dispatcherName =
    user?.name?.trim().split(/\s+/)[0] || "Dispatcher";

  const operationalTotal = dashboard
    ? dashboard.unassignedJobOrderCount +
      dashboard.assignedJobOrderCount +
      dashboard.activeJobOrderCount
    : 0;

  const queueOverview = useMemo<QueueOverviewItem[]>(() => {
    if (!dashboard) {
      return [];
    }

    return [
      {
        label: "Awaiting assignment",
        value: dashboard.unassignedJobOrderCount,
        description: "Ready for technician assignment",
        className: "bg-slate-700 dark:bg-slate-300",
      },
      {
        label: "Assigned",
        value: dashboard.assignedJobOrderCount,
        description: "Allocated to field technicians",
        className: "bg-blue-600",
      },
      {
        label: "In progress",
        value: dashboard.activeJobOrderCount,
        description: "Currently being serviced",
        className: "bg-amber-500",
      },
    ];
  }, [dashboard]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!dashboard) {
    return (
      <div className="mx-auto max-w-xl pt-12">
        <Card className="rounded-none shadow-none">
          <CardHeader>
            <CardTitle>Dispatcher data unavailable</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              type="button"
              onClick={() => void loadDashboard()}
            >
              <RefreshCcw aria-hidden={true} />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Heading */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {getGreeting()}, {dispatcherName}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Assign technicians and monitor active field work.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            aria-label="Refresh dispatcher dashboard"
            onClick={() => void loadDashboard()}
            size="icon"
            type="button"
            variant="outline"
          >
            <RefreshCcw aria-hidden={true} />
          </Button>

          <Button
            render={<Link to="/dispatcher/job-orders/create" />}
          >
            <Plus aria-hidden={true} />
            Create job order
          </Button>
        </div>
      </section>

      {/* Dispatch update */}
      <DashboardCard className="ring-1 ring-border">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-emerald-600"
              />

              <p className="text-sm font-medium">Dispatch update</p>

              <span className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("en-PH", {
                  dateStyle: "medium",
                }).format(new Date())}
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {dashboard.unassignedJobOrderCount.toLocaleString()} job
              orders need assignment.{" "}
              {dashboard.activeTechnicianCount.toLocaleString()} technicians
              are currently active.
            </p>
          </div>

          <Button
            render={<Link to="/dispatcher/job-orders" />}
            size="sm"
            variant="outline"
          >
            Open work queue
            <ArrowRight aria-hidden={true} />
          </Button>
        </CardContent>
      </DashboardCard>

      {/* Operational overview */}
      <section className="grid gap-px bg-border p-px xl:grid-cols-12">
        <DashboardCard className="xl:col-span-7">
          <CardHeader className="border-b p-5">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList
                aria-hidden={true}
                className="size-4 text-muted-foreground"
              />
              Dispatch workload
            </CardTitle>

            <CardDescription>
              Current work across the assignment and service workflow.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Operational job orders
              </p>

              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {operationalTotal.toLocaleString()}
              </p>
            </div>

            <div className="mt-8 space-y-6">
              {queueOverview.map((item) => {
                const percentage = getPercentage(
                  item.value,
                  operationalTotal,
                );

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">
                          {item.label}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold tabular-nums">
                          {item.value.toLocaleString()}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {percentage}%
                        </p>
                      </div>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${item.className}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </DashboardCard>

        <DashboardCard className="xl:col-span-5">
          <CardHeader className="border-b p-5">
            <CardTitle className="flex items-center gap-2">
              <UsersRound
                aria-hidden={true}
                className="size-4 text-muted-foreground"
              />
              Dispatch totals
            </CardTitle>

            <CardDescription>
              A quick view of workload and field capacity.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-px bg-border">
              <div className="flex min-h-32 flex-col justify-between bg-background p-5">
                <UsersRound
                  aria-hidden={true}
                  className="size-4 text-muted-foreground"
                />

                <div>
                  <p className="text-2xl font-semibold">
                    {dashboard.activeTechnicianCount.toLocaleString()}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Active technicians
                  </p>
                </div>
              </div>

              <div className="flex min-h-32 flex-col justify-between bg-background p-5">
                <ClipboardList
                  aria-hidden={true}
                  className="size-4 text-muted-foreground"
                />

                <div>
                  <p className="text-2xl font-semibold">
                    {operationalTotal.toLocaleString()}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Operational jobs
                  </p>
                </div>
              </div>

              <div className="flex min-h-32 flex-col justify-between bg-background p-5">
                <UserRoundCheck
                  aria-hidden={true}
                  className="size-4 text-muted-foreground"
                />

                <div>
                  <p className="text-2xl font-semibold">
                    {dashboard.assignedJobOrderCount.toLocaleString()}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Assigned jobs
                  </p>
                </div>
              </div>

              <div className="flex min-h-32 flex-col justify-between bg-background p-5">
                <Wrench
                  aria-hidden={true}
                  className="size-4 text-muted-foreground"
                />

                <div>
                  <p className="text-2xl font-semibold">
                    {dashboard.activeJobOrderCount.toLocaleString()}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Jobs in progress
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </DashboardCard>

        <DispatcherMetricCard
          description="New job orders that still require a technician."
          href="/dispatcher/job-orders"
          icon={ClipboardList}
          label="Awaiting assignment"
          value={dashboard.unassignedJobOrderCount}
        />

        <DispatcherMetricCard
          description="Work already allocated to field technicians."
          href="/dispatcher/job-orders"
          icon={UserRoundCheck}
          label="Assigned workload"
          value={dashboard.assignedJobOrderCount}
        />

        <DispatcherMetricCard
          description="Jobs currently being handled in the field."
          href="/dispatcher/job-orders"
          icon={Wrench}
          label="Active field jobs"
          value={dashboard.activeJobOrderCount}
        />
      </section>

      {/* Queue and schedules */}
      <section className="grid gap-4 xl:grid-cols-12">
        <DashboardCard className="ring-1 ring-border xl:col-span-7">
          <CardHeader className="border-b p-5">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList
                aria-hidden={true}
                className="size-4 text-muted-foreground"
              />
              Unassigned work queue
            </CardTitle>

            <CardDescription>
              Job orders waiting for technician assignment.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {dashboard.unassignedJobOrders.length === 0 ? (
              <div className="p-8 text-center">
                <UserRoundCheck
                  aria-hidden={true}
                  className="mx-auto size-8 text-muted-foreground"
                />

                <p className="mt-3 font-medium">
                  The assignment queue is clear
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  New job orders will appear here.
                </p>
              </div>
            ) : (
              dashboard.unassignedJobOrders.map((jobOrder) => (
                <JobOrderQueueItem
                  jobOrder={jobOrder}
                  key={jobOrder.id}
                />
              ))
            )}

            <div className="border-t p-4">
              <Button
                className="w-full"
                render={<Link to="/dispatcher/job-orders" />}
                variant="outline"
              >
                View all job orders
                <ArrowRight aria-hidden={true} />
              </Button>
            </div>
          </CardContent>
        </DashboardCard>

        <DashboardCard className="ring-1 ring-border xl:col-span-5">
          <CardHeader className="border-b p-5">
            <CardTitle className="flex items-center gap-2">
              <CalendarClock
                aria-hidden={true}
                className="size-4 text-muted-foreground"
              />
              Recent schedules
            </CardTitle>

            <CardDescription>
              Scheduling details from recent job orders.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {dashboard.recentJobOrders.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarClock
                  aria-hidden={true}
                  className="mx-auto size-8 text-muted-foreground"
                />

                <p className="mt-3 font-medium">
                  No schedules available
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Scheduled job orders will appear here.
                </p>
              </div>
            ) : (
              dashboard.recentJobOrders.map((jobOrder) => (
                <article
                  className="border-b p-5 last:border-b-0"
                  key={jobOrder.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {jobOrder.title}
                      </p>

                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {jobOrder.customer.name}
                      </p>
                    </div>

                    <JobOrderStatusBadge
                      status={jobOrder.status}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(jobOrder.scheduled_at)}
                    </p>

                    <Button
                      render={
                        <Link
                          to={`/dispatcher/job-orders/${jobOrder.id}`}
                        />
                      }
                      size="sm"
                      variant="ghost"
                    >
                      Details
                      <ArrowRight aria-hidden={true} />
                    </Button>
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </DashboardCard>
      </section>
    </div>
  );
}