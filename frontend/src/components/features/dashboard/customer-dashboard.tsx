import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  FilePlus2,
  MessageCircle,
  RefreshCcw,
  UserRoundCheck,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getCustomerServiceRequests } from "@/services/customer-service-requests";
import type { JobOrder } from "@/types/job-order";

interface CustomerDashboardSnapshot {
  total: number;
  recentRequests: JobOrder[];
}

function formatDate(value: string | null) {
  if (!value) {
    return "Awaiting schedule";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading dashboard">
      <Skeleton className="h-20 w-full rounded-none" />

      <div className="grid gap-4 lg:grid-cols-12">
        <Skeleton className="h-60 rounded-none lg:col-span-5" />
        <Skeleton className="h-60 rounded-none lg:col-span-7" />
      </div>

      <Skeleton className="h-80 w-full rounded-none" />
    </div>
  );
}

export function CustomerDashboard() {
  const { user } = useAuth();

  const [snapshot, setSnapshot] =
    useState<CustomerDashboardSnapshot | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getCustomerServiceRequests({
        page: 1,
        per_page: 5,
      });

      setSnapshot({
        total: response.data.total,
        recentRequests: response.data.data,
      });
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load your dashboard. Please try again.",
      );

      setErrorMessage(details.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDashboard]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!snapshot) {
    return (
      <Card className="mx-auto max-w-xl rounded-none py-0 shadow-none">
        <CardHeader className="rounded-none border-b p-5">
          <CardTitle>Dashboard unavailable</CardTitle>
          <CardDescription role="alert">
            {errorMessage}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5">
          <Button
            type="button"
            onClick={() => void loadDashboard()}
          >
            <RefreshCcw aria-hidden={true} />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const firstName =
    user?.name?.trim().split(/\s+/)[0] || "there";

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {getGreeting()}, {firstName}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Request service and follow the work from scheduling to completion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            aria-label="Refresh customer dashboard"
            size="icon"
            type="button"
            variant="outline"
            onClick={() => void loadDashboard()}
          >
            <RefreshCcw aria-hidden={true} />
          </Button>

          <Button
            render={<Link to="/conversations" />}
            variant="outline"
          >
            <MessageCircle aria-hidden={true} />
            Conversations
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-12">
        <Card className="gap-0 rounded-none py-0 shadow-none lg:col-span-5">
          <CardContent className="flex min-h-60 flex-col justify-between p-5">
            <div>
              <ClipboardList
                aria-hidden={true}
                className="size-5 text-muted-foreground"
              />

              <p className="mt-5 text-sm text-muted-foreground">
                My service requests
              </p>

              <p className="mt-1 font-mono text-4xl font-semibold tracking-tight tabular-nums">
                {snapshot.total.toLocaleString()}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-52 text-xs leading-5 text-muted-foreground">
                Requests submitted from your customer account.
              </p>

              <Button
                render={
                  <Link to="/customer/service-requests/new" />
                }
              >
                <FilePlus2 aria-hidden={true} />
                New request
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-none py-0 shadow-none lg:col-span-7">
          <CardHeader className="rounded-none border-b p-5">
            <CardTitle>How your request moves forward</CardTitle>
            <CardDescription>
              You choose the technician. The dispatcher sets the official time.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 p-5">
            <div className="flex items-start gap-3">
              <UserRoundCheck
                aria-hidden={true}
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />

              <div>
                <p className="text-sm font-medium">
                  Choose your technician
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Review available profiles before sending a repair request.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarClock
                aria-hidden={true}
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />

              <div>
                <p className="text-sm font-medium">
                  Receive a service schedule
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  A dispatcher assigns the official date and time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle
                aria-hidden={true}
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />

              <div>
                <p className="text-sm font-medium">
                  Follow the response
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your technician can accept the schedule or request a change.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="gap-0 rounded-none py-0 shadow-none">
        <CardHeader className="flex flex-col gap-3 rounded-none border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Latest requests</CardTitle>
            <CardDescription className="mt-1">
              Your five most recently submitted requests.
            </CardDescription>
          </div>

          <Button
            render={<Link to="/customer/service-requests" />}
            size="sm"
            variant="outline"
          >
            View all
            <ArrowRight aria-hidden={true} />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {snapshot.recentRequests.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <ClipboardList
                aria-hidden={true}
                className="mx-auto size-8 text-muted-foreground"
              />

              <p className="mt-3 font-medium">
                No service requests yet
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Your first request will appear here after submission.
              </p>
            </div>
          ) : (
            snapshot.recentRequests.map((request) => (
              <article
                className="flex flex-col gap-4 border-b p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                key={request.id}
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">
                    {request.job_order_number}
                  </p>

                  <p className="mt-1 truncate font-medium">
                    {request.title}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Technician:{" "}
                    {request.selected_technician?.name ??
                      "Profile unavailable"}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Schedule: {formatDate(request.scheduled_at)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
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
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}