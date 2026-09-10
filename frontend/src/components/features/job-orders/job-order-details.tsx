import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

import { DeleteJobOrderDialog } from "@/components/features/job-orders/delete-job-order-dialog";
import { JobOrderStatusPanel } from "@/components/features/job-orders/job-order-status-panel";
import { JobOrderAssignmentPanel } from "@/components/features/job-orders/job-order-assignment-panel";
import {
  JobOrderPriorityBadge,
  JobOrderStatusBadge,
} from "@/components/features/job-orders/job-order-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorDetails } from "@/lib/api-errors";
import {
  getJobOrder,
  getJobOrderStatusHistory,
} from "@/services/job-orders";
import type {
  JobOrder,
  JobOrderStatusHistory,
} from "@/types/job-order";

interface JobOrderDetailsProps {
  jobOrderId: number;
  listPath: string;
  editPath: string;
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

export function JobOrderDetails({
  jobOrderId,
  listPath,
  editPath,
}: JobOrderDetailsProps) {
  const navigate = useNavigate();

  const [jobOrder, setJobOrder] = useState<JobOrder | null>(null);
  const [statusHistory, setStatusHistory] = useState<JobOrderStatusHistory[]>(
    [],
  );
  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadDetails = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [jobOrderResponse, historyResponse] = await Promise.all([
        getJobOrder(jobOrderId),
        getJobOrderStatusHistory(jobOrderId),
      ]);

      setJobOrder(jobOrderResponse.data);
      setStatusHistory(historyResponse.data.data);
    } catch (requestError) {
      const details = getApiErrorDetails(
        requestError,
        "Unable to load this job order. Please try again.",
      );

      setError(details.message);
    } finally {
      setIsLoading(false);
    }
  }, [jobOrderId]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </section>
    );
  }

  if (error || !jobOrder) {
    return (
      <section className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
        <p className="max-w-md text-sm text-destructive" role="alert">
          {error || "Job order not found."}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" onClick={loadDetails}>
            <RefreshCw />
            Try again
          </Button>

          <Button type="button" onClick={() => navigate(listPath)}>
            <ArrowLeft />
            Return to Job Orders
          </Button>
        </div>
      </section>
    );
  }

  const technician = jobOrder.active_assignment?.technician;

  return (
    <section className="space-y-6">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(listPath)}
      >
        <ArrowLeft />
        Back to Job Orders
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
            Created by {jobOrder.creator.name} ·{" "}
            {formatDate(jobOrder.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(editPath)}
          >
            <Pencil />
            Edit job order
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 />
            Delete job order
          </Button>
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

            <div>
              <p className="text-muted-foreground">Scheduled date and time</p>
              <p className="mt-1">{formatDate(jobOrder.scheduled_at)}</p>
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

        <Card>
          <CardHeader>
            <CardTitle>Current assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {technician ? (
              <>
                <p className="font-medium">{technician.user.name}</p>
                <p className="text-muted-foreground">
                  {technician.employee_number}
                </p>
                <p>{technician.user.email}</p>
                <p>{technician.phone ?? "No phone number"}</p>
              </>
            ) : (
              <p className="text-muted-foreground">
                No technician is currently assigned.
              </p>
            )}
          </CardContent>
        </Card>

        <JobOrderAssignmentPanel
          jobOrder={jobOrder}
          onAssignmentChanged={() => void loadDetails()}
        />

        <JobOrderStatusPanel
          jobOrder={jobOrder}
          onStatusChanged={() => void loadDetails()}
        />

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status history</CardTitle>
          </CardHeader>
          <CardContent>
            {statusHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No status history is available.
              </p>
            ) : (
              <ol className="space-y-4">
                {statusHistory.map((history) => (
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
                      Changed by {history.changed_by.name}
                    </p>
                    {history.remarks ? (
                      <p className="mt-1 text-muted-foreground">
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

      <DeleteJobOrderDialog
        jobOrder={jobOrder}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleted={(message) =>
          navigate(listPath, {
            replace: true,
            state: {
              successMessage: message,
            },
          })
        }
      />
    </section>
  );
}
