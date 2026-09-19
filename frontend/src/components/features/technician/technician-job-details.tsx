import {
  useCallback,
  useEffect,
  useState,
} from "react";
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

  return new Intl.DateTimeFormat(undefined, {
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
      <section className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-80 w-full" />
      </section>
    );
  }

  if (errorMessage || !jobOrder) {
    return (
      <section className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
        <p
          className="max-w-md text-sm text-destructive"
          role="alert"
        >
          {errorMessage || "Job order not found."}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadDetails()}
          >
            <RefreshCw aria-hidden={true} />
            Try again
          </Button>

          <Button
            type="button"
            onClick={() =>
              navigate("/technician/my-jobs")
            }
          >
            <ArrowLeft aria-hidden={true} />
            Back to my jobs
          </Button>
        </div>
      </section>
    );
  }

  const revision = jobOrder.latest_schedule_revision;
  const response = jobOrder.latest_technician_response;

  return (
    <section className="space-y-6">
      <Button
        render={<Link to="/technician/my-jobs" />}
        variant="outline"
      >
        <ArrowLeft aria-hidden={true} />
        Back to my jobs
      </Button>

      {successMessage ? (
        <div
          className="flex items-start justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
          role="status"
        >
          <span>{successMessage}</span>

          <Button
            aria-label="Dismiss message"
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={() => setSuccessMessage("")}
          >
            <X aria-hidden={true} />
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-4 border bg-background p-5 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              {jobOrder.job_order_number}
            </p>
            <JobOrderStatusBadge status={jobOrder.status} />
            <JobOrderPriorityBadge
              priority={jobOrder.priority}
            />
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {jobOrder.title}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
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
            variant="outline"
          >
            <MessageCircle aria-hidden={true} />
            Message customer
          </Button>

          <Button
            render={<Link to="/technician/schedule" />}
            variant="outline"
          >
            <CalendarClock aria-hidden={true} />
            View my schedule
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Service details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 text-sm">
            <div>
              <p className="text-muted-foreground">
                Description
              </p>
              <p className="mt-1 whitespace-pre-wrap">
                {jobOrder.description ??
                  "No description provided."}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Service address
              </p>
              <p className="mt-1 whitespace-pre-wrap">
                {jobOrder.service_address ??
                  "No service address provided."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Official schedule</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">
                Starts
              </p>
              <p className="mt-1 font-medium">
                {formatDate(jobOrder.scheduled_at)}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Ends
              </p>
              <p className="mt-1 font-medium">
                {formatDate(jobOrder.scheduled_end_at)}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Schedule version
              </p>
              <p className="mt-1">
                {jobOrder.schedule_version || "Not scheduled"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Dispatcher remarks
              </p>
              <p className="mt-1 whitespace-pre-wrap">
                {revision?.remarks ?? "No remarks"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest response</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
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

            void getTechnicianJobOrderHistory(
              jobOrderId,
            )
              .then((historyResponse) => {
                setHistory(historyResponse.data);
              })
              .catch(() => undefined);
          }}
        />

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Job history</CardTitle>
          </CardHeader>

          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No status history is available.
              </p>
            ) : (
              <ol className="space-y-4">
                {history.map((entry) => (
                  <li
                    className="border-l-2 border-primary/30 pl-4 text-sm"
                    key={entry.id}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <JobOrderStatusBadge
                        status={entry.status}
                      />
                      <span className="text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </span>
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