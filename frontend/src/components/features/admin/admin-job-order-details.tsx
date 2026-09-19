import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  Pencil,
  RefreshCw,
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
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorDetails } from "@/lib/api-errors";
import {
  getAdminJobOrder,
  getAdminJobOrderHistory,
  updateAdminJobOrderStatus,
} from "@/services/admin-job-orders";
import type { AdminJobOrder } from "@/types/admin-job-order";
import type { JobOrderStatusHistory } from "@/types/job-order";

interface Props {
  jobOrderId: number;
}

function formatDate(value: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminJobOrderDetails({
  jobOrderId,
}: Props) {
  const [jobOrder, setJobOrder] =
    useState<AdminJobOrder | null>(null);
  const [history, setHistory] = useState<
    JobOrderStatusHistory[]
  >([]);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [orderResponse, historyResponse] =
        await Promise.all([
          getAdminJobOrder(jobOrderId),
          getAdminJobOrderHistory(jobOrderId),
        ]);
      setJobOrder(orderResponse.data);
      setHistory(historyResponse.data.data);
    } catch (requestError) {
      setError(
        getApiErrorDetails(
          requestError,
          "Unable to load this job order.",
        ).message,
      );
    } finally {
      setLoading(false);
    }
  }, [jobOrderId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function performStatusAction() {
    if (!jobOrder) return;

    const nextStatus =
      jobOrder.status === "completed"
        ? "closed"
        : "cancelled";

    const confirmed = window.confirm(
      nextStatus === "closed"
        ? "Close this completed request?"
        : "Cancel this request?",
    );
    if (!confirmed) return;

    setSubmitting(true);
    setActionError("");
    setSuccess("");

    try {
      const response = await updateAdminJobOrderStatus(
        jobOrder.id,
        nextStatus,
        remarks.trim() || null,
      );
      setSuccess(response.message);
      setRemarks("");
      await load();
    } catch (requestError) {
      setActionError(
        getApiErrorDetails(
          requestError,
          "Unable to change this request's status.",
        ).message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-72 w-full" />
      </section>
    );
  }

  if (error || !jobOrder) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-destructive" role="alert">
          {error || "Job order not found."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void load()}
        >
          <RefreshCw aria-hidden={true} />
          Try again
        </Button>
      </section>
    );
  }

  const canClose = jobOrder.status === "completed";
  const canCancel = [
    "pending_schedule",
    "pending_technician_response",
    "accepted",
    "technician_rejected",
    "in_progress",
    "pending_review",
    "created",
    "assigned",
  ].includes(jobOrder.status);

  return (
    <section className="space-y-6">
      <Button
        render={<Link to="/admin/job-orders" />}
        variant="outline"
      >
        <ArrowLeft aria-hidden={true} />
        Back to job orders
      </Button>

      {success ? (
        <p
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700"
          role="status"
        >
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4 border bg-background p-5">
        <div>
          <p className="text-sm text-muted-foreground">
            {jobOrder.job_order_number}
          </p>
          <h1 className="mt-1 text-2xl font-semibold">
            {jobOrder.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Submitted {formatDate(jobOrder.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <JobOrderStatusBadge status={jobOrder.status} />
          <JobOrderPriorityBadge
            priority={jobOrder.priority}
          />
          <Button
            render={
              <Link
                to={`/admin/job-orders/${jobOrder.id}/edit`}
              />
            }
            variant="outline"
          >
            <Pencil aria-hidden={true} />
            Edit details
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Service details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
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
              <p className="mt-1">
                {jobOrder.service_address ??
                  "Not available"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">
                Official schedule
              </p>
              <p className="mt-1">
                {formatDate(jobOrder.scheduled_at)} –{" "}
                {formatDate(jobOrder.scheduled_end_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer and technician</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">
                Customer
              </p>
              <p className="font-medium">
                {jobOrder.customer.name}
              </p>
              <p>{jobOrder.customer.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                Customer-selected technician
              </p>
              <p className="font-medium">
                {jobOrder.selected_technician?.user.name ??
                  "Unavailable"}
              </p>
              <p>
                {jobOrder.selected_technician
                  ?.employee_number ?? ""}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              Administrative status action
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {canClose || canCancel ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {canClose
                    ? "Close completed work."
                    : "Cancel this active request. Technician workflow actions remain technician-only."}
                </p>
                <Textarea
                  aria-label="Status remarks"
                  maxLength={2000}
                  rows={3}
                  value={remarks}
                  disabled={submitting}
                  placeholder="Optional remarks"
                  onChange={(event) =>
                    setRemarks(event.target.value)
                  }
                />
                {actionError ? (
                  <p
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {actionError}
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant={
                    canClose ? "default" : "destructive"
                  }
                  disabled={submitting}
                  onClick={() =>
                    void performStatusAction()
                  }
                >
                  {submitting
                    ? "Updating..."
                    : canClose
                      ? "Close request"
                      : "Cancel request"}
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No administrative status action is
                available.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Status history</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No history is available.
              </p>
            ) : (
              <ol className="space-y-4">
                {history.map((entry) => (
                  <li
                    className="border-l-2 border-primary/30 pl-4 text-sm"
                    key={entry.id}
                  >
                    <div className="flex flex-wrap gap-2">
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