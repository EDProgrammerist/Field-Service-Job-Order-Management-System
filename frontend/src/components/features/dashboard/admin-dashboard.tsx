import {
  useCallback,
  useEffect,
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

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;
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

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card className="gap-0 rounded-none bg-background py-0 shadow-none">
      <CardContent className="flex min-h-40 flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm text-muted-foreground">{label}</h3>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {value.toLocaleString()}
            </p>
          </div>

          <div className="flex size-9 shrink-0 items-center justify-center border bg-muted/30">
            <Icon aria-hidden={true} className="size-4" />
          </div>
        </div>

        <p className="mt-5 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div
      aria-label="Loading admin dashboard"
      className="space-y-4"
      role="status"
    >
      <Skeleton className="h-16 w-full rounded-none" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton
            className="h-40 rounded-none"
            key={index}
          />
        ))}
      </div>

      <Skeleton className="h-80 w-full rounded-none" />
      <Skeleton className="h-44 w-full rounded-none" />
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
      const data = await getAdminDashboardData();
      setDashboard(data);
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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!dashboard) {
    return (
      <Card className="mx-auto max-w-xl rounded-none py-0 shadow-none">
        <CardHeader className="border-b p-5">
          <CardTitle>Dashboard data unavailable</CardTitle>
          <CardDescription role="alert">
            {errorMessage}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5">
          <Button type="button" onClick={() => void loadDashboard()}>
            <RefreshCcw aria-hidden={true} />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {getGreeting()}, {administratorName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor job orders and service records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            aria-label="Refresh admin dashboard"
            onClick={() => void loadDashboard()}
            size="icon"
            type="button"
            variant="outline"
          >
            <RefreshCcw aria-hidden={true} />
          </Button>

          <Button
            render={<Link to="/admin/job-orders" />}
            variant="outline"
          >
            View job orders
            <ArrowRight aria-hidden={true} />
          </Button>
        </div>
      </section>

      {errorMessage ? (
        <p
          className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          Refresh failed. The figures below are from the previous load.
        </p>
      ) : null}

      <section
        aria-label="Job order snapshot"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          description="All job orders recorded in the system."
          icon={ClipboardList}
          label="Total job orders"
          value={dashboard.totalJobOrders}
        />
        <StatCard
          description="Requests awaiting an official dispatcher schedule."
          icon={Clock3}
          label="Pending schedule"
          value={dashboard.pendingScheduleJobOrders}
        />
        <StatCard
          description="Service work currently underway."
          icon={Wrench}
          label="In progress"
          value={dashboard.inProgressJobOrders}
        />
        <StatCard
          description="Jobs completed by the service team."
          icon={CheckCircle2}
          label="Completed"
          value={dashboard.completedJobOrders}
        />
      </section>

      <section aria-labelledby="recent-job-orders-title">
        <Card className="gap-0 rounded-none bg-background py-0 shadow-none">
          <CardHeader className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                <h2 id="recent-job-orders-title">
                  Recent job orders
                </h2>
              </CardTitle>
              <CardDescription className="mt-1">
                The five most recently created job orders.
              </CardDescription>
            </div>

            <Button
              render={<Link to="/admin/job-orders" />}
              size="sm"
              variant="outline"
            >
              View all
              <ArrowRight aria-hidden={true} />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
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
                        <JobOrderStatusBadge
                          status={jobOrder.status}
                        />
                      </TableCell>

                      <TableCell>
                        <JobOrderPriorityBadge
                          priority={jobOrder.priority}
                        />
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
                          <ArrowRight aria-hidden={true} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="directory-title">
        <Card className="gap-0 rounded-none bg-background py-0 shadow-none">
          <CardHeader className="border-b p-5">
            <CardTitle>
              <h2 id="directory-title">People directory</h2>
            </CardTitle>
            <CardDescription>
              Customer and technician records.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-px bg-border p-0 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-4 bg-background p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Customers
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {dashboard.totalCustomers.toLocaleString()}
                </p>
              </div>
              <Button
                render={<Link to="/admin/customers" />}
                size="sm"
                variant="outline"
              >
                <Users aria-hidden={true} />
                View
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 bg-background p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Technicians
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {dashboard.totalTechnicians.toLocaleString()}
                </p>
              </div>
              <Button
                render={<Link to="/admin/technicians" />}
                size="sm"
                variant="outline"
              >
                <Wrench aria-hidden={true} />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}