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
  icon: ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;
}

interface QueueItemProps {
  jobOrder: DispatcherJobOrder;
  actionLabel: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
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
    <Card className="gap-0 rounded-none bg-background py-0 shadow-none">
      <CardContent className="flex min-h-40 flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm text-muted-foreground">
              {label}
            </h3>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {value.toLocaleString()}
            </p>
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center border bg-muted/30">
            <Icon
              aria-hidden={true}
              className="size-4 text-muted-foreground"
            />
          </div>
        </div>
        <p className="mt-5 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function QueueItem({
  jobOrder,
  actionLabel,
}: QueueItemProps) {
  const scheduleLabel =
    jobOrder.status === "technician_rejected"
      ? "Previous schedule"
      : "Scheduled";

  return (
    <article className="border-b p-5 last:border-b-0">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {jobOrder.job_order_number}
            </span>
            <JobOrderStatusBadge status={jobOrder.status} />
            <JobOrderPriorityBadge
              priority={jobOrder.priority}
            />
          </div>

          <h3 className="mt-3 truncate font-medium">
            {jobOrder.title}
          </h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {jobOrder.customer.name}
            {" · "}
            {jobOrder.selected_technician?.name ??
              "Technician unavailable"}
          </p>

          {jobOrder.scheduled_at ? (
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarClock
                aria-hidden={true}
                className="size-3.5"
              />
              {scheduleLabel}:{" "}
              {formatDate(jobOrder.scheduled_at)}
            </p>
          ) : null}
        </div>

        <Button
          className="w-full shrink-0 sm:w-auto"
          render={
            <Link
              to={`/dispatcher/job-orders/${jobOrder.id}`}
            />
          }
          size="sm"
          variant="outline"
        >
          {actionLabel}
          <ArrowRight aria-hidden={true} />
        </Button>
      </div>
    </article>
  );
}

function DashboardSkeleton() {
  return (
    <div
      aria-label="Loading dispatcher dashboard"
      className="space-y-4"
      role="status"
    >
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton className="h-40 rounded-none" key={index} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-none" />
        <Skeleton className="h-80 rounded-none" />
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
    if (!dashboard) return [];

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
    return <DashboardSkeleton />;
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-4 border bg-background p-6 text-center">
        <p
          className="max-w-md text-sm text-destructive"
          role="alert"
        >
          {errorMessage ||
            "Dispatcher dashboard is unavailable."}
        </p>
        <Button
          onClick={() => void loadDashboard()}
          type="button"
          variant="outline"
        >
          <RefreshCw aria-hidden={true} />
          Try again
        </Button>
      </div>
    );
  }

  const needsSchedulingCount =
    dashboard.pendingScheduleCount +
    dashboard.rejectedScheduleCount;

  return (
    <div className="space-y-4">
      <section className="flex flex-col justify-between gap-5 border bg-background p-5 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Dispatch center
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, {user?.name ?? "Dispatcher"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Set official schedules and track technician
            responses.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => void loadDashboard()}
            type="button"
            variant="outline"
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

      {errorMessage ? (
        <p
          className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          Refresh failed: {errorMessage} The figures below
          are from the previous load.
        </p>
      ) : null}

      <section
        aria-label="Dispatch overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          description="Requests that have not received an official schedule."
          icon={CalendarClock}
          label="New requests"
          value={dashboard.pendingScheduleCount}
        />
        <MetricCard
          description="Schedules rejected by technicians that need another date."
          icon={RotateCcw}
          label="Rejected schedules"
          value={dashboard.rejectedScheduleCount}
        />
        <MetricCard
          description="Scheduled requests waiting for the technician's decision."
          icon={UserRoundCheck}
          label="Awaiting technician"
          value={dashboard.awaitingTechnicianCount}
        />
        <MetricCard
          description="Technicians currently active in the directory."
          icon={UsersRound}
          label="Active technicians"
          value={dashboard.activeTechnicianCount}
        />
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-2">
        <Card className="gap-0 rounded-none bg-background py-0 shadow-none">
          <CardHeader className="border-b p-5">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList
                aria-hidden={true}
                className="size-4 text-muted-foreground"
              />
              <h2>Needs scheduling</h2>
            </CardTitle>
            <CardDescription>
              {needsSchedulingCount.toLocaleString()} total:{" "}
              {dashboard.pendingScheduleCount.toLocaleString()} new
              {" + "}
              {dashboard.rejectedScheduleCount.toLocaleString()} rejected.
              Showing up to five oldest requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {needsScheduling.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
                <CalendarClock
                  aria-hidden={true}
                  className="size-6 text-muted-foreground"
                />
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
                  actionLabel="Review"
                  jobOrder={jobOrder}
                  key={jobOrder.id}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-none bg-background py-0 shadow-none">
          <CardHeader className="border-b p-5">
            <CardTitle className="flex items-center gap-2">
              <UserRoundCheck
                aria-hidden={true}
                className="size-4 text-muted-foreground"
              />
              <h2>Awaiting technician response</h2>
            </CardTitle>
            <CardDescription>
              Schedules already sent to technicians for a decision.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {dashboard.awaitingTechnicianRequests.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
                <UserRoundCheck
                  aria-hidden={true}
                  className="size-6 text-muted-foreground"
                />
                <p className="mt-3 font-medium">
                  No responses are pending
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Submitted schedules appear here until the
                  technician responds.
                </p>
              </div>
            ) : (
              dashboard.awaitingTechnicianRequests.map(
                (jobOrder) => (
                  <QueueItem
                    actionLabel="View"
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
  );
}