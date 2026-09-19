import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  CalendarDays,
  ClipboardList,
  Eye,
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getTechnicianSchedule } from "@/services/technician-job-orders";
import type { TechnicianJobOrder } from "@/types/technician-job-order";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function defaultEndDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);

  return toDateInputValue(date);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function scheduleRange(fromValue: string, toValue: string) {
  const from = new Date(`${fromValue}T00:00:00`);
  const to = new Date(`${toValue}T23:59:59`);

  if (
    !fromValue ||
    !toValue ||
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime()) ||
    to.getTime() <= from.getTime()
  ) {
    return null;
  }

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function TechnicianSchedule() {
  const [fromDate, setFromDate] = useState(() =>
    toDateInputValue(new Date()),
  );
  const [toDate, setToDate] = useState(defaultEndDate);
  const [jobOrders, setJobOrders] = useState<
    TechnicianJobOrder[]
  >([]);
  const [displayRange, setDisplayRange] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadSchedule = useCallback(
    async (fromValue: string, toValue: string) => {
      const range = scheduleRange(fromValue, toValue);

      if (!range) {
        setErrorMessage("Select a valid schedule range.");
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getTechnicianSchedule(range);

        setJobOrders(response.data.job_orders);
        setDisplayRange({
          from: response.data.from,
          to: response.data.to,
        });
      } catch (error) {
        const details = getApiErrorDetails(
          error,
          "Unable to load your schedule.",
        );

        setErrorMessage(details.message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSchedule(fromDate, toDate);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fromDate, loadSchedule, toDate]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadSchedule(fromDate, toDate);
  }

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
      <header>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          My Schedule
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review accepted and in-progress work in your service schedule.
        </p>
      </header>

      <Card className="gap-0 rounded-none py-0 shadow-none">
        <CardHeader className="rounded-none border-b p-5">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays
              aria-hidden={true}
              className="size-5"
            />
            Schedule range
          </CardTitle>
          <CardDescription>
            Choose the dates you want to review.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5">
          <form
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="schedule-from">From</Label>
              <Input
                id="schedule-from"
                type="date"
                value={fromDate}
                disabled={isLoading}
                onChange={(event) =>
                  setFromDate(event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule-to">To</Label>
              <Input
                id="schedule-to"
                type="date"
                value={toDate}
                disabled={isLoading}
                onChange={(event) =>
                  setToDate(event.target.value)
                }
              />
            </div>

            <Button
              className="w-full self-end sm:col-span-2 lg:col-span-1 lg:w-auto"
              disabled={isLoading}
              type="submit"
            >
              <RefreshCw aria-hidden={true} />
              {isLoading ? "Loading..." : "Apply range"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {errorMessage ? (
        <div
          className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <Card className="gap-0 rounded-none py-0 shadow-none">
        <CardHeader className="rounded-none border-b p-5">
          <CardTitle>Scheduled work</CardTitle>

          {displayRange && !errorMessage ? (
            <CardDescription>
              {formatDate(displayRange.from)} through{" "}
              {formatDate(displayRange.to)}
            </CardDescription>
          ) : null}
        </CardHeader>

        <CardContent className="p-0">
          {isLoading && !errorMessage ? (
            <div
              aria-label="Loading scheduled work"
              role="status"
            >
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  className="space-y-3 border-b p-5 last:border-b-0"
                  key={index}
                >
                  <Skeleton className="h-4 w-32 rounded-none" />
                  <Skeleton className="h-5 w-2/3 rounded-none" />
                  <Skeleton className="h-4 w-full max-w-lg rounded-none" />
                </div>
              ))}
            </div>
          ) : null}

          {!isLoading &&
          !errorMessage &&
          jobOrders.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-5 text-center">
              <ClipboardList
                aria-hidden={true}
                className="size-8 text-muted-foreground"
              />
              <h2 className="mt-3 font-medium">
                No scheduled work
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You have no accepted or in-progress work in this period.
              </p>
            </div>
          ) : null}

          {!isLoading && !errorMessage
            ? jobOrders.map((jobOrder) => (
                <article
                  className="flex flex-col gap-4 border-b p-5 last:border-b-0 lg:flex-row lg:items-center lg:justify-between"
                  key={jobOrder.id}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-xs text-muted-foreground">
                        {jobOrder.job_order_number}
                      </p>
                      <JobOrderStatusBadge
                        status={jobOrder.status}
                      />
                      <JobOrderPriorityBadge
                        priority={jobOrder.priority}
                      />
                    </div>

                    <h2 className="mt-2 font-medium">
                      {jobOrder.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Customer: {jobOrder.customer.name}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0">
                    <div className="text-sm">
                      <p>
                        {jobOrder.scheduled_at
                          ? formatDate(jobOrder.scheduled_at)
                          : "No start time"}
                      </p>
                      <p className="text-muted-foreground">
                        to{" "}
                        {jobOrder.scheduled_end_at
                          ? formatDate(
                              jobOrder.scheduled_end_at,
                            )
                          : "No end time"}
                      </p>
                    </div>

                    <Button
                      render={
                        <Link
                          to={`/technician/my-jobs/${jobOrder.id}`}
                        />
                      }
                      size="sm"
                      variant="outline"
                    >
                      <Eye aria-hidden={true} />
                      View job
                    </Button>
                  </div>
                </article>
              ))
            : null}
        </CardContent>
      </Card>
    </section>
  );
}