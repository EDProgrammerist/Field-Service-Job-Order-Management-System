import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  CalendarCheck,
  RefreshCw,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

import { JobOrderStatusBadge } from "@/components/features/job-orders/job-order-badges";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorDetails } from "@/lib/api-errors";
import {
  getDispatcherJobOrder,
  getDispatcherTechnicianAvailability,
  scheduleDispatcherJobOrder,
} from "@/services/dispatcher-job-orders";
import type {
  DispatcherJobOrder,
  TechnicianAvailability,
} from "@/types/dispatcher-job-order";

interface DispatcherScheduleFormProps {
  jobOrderId: number;
}

interface ValidScheduleRange {
  from: string;
  to: string;
  key: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16);
}

export function DispatcherScheduleForm({
  jobOrderId,
}: DispatcherScheduleFormProps) {
  const navigate = useNavigate();

  const [jobOrder, setJobOrder] =
    useState<DispatcherJobOrder | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [scheduledEndAt, setScheduledEndAt] =
    useState("");
  const [remarks, setRemarks] = useState("");
  const [availability, setAvailability] =
    useState<TechnicianAvailability | null>(null);
  const [checkedRangeKey, setCheckedRangeKey] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadJobOrder = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response =
        await getDispatcherJobOrder(jobOrderId);

      setJobOrder(response.data);
      setScheduledAt(
        toDateTimeLocal(response.data.scheduled_at),
      );
      setScheduledEndAt(
        toDateTimeLocal(response.data.scheduled_end_at),
      );
      setRemarks(
        response.data.latest_schedule_revision?.remarks ?? "",
      );
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
      void loadJobOrder();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadJobOrder]);

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

  function invalidateAvailabilityCheck() {
    setAvailability(null);
    setCheckedRangeKey("");
  }

  function validateScheduleRange(): ValidScheduleRange | null {
    const nextErrors: Record<string, string> = {};
    const start = new Date(scheduledAt);
    const end = new Date(scheduledEndAt);

    if (
      !scheduledAt ||
      Number.isNaN(start.getTime())
    ) {
      nextErrors.scheduled_at =
        "Select a valid scheduled start.";
    } else if (start.getTime() <= Date.now()) {
      nextErrors.scheduled_at =
        "The scheduled start must be in the future.";
    }

    if (
      !scheduledEndAt ||
      Number.isNaN(end.getTime())
    ) {
      nextErrors.scheduled_end_at =
        "Select a valid scheduled end.";
    } else if (
      !Number.isNaN(start.getTime()) &&
      end.getTime() <= start.getTime()
    ) {
      nextErrors.scheduled_end_at =
        "The scheduled end must be after the start.";
    }

    if (remarks.length > 2000) {
      nextErrors.remarks =
        "Remarks cannot exceed 2,000 characters.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return null;
    }

    const from = start.toISOString();
    const to = end.toISOString();

    return {
      from,
      to,
      key: `${from}|${to}`,
    };
  }

  async function handleAvailabilityCheck() {
    if (!jobOrder?.selected_technician_id) {
      setErrorMessage(
        "This request does not have a selected technician.",
      );
      return;
    }

    const range = validateScheduleRange();

    if (!range) {
      setErrorMessage(
        "Correct the schedule information before checking availability.",
      );
      return;
    }

    setIsChecking(true);
    setErrorMessage("");
    setAvailability(null);
    setCheckedRangeKey("");

    try {
      const response =
        await getDispatcherTechnicianAvailability(
          jobOrder.selected_technician_id,
          range.from,
          range.to,
        );

      setAvailability(response.data);
      setCheckedRangeKey(range.key);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to check technician availability.",
      );

      setErrorMessage(details.message);
      setFieldErrors(details.fieldErrors);
    } finally {
      setIsChecking(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const range = validateScheduleRange();

    if (!range) {
      setErrorMessage(
        "Correct the schedule information before saving.",
      );
      return;
    }

    if (
      checkedRangeKey !== range.key ||
      availability === null
    ) {
      setErrorMessage(
        "Check technician availability for this exact time range before saving.",
      );
      return;
    }

    if (!availability.is_available) {
      setErrorMessage(
        "The selected technician is not available for this time range.",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      const response = await scheduleDispatcherJobOrder(
        jobOrderId,
        {
          scheduled_at: range.from,
          scheduled_end_at: range.to,
          remarks: remarks.trim() || null,
        },
      );

      navigate(`/dispatcher/job-orders/${jobOrderId}`, {
        replace: true,
        state: {
          successMessage: response.message,
        },
      });
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to save the official schedule.",
      );

      setErrorMessage(details.message);
      setFieldErrors(details.fieldErrors);

      // Availability may have changed after the previous check.
      setAvailability(null);
      setCheckedRangeKey("");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!jobOrder) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-destructive" role="alert">
          {errorMessage ||
            "Scheduling request could not be loaded."}
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => void loadJobOrder()}
        >
          <RefreshCw aria-hidden={true} />
          Try again
        </Button>
      </div>
    );
  }

  if (!jobOrder.can_schedule) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium">
            This request can no longer be scheduled.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Its current status is{" "}
            <JobOrderStatusBadge status={jobOrder.status} />.
          </p>

          <Button
            className="mt-6"
            render={
              <Link
                to={`/dispatcher/job-orders/${jobOrder.id}`}
              />
            }
            variant="outline"
          >
            Return to request
          </Button>
        </CardContent>
      </Card>
    );
  }

  const technician = jobOrder.selected_technician;

  return (
    <form
      className="grid gap-6 lg:grid-cols-3"
      noValidate
      onSubmit={handleSubmit}
    >
      <Card>
        <CardHeader>
          <CardTitle>Request assignment</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground">
              Job order
            </p>
            <p className="mt-1 font-medium">
              {jobOrder.job_order_number}
            </p>
            <p className="mt-1">{jobOrder.title}</p>
          </div>

          <div>
            <p className="text-muted-foreground">
              Customer-selected technician
            </p>
            <p className="mt-1 font-medium">
              {technician?.name ??
                "Technician unavailable"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {technician?.specialization ??
                "No specialization provided"}
            </p>
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            Dispatch can set the official schedule, but cannot
            replace the technician selected by the customer.
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {jobOrder.schedule_version > 0
              ? "Update official schedule"
              : "Set official schedule"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {errorMessage ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scheduled-at">
                Scheduled start
              </Label>

              <Input
                id="scheduled-at"
                type="datetime-local"
                value={scheduledAt}
                aria-invalid={Boolean(
                  fieldErrors.scheduled_at,
                )}
                disabled={isChecking || isSubmitting}
                onChange={(event) => {
                  setScheduledAt(event.target.value);
                  clearFieldError("scheduled_at");
                  invalidateAvailabilityCheck();
                }}
              />

              {fieldErrors.scheduled_at ? (
                <p className="text-xs text-destructive">
                  {fieldErrors.scheduled_at}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled-end-at">
                Scheduled end
              </Label>

              <Input
                id="scheduled-end-at"
                type="datetime-local"
                value={scheduledEndAt}
                aria-invalid={Boolean(
                  fieldErrors.scheduled_end_at,
                )}
                disabled={isChecking || isSubmitting}
                onChange={(event) => {
                  setScheduledEndAt(event.target.value);
                  clearFieldError("scheduled_end_at");
                  invalidateAvailabilityCheck();
                }}
              />

              {fieldErrors.scheduled_end_at ? (
                <p className="text-xs text-destructive">
                  {fieldErrors.scheduled_end_at}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-remarks">
              Scheduling remarks
            </Label>

            <Textarea
              id="schedule-remarks"
              value={remarks}
              maxLength={2000}
              aria-invalid={Boolean(fieldErrors.remarks)}
              disabled={isSubmitting}
              placeholder="Optional information about the official schedule."
              onChange={(event) => {
                setRemarks(event.target.value);
                clearFieldError("remarks");
              }}
            />

            <div className="flex justify-between gap-3 text-xs text-muted-foreground">
              <span>{fieldErrors.remarks ?? "Optional"}</span>
              <span>{remarks.length}/2000</span>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="font-medium">
                  Technician availability
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check the selected technician before saving.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={
                  isChecking ||
                  isSubmitting ||
                  !jobOrder.selected_technician_id
                }
                onClick={() =>
                  void handleAvailabilityCheck()
                }
              >
                <Search aria-hidden={true} />
                {isChecking
                  ? "Checking..."
                  : "Check availability"}
              </Button>
            </div>

            {availability ? (
              <div className="mt-4">
                {availability.is_available ? (
                  <p
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
                    role="status"
                  >
                    The technician is available for this time
                    range.
                  </p>
                ) : (
                  <div
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm text-destructive"
                    role="alert"
                  >
                    <p className="font-medium">
                      The technician is unavailable.
                    </p>

                    {!availability.is_active ? (
                      <p className="mt-1">
                        This technician is currently inactive.
                      </p>
                    ) : null}

                    {availability.conflicts.length > 0 ? (
                      <ul className="mt-3 space-y-2">
                        {availability.conflicts.map(
                          (conflict) => (
                            <li key={conflict.id}>
                              <Link
                                className="underline underline-offset-4"
                                to={`/dispatcher/job-orders/${conflict.id}`}
                              >
                                {conflict.job_order_number}:{" "}
                                {conflict.title}
                              </Link>
                              <span className="block">
                                {formatDate(
                                  conflict.scheduled_at,
                                )}{" "}
                                to{" "}
                                {formatDate(
                                  conflict.scheduled_end_at,
                                )}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              render={
                <Link
                  to={`/dispatcher/job-orders/${jobOrder.id}`}
                />
              }
              type="button"
              variant="outline"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || isChecking}
            >
              <CalendarCheck aria-hidden={true} />
              {isSubmitting
                ? "Saving schedule..."
                : "Save official schedule"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}