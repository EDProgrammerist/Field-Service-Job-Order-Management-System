import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";

import {
  JobOrderPriorityBadge,
  JobOrderStatusBadge,
} from "@/components/features/job-orders/job-order-badges";
import { JobOrderStatusPanel } from "@/components/features/job-orders/job-order-status-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getMyJobOrders } from "@/services/job-orders";
import type { JobOrder } from "@/types/job-order";

interface TechnicianJobOrderDetailsProps {
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

export function TechnicianJobOrderDetails({
  jobOrderId,
}: TechnicianJobOrderDetailsProps) {
  const navigate = useNavigate();

  const [jobOrder, setJobOrder] = useState<JobOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadJobOrder = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getMyJobOrders({
        per_page: 100,
      });

      const foundJobOrder =
        response.data.data.find((item) => item.id === jobOrderId) ?? null;

      if (!foundJobOrder) {
        setErrorMessage(
          "This job order is not currently assigned to your technician profile.",
        );
        setJobOrder(null);
        return;
      }

      setJobOrder(foundJobOrder);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load this job order. Please try again.",
      );

      setErrorMessage(details.message);
    } finally {
      setIsLoading(false);
    }
  }, [jobOrderId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadJobOrder();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadJobOrder]);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </section>
    );
  }

  if (errorMessage || !jobOrder) {
    return (
      <section className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
        <p className="max-w-md text-sm text-destructive" role="alert">
          {errorMessage || "Job order not found."}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" onClick={loadJobOrder}>
            <RefreshCw />
            Try again
          </Button>

          <Button
            type="button"
            onClick={() => navigate("/technician/my-jobs")}
          >
            <ArrowLeft />
            Back to My Jobs
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
        onClick={() => navigate("/technician/my-jobs")}
      >
        <ArrowLeft />
        Back to My Jobs
      </Button>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {jobOrder.job_order_number}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {jobOrder.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Scheduled {formatDate(jobOrder.scheduled_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <JobOrderStatusBadge status={jobOrder.status} />
          <JobOrderPriorityBadge priority={jobOrder.priority} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Service details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div>
              <p className="text-muted-foreground">Description</p>
              <p className="mt-1 whitespace-pre-wrap">
                {jobOrder.description ?? "No description provided."}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Service address</p>
              <p className="mt-1 whitespace-pre-wrap">
                {jobOrder.service_address ?? "No service address provided."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">{jobOrder.customer.name}</p>
              <p className="text-muted-foreground">
                {jobOrder.customer.contact_person ?? "No contact person"}
              </p>
            </div>
            <p>{jobOrder.customer.phone}</p>
            <p className="break-all">{jobOrder.customer.email ?? "—"}</p>
          </CardContent>
        </Card>

        <JobOrderStatusPanel
          jobOrder={jobOrder}
          onStatusChanged={() => void loadJobOrder()}
        />

        <Card>
          <CardHeader>
            <CardTitle>Job history</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Status history is not available in the Technician workspace
              because the current Laravel API only authorizes this endpoint for
              Admin and Dispatcher roles.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
