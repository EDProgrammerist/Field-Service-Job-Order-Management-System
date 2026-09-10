import { CustomerServiceRequestForm } from "@/components/features/customers/customer-service-request-form";
import { DashboardLayout } from "@/components/common/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CustomerNewServiceRequestPage() {
  return (
    <DashboardLayout>
      <section className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Customer workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Submit a service request
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Tell us what needs repair and where service is required.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request details</CardTitle>
            <CardDescription>
              Your request starts as Pending Review for the operations team.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <CustomerServiceRequestForm />
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
}