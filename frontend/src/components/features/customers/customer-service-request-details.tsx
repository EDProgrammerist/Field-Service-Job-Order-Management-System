import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";

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
import { getCustomerServiceRequest } from "@/services/customer-service-requests";
import type { CustomerServiceRequestDetails } from "@/types/job-order";

interface CustomerServiceRequestDetailsProps {
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

export function CustomerServiceRequestDetails({
  jobOrderId,
}: CustomerServiceRequestDetailsProps) {
  const navigate = useNavigate();

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
      <section className="space-y-6">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </section>
    );
  }

  if (errorMessage || !request) {
    return (
      <section className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
        <p className="max-w-md text-sm text-destructive" role="alert">
          {errorMessage || "Service request not found."}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" onClick={loadRequest}>
            <RefreshCw />
            Try again
          </Button>

          <Button
            type="button"
            onClick={() => navigate("/customer/service-requests")}
          >
            <ArrowLeft />
            Back to My Requests
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate("/customer/service-requests")}
      >
        <ArrowLeft />
        Back to My Requests
      </Button>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {request.job_order_number}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {request.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Submitted {formatDate(request.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <JobOrderStatusBadge status={request.status} />
          <JobOrderPriorityBadge priority={request.priority} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Request details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div>
              <p className="text-muted-foreground">Problem description</p>
              <p className="mt-1 whitespace-pre-wrap">
                {request.description}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Service address</p>
              <p className="mt-1 whitespace-pre-wrap">
                {request.service_address}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Scheduled date and time
              </p>
              <p className="mt-1">{formatDate(request.scheduled_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned technician</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {request.active_assignment ? (
              <>
                <p className="font-medium">
                  {request.active_assignment.technician.user.name}
                </p>
                <p className="text-muted-foreground">
                  {request.active_assignment.technician.employee_number}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                A technician has not been assigned yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Status history</CardTitle>
          </CardHeader>
          <CardContent>
            {request.status_histories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No status history is available.
              </p>
            ) : (
              <ol className="space-y-4">
                {request.status_histories.map((history) => (
                  <li
                    key={history.id}
                    className="border-l-2 border-primary/30 pl-4 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <JobOrderStatusBadge status={history.status} />
                      <span className="text-muted-foreground">
                        {formatDate(history.created_at)}
                      </span>
                    </div>

                    <p className="mt-2">
                      Updated by {history.changed_by.name}
                    </p>

                    {history.remarks ? (
                      <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
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
