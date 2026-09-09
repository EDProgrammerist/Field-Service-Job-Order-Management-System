import { useCallback, useEffect, useState, type FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getAllCustomers } from "@/services/customers";
import {
  createJobOrder,
  getJobOrder,
  updateJobOrder,
} from "@/services/job-orders";
import type { Customer } from "@/types/customer";
import type {
  CreateJobOrderPayload,
  JobOrder,
  JobOrderPriority,
} from "@/types/job-order";

interface JobOrderFormProps {
  listPath: string;
  jobOrderId?: number;
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

function formatDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number: number) => String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toFormValues(jobOrder: JobOrder): JobOrderFormValues {
  return {
    customerId: String(jobOrder.customer_id),
    title: jobOrder.title,
    description: jobOrder.description ?? "",
    serviceAddress: jobOrder.service_address ?? "",
    priority: jobOrder.priority,
    scheduledAt: formatDateTimeLocal(jobOrder.scheduled_at),
  };
}

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

export function JobOrderForm({
  listPath,
  jobOrderId,
}: JobOrderFormProps) {
  const navigate = useNavigate();
  const isEditing = typeof jobOrderId === "number";

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [values, setValues] = useState<JobOrderFormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFormData = useCallback(async () => {
    setIsLoadingData(true);
    setLoadError("");

    try {
      const customersRequest = getAllCustomers();
      const jobOrderRequest =
        typeof jobOrderId === "number"
          ? getJobOrder(jobOrderId)
          : Promise.resolve(null);

      const [loadedCustomers, jobOrderResponse] = await Promise.all([
        customersRequest,
        jobOrderRequest,
      ]);

      setCustomers(loadedCustomers);

      if (jobOrderResponse) {
        setValues(toFormValues(jobOrderResponse.data));
      }
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load the job order form. Please try again.",
      );

      setLoadError(details.message);
    } finally {
      setIsLoadingData(false);
    }
  }, [jobOrderId]);

  useEffect(() => {
    void loadFormData();
  }, [loadFormData]);

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

      const remainingErrors = { ...currentErrors };
      delete remainingErrors[errorField];

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
      const payload = toPayload(values);
      const response =
        isEditing && typeof jobOrderId === "number"
          ? await updateJobOrder(jobOrderId, payload)
          : await createJobOrder(payload);

      setSuccessMessage(response.message);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        isEditing
          ? "Unable to update the job order. Please try again."
          : "Unable to create the job order. Please try again.",
      );

      setSubmitError(details.message);
      setFieldErrors(details.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingData) {
    return (
      <section
        className="mx-auto max-w-3xl rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-sm"
        role="status"
      >
        Loading job order form...
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-xl border border-destructive/30 bg-destructive/10 p-6">
        <p className="text-sm text-destructive" role="alert">
          {loadError}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void loadFormData()}>
            <RefreshCw />
            Try again
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(listPath)}
          >
            Cancel
          </Button>
        </div>
      </section>
    );
  }

  if (successMessage) {
    return (
      <section className="mx-auto max-w-3xl">
        <div
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-700 dark:text-emerald-400"
          role="status"
        >
          <h2 className="text-lg font-semibold">
            {isEditing ? "Job order updated" : "Job order created"}
          </h2>
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
              {customers.length === 0 ? (
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

          <Button type="submit" disabled={isSubmitting || customers.length === 0}>
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save changes"
                : "Create job order"}
          </Button>
        </div>
      </section>
    </form>
  );
}