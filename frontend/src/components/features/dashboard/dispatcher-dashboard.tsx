import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  RefreshCw,
  RotateCcw,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import {
  JobOrderPriorityBadge,
  JobOrderStatusBadge,
} from "@/components/features/job-orders/job-order-badges";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getDispatcherDashboardData } from "@/services/dispatcher-job-orders";
import type {
  DispatcherDashboardData,
  DispatcherJobOrder,
} from "@/types/dispatcher-job-order";

interface MetricCardProps {
  label: string;
  value: number;
  description: string;
  icon: ComponentType<{ className?: string }>;
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

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex min-h-40 flex-col justify-between p-5">
        <Icon className="size-5 text-muted-foreground" />

        <div>
          <p className="text-3xl font-semibold">
            {value.toLocaleString()}
          </p>
          <p className="mt-1 font-medium">{label}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function QueueItem({
  jobOrder,
}: {
  jobOrder: DispatcherJobOrder;
}) {
  return (
    <article className="border-b p-5 last:border-b-0">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {jobOrder.job_order_number}
            </p>
            <JobOrderStatusBadge
              status={jobOrder.status}
            />
            <JobOrderPriorityBadge
              priority={jobOrder.priority}
            />
          </div>

          <p className="mt-2 truncate font-medium">
            {jobOrder.title}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {jobOrder.selected_technician?.name ??
              "Technician unavailable"}
            {" · "}
            {jobOrder.customer.name}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            {formatDate(jobOrder.scheduled_at)}
          </p>
        </div>

        <Button
          render={
            <Link
              to={`/dispatcher/job-orders/${jobOrder.id}`}
            />
          }
          size="sm"
          variant="outline"
        >
          Review
          <ArrowRight aria-hidden={true} />
        </Button>
      </div>
    </article>
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
      setDashboard(await getDispatcherDashboardData());
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load the dispatcher dashboard.",
      );

      setErrorMessage(details.message);
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

  const needsScheduling = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return [
      ...dashboard.pendingScheduleRequests,
      ...dashboard.rejectedScheduleRequests,
    ]
      .sort(
        (first, second) =>
          new Date(first.created_at).getTime() -
          new Date(second.created_at).getTime(),
      )
      .slice(0, 5);
  }, [dashboard]);

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                className="h-40 w-full"
                key={index}
              />
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </DashboardShell>
    );
  }

  if (errorMessage || !dashboard) {
    return (
      <DashboardShell>
        <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
          <p
            className="max-w-md text-sm text-destructive"
            role="alert"
          >
            {errorMessage ||
              "Dispatcher dashboard is unavailable."}
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={() => void loadDashboard()}
          >
            <RefreshCw aria-hidden={true} />
            Try again
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const needsSchedulingCount =
    dashboard.pendingScheduleCount +
    dashboard.rejectedScheduleCount;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="flex flex-col justify-between gap-4 border bg-background p-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Dispatch Center
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back, {user?.name ?? "Dispatcher"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review requests that need an official schedule and
              monitor schedules waiting for technician approval.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadDashboard()}
            >
              <RefreshCw aria-hidden={true} />
              Refresh
            </Button>

            <Button
              render={<Link to="/dispatcher/job-orders" />}
            >
              Open scheduling queue
              <ArrowRight aria-hidden={true} />
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            description="New and rejected requests that require an official schedule."
            icon={CalendarClock}
            label="Needs scheduling"
            value={needsSchedulingCount}
          />

          <MetricCard
            description="Schedules currently waiting for the selected technician."
            icon={UserRoundCheck}
            label="Awaiting technician"
            value={dashboard.awaitingTechnicianCount}
          />

          <MetricCard
            description="Schedules rejected by technicians and ready for rescheduling."
            icon={RotateCcw}
            label="Rejected schedules"
            value={dashboard.rejectedScheduleCount}
          />

          <MetricCard
            description="Technicians currently active in the directory."
            icon={UsersRound}
            label="Active technicians"
            value={dashboard.activeTechnicianCount}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-4 text-muted-foreground" />
                Needs scheduling
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {needsScheduling.length === 0 ? (
                <div className="p-8 text-center">
                  <CalendarClock className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-medium">
                    The scheduling queue is clear
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    New and rejected requests will appear here.
                  </p>
                </div>
              ) : (
                needsScheduling.map((jobOrder) => (
                  <QueueItem
                    jobOrder={jobOrder}
                    key={jobOrder.id}
                  />
                ))
              )}

              <div className="border-t p-4">
                <Button
                  className="w-full"
                  render={
                    <Link to="/dispatcher/job-orders" />
                  }
                  variant="outline"
                >
                  View scheduling queue
                  <ArrowRight aria-hidden={true} />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <UserRoundCheck className="size-4 text-muted-foreground" />
                Awaiting technician response
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {dashboard.awaitingTechnicianRequests.length ===
              0 ? (
                <div className="p-8 text-center">
                  <UserRoundCheck className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-medium">
                    No responses are pending
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Submitted schedules will appear here until
                    the technician responds.
                  </p>
                </div>
              ) : (
                dashboard.awaitingTechnicianRequests.map(
                  (jobOrder) => (
                    <QueueItem
                      jobOrder={jobOrder}
                      key={jobOrder.id}
                    />
                  ),
                )
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardShell>
  );
}