import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, RefreshCw } from "lucide-react";
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
import { getApiErrorDetails } from "@/lib/api-errors";
import { getCustomerServiceRequest } from "@/services/customer-service-requests";
import type { CustomerServiceRequestDetails } from "@/types/job-order";

interface CustomerServiceRequestDetailsProps {
  jobOrderId: number;
}

function formatDate(value: string | null, fallback = "Not scheduled") {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CustomerServiceRequestDetails({
  jobOrderId,
}: CustomerServiceRequestDetailsProps) {
  const [request, setRequest] =
    useState<CustomerServiceRequestDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadRequest = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getCustomerServiceRequest(jobOrderId);
      setRequest(response.data);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load this service request. Please try again.",
      );

      setErrorMessage(details.message);
    } finally {
      setIsLoading(false);
    }
  }, [jobOrderId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRequest();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRequest]);

  if (isLoading) {
    return (
      <section
        aria-label="Loading service request"
        className="space-y-4"
        role="status"
      >
        <Skeleton className="h-9 w-40 rounded-none" />
        <Skeleton className="h-24 w-full rounded-none" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-none lg:col-span-2" />
          <Skeleton className="h-72 rounded-none" />
        </div>
        <Skeleton className="h-48 w-full rounded-none" />
      </section>
    );
  }

  if (errorMessage || !request) {
    return (
      <Card className="mx-auto max-w-xl gap-0 rounded-none py-0 shadow-none">
        <CardHeader className="rounded-none border-b p-5">
          <CardTitle>Request unavailable</CardTitle>
          <CardDescription role="alert">
            {errorMessage || "Service request not found."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-2 p-5">
          <Button onClick={() => void loadRequest()} type="button">
            <RefreshCw aria-hidden={true} />
            Try again
          </Button>

          <Button
            render={<Link to="/customer/service-requests" />}
            variant="outline"
          >
            <ArrowLeft aria-hidden={true} />
            Back to My Requests
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
      <Button
        render={<Link to="/customer/service-requests" />}
        size="sm"
        variant="outline"
      >
        <ArrowLeft aria-hidden={true} />
        Back to My Requests
      </Button>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">
            {request.job_order_number}
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            {request.title}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Submitted {formatDate(request.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <JobOrderStatusBadge status={request.status} />
          <JobOrderPriorityBadge priority={request.priority} />

          <Button
            aria-label="Refresh service request"
            onClick={() => void loadRequest()}
            size="icon"
            type="button"
            variant="outline"
          >
            <RefreshCw aria-hidden={true} />
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 rounded-none py-0 shadow-none lg:col-span-2">
          <CardHeader className="rounded-none border-b p-5">
            <CardTitle>Request details</CardTitle>
            <CardDescription>
              The problem, service location, and assigned schedule.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            <dl className="grid gap-5 text-sm sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">
                  Problem description
                </dt>
                <dd className="mt-1 whitespace-pre-wrap">
                  {request.description || "No description provided."}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">
                  Service address
                </dt>
                <dd className="mt-1 whitespace-pre-wrap">
                  {request.service_address || "No address provided."}
                </dd>
              </div>

              <div>
                <dt className="text-muted-foreground">
                  Scheduled start
                </dt>
                <dd className="mt-1 font-medium">
                  {formatDate(request.scheduled_at)}
                </dd>
              </div>

              <div>
                <dt className="text-muted-foreground">
                  Scheduled end
                </dt>
                <dd className="mt-1 font-medium">
                  {formatDate(request.scheduled_end_at)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-none py-0 shadow-none">
          <CardHeader className="rounded-none border-b p-5">
            <CardTitle>Selected technician</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 p-5 text-sm">
            {request.selected_technician ? (
              <>
                <div>
                  <p className="font-medium">
                    {request.selected_technician.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {request.selected_technician.employee_number}
                  </p>
                </div>

                <p>
                  {request.selected_technician.specialization ??
                    "General field service"}
                </p>

                {request.selected_technician.introduction ? (
                  <p className="leading-6 text-muted-foreground">
                    {request.selected_technician.introduction}
                  </p>
                ) : null}

                <Button
                  render={
                    <Link
                      to={`/conversations/job-orders/${request.id}`}
                    />
                  }
                  variant="outline"
                >
                  <MessageCircle aria-hidden={true} />
                  View conversation
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">
                The selected technician profile is unavailable.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 rounded-none py-0 shadow-none">
        <CardHeader className="rounded-none border-b p-5">
          <CardTitle>Status history</CardTitle>
          <CardDescription>
            Recorded changes to this service request.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {request.status_histories.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">
              No status history is available.
            </p>
          ) : (
            <ol className="divide-y">
              {request.status_histories.map((history) => (
                <li className="p-5" key={history.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <JobOrderStatusBadge status={history.status} />
                    <time className="text-xs text-muted-foreground">
                      {formatDate(history.created_at)}
                    </time>
                  </div>

                  <p className="mt-2 text-sm">
                    Updated by {history.changed_by.name}
                  </p>

                  {history.remarks ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                      {history.remarks}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </section>
  );
}