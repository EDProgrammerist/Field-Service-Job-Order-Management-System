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
import type { TechnicianJobOrder } from "@/types/technician-job-order";
import type { Technician } from "@/types/technician";

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

function ScheduledJobCard({
  jobOrder,
}: {
  jobOrder: TechnicianJobOrder;
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

          <h3 className="mt-2 truncate font-medium">
            {jobOrder.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {jobOrder.customer.name}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
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
        >
          View
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
  const [scheduledJobs, setScheduledJobs] = useState<
    TechnicianJobOrder[]
  >([]);
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
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              className="h-40 w-full"
              key={index}
            />
          ))}
        </div>

        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (errorMessage || !technician) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
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
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border bg-background p-5 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Technician workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome, {technician.user.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {technician.employee_number} ·{" "}
            {technician.specialization ??
              "No specialization listed"}
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
            render={<Link to="/technician/my-jobs" />}
          >
            Open my jobs
            <ArrowRight aria-hidden={true} />
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          description="Official schedules waiting for your decision."
          icon={UserRoundCheck}
          label="Awaiting response"
          value={awaitingResponseCount}
        />

        <MetricCard
          description="Accepted work that is ready to begin."
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

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="size-4 text-muted-foreground" />
              Technician profile
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <p className="font-medium">
              {technician.user.name}
            </p>
            <p>{technician.user.email}</p>
            <p>
              {technician.phone ?? "No phone number"}
            </p>
            <p className="text-muted-foreground">
              {technician.is_active
                ? "Active technician"
                : "Inactive technician"}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4 text-muted-foreground" />
              Upcoming scheduled work
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {scheduledJobs.length === 0 ? (
              <div className="p-8 text-center">
                <ClipboardList className="mx-auto size-8 text-muted-foreground" />
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
                render={
                  <Link to="/technician/schedule" />
                }
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