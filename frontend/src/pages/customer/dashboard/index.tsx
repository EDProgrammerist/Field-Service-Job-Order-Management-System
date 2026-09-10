import { useCallback, useEffect, useState } from "react";
import { ClipboardList, FilePlus2, RefreshCw } from "lucide-react";
import { Link } from "react-router";

import { DashboardLayout } from "@/components/common/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getCustomerServiceRequests } from "@/services/customer-service-requests";

export default function CustomerDashboardPage() {
  const { user } = useAuth();

  const [requestCount, setRequestCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getCustomerServiceRequests({
        page: 1,
        per_page: 1,
      });

      setRequestCount(response.data.total);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load your service-request summary. Please try again.",
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

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Customer workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome, {user?.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Submit repair requests and follow their progress in one place.
          </p>
        </div>

        {errorMessage ? (
          <div
            className="flex flex-col justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:flex-row sm:items-center"
            role="alert"
          >
            <span>{errorMessage}</span>

            <Button
              type="button"
              variant="outline"
              onClick={() => void loadDashboard()}
            >
              <RefreshCw />
              Try again
            </Button>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="flex items-start justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  My service requests
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">
                  {isLoading ? "—" : requestCount}
                </p>
              </div>

              <div className="rounded-lg bg-muted p-2.5 text-muted-foreground">
                <ClipboardList aria-hidden="true" className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need service?</CardTitle>
              <CardDescription>
                Submit a repair or service request for review.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button render={<Link to="/customer/service-requests/new" />}>
                <FilePlus2 />
                Submit new request
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Track your requests</CardTitle>
            <CardDescription>
              View only requests connected to your Customer account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              variant="outline"
              render={<Link to="/customer/service-requests" />}
            >
              <ClipboardList />
              View my requests
            </Button>
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
}
