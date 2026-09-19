import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  CalendarClock,
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getTechnicianJobOrders } from "@/services/technician-job-orders";
import type {
  WorkflowJobOrderStatus,
} from "@/types/job-order";
import type { PaginatedCollection } from "@/types/pagination";
import type { TechnicianJobOrder } from "@/types/technician-job-order";

const PAGE_SIZE = 10;

type StatusFilter =
  | "all"
  | WorkflowJobOrderStatus;

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeStatus(
  value: string | null,
): StatusFilter {
  if (
    value === "pending_schedule" ||
    value === "pending_technician_response" ||
    value === "accepted" ||
    value === "technician_rejected" ||
    value === "in_progress" ||
    value === "completed" ||
    value === "closed" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "all";
}

export function TechnicianJobList() {
  const [jobOrders, setJobOrders] = useState<
    TechnicianJobOrder[]
  >([]);
  const [pagination, setPagination] =
    useState<PaginatedCollection<TechnicianJobOrder> | null>(
      null,
    );
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadJobs = useCallback(
    async (
      pageToLoad: number,
      selectedStatus: StatusFilter,
    ) => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getTechnicianJobOrders({
          page: pageToLoad,
          per_page: PAGE_SIZE,
          ...(selectedStatus === "all"
            ? {}
            : { status: selectedStatus }),
        });

        setJobOrders(response.data.data);
        setPagination(response.data);
      } catch (error) {
        const details = getApiErrorDetails(
          error,
          "Unable to load your job orders.",
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
      void loadJobs(page, statusFilter);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadJobs, page, statusFilter]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Technician workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          My Jobs
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Review selected requests, respond to official
          schedules, and update your service work.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-col gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Job requests</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Only requests where you are the
              customer-selected technician appear here.
            </p>
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(normalizeStatus(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All requests
              </SelectItem>
              <SelectItem value="pending_schedule">
                Waiting for schedule
              </SelectItem>
              <SelectItem value="pending_technician_response">
                Awaiting my response
              </SelectItem>
              <SelectItem value="accepted">
                Accepted
              </SelectItem>
              <SelectItem value="technician_rejected">
                Rejected schedule
              </SelectItem>
              <SelectItem value="in_progress">
                In progress
              </SelectItem>
              <SelectItem value="completed">
                Completed
              </SelectItem>
              <SelectItem value="closed">
                Closed
              </SelectItem>
              <SelectItem value="cancelled">
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="p-0">
          {errorMessage ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center">
              <p
                className="max-w-md text-sm text-destructive"
                role="alert"
              >
                {errorMessage}
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void loadJobs(page, statusFilter)
                }
              >
                <RefreshCw aria-hidden={true} />
                Try again
              </Button>
            </div>
          ) : null}

          {!errorMessage && isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton
                  className="h-32 w-full"
                  key={index}
                />
              ))}
            </div>
          ) : null}

          {!errorMessage &&
          !isLoading &&
          jobOrders.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
              <ClipboardList className="size-10 text-muted-foreground" />
              <h2 className="mt-4 font-semibold">
                No matching requests
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Requests matching the selected status will
                appear here.
              </p>
            </div>
          ) : null}

          {!errorMessage && !isLoading
            ? jobOrders.map((jobOrder) => (
                <article
                  className="grid gap-4 border-b p-5 last:border-b-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] lg:items-center"
                  key={jobOrder.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {jobOrder.job_order_number}
                      </p>
                      <JobOrderStatusBadge
                        status={jobOrder.status}
                      />
                      <JobOrderPriorityBadge
                        priority={jobOrder.priority}
                      />
                    </div>

                    <h2 className="mt-2 truncate font-semibold">
                      {jobOrder.title}
                    </h2>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {jobOrder.customer.name}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <CalendarClock
                        aria-hidden={true}
                        className="size-4 text-muted-foreground"
                      />
                      {formatDate(jobOrder.scheduled_at)}
                    </p>

                    <p className="line-clamp-2 text-muted-foreground">
                      {jobOrder.service_address ??
                        "No service address"}
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
                    {jobOrder.allowed_actions.accept
                      ? "Review schedule"
                      : "View"}
                  </Button>
                </article>
              ))
            : null}
        </CardContent>

        {pagination && !isLoading && !errorMessage ? (
          <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              {pagination.total} request
              {pagination.total === 1 ? "" : "s"} · Page{" "}
              {pagination.current_page} of{" "}
              {pagination.last_page}
            </p>

            {pagination.last_page > 1 ? (
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={
                        pagination.current_page === 1
                      }
                      className={
                        pagination.current_page === 1
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault();

                        if (pagination.current_page > 1) {
                          setPage(
                            pagination.current_page - 1,
                          );
                        }
                      }}
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={
                        pagination.current_page ===
                        pagination.last_page
                      }
                      className={
                        pagination.current_page ===
                        pagination.last_page
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault();

                        if (
                          pagination.current_page <
                          pagination.last_page
                        ) {
                          setPage(
                            pagination.current_page + 1,
                          );
                        }
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </div>
        ) : null}
      </Card>
    </section>
  );
}