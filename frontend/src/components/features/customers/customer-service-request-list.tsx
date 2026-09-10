import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";

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
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getCustomerServiceRequests } from "@/services/customer-service-requests";
import type { JobOrder } from "@/types/job-order";
import type { PaginatedCollection } from "@/types/pagination";

const PAGE_SIZE = 10;

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CustomerServiceRequestList() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<JobOrder[]>([]);
  const [pagination, setPagination] =
    useState<PaginatedCollection<JobOrder> | null>(null);
  const [page, setPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = useCallback(async (pageToLoad: number) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getCustomerServiceRequests({
        page: pageToLoad,
        per_page: PAGE_SIZE,
      });

      setRequests(response.data.data);
      setPagination(response.data);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load your service requests. Please try again.",
      );

      setErrorMessage(details.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests(page);
  }, [loadRequests, page]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Customer workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          My service requests
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Requests submitted from your Customer account only.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Request history</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-52 w-full" />
              ))}
            </div>
          ) : null}

          {!isLoading && errorMessage ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
              <p className="max-w-md text-sm text-destructive" role="alert">
                {errorMessage}
              </p>

              <Button type="button" onClick={() => void loadRequests(page)}>
                <RefreshCw />
                Try again
              </Button>
            </div>
          ) : null}

          {!isLoading && !errorMessage && requests.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <ClipboardList className="size-6 text-muted-foreground" />
              </div>
              <h2 className="mt-4 font-semibold">No service requests yet</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Submit a request when you need field service or repair.
              </p>
            </div>
          ) : null}

          {!isLoading && !errorMessage && requests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {requests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-lg border bg-card p-4 text-card-foreground"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        {request.job_order_number}
                      </p>
                      <h2 className="mt-1 truncate font-semibold">
                        {request.title}
                      </h2>
                    </div>

                    <JobOrderStatusBadge status={request.status} />
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                    {request.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">
                        Submitted:{" "}
                      </span>
                      {formatDate(request.created_at)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Service address:{" "}
                      </span>
                      {request.service_address}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <JobOrderPriorityBadge priority={request.priority} />

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/customer/service-requests/${request.id}`)
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

        {pagination && !isLoading && !errorMessage ? (
          <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              {pagination.total} request
              {pagination.total === 1 ? "" : "s"} · Page{" "}
              {pagination.current_page} of {pagination.last_page}
            </p>

            {pagination.last_page > 1 ? (
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={pagination.current_page === 1}
                      className={
                        pagination.current_page === 1
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault();

                        if (pagination.current_page > 1) {
                          setPage(pagination.current_page - 1);
                        }
                      }}
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={
                        pagination.current_page === pagination.last_page
                      }
                      className={
                        pagination.current_page === pagination.last_page
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault();

                        if (pagination.current_page < pagination.last_page) {
                          setPage(pagination.current_page + 1);
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