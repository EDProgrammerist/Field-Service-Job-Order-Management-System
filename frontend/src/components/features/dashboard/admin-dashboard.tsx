import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  RefreshCcw,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "react-router";

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
import { useAuth } from "@/contexts/auth-context";
import { getAdminDashboardData } from "@/services/dashboard";
import type { AdminDashboardData } from "@/types/dashboard";
import type {
  JobOrderPriority,
  JobOrderStatus,
} from "@/types/job-order";

interface DashboardMetricCardProps {
  label: string;
  value: number;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

interface StatusOverviewItem {
  label: string;
  value: number;
  className: string;
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
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
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
}: React.ComponentProps<typeof Card>) {
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

function MetricCard({
  label,
  value,
  description,
  href,
  icon: Icon,
}: DashboardMetricCardProps) {
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
            <Icon aria-hidden={true} className="size-4" />
          </div>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <p className="max-w-44 text-xs leading-5 text-muted-foreground">
            {description}
          </p>

          <Button
            render={<Link to={href} />}
            size="sm"
            variant="outline"
          >
            View
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </DashboardCard>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-6 w-52 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
        </div>

        <div className="h-9 w-40 animate-pulse rounded bg-muted" />
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

      <div className="h-96 animate-pulse rounded-none bg-muted" />
    </div>
  );
}

export function AdminDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] =
    useState<AdminDashboardData | null>(null);
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
        "Unable to load dashboard data. Check the Laravel API connection and try again.",
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

  const administratorName =
    user?.name?.trim().split(/\s+/)[0] || "Administrator";

  const statusOverview = useMemo<StatusOverviewItem[]>(() => {
    if (!dashboard) {
      return [];
    }

    return [
      {
        label: "Awaiting assignment",
        value: dashboard.createdJobOrders,
        className: "bg-slate-700",
      },
      {
        label: "In progress",
        value: dashboard.inProgressJobOrders,
        className: "bg-amber-500",
      },
      {
        label: "Completed",
        value: dashboard.completedJobOrders,
        className: "bg-emerald-600",
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
            <CardTitle>Dashboard data unavailable</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>

          <CardContent>
            <Button type="button" onClick={loadDashboard}>
              <RefreshCcw aria-hidden="true" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page heading */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {getGreeting()}, {administratorName}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor job orders, customers, and field operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            aria-label="Refresh dashboard"
            onClick={loadDashboard}
            size="icon"
            type="button"
            variant="outline"
          >
            <RefreshCcw aria-hidden="true" />
          </Button>


        </div>
      </section>

      {/* Operational update */}
      <DashboardCard className="ring-1 ring-border">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-emerald-600"
              />

              <p className="text-sm font-medium">Operations update</p>

              <span className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("en-PH", {
                  dateStyle: "medium",
                }).format(new Date())}
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {dashboard.inProgressJobOrders.toLocaleString()} active jobs and{" "}
              {dashboard.createdJobOrders.toLocaleString()} waiting for
              assignment.
            </p>
          </div>

          <Button
            render={<Link to="/admin/job-orders" />}
            size="sm"
            variant="outline"
          >
            Review jobs
            <ArrowRight aria-hidden="true" />
          </Button>
        </CardContent>
      </DashboardCard>

      {/* Main dashboard grid */}
      <section className="grid gap-px bg-border p-px xl:grid-cols-12">
        {/* Job order status overview */}
        <DashboardCard className="xl:col-span-7">
          <CardHeader className="border-b p-5">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              Job order overview
            </CardTitle>

            <CardDescription>
              Current progress across the job order workflow.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                Total job orders
              </p>

              <p className="text-3xl font-semibold tracking-tight">
                {dashboard.totalJobOrders.toLocaleString()}
              </p>
            </div>

            <div className="mt-8 space-y-6">
              {statusOverview.map((item) => {
                const percentage = getPercentage(
                  item.value,
                  dashboard.totalJobOrders,
                );

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {percentage}% of all job orders
                        </p>
                      </div>

                      <p className="font-mono text-sm font-semibold tabular-nums">
                        {item.value.toLocaleString()}
                      </p>
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

        {/* Records grid */}
        <DashboardCard className="xl:col-span-5">
          <CardHeader className="border-b p-5">
            <CardTitle className="flex items-center gap-2">
              <Users
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              Total records
            </CardTitle>

            <CardDescription>
              Key records currently stored in the system.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-px bg-border">
              <div className="flex min-h-32 flex-col justify-between bg-background p-5">
                <ClipboardList
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />

                <div>
                  <p className="text-2xl font-semibold">
                    {dashboard.totalJobOrders.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Job orders
                  </p>
                </div>
              </div>

              <div className="flex min-h-32 flex-col justify-between bg-background p-5">
                <Users
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />

                <div>
                  <p className="text-2xl font-semibold">
                    {dashboard.totalCustomers.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Customers
                  </p>
                </div>
              </div>

              <div className="flex min-h-32 flex-col justify-between bg-background p-5">
                <Wrench
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />

                <div>
                  <p className="text-2xl font-semibold">
                    {dashboard.totalTechnicians.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Technicians
                  </p>
                </div>
              </div>

              <div className="flex min-h-32 flex-col justify-between bg-background p-5">
                <CheckCircle2
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />

                <div>
                  <p className="text-2xl font-semibold">
                    {dashboard.completedJobOrders.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completed jobs
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </DashboardCard>

        <MetricCard
          description="New job orders that are ready for administrative review."
          href="/admin/job-orders"
          icon={Clock3}
          label="Awaiting assignment"
          value={dashboard.createdJobOrders}
        />

        <MetricCard
          description="Jobs currently being handled by field technicians."
          href="/admin/job-orders"
          icon={Wrench}
          label="Jobs in progress"
          value={dashboard.inProgressJobOrders}
        />

        <MetricCard
          description="Job orders successfully completed by the service team."
          href="/admin/job-orders"
          icon={CheckCircle2}
          label="Completed jobs"
          value={dashboard.completedJobOrders}
        />
      </section>

      {/* Recent job orders */}
      <section>
        <DashboardCard className="ring-1 ring-border">
          <CardHeader className="border-b p-5">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              Recent job orders
            </CardTitle>

            <CardDescription>
              The five most recently created job orders.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-210">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5">Job order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead className="pr-5 text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {dashboard.recentJobOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        className="py-14 text-center text-muted-foreground"
                        colSpan={6}
                      >
                        No job orders have been created yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    dashboard.recentJobOrders.map((jobOrder) => (
                      <TableRow key={jobOrder.id}>
                        <TableCell className="pl-5">
                          <p className="font-medium">
                            {jobOrder.job_order_number}
                          </p>

                          <p className="mt-1 max-w-60 truncate text-xs text-muted-foreground">
                            {jobOrder.title}
                          </p>
                        </TableCell>

                        <TableCell>
                          {jobOrder.customer.name}
                        </TableCell>

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

                        <TableCell className="pr-5 text-right">
                          <Button
                            render={
                              <Link
                                to={`/admin/job-orders/${jobOrder.id}`}
                              />
                            }
                            size="sm"
                            variant="ghost"
                          >
                            View
                            <ArrowRight aria-hidden="true" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </DashboardCard>
      </section>
    </div>
  );
}