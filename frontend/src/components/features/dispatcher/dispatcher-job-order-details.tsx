import { useCallback, useEffect, useState } from "react";
import { CalendarClock, RefreshCw, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";

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
  getDispatcherJobOrder,
  getDispatcherJobOrderStatusHistory,
} from "@/services/dispatcher-job-orders";
import type { DispatcherJobOrder } from "@/types/dispatcher-job-order";
import type { JobOrderStatusHistory } from "@/types/job-order";

interface DispatcherJobOrderDetailsProps {
  jobOrderId: number;
}

function formatDate(value: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getSuccessMessage(state: unknown) {
  if (
    typeof state !== "object" ||
    state === null ||
    !("successMessage" in state) ||
    typeof state.successMessage !== "string"
  ) {
    return "";
  }

  return state.successMessage;
}

export function DispatcherJobOrderDetails({
  jobOrderId,
}: DispatcherJobOrderDetailsProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [jobOrder, setJobOrder] =
    useState<DispatcherJobOrder | null>(null);
  const [statusHistory, setStatusHistory] =
    useState<JobOrderStatusHistory[]>([]);
  const [successMessage, setSuccessMessage] = useState(
    () => getSuccessMessage(location.state),
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDetails = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [jobOrderResponse, historyResponse] = await Promise.all([
        getDispatcherJobOrder(jobOrderId),
        getDispatcherJobOrderStatusHistory(jobOrderId),
      ]);

      setJobOrder(jobOrderResponse.data);
      setStatusHistory(historyResponse.data.data);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load this scheduling request.",
      );
      setErrorMessage(details.message);
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
        className="grid gap-4 lg:grid-cols-3"
        aria-label="Loading scheduling request"
      >
        <Skeleton className="h-36 rounded-none lg:col-span-3" />
        <Skeleton className="h-72 rounded-none lg:col-span-2" />
        <Skeleton className="h-72 rounded-none" />
        <Skeleton className="h-64 rounded-none lg:col-span-3" />
      </section>
    );
  }

  if (errorMessage || !jobOrder) {
    return (
      <section className="flex min-h-72 flex-col items-center justify-center gap-4 border bg-background p-6 text-center">
        <p className="max-w-md text-sm text-destructive" role="alert">
          {errorMessage || "Scheduling request not found."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void loadDetails()}
        >
          <RefreshCw aria-hidden={true} />
          Try again
        </Button>
      </section>
    );
  }

  const technician = jobOrder.selected_technician;
  const revision = jobOrder.latest_schedule_revision;

  return (
    <section className="space-y-4">
      {successMessage ? (
        <div
          className="flex items-start justify-between gap-3 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
          role="status"
        >
          <span>{successMessage}</span>
          <Button
            aria-label="Dismiss message"
            onClick={() => {
              setSuccessMessage("");
              navigate(location.pathname, {
                replace: true,
                state: null,
              });
            }}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <X aria-hidden={true} />
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-5 border bg-background p-5 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground">
              {jobOrder.job_order_number}
            </span>
            <JobOrderStatusBadge status={jobOrder.status} />
            <JobOrderPriorityBadge priority={jobOrder.priority} />
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            {jobOrder.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Submitted {formatDate(jobOrder.created_at)}
          </p>
        </div>

        {jobOrder.can_schedule ? (
          <Button
            render={
              <Link
                to={`/dispatcher/job-orders/${jobOrder.id}/schedule`}
              />
            }
            className="w-full shrink-0 sm:w-auto"
          >
            <CalendarClock aria-hidden={true} />
            {jobOrder.schedule_version > 0
              ? "Update schedule"
              : "Set schedule"}
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 rounded-none py-0 shadow-none lg:col-span-2">
          <CardHeader className="border-b p-5">
            <CardTitle className="text-base">Service request</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </p>
              <p className="mt-2 whitespace-pre-wrap leading-6">
                {jobOrder.description ?? "No description provided."}
              </p>
            </div>
            <div className="border-t pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Service address
              </p>
              <p className="mt-2 whitespace-pre-wrap leading-6">
                {jobOrder.service_address ??
                  "No service address provided."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-none py-0 shadow-none">
          <CardHeader className="border-b p-5">
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">
                Customer name
              </p>
              <p className="mt-1 font-medium">
                {jobOrder.customer.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Contact person
              </p>
              <p className="mt-1">
                {jobOrder.customer.contact_person ??
                  "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Phone
              </p>
              <p className="mt-1">{jobOrder.customer.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Email
              </p>
              <p className="mt-1 break-all">
                {jobOrder.customer.email ??
                  "No email address"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-none py-0 shadow-none">
          <CardHeader className="border-b p-5">
            <CardTitle className="text-base">
              Customer-selected technician
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5 text-sm">
            {technician ? (
              <>
                <div>
                  <p className="font-medium">{technician.name}</p>
                  <p className="mt-1 text-muted-foreground">
                    {technician.employee_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Specialization
                  </p>
                  <p className="mt-1">
                    {technician.specialization ??
                      "General service"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Phone
                  </p>
                  <p className="mt-1">
                    {technician.phone ??
                      "No technician phone number"}
                  </p>
                </div>
                <p className="border-t pt-4 text-xs leading-5 text-muted-foreground">
                  This technician was chosen by the customer.
                  Dispatch can set the schedule but cannot change
                  the technician.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                The selected technician is unavailable.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-none py-0 shadow-none lg:col-span-2">
          <CardHeader className="border-b p-5">
            <CardTitle className="text-base">
              Official schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">
                Starts
              </p>
              <p className="mt-1 font-medium">
                {formatDate(jobOrder.scheduled_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Ends
              </p>
              <p className="mt-1 font-medium">
                {formatDate(jobOrder.scheduled_end_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Schedule version
              </p>
              <p className="mt-1">
                {jobOrder.schedule_version ||
                  "Not scheduled"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Scheduled by
              </p>
              <p className="mt-1">
                {jobOrder.scheduled_by_user?.name ??
                  "Not scheduled"}
              </p>
            </div>
            {revision?.remarks ? (
              <div className="border-t pt-4 sm:col-span-2">
                <p className="text-xs text-muted-foreground">
                  Latest scheduling remarks
                </p>
                <p className="mt-2 whitespace-pre-wrap leading-6">
                  {revision.remarks}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-none py-0 shadow-none lg:col-span-3">
          <CardHeader className="border-b p-5">
            <CardTitle className="text-base">
              Status history
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {statusHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No status history is available.
              </p>
            ) : (
              <ol className="space-y-5">
                {statusHistory.map((history) => (
                  <li
                    className="border-l-2 border-primary/30 pl-4 text-sm"
                    key={history.id}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <JobOrderStatusBadge
                        status={history.status}
                      />
                      <span className="text-muted-foreground">
                        {formatDate(history.created_at)}
                      </span>
                    </div>
                    <p className="mt-2">
                      Changed by {history.changed_by.name}
                    </p>
                    {history.remarks ? (
                      <p className="mt-1 whitespace-pre-wrap leading-6 text-muted-foreground">
                        {history.remarks}
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