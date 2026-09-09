import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { getApiErrorDetails } from "@/lib/api-errors";
import { updateJobOrderStatus } from "@/services/job-orders";
import type { JobOrder, JobOrderStatus } from "@/types/job-order";

interface JobOrderStatusPanelProps {
  jobOrder: JobOrder;
  onStatusChanged: () => void | Promise<void>;
}

const allowedTransitions: Record<JobOrderStatus, JobOrderStatus[]> = {
  created: ["assigned", "cancelled"],
  assigned: ["created", "in_progress", "cancelled"],
  in_progress: ["assigned", "completed", "cancelled"],
  completed: ["closed"],
  closed: [],
  cancelled: [],
};

const statusLabels: Record<JobOrderStatus, string> = {
  created: "Created",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
  cancelled: "Cancelled",
};

export function JobOrderStatusPanel({
  jobOrder,
  onStatusChanged,
}: JobOrderStatusPanelProps) {
  const { user } = useAuth();

  const [nextStatus, setNextStatus] = useState<JobOrderStatus | "">("");
  const [remarks, setRemarks] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allAvailableStatuses = allowedTransitions[jobOrder.status];

  const availableStatuses =
    user?.role === "technician"
      ? allAvailableStatuses.filter(
          (status) =>
            (jobOrder.status === "assigned" && status === "in_progress") ||
            (jobOrder.status === "in_progress" && status === "completed"),
        )
      : allAvailableStatuses;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nextStatus) {
      setFieldErrors({
        status: "Select the next job order status.",
      });
      return;
    }

    setSubmitError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await updateJobOrderStatus(jobOrder.id, {
        status: nextStatus,
        remarks: remarks.trim() || null,
      });

      setSuccessMessage(response.message);
      setNextStatus("");
      setRemarks("");
      setFieldErrors({});

      await onStatusChanged();
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to update the job order status. Please try again.",
      );

      setSubmitError(details.message);
      setFieldErrors(details.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (availableStatuses.length === 0) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Update status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {jobOrder.status === "closed" || jobOrder.status === "cancelled"
              ? `This job order is ${statusLabels[jobOrder.status].toLowerCase()} and cannot be changed further.`
              : "No status changes are available for your account."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Update status</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {submitError ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}

          {successMessage ? (
            <p
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
              role="status"
            >
              {successMessage}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="job-order-next-status">New status</Label>

            <select
              id="job-order-next-status"
              value={nextStatus}
              disabled={isSubmitting}
              onChange={(event) => {
                setNextStatus(event.target.value as JobOrderStatus);
                setFieldErrors((currentErrors) => {
                  const remainingErrors = { ...currentErrors };
                  delete remainingErrors.status;
                  return remainingErrors;
                });
              }}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
            >
              <option value="">Select the next status</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>

            {fieldErrors.status ? (
              <p className="text-xs text-destructive">
                {fieldErrors.status}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-order-status-remarks">
              Remarks
              <span className="ml-1 text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="job-order-status-remarks"
              rows={3}
              value={remarks}
              disabled={isSubmitting}
              placeholder="Add a note explaining this status change"
              onChange={(event) => setRemarks(event.target.value)}
            />
          </div>

          <Button type="submit" disabled={isSubmitting || !nextStatus}>
            <CheckCircle2 />
            {isSubmitting ? "Updating..." : "Update status"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}