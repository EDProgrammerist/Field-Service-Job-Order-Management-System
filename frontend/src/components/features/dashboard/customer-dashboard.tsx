import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  FilePlus2,
  MessageCircle,
  RefreshCcw,
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
  if (!value) return "Awaiting schedule";

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
    <div
      aria-label="Loading customer dashboard"
      className="space-y-4"
      role="status"
    >
      <Skeleton className="h-16 w-full rounded-none" />
      <Skeleton className="h-32 w-full rounded-none" />
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
        <CardHeader className="border-b p-5">
          <CardTitle>Dashboard unavailable</CardTitle>
          <CardDescription role="alert">
            {errorMessage}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5">
          <Button
            onClick={() => void loadDashboard()}
            type="button"
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
    <div className="space-y-4">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {getGreeting()}, {firstName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your requests from scheduling to completion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            aria-label="Refresh customer dashboard"
            onClick={() => void loadDashboard()}
            size="icon"
            type="button"
            variant="outline"
          >
            <RefreshCcw aria-hidden={true} />
          </Button>

          <Button
            render={
              <Link to="/customer/service-requests/new" />
            }
          >
            <FilePlus2 aria-hidden={true} />
            New request
          </Button>
        </div>
      </section>

      {errorMessage ? (
        <p
          className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          Refresh failed: {errorMessage} The requests below
          are from the previous load.
        </p>
      ) : null}

      <section aria-label="Service request summary">
        <Card className="gap-0 rounded-none bg-background py-0 shadow-none">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center border bg-muted/30">
                <ClipboardList
                  aria-hidden={true}
                  className="size-5 text-muted-foreground"
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  My service requests
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                  {snapshot.total.toLocaleString()}
                </p>
              </div>
            </div>

            <Button
              render={<Link to="/conversations" />}
              variant="outline"
            >
              <MessageCircle aria-hidden={true} />
              Conversations
            </Button>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="latest-requests-title">
        <Card className="gap-0 rounded-none bg-background py-0 shadow-none">
          <CardHeader className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                <h2 id="latest-requests-title">
                  Latest requests
                </h2>
              </CardTitle>
              <CardDescription className="mt-1">
                Your five most recently submitted requests.
              </CardDescription>
            </div>

            <Button
              render={
                <Link to="/customer/service-requests" />
              }
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
                  Your first request will appear here after
                  submission.
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

                    <h3 className="mt-1 truncate font-medium">
                      {request.title}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Technician:{" "}
                      {request.selected_technician?.name ??
                        "Profile unavailable"}
                    </p>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarClock
                        aria-hidden={true}
                        className="size-3.5"
                      />
                      {formatDate(request.scheduled_at)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <JobOrderStatusBadge
                      status={request.status}
                    />
                    <JobOrderPriorityBadge
                      priority={request.priority}
                    />

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
      </section>

      {snapshot.total === 0 ? (
        <section aria-labelledby="getting-started-title">
          <Card className="gap-0 rounded-none bg-background py-0 shadow-none">
            <CardHeader className="border-b p-5">
              <CardTitle>
                <h2 id="getting-started-title">
                  Getting started
                </h2>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 text-sm leading-6 text-muted-foreground">
              Choose a technician and submit a service
              request. A dispatcher will set the official
              schedule, and you can follow its progress here.
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}