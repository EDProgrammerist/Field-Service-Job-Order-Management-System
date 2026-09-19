import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  MessageCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

import {
  JobOrderPriorityBadge,
  JobOrderStatusBadge,
} from "@/components/features/job-orders/job-order-badges";
import { TechnicianJobActions } from "@/components/features/technician/technician-job-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorDetails } from "@/lib/api-errors";
import {
  getTechnicianJobOrder,
  getTechnicianJobOrderHistory,
} from "@/services/technician-job-orders";
import type { JobOrderStatusHistory } from "@/types/job-order";
import type { TechnicianJobOrder } from "@/types/technician-job-order";

interface TechnicianJobDetailsProps {
  jobOrderId: number;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusGuidance(jobOrder: TechnicianJobOrder) {
  if (jobOrder.status === "pending_schedule") {
    return "The dispatcher has not assigned an official schedule yet.";
  }

  if (jobOrder.status === "technician_rejected") {
    return "The dispatcher must provide a new schedule before you can respond again.";
  }

  if (jobOrder.status === "completed") {
    return "Your work is complete. An administrator may now close this request.";
  }

  if (jobOrder.status === "cancelled") {
    return "This service request was cancelled.";
  }

  if (jobOrder.status === "closed") {
    return "This service request is closed.";
  }

  return "Follow the available action for the current workflow status.";
}

export function TechnicianJobDetails({
  jobOrderId,
}: TechnicianJobDetailsProps) {
  const navigate = useNavigate();

  const [jobOrder, setJobOrder] =
    useState<TechnicianJobOrder | null>(null);
  const [history, setHistory] = useState<
    JobOrderStatusHistory[]
  >([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDetails = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [jobOrderResponse, historyResponse] =
        await Promise.all([
          getTechnicianJobOrder(jobOrderId),
          getTechnicianJobOrderHistory(jobOrderId),
        ]);

      setJobOrder(jobOrderResponse.data);
      setHistory(historyResponse.data);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load this job order.",
      );

      setErrorMessage(details.message);
      setJobOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [jobOrderId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDetails();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDetails]);

  if (isLoading) {
    return (
      <section
        aria-label="Loading job details"
        className="space-y-4"
        role="status"
      >
        <Skeleton className="h-9 w-40 rounded-none" />
        <Skeleton className="h-28 w-full rounded-none" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-none lg:col-span-2" />
          <Skeleton className="h-72 rounded-none" />
        </div>
        <Skeleton className="h-48 w-full rounded-none" />
      </section>
    );
  }

  if (errorMessage || !jobOrder) {
    return (
      <Card className="mx-auto max-w-xl gap-0 rounded-none py-0 shadow-none">
        <CardHeader className="rounded-none border-b p-5">
          <CardTitle>Job unavailable</CardTitle>
          <CardDescription role="alert">
            {errorMessage || "Job order not found."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-2 p-5">
          <Button
            onClick={() => void loadDetails()}
            type="button"
            variant="outline"
          >
            <RefreshCw aria-hidden={true} />
            Try again
          </Button>

          <Button
            onClick={() => navigate("/technician/my-jobs")}
            type="button"
          >
            <ArrowLeft aria-hidden={true} />
            Back to my jobs
          </Button>
        </CardContent>
      </Card>
    );
  }

  const revision = jobOrder.latest_schedule_revision;
  const response = jobOrder.latest_technician_response;

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
      <Button
        render={<Link to="/technician/my-jobs" />}
        size="sm"
        variant="outline"
      >
        <ArrowLeft aria-hidden={true} />
        Back to my jobs
      </Button>

      {successMessage ? (
        <div
          className="flex items-start justify-between gap-3 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
          role="status"
        >
          <span>{successMessage}</span>

          <Button
            aria-label="Dismiss message"
            onClick={() => setSuccessMessage("")}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <X aria-hidden={true} />
          </Button>
        </div>
      ) : null}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs text-muted-foreground">
              {jobOrder.job_order_number}
            </p>
            <JobOrderStatusBadge status={jobOrder.status} />
            <JobOrderPriorityBadge
              priority={jobOrder.priority}
            />
          </div>

          <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            {jobOrder.title}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {statusGuidance(jobOrder)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            render={
              <Link
                to={`/conversations/job-orders/${jobOrder.id}`}
              />
            }
            size="sm"
            variant="outline"
          >
            <MessageCircle aria-hidden={true} />
            View conversation
          </Button>

          <Button
            render={<Link to="/technician/schedule" />}
            size="sm"
            variant="outline"
          >
            <CalendarClock aria-hidden={true} />
            View my schedule
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 rounded-none py-0 shadow-none lg:col-span-2">
          <CardHeader className="rounded-none border-b p-5">
            <CardTitle>Service details</CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <dl className="space-y-5 text-sm">
              <div>
                <dt className="text-muted-foreground">
                  Description
                </dt>
                <dd className="mt-1 whitespace-pre-wrap">
                  {jobOrder.description ??
                    "No description provided."}
                </dd>
              </div>

              <div>
                <dt className="text-muted-foreground">
                  Service address
                </dt>
                <dd className="mt-1 whitespace-pre-wrap">
                  {jobOrder.service_address ??
                    "No service address provided."}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-none py-0 shadow-none">
          <CardHeader className="rounded-none border-b p-5">
            <CardTitle>Customer</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 p-5 text-sm">
            <p className="font-medium">
              {jobOrder.customer.name}
            </p>
            <p className="text-muted-foreground">
              {jobOrder.customer.contact_person ??
                "No contact person"}
            </p>
            <p>{jobOrder.customer.phone}</p>
            <p className="break-all">
              {jobOrder.customer.email ??
                "No email address"}
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-none py-0 shadow-none lg:col-span-2">
          <CardHeader className="rounded-none border-b p-5">
            <CardTitle>Official schedule</CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <dl className="grid gap-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">
                  Starts
                </dt>
                <dd className="mt-1 font-medium">
                  {formatDate(jobOrder.scheduled_at)}
                </dd>
              </div>

              <div>
                <dt className="text-muted-foreground">
                  Ends
                </dt>
                <dd className="mt-1 font-medium">
                  {formatDate(jobOrder.scheduled_end_at)}
                </dd>
              </div>

              <div>
                <dt className="text-muted-foreground">
                  Schedule version
                </dt>
                <dd className="mt-1">
                  {jobOrder.schedule_version ||
                    "Not scheduled"}
                </dd>
              </div>

              <div>
                <dt className="text-muted-foreground">
                  Dispatcher remarks
                </dt>
                <dd className="mt-1 whitespace-pre-wrap">
                  {revision?.remarks ?? "No remarks"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-none py-0 shadow-none">
          <CardHeader className="rounded-none border-b p-5">
            <CardTitle>Latest response</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 p-5 text-sm">
            {response ? (
              <>
                <p className="font-medium capitalize">
                  {response.response}
                </p>
                <p className="text-muted-foreground">
                  {formatDate(response.responded_at)}
                </p>
                <p className="whitespace-pre-wrap">
                  {response.response_notes ??
                    "No response notes"}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                No technician response has been recorded for
                the current schedule.
              </p>
            )}
          </CardContent>
        </Card>

        <TechnicianJobActions
          jobOrder={jobOrder}
          onRefresh={loadDetails}
          onUpdated={(updatedJobOrder, message) => {
            setJobOrder(updatedJobOrder);
            setSuccessMessage(message);

            void getTechnicianJobOrderHistory(jobOrderId)
              .then((historyResponse) => {
                setHistory(historyResponse.data);
              })
              .catch(() => undefined);
          }}
        />

        <Card className="gap-0 rounded-none py-0 shadow-none lg:col-span-3">
          <CardHeader className="rounded-none border-b p-5">
            <CardTitle>Job history</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {history.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">
                No status history is available.
              </p>
            ) : (
              <ol className="divide-y">
                {history.map((entry) => (
                  <li className="p-5 text-sm" key={entry.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      <JobOrderStatusBadge
                        status={entry.status}
                      />
                      <time
                        className="text-xs text-muted-foreground"
                        dateTime={entry.created_at}
                      >
                        {formatDate(entry.created_at)}
                      </time>
                    </div>

                    <p className="mt-2">
                      Changed by {entry.changed_by.name}
                    </p>

                    {entry.remarks ? (
                      <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                        {entry.remarks}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}