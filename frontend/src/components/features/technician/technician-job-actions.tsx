import { useState } from "react";
import {
  CheckCircle2,
  Play,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorDetails } from "@/lib/api-errors";
import {
  acceptTechnicianSchedule,
  completeTechnicianWork,
  rejectTechnicianSchedule,
  startTechnicianWork,
} from "@/services/technician-job-orders";
import type {
  TechnicianJobOrder,
  TechnicianJobOrderResponse,
} from "@/types/technician-job-order";

interface TechnicianJobActionsProps {
  jobOrder: TechnicianJobOrder;
  onRefresh: () => Promise<void>;
  onUpdated: (
    jobOrder: TechnicianJobOrder,
    message: string,
  ) => void;
}

type TechnicianAction =
  | "accept"
  | "reject"
  | "start"
  | "complete";

export function TechnicianJobActions({
  jobOrder,
  onRefresh,
  onUpdated,
}: TechnicianJobActionsProps) {
  const [acceptRemarks, setAcceptRemarks] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [workRemarks, setWorkRemarks] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});
  const [actionInProgress, setActionInProgress] =
    useState<TechnicianAction | null>(null);

  const hasAction = Object.values(
    jobOrder.allowed_actions,
  ).some(Boolean);

  function clearFieldError(field: string) {
    setFieldErrors((currentErrors) => {
      if (!(field in currentErrors)) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];

      return nextErrors;
    });
  }

  async function performAction(action: TechnicianAction) {
    if (
      action === "reject" &&
      rejectReason.trim().length === 0
    ) {
      setFieldErrors({
        reason:
          "Please provide a reason for rejecting the schedule.",
      });
      setErrorMessage("A rejection reason is required.");
      return;
    }

    setActionInProgress(action);
    setErrorMessage("");
    setFieldErrors({});

    try {
      let response: TechnicianJobOrderResponse;

      if (action === "accept") {
        response = await acceptTechnicianSchedule(
          jobOrder.id,
          {
            schedule_version: jobOrder.schedule_version,
            remarks: acceptRemarks.trim() || null,
          },
        );
      } else if (action === "reject") {
        response = await rejectTechnicianSchedule(
          jobOrder.id,
          {
            schedule_version: jobOrder.schedule_version,
            reason: rejectReason.trim(),
          },
        );
      } else if (action === "start") {
        response = await startTechnicianWork(
          jobOrder.id,
          {
            remarks: workRemarks.trim() || null,
          },
        );
      } else {
        response = await completeTechnicianWork(
          jobOrder.id,
          {
            remarks: workRemarks.trim() || null,
          },
        );
      }

      setAcceptRemarks("");
      setRejectReason("");
      setWorkRemarks("");

      onUpdated(response.data, response.message);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to update this job order.",
      );

      setFieldErrors(details.fieldErrors);
      setErrorMessage(
        details.fieldErrors.schedule_version ??
          details.fieldErrors.scheduled_at ??
          details.message,
      );

      if (
        details.fieldErrors.schedule_version ||
        details.fieldErrors.status
      ) {
        await onRefresh();
      }
    } finally {
      setActionInProgress(null);
    }
  }

  if (!hasAction) {
    return (
      <Card className="gap-0 rounded-none py-0 shadow-none lg:col-span-3">
        <CardHeader className="rounded-none border-b p-5">
          <CardTitle>Available actions</CardTitle>
        </CardHeader>

        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">
            No technician action is available for this request
            in its current status.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-0 rounded-none py-0 shadow-none lg:col-span-3">
      <CardHeader className="rounded-none border-b p-5">
        <CardTitle>Technician actions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-5">
        {errorMessage ? (
          <div
            className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            <p>{errorMessage}</p>

            {fieldErrors.schedule_version ? (
              <Button
                className="mt-3"
                onClick={() => void onRefresh()}
                type="button"
                variant="outline"
              >
                <RefreshCw aria-hidden={true} />
                Refresh schedule
              </Button>
            ) : null}
          </div>
        ) : null}

        {jobOrder.allowed_actions.accept ||
        jobOrder.allowed_actions.reject ? (
          <div
            className={
              jobOrder.allowed_actions.accept &&
              jobOrder.allowed_actions.reject
                ? "grid gap-4 lg:grid-cols-2"
                : "grid gap-4"
            }
          >
            {jobOrder.allowed_actions.accept ? (
              <div className="space-y-4 border p-4">
                <div>
                  <h3 className="font-medium">
                    Accept official schedule
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Accept schedule version{" "}
                    {jobOrder.schedule_version}.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accept-remarks">
                    Acceptance remarks
                  </Label>

                  <Textarea
                    id="accept-remarks"
                    maxLength={2000}
                    value={acceptRemarks}
                    disabled={actionInProgress !== null}
                    placeholder="Optional remarks about the schedule."
                    onChange={(event) =>
                      setAcceptRemarks(event.target.value)
                    }
                  />
                </div>

                <Button
                  className="w-full sm:w-auto"
                  disabled={actionInProgress !== null}
                  onClick={() =>
                    void performAction("accept")
                  }
                  type="button"
                >
                  <CheckCircle2 aria-hidden={true} />
                  {actionInProgress === "accept"
                    ? "Accepting..."
                    : "Accept schedule"}
                </Button>
              </div>
            ) : null}

            {jobOrder.allowed_actions.reject ? (
              <div className="space-y-4 border border-destructive/30 p-4">
                <div>
                  <h3 className="font-medium">
                    Reject official schedule
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Explain why dispatch should reschedule this
                    request.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reject-reason">
                    Rejection reason
                  </Label>

                  <Textarea
                    id="reject-reason"
                    maxLength={2000}
                    value={rejectReason}
                    aria-invalid={Boolean(fieldErrors.reason)}
                    aria-describedby={
                      fieldErrors.reason
                        ? "reject-reason-error"
                        : undefined
                    }
                    disabled={actionInProgress !== null}
                    placeholder="Example: I am unavailable during this period."
                    onChange={(event) => {
                      setRejectReason(event.target.value);
                      clearFieldError("reason");
                    }}
                  />

                  {fieldErrors.reason ? (
                    <p
                      className="text-xs text-destructive"
                      id="reject-reason-error"
                    >
                      {fieldErrors.reason}
                    </p>
                  ) : null}
                </div>

                <Button
                  className="w-full sm:w-auto"
                  disabled={actionInProgress !== null}
                  onClick={() =>
                    void performAction("reject")
                  }
                  type="button"
                  variant="destructive"
                >
                  <XCircle aria-hidden={true} />
                  {actionInProgress === "reject"
                    ? "Rejecting..."
                    : "Reject schedule"}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        {jobOrder.allowed_actions.start ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">
                Start service work
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Use this when work at the service location begins.
              </p>
            </div>

            <div className="max-w-2xl space-y-2">
              <Label htmlFor="start-remarks">
                Start remarks
              </Label>

              <Textarea
                id="start-remarks"
                maxLength={2000}
                value={workRemarks}
                disabled={actionInProgress !== null}
                placeholder="Optional notes about starting the work."
                onChange={(event) =>
                  setWorkRemarks(event.target.value)
                }
              />
            </div>

            <Button
              className="w-full sm:w-auto"
              disabled={actionInProgress !== null}
              onClick={() => void performAction("start")}
              type="button"
            >
              <Play aria-hidden={true} />
              {actionInProgress === "start"
                ? "Starting..."
                : "Start work"}
            </Button>
          </div>
        ) : null}

        {jobOrder.allowed_actions.complete ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">
                Complete service work
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Confirm that the requested service has been completed.
              </p>
            </div>

            <div className="max-w-2xl space-y-2">
              <Label htmlFor="completion-remarks">
                Completion remarks
              </Label>

              <Textarea
                id="completion-remarks"
                maxLength={2000}
                value={workRemarks}
                disabled={actionInProgress !== null}
                placeholder="Describe the completed repair or service."
                onChange={(event) =>
                  setWorkRemarks(event.target.value)
                }
              />
            </div>

            <Button
              className="w-full sm:w-auto"
              disabled={actionInProgress !== null}
              onClick={() =>
                void performAction("complete")
              }
              type="button"
            >
              <CheckCircle2 aria-hidden={true} />
              {actionInProgress === "complete"
                ? "Completing..."
                : "Complete work"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}