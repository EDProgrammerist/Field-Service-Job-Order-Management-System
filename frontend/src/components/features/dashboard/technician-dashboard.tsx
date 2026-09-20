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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorDetails } from "@/lib/api-errors";
import {
  getTechnicianJobOrders,
  getTechnicianSchedule,
} from "@/services/technician-job-orders";
import { getMyTechnician } from "@/services/technicians";
import type { Technician } from "@/types/technician";
import type { TechnicianJobOrder } from "@/types/technician-job-order";

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

function ScheduledJobCard({
  jobOrder,
}: {
  jobOrder: TechnicianJobOrder;
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
          render={
            <Link
              to={`/technician/my-jobs/${jobOrder.id}`}
            />
          }
          size="sm"
          variant="outline"
          className="w-full shrink-0 sm:w-auto"
        >
          View job
          <ArrowRight aria-hidden={true} />
        </Button>
      </div>
    </article>
  );
}

export function TechnicianDashboard() {
  const [technician, setTechnician] =
    useState<Technician | null>(null);
  const [awaitingResponseCount, setAwaitingResponseCount] =
    useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [scheduledJobs, setScheduledJobs] =
    useState<TechnicianJobOrder[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [
        technicianResponse,
        awaitingResponse,
        acceptedResponse,
        inProgressResponse,
        scheduleResponse,
      ] = await Promise.all([
        getMyTechnician(),
        getTechnicianJobOrders({
          status: "pending_technician_response",
          per_page: 1,
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

      setTechnician(technicianResponse.data);
      setAwaitingResponseCount(
        awaitingResponse.data.total,
      );
      setAcceptedCount(acceptedResponse.data.total);
      setInProgressCount(inProgressResponse.data.total);
      setScheduledJobs(
        scheduleResponse.data.job_orders.slice(0, 5),
      );
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
    return (
      <div
        className="space-y-4"
        aria-label="Loading technician dashboard"
      >
        <Skeleton className="h-36 w-full rounded-none" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              className="h-44 w-full rounded-none"
              key={index}
            />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 w-full rounded-none" />
          <Skeleton className="h-72 w-full rounded-none lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (errorMessage || !technician) {
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

  return (
    <div className="space-y-4">
      <section className="flex flex-col justify-between gap-5 border bg-background p-5 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Technician workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome, {technician.user.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {technician.employee_number} ·{" "}
            {technician.specialization ??
              "No specialization listed"}
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
            render={<Link to="/technician/my-jobs" />}
          >
            Open my jobs
            <ArrowRight aria-hidden={true} />
          </Button>
        </div>
      </section>

      <section
        className="grid gap-4 lg:grid-cols-3"
        aria-label="Technician job overview"
      >
        <MetricCard
          description="Official schedules waiting for your decision."
          icon={UserRoundCheck}
          label="Awaiting response"
          value={awaitingResponseCount}
        />
        <MetricCard
          description="Accepted service work ready to begin."
          icon={CheckCircle2}
          label="Accepted jobs"
          value={acceptedCount}
        />
        <MetricCard
          description="Service work currently underway."
          icon={Play}
          label="In progress"
          value={inProgressCount}
        />
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="gap-0 rounded-none py-0 shadow-none">
          <CardHeader className="flex flex-row items-center gap-2 border-b p-5">
            <Wrench
              aria-hidden={true}
              className="size-4 text-muted-foreground"
            />
            <CardTitle className="text-base">
              Technician profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">
                Name
              </p>
              <p className="mt-1 font-medium">
                {technician.user.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Email
              </p>
              <p className="mt-1 break-all">
                {technician.user.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Phone
              </p>
              <p className="mt-1">
                {technician.phone ?? "No phone number"}
              </p>
            </div>
            <p className="border-t pt-4 text-xs text-muted-foreground">
              {technician.is_active
                ? "Active technician"
                : "Inactive technician"}
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-none py-0 shadow-none lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 border-b p-5">
            <CalendarClock
              aria-hidden={true}
              className="size-4 text-muted-foreground"
            />
            <CardTitle className="text-base">
              Upcoming scheduled work
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {scheduledJobs.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
                <ClipboardList
                  aria-hidden={true}
                  className="size-6 text-muted-foreground"
                />
                <p className="mt-3 font-medium">
                  No active scheduled work
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Accepted and in-progress jobs will appear
                  here.
                </p>
              </div>
            ) : (
              scheduledJobs.map((jobOrder) => (
                <ScheduledJobCard
                  jobOrder={jobOrder}
                  key={jobOrder.id}
                />
              ))
            )}

            <div className="border-t p-4">
              <Button
                className="w-full"
                render={<Link to="/technician/schedule" />}
                variant="outline"
              >
                View full schedule
                <ArrowRight aria-hidden={true} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}