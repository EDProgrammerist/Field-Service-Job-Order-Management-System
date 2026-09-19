import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { DashboardShell } from "@/components/common/dashboard-shell/dashboard-layout";
import { CustomerServiceRequestForm } from "@/components/features/customers/customer-service-request-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CustomerNewServiceRequestPage() {
  return (
    <DashboardShell>
      <section className="mx-auto max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
        <Button
          render={<Link to="/customer/service-requests" />}
          size="sm"
          variant="outline"
        >
          <ArrowLeft aria-hidden={true} />
          Back to My Requests
        </Button>

        <header>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Submit a service request
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose your preferred technician and tell us what needs
            repair.
          </p>
        </header>

        <Card className="gap-0 rounded-none py-0 shadow-none">
          <CardHeader className="rounded-none border-b p-5">
            <CardTitle>Request details</CardTitle>
            <CardDescription>
              Your request starts as Pending Schedule. A dispatcher
              will assign the official service time for your selected
              technician.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            <CustomerServiceRequestForm />
          </CardContent>
        </Card>
      </section>
    </DashboardShell>
  );
}