import { useEffect, useState, type FormEvent } from "react";

import { getApiErrorDetails } from "@/lib/api-errors";
import { createCustomer, updateCustomer } from "@/services/customers";
import type { Customer, CustomerPayload } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CustomerFormProps {
  customer?: Customer;
  onCancel: () => void;
  onSuccess: (message: string) => void;
}

interface CustomerFormValues {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
}

const emptyValues: CustomerFormValues = {
  name: "",
  contact_person: "",
  email: "",
  phone: "",
  address: "",
};

function customerToFormValues(customer?: Customer): CustomerFormValues {
  if (!customer) {
    return emptyValues;
  }

  return {
    name: customer.name,
    contact_person: customer.contact_person ?? "",
    email: customer.email ?? "",
    phone: customer.phone,
    address: customer.address ?? "",
  };
}

function toPayload(values: CustomerFormValues): CustomerPayload {
  return {
    name: values.name.trim(),
    contact_person: values.contact_person.trim() || null,
    email: values.email.trim() || null,
    phone: values.phone.trim(),
    address: values.address.trim() || null,
  };
}

export function CustomerForm({
  customer,
  onCancel,
  onSuccess,
}: CustomerFormProps) {
  const [values, setValues] = useState<CustomerFormValues>(
    customerToFormValues(customer),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(customerToFormValues(customer));
    setFieldErrors({});
    setSubmitError("");
  }, [customer]);

  function updateValue(field: keyof CustomerFormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setFieldErrors((currentErrors) => {
      const { [field]: ignoredError, ...remainingErrors } = currentErrors;

      return remainingErrors;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = toPayload(values);
    const nextFieldErrors: Record<string, string> = {};

    if (!payload.name) {
      nextFieldErrors.name = "Customer name is required.";
    }

    if (!payload.phone) {
      nextFieldErrors.phone = "Phone number is required.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = customer
        ? await updateCustomer(customer.id, payload)
        : await createCustomer(payload);

      onSuccess(response.message);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        customer
          ? "Unable to update this customer. Please try again."
          : "Unable to create this customer. Please try again.",
      );

      setSubmitError(details.message);
      setFieldErrors(details.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {submitError ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {submitError}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-name">Customer name</Label>
          <Input
            id="customer-name"
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            autoComplete="organization"
            disabled={isSubmitting}
          />
          {fieldErrors.name ? (
            <p className="text-xs text-destructive">{fieldErrors.name}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-phone">Phone number</Label>
          <Input
            id="customer-phone"
            value={values.phone}
            onChange={(event) => updateValue("phone", event.target.value)}
            aria-invalid={Boolean(fieldErrors.phone)}
            autoComplete="tel"
            disabled={isSubmitting}
          />
          {fieldErrors.phone ? (
            <p className="text-xs text-destructive">{fieldErrors.phone}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-contact-person">Contact person</Label>
          <Input
            id="customer-contact-person"
            value={values.contact_person}
            onChange={(event) =>
              updateValue("contact_person", event.target.value)
            }
            aria-invalid={Boolean(fieldErrors.contact_person)}
            autoComplete="name"
            disabled={isSubmitting}
          />
          {fieldErrors.contact_person ? (
            <p className="text-xs text-destructive">
              {fieldErrors.contact_person}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-email">Email address</Label>
          <Input
            id="customer-email"
            type="email"
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            autoComplete="email"
            disabled={isSubmitting}
          />
          {fieldErrors.email ? (
            <p className="text-xs text-destructive">{fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="customer-address">Address</Label>
          <Textarea
            id="customer-address"
            value={values.address}
            onChange={(event) => updateValue("address", event.target.value)}
            aria-invalid={Boolean(fieldErrors.address)}
            disabled={isSubmitting}
            rows={3}
          />
          {fieldErrors.address ? (
            <p className="text-xs text-destructive">{fieldErrors.address}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : customer
              ? "Save changes"
              : "Create customer"}
        </Button>
      </div>
    </form>
  );
}