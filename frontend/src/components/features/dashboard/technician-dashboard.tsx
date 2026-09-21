import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
} from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Play,
  RefreshCw,
  UserRoundCheck,
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
import {
  getTechnicianJobOrders,
  getTechnicianSchedule,
} from "@/services/technician-job-orders";
import type { TechnicianJobOrder } from "@/types/technician-job-order";

interface TechnicianDashboardSnapshot {
  awaitingResponseCount: number;
  awaitingResponseJobs: TechnicianJobOrder[];
  acceptedCount: number;
  inProgressCount: number;
  scheduledJobs: TechnicianJobOrder[];
}

interface MetricCardProps {
  label: string;
  value: number;
  description: string;
  icon: ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;
}

interface JobPreviewProps {
  jobOrder: TechnicianJobOrder;
  actionLabel: string;
}

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";

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

function JobPreview({
  jobOrder,
  actionLabel,
}: JobPreviewProps) {
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
          className="w-full shrink-0 sm:w-auto"
          render={
            <Link
              to={`/technician/my-jobs/${jobOrder.id}`}
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
      aria-label="Loading technician dashboard"
      className="space-y-4"
      role="status"
    >
      <Skeleton className="h-36 w-full rounded-none" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton
            className="h-40 rounded-none"
            key={index}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-none" />
        <Skeleton className="h-80 rounded-none" />
      </div>
    </div>
  );
}

export function TechnicianDashboard() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] =
    useState<TechnicianDashboardSnapshot | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [
        awaitingResponse,
        acceptedResponse,
        inProgressResponse,
        scheduleResponse,
      ] = await Promise.all([
        getTechnicianJobOrders({
          status: "pending_technician_response",
          per_page: 5,
        }),
        getTechnicianJobOrders({
          status: "accepted",
          per_page: 1,
        }),
        getTechnicianJobOrders({
          status: "in_progress",
          per_page: 1,
        }),
        getTechnicianSchedule(),
      ]);

      setSnapshot({
        awaitingResponseCount: awaitingResponse.data.total,
        awaitingResponseJobs: awaitingResponse.data.data,
        acceptedCount: acceptedResponse.data.total,
        inProgressCount: inProgressResponse.data.total,
        scheduledJobs:
          scheduleResponse.data.job_orders.slice(0, 5),
      });
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load your technician dashboard.",
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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!snapshot) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-4 border bg-background p-6 text-center">
        <p
          className="max-w-md text-sm text-destructive"
          role="alert"
        >
          {errorMessage ||
            "Technician dashboard is unavailable."}
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

  return (
    <div className="space-y-4">
      <section className="flex flex-col justify-between gap-5 border bg-background p-5 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Technician workspace
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome, {user?.name ?? "Technician"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Review schedule decisions and keep track of your
            assigned work.
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
            render={<Link to="/technician/my-jobs" />}
          >
            Open my jobs
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
        aria-label="Technician job overview"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <MetricCard
          description="Official schedules waiting for your decision."
          icon={UserRoundCheck}
          label="Awaiting response"
          value={snapshot.awaitingResponseCount}
        />
        <MetricCard
          description="Accepted jobs that have not been started."
          icon={CheckCircle2}
          label="Accepted jobs"
          value={snapshot.acceptedCount}
        />
        <MetricCard
          description="Service work currently underway."
          icon={Play}
          label="In progress"
          value={snapshot.inProgressCount}
        />
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-2">
        <Card className="gap-0 rounded-none bg-background py-0 shadow-none">
          <CardHeader className="border-b p-5">
            <CardTitle className="flex items-center gap-2">
              <UserRoundCheck
                aria-hidden={true}
                className="size-4 text-muted-foreground"
              />
              <h2>Schedules needing your response</h2>
            </CardTitle>
            <CardDescription>
              Review the official time before accepting or
              requesting a change.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {snapshot.awaitingResponseJobs.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
                <UserRoundCheck
                  aria-hidden={true}
                  className="size-6 text-muted-foreground"
                />
                <p className="mt-3 font-medium">
                  No schedule decisions pending
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  New schedules will appear here when a
                  dispatcher sends them.
                </p>
              </div>
            ) : (
              snapshot.awaitingResponseJobs.map((jobOrder) => (
                <JobPreview
                  actionLabel="Review schedule"
                  jobOrder={jobOrder}
                  key={jobOrder.id}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-none bg-background py-0 shadow-none">
          <CardHeader className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock
                  aria-hidden={true}
                  className="size-4 text-muted-foreground"
                />
                <h2>Scheduled work</h2>
              </CardTitle>
              <CardDescription className="mt-1">
                Appointments from your current schedule.
              </CardDescription>
            </div>

            <Button
              render={<Link to="/technician/schedule" />}
              size="sm"
              variant="outline"
            >
              Full schedule
              <ArrowRight aria-hidden={true} />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {snapshot.scheduledJobs.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
                <ClipboardList
                  aria-hidden={true}
                  className="size-6 text-muted-foreground"
                />
                <p className="mt-3 font-medium">
                  No scheduled work
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Appointments will appear here after schedules
                  are accepted.
                </p>
              </div>
            ) : (
              snapshot.scheduledJobs.map((jobOrder) => (
                <JobPreview
                  actionLabel="View job"
                  jobOrder={jobOrder}
                  key={jobOrder.id}
                />
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}