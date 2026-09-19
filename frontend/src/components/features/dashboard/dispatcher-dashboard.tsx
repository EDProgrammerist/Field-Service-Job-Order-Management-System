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
  if (!value) return "Not scheduled";

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
    <Card className="gap-0 rounded-none py-0 shadow-none">
      <CardContent className="flex min-h-44 flex-col justify-between p-5">
        <div className="flex size-9 items-center justify-center border bg-muted/30">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="mt-5">
          <p className="text-3xl font-semibold tracking-tight">
            {value.toLocaleString()}
          </p>
          <p className="mt-1 text-sm font-medium">{label}</p>
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
    <article className="border-b p-5 transition-colors hover:bg-muted/30 last:border-b-0">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground">
              {jobOrder.job_order_number}
            </span>
            <JobOrderStatusBadge status={jobOrder.status} />
            <JobOrderPriorityBadge
              priority={jobOrder.priority}
            />
          </div>

          <p className="mt-3 truncate font-medium">
            {jobOrder.title}
          </p>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {jobOrder.selected_technician?.name ??
              "Technician unavailable"}
            {" · "}
            {jobOrder.customer.name}
          </p>
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock
              aria-hidden={true}
              className="size-3.5"
            />
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
          className="w-full shrink-0 sm:w-auto"
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
    return (
      <div
        className="space-y-4"
        aria-label="Loading dispatcher dashboard"
      >
        <Skeleton className="h-36 w-full rounded-none" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              className="h-44 w-full rounded-none"
              key={index}
            />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-none" />
          <Skeleton className="h-80 w-full rounded-none" />
        </div>
      </div>
    );
  }

  if (errorMessage || !dashboard) {
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
          type="button"
          variant="outline"
          onClick={() => void loadDashboard()}
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
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, {user?.name ?? "Dispatcher"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Set official service schedules and monitor requests
            waiting for technician approval.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
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

      <section
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        aria-label="Dispatch overview"
      >
        <MetricCard
          description="New and rejected requests that need an official schedule."
          icon={CalendarClock}
          label="Needs scheduling"
          value={needsSchedulingCount}
        />
        <MetricCard
          description="Schedules waiting for the selected technician to respond."
          icon={UserRoundCheck}
          label="Awaiting technician"
          value={dashboard.awaitingTechnicianCount}
        />
        <MetricCard
          description="Technician-rejected schedules ready for a new date."
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

      <section className="grid items-start gap-4 xl:grid-cols-2">
        <Card className="gap-0 rounded-none py-0 shadow-none">
          <CardHeader className="flex flex-row items-center gap-2 border-b p-5">
            <ClipboardList
              aria-hidden={true}
              className="size-4 text-muted-foreground"
            />
            <CardTitle className="text-base">
              Needs scheduling
            </CardTitle>
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
                View scheduling queue
                <ArrowRight aria-hidden={true} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-none py-0 shadow-none">
          <CardHeader className="flex flex-row items-center gap-2 border-b p-5">
            <UserRoundCheck
              aria-hidden={true}
              className="size-4 text-muted-foreground"
            />
            <CardTitle className="text-base">
              Awaiting technician response
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {dashboard.awaitingTechnicianRequests.length ===
            0 ? (
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