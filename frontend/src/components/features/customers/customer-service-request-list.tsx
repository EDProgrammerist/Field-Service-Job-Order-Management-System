import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  FilePlus2,
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
    return "Awaiting schedule";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CustomerServiceRequestList() {
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
    const timeoutId = window.setTimeout(() => {
      void loadRequests(page);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRequests, page]);

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            My service requests
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Follow your requests from scheduling to completion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            aria-label="Refresh service requests"
            disabled={isLoading}
            onClick={() => void loadRequests(page)}
            size="icon"
            type="button"
            variant="outline"
          >
            <RefreshCw aria-hidden={true} />
          </Button>

          <Button render={<Link to="/customer/service-requests/new" />}>
            <FilePlus2 aria-hidden={true} />
            New request
          </Button>
        </div>
      </header>

      <Card className="gap-0 rounded-none py-0 shadow-none">
        <CardHeader className="rounded-none border-b p-5">
          <CardTitle>Request history</CardTitle>
          <CardDescription>
            Requests submitted from your customer account.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div
              aria-label="Loading service requests"
              className="space-y-0"
              role="status"
            >
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  className="space-y-3 border-b p-5 last:border-b-0"
                  key={index}
                >
                  <Skeleton className="h-4 w-28 rounded-none" />
                  <Skeleton className="h-5 w-2/3 rounded-none" />
                  <Skeleton className="h-4 w-full max-w-lg rounded-none" />
                </div>
              ))}
            </div>
          ) : null}

          {!isLoading && errorMessage ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-5 text-center">
              <p className="max-w-md text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
              <Button
                onClick={() => void loadRequests(page)}
                type="button"
              >
                <RefreshCw aria-hidden={true} />
                Try again
              </Button>
            </div>
          ) : null}

          {!isLoading && !errorMessage && requests.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <ClipboardList
                aria-hidden={true}
                className="size-8 text-muted-foreground"
              />
              <h2 className="mt-3 font-medium">
                No service requests yet
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Use New request to choose a technician and describe the
                repair you need.
              </p>
            </div>
          ) : null}

          {!isLoading && !errorMessage && requests.length > 0 ? (
            <div className="divide-y">
              {requests.map((request) => (
                <article
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
                  key={request.id}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-muted-foreground">
                      {request.job_order_number}
                    </p>

                    <h2 className="mt-1 font-medium">
                      {request.title}
                    </h2>

                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {request.description}
                    </p>

                    <div className="mt-3 grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                      <p>
                        Submitted: {formatDate(request.created_at)}
                      </p>
                      <p>
                        Schedule: {formatDate(request.scheduled_at)}
                      </p>
                      <p className="truncate">
                        Technician:{" "}
                        {request.selected_technician?.name ??
                          "Profile unavailable"}
                      </p>
                      <p className="truncate">
                        Address: {request.service_address}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <JobOrderStatusBadge status={request.status} />
                    <JobOrderPriorityBadge priority={request.priority} />

                    <Button
                      render={
                        <Link
                          to={`/customer/service-requests/${request.id}`}
                        />
                      }
                      size="sm"
                      variant="outline"
                    >
                      Details
                      <ArrowRight aria-hidden={true} />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </CardContent>

        {pagination && !isLoading && !errorMessage ? (
          <div className="flex flex-col gap-4 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
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

                        if (
                          pagination.current_page < pagination.last_page
                        ) {
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