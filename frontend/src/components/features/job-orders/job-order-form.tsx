import { useCallback, useEffect, useState, type FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getAllCustomers } from "@/services/customers";
import { createJobOrder } from "@/services/job-orders";
import type { Customer } from "@/types/customer";
import type {
  CreateJobOrderPayload,
  JobOrderPriority,
} from "@/types/job-order";

interface JobOrderFormProps {
  listPath: string;
}

interface JobOrderFormValues {
  customerId: string;
  title: string;
  description: string;
  serviceAddress: string;
  priority: JobOrderPriority;
  scheduledAt: string;
}

const emptyValues: JobOrderFormValues = {
  customerId: "",
  title: "",
  description: "",
  serviceAddress: "",
  priority: "normal",
  scheduledAt: "",
};

function toPayload(values: JobOrderFormValues): CreateJobOrderPayload {
  return {
    customer_id: Number(values.customerId),
    title: values.title.trim(),
    description: values.description.trim() || null,
    service_address: values.serviceAddress.trim() || null,
    priority: values.priority,
    scheduled_at: values.scheduledAt || null,
  };
}

export function JobOrderForm({ listPath }: JobOrderFormProps) {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [values, setValues] = useState<JobOrderFormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [customerError, setCustomerError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCustomers = useCallback(async () => {
    setIsLoadingCustomers(true);
    setCustomerError("");

    try {
      const loadedCustomers = await getAllCustomers();
      setCustomers(loadedCustomers);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load customers. Please try again.",
      );

      setCustomerError(details.message);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  function updateValue(field: keyof JobOrderFormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setFieldErrors((currentErrors) => {
      const errorField =
        field === "customerId"
          ? "customer_id"
          : field === "serviceAddress"
            ? "service_address"
            : field;

      const { [errorField]: ignoredError, ...remainingErrors } =
        currentErrors;

      return remainingErrors;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors: Record<string, string> = {};

    if (!values.customerId) {
      nextFieldErrors.customer_id = "Select a customer.";
    }

    if (!values.title.trim()) {
      nextFieldErrors.title = "Job order title is required.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await createJobOrder(toPayload(values));
      setSuccessMessage(response.message);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to create the job order. Please try again.",
      );

      setSubmitError(details.message);
      setFieldErrors(details.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <section className="mx-auto max-w-3xl">
        <div
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-700 dark:text-emerald-400"
          role="status"
        >
          <h2 className="text-lg font-semibold">Job order created</h2>
          <p className="mt-2 text-sm">{successMessage}</p>

          <Button
            className="mt-5"
            type="button"
            onClick={() => navigate(listPath)}
          >
            Return to Job Orders
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form className="mx-auto max-w-3xl space-y-6" onSubmit={handleSubmit}>
      {submitError ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {submitError}
        </div>
      ) : null}

      <section className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Customer</Label>

            <div
              className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto rounded-lg border p-2 sm:grid-cols-2"
              role="radiogroup"
              aria-label="Customer"
            >
              {isLoadingCustomers ? (
                <p className="p-2 text-sm text-muted-foreground">
                  Loading customers...
                </p>
              ) : null}

              {!isLoadingCustomers && customers.length === 0 ? (
                <p className="p-2 text-sm text-destructive">
                  No customers were loaded.
                </p>
              ) : null}

              {customers.map((customer) => {
                const isSelected = values.customerId === String(customer.id);

                return (
                  <button
                    key={customer.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isSubmitting}
                    onClick={() =>
                      updateValue("customerId", String(customer.id))
                    }
                    className={`rounded-lg border p-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <span className="block font-medium">{customer.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {customer.contact_person ?? "No contact person"} ·{" "}
                      {customer.phone}
                    </span>
                  </button>
                );
              })}
            </div>

            {customerError ? (
              <div className="flex items-center gap-2">
                <p className="text-xs text-destructive">{customerError}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void loadCustomers()}
                >
                  <RefreshCw />
                  Retry
                </Button>
              </div>
            ) : null}

            {fieldErrors.customer_id ? (
              <p className="text-xs text-destructive">
                {fieldErrors.customer_id}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="job-order-title">Job order title</Label>
            <Input
              id="job-order-title"
              value={values.title}
              onChange={(event) => updateValue("title", event.target.value)}
              aria-invalid={Boolean(fieldErrors.title)}
              disabled={isSubmitting}
            />
            {fieldErrors.title ? (
              <p className="text-xs text-destructive">{fieldErrors.title}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-order-priority">Priority</Label>

            <select
              id="job-order-priority"
              value={values.priority}
              onChange={(event) =>
                updateValue("priority", event.target.value)
              }
              disabled={isSubmitting}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-order-scheduled-at">
              Scheduled date and time
            </Label>
            <Input
              id="job-order-scheduled-at"
              type="datetime-local"
              value={values.scheduledAt}
              onChange={(event) =>
                updateValue("scheduledAt", event.target.value)
              }
              aria-invalid={Boolean(fieldErrors.scheduled_at)}
              disabled={isSubmitting}
            />
            {fieldErrors.scheduled_at ? (
              <p className="text-xs text-destructive">
                {fieldErrors.scheduled_at}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="job-order-service-address">Service address</Label>
            <Textarea
              id="job-order-service-address"
              rows={3}
              value={values.serviceAddress}
              onChange={(event) =>
                updateValue("serviceAddress", event.target.value)
              }
              aria-invalid={Boolean(fieldErrors.service_address)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="job-order-description">Description</Label>
            <Textarea
              id="job-order-description"
              rows={5}
              value={values.description}
              onChange={(event) =>
                updateValue("description", event.target.value)
              }
              aria-invalid={Boolean(fieldErrors.description)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => navigate(listPath)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingCustomers ||
              Boolean(customerError)
            }
          >
            {isSubmitting ? "Creating..." : "Create job order"}
          </Button>
        </div>
      </section>
    </form>
  );
}