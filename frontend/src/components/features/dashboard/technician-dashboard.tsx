import { useCallback, useEffect, useState } from "react";
import { CalendarClock, ClipboardList, RefreshCw, Wrench } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getMyJobOrders } from "@/services/job-orders";
import { getMyTechnician } from "@/services/technicians";
import type { JobOrder } from "@/types/job-order";
import type { Technician } from "@/types/technician";

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-3 h-5 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-44 lg:col-span-1" />
        <Skeleton className="h-44 lg:col-span-2" />
      </div>

      <Skeleton className="h-72 w-full" />
    </div>
  );
}

function MyJobCard({ jobOrder }: { jobOrder: JobOrder }) {
  return (
    <article className="rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {jobOrder.job_order_number}
          </p>
          <h3 className="mt-1 truncate font-semibold">{jobOrder.title}</h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {jobOrder.customer.name}
          </p>
        </div>

        <JobOrderStatusBadge status={jobOrder.status} />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p>
          <span className="text-muted-foreground">Schedule: </span>
          {formatDate(jobOrder.scheduled_at)}
        </p>
        <p className="whitespace-pre-wrap">
          <span className="text-muted-foreground">Service address: </span>
          {jobOrder.service_address ?? "Not provided"}
        </p>
      </div>

      <div className="mt-4">
        <JobOrderPriorityBadge priority={jobOrder.priority} />
      </div>
    </article>
  );
}

export function TechnicianDashboard() {
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [jobOrderCount, setJobOrderCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [technicianResponse, jobOrdersResponse] = await Promise.all([
        getMyTechnician(),
        getMyJobOrders({
          per_page: 100,
        }),
      ]);

      setTechnician(technicianResponse.data);
      setJobOrders(jobOrdersResponse.data.data);
      setJobOrderCount(jobOrdersResponse.data.total);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load your technician dashboard. Please try again.",
      );

      setErrorMessage(details.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!technician) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard data unavailable</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => void loadDashboard()}>
            <RefreshCw />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-muted-foreground">
          Technician workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          My Dashboard
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your active job orders and current work schedule.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-start justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Current assigned jobs
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {jobOrderCount}
              </p>
            </div>

            <div className="rounded-lg bg-muted p-2.5 text-muted-foreground">
              <ClipboardList aria-hidden="true" className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col items-start gap-4 pt-6 sm:flex-row sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Technician profile
              </p>
              <p className="mt-1 text-lg font-semibold">
                {technician.user.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {technician.employee_number} ·{" "}
                {technician.specialization ?? "No specialization listed"}
              </p>
              <p className="mt-3 text-sm">{technician.user.email}</p>
              <p className="mt-1 text-sm">
                {technician.phone ?? "No phone number"}
              </p>
            </div>

            <div className="rounded-lg bg-muted p-2.5 text-muted-foreground">
              <Wrench aria-hidden="true" className="size-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-5" />
              My current jobs
            </CardTitle>
            <CardDescription>
              Only job orders currently assigned to your technician profile.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {jobOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <h2 className="font-semibold">No assigned jobs</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  You do not currently have any active job orders.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {jobOrders.map((jobOrder) => (
                  <MyJobCard key={jobOrder.id} jobOrder={jobOrder} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
