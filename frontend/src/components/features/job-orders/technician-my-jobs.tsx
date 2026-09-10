import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";

import {
  JobOrderPriorityBadge,
  JobOrderStatusBadge,
} from "@/components/features/job-orders/job-order-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getMyJobOrders } from "@/services/job-orders";
import type { JobOrder } from "@/types/job-order";

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TechnicianMyJobs() {
  const navigate = useNavigate();

  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getMyJobOrders({
        per_page: 100,
      });

      setJobOrders(response.data.data);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load your assigned jobs. Please try again.",
      );

      setErrorMessage(details.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadJobs();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadJobs]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Technician workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          My Jobs
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Job orders currently assigned to your technician profile.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assigned work</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-56 w-full" />
              ))}
            </div>
          ) : null}

          {!isLoading && errorMessage ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
              <p className="max-w-md text-sm text-destructive" role="alert">
                {errorMessage}
              </p>

              <Button type="button" onClick={() => void loadJobs()}>
                <RefreshCw />
                Try again
              </Button>
            </div>
          ) : null}

          {!isLoading && !errorMessage && jobOrders.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <ClipboardList className="size-6 text-muted-foreground" />
              </div>
              <h2 className="mt-4 font-semibold">No assigned jobs</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                You do not currently have any active job orders.
              </p>
            </div>
          ) : null}

          {!isLoading && !errorMessage && jobOrders.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {jobOrders.map((jobOrder) => (
                <article
                  key={jobOrder.id}
                  className="rounded-lg border bg-card p-4 text-card-foreground"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        {jobOrder.job_order_number}
                      </p>
                      <h2 className="mt-1 truncate font-semibold">
                        {jobOrder.title}
                      </h2>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {jobOrder.customer.name}
                      </p>
                    </div>

                    <JobOrderStatusBadge status={jobOrder.status} />
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Schedule: </span>
                      {formatDate(jobOrder.scheduled_at)}
                    </p>
                    <p className="line-clamp-2">
                      <span className="text-muted-foreground">
                        Service address:{" "}
                      </span>
                      {jobOrder.service_address ?? "Not provided"}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <JobOrderPriorityBadge priority={jobOrder.priority} />

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/technician/my-jobs/${jobOrder.id}`)
                      }
                    >
                      <Eye />
                      View
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
