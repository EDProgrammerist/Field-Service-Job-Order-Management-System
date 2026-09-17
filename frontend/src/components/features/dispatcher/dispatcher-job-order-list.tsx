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
import { getDispatcherJobOrders } from "@/services/dispatcher-job-orders";
import type {
  DispatcherJobOrder,
  DispatcherQueueStatus,
} from "@/types/dispatcher-job-order";
import type { PaginatedCollection } from "@/types/pagination";

const PAGE_SIZE = 10;

type QueueFilter =
  | "needs_scheduling"
  | DispatcherQueueStatus;

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeQueueFilter(
  value: string | null,
): QueueFilter {
  if (
    value === "pending_schedule" ||
    value === "pending_technician_response" ||
    value === "technician_rejected"
  ) {
    return value;
  }

  return "needs_scheduling";
}

export function DispatcherJobOrderList() {
  const [jobOrders, setJobOrders] = useState<
    DispatcherJobOrder[]
  >([]);
  const [pagination, setPagination] =
    useState<PaginatedCollection<DispatcherJobOrder> | null>(
      null,
    );
  const [filter, setFilter] =
    useState<QueueFilter>("needs_scheduling");
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadJobOrders = useCallback(
    async (
      pageToLoad: number,
      selectedFilter: QueueFilter,
    ) => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await getDispatcherJobOrders({
          page: pageToLoad,
          per_page: PAGE_SIZE,
          ...(selectedFilter === "needs_scheduling"
            ? {}
            : { status: selectedFilter }),
        });

        setJobOrders(response.data.data);
        setPagination(response.data);
      } catch (error) {
        const details = getApiErrorDetails(
          error,
          "Unable to load the scheduling queue.",
        );

        setLoadError(details.message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadJobOrders(page, filter);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [filter, loadJobOrders, page]);

  return (
    <Card>
      <CardHeader className="flex-col gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Scheduling queue</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Review customer-selected technicians and assign the
            official service schedule.
          </p>
        </div>

        <Select
          value={filter}
          onValueChange={(value) => {
            setFilter(normalizeQueueFilter(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter queue" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="needs_scheduling">
              Needs scheduling
            </SelectItem>
            <SelectItem value="pending_schedule">
              Pending schedule
            </SelectItem>
            <SelectItem value="technician_rejected">
              Rejected schedules
            </SelectItem>
            <SelectItem value="pending_technician_response">
              Awaiting technician
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="p-0">
        {loadError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center">
            <p
              className="max-w-md text-sm text-destructive"
              role="alert"
            >
              {loadError}
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void loadJobOrders(page, filter)
              }
            >
              <RefreshCw aria-hidden={true} />
              Try again
            </Button>
          </div>
        ) : null}

        {!loadError && isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton
                className="h-28 w-full"
                key={index}
              />
            ))}
          </div>
        ) : null}

        {!loadError &&
        !isLoading &&
        jobOrders.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <ClipboardList className="size-6 text-muted-foreground" />
            </div>

            <h3 className="mt-4 font-semibold">
              The selected queue is clear
            </h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Scheduling requests matching this filter will
              appear here.
            </p>
          </div>
        ) : null}

        {!loadError && !isLoading
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

                  <h3 className="mt-2 truncate font-semibold">
                    {jobOrder.title}
                  </h3>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    Customer: {jobOrder.customer.name}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">
                      Technician:{" "}
                    </span>
                    {jobOrder.selected_technician?.name ??
                      "Technician unavailable"}
                  </p>

                  <p className="flex items-center gap-2">
                    <CalendarClock
                      aria-hidden={true}
                      className="size-4 text-muted-foreground"
                    />
                    {formatDate(jobOrder.scheduled_at)}
                  </p>
                </div>

                <Button
                  render={
                    <Link
                      to={`/dispatcher/job-orders/${jobOrder.id}`}
                    />
                  }
                  size="sm"
                  variant="outline"
                >
                  <Eye aria-hidden={true} />
                  Review
                </Button>
              </article>
            ))
          : null}
      </CardContent>

      {pagination && !isLoading && !loadError ? (
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
  );
}