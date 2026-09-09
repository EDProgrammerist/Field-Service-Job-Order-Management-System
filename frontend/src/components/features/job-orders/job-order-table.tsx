import { ClipboardList, Eye } from "lucide-react";

import {
  JobOrderPriorityBadge,
  JobOrderStatusBadge,
} from "@/components/features/job-orders/job-order-badges";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JobOrder } from "@/types/job-order";

interface JobOrderTableProps {
  isLoading: boolean;
  jobOrders: JobOrder[];
  onView: (jobOrder: JobOrder) => void;
}

function formatScheduledDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function technicianName(jobOrder: JobOrder) {
  return jobOrder.active_assignment?.technician.user.name ?? "Unassigned";
}

export function JobOrderTable({
  isLoading,
  jobOrders,
  onView,
}: JobOrderTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (jobOrders.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <ClipboardList className="size-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-base font-semibold">No job orders found</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Change the selected filters or create a new job order.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 p-4 md:hidden">
        {jobOrders.map((jobOrder) => (
          <article
            key={jobOrder.id}
            className="rounded-lg border bg-card p-4 text-card-foreground"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  {jobOrder.job_order_number}
                </p>
                <h3 className="mt-1 truncate font-semibold">
                  {jobOrder.title}
                </h3>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {jobOrder.customer.name}
                </p>
              </div>

              <JobOrderStatusBadge status={jobOrder.status} />
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <p>
                <span className="text-muted-foreground">Technician: </span>
                {technicianName(jobOrder)}
              </p>
              <p>
                <span className="text-muted-foreground">Schedule: </span>
                {formatScheduledDate(jobOrder.scheduled_at)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <JobOrderPriorityBadge priority={jobOrder.priority} />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onView(jobOrder)}
              >
                <Eye />
                View
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {jobOrders.map((jobOrder) => (
              <TableRow key={jobOrder.id}>
                <TableCell>
                  <p className="font-medium">{jobOrder.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {jobOrder.job_order_number}
                  </p>
                </TableCell>
                <TableCell>{jobOrder.customer.name}</TableCell>
                <TableCell>{technicianName(jobOrder)}</TableCell>
                <TableCell>
                  <JobOrderStatusBadge status={jobOrder.status} />
                </TableCell>
                <TableCell>
                  <JobOrderPriorityBadge priority={jobOrder.priority} />
                </TableCell>
                <TableCell>
                  {formatScheduledDate(jobOrder.scheduled_at)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`View ${jobOrder.job_order_number}`}
                    onClick={() => onView(jobOrder)}
                  >
                    <Eye />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}