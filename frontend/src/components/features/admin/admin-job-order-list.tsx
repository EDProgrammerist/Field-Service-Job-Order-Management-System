import { useCallback, useEffect, useState } from "react";
import { Eye, RefreshCw } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getAdminJobOrders } from "@/services/admin-job-orders";
import type { AdminJobOrder } from "@/types/admin-job-order";
import type {
  JobOrderPriority,
  JobOrderStatus,
} from "@/types/job-order";
import type { PaginatedCollection } from "@/types/pagination";

type StatusFilter = "all" | JobOrderStatus;
type PriorityFilter = "all" | JobOrderPriority;

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminJobOrderList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priority, setPriority] =
    useState<PriorityFilter>("all");
  const [collection, setCollection] =
    useState<PaginatedCollection<AdminJobOrder> | null>(
      null,
    );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminJobOrders({
        page,
        per_page: 10,
        ...(status === "all" ? {} : { status }),
        ...(priority === "all" ? {} : { priority }),
      });
      setCollection(response.data);
    } catch (requestError) {
      setError(
        getApiErrorDetails(
          requestError,
          "Unable to load job orders.",
        ).message,
      );
    } finally {
      setLoading(false);
    }
  }, [page, priority, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Operations
          </p>
          <h1 className="mt-1 text-2xl font-semibold">
            Job Orders
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review customer requests and their workflow status.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void load()}
        >
          <RefreshCw aria-hidden={true} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Job order directory</CardTitle>

          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter by status"
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusFilter);
                setPage(1);
              }}
            >
              <option value="all">All statuses</option>
              <option value="pending_schedule">Pending schedule</option>
              <option value="pending_technician_response">
                Awaiting technician
              </option>
              <option value="accepted">Accepted</option>
              <option value="technician_rejected">
                Schedule rejected
              </option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
              <optgroup label="Historical statuses">
                <option value="pending_review">Pending review</option>
                <option value="created">Created</option>
                <option value="assigned">Assigned</option>
              </optgroup>
            </select>

            <select
              aria-label="Filter by priority"
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={priority}
              onChange={(event) => {
                setPriority(event.target.value as PriorityFilter);
                setPage(1);
              }}
            >
              <option value="all">All priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error ? (
            <div className="p-6">
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
              <Button
                className="mt-3"
                type="button"
                variant="outline"
                onClick={() => void load()}
              >
                Try again
              </Button>
            </div>
          ) : loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton
                  className="h-14 w-full"
                  key={index}
                />
              ))}
            </div>
          ) : collection?.data.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No job orders match these filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-200">
                <TableHeader>
                  <TableRow>
                    <TableHead>Job order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Selected technician</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead className="text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collection?.data.map((jobOrder) => (
                    <TableRow key={jobOrder.id}>
                      <TableCell>
                        <p className="font-medium">
                          {jobOrder.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {jobOrder.job_order_number}
                        </p>
                      </TableCell>
                      <TableCell>
                        {jobOrder.customer.name}
                      </TableCell>
                      <TableCell>
                        {jobOrder.selected_technician?.user.name ??
                          "Unavailable"}
                      </TableCell>
                      <TableCell>
                        <JobOrderStatusBadge
                          status={jobOrder.status}
                        />
                      </TableCell>
                      <TableCell>
                        <JobOrderPriorityBadge
                          priority={jobOrder.priority}
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(jobOrder.scheduled_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          render={
                            <Link
                              to={`/admin/job-orders/${jobOrder.id}`}
                            />
                          }
                          size="sm"
                          variant="outline"
                        >
                          <Eye aria-hidden={true} />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {collection && !loading && !error ? (
          <div className="flex items-center justify-between gap-3 border-t p-4 text-sm">
            <span className="text-muted-foreground">
              {collection.total} job orders · Page{" "}
              {collection.current_page} of{" "}
              {collection.last_page}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page >= collection.last_page}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </section>
  );
}