import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";

import { JobOrderTable } from "@/components/features/job-orders/job-order-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAuth } from "@/contexts/auth-context";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getJobOrders } from "@/services/job-orders";
import type {
  JobOrder,
  JobOrderPriority,
  JobOrderStatus,
} from "@/types/job-order";
import type { PaginatedCollection } from "@/types/pagination";

const PAGE_SIZE = 10;

type PriorityFilter = "all" | JobOrderPriority;
type StatusFilter = "all" | JobOrderStatus;

export function JobOrderList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [pagination, setPagination] =
    useState<PaginatedCollection<JobOrder> | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const createPath =
    user?.role === "admin"
      ? "/admin/job-orders/create"
      : "/dispatcher/job-orders/create";

  const loadJobOrders = useCallback(
    async (
      pageToLoad: number,
      status: StatusFilter,
      priority: PriorityFilter,
    ) => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await getJobOrders({
          page: pageToLoad,
          per_page: PAGE_SIZE,
          ...(status === "all" ? {} : { status }),
          ...(priority === "all" ? {} : { priority }),
        });

        setJobOrders(response.data.data);
        setPagination(response.data);
      } catch (error) {
        const details = getApiErrorDetails(
          error,
          "Unable to load job orders. Please try again.",
        );

        setLoadError(details.message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadJobOrders(page, statusFilter, priorityFilter);
  }, [loadJobOrders, page, priorityFilter, statusFilter]);

  function changeStatusFilter(value: string | null) {
    const status: StatusFilter =
      value === "created" ||
      value === "assigned" ||
      value === "in_progress" ||
      value === "completed" ||
      value === "closed" ||
      value === "cancelled"
        ? value
        : "all";

    setPage(1);
    setStatusFilter(status);
  }

  function changePriorityFilter(value: string | null) {
    const priority: PriorityFilter =
      value === "low" ||
      value === "normal" ||
      value === "high" ||
      value === "urgent"
        ? value
        : "all";

    setPage(1);
    setPriorityFilter(priority);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Operations
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Job Orders
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Monitor service requests, their assigned technician, status,
            priority, and schedule.
          </p>
        </div>

        <Button type="button" onClick={() => navigate(createPath)}>
          <Plus />
          Create job order
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Job order directory</CardTitle>

          <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
            <Select value={statusFilter} onValueChange={changeStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={changePriorityFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loadError ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="max-w-md text-sm text-destructive" role="alert">
                {loadError}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void loadJobOrders(page, statusFilter, priorityFilter)
                }
              >
                <RefreshCw />
                Try again
              </Button>
            </div>
          ) : (
            <JobOrderTable
              isLoading={isLoading}
              jobOrders={jobOrders}
              onView={(jobOrder) => {
                const detailsPath =
                  user?.role === "admin"
                    ? `/admin/job-orders/${jobOrder.id}`
                    : `/dispatcher/job-orders/${jobOrder.id}`;

                navigate(detailsPath);
              }}
            />
          )}
        </CardContent>

        {pagination && !isLoading && !loadError ? (
          <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              {pagination.total} job order
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