import {
  useState,
  type FormEvent,
} from "react";

import { CustomerTechnicianSelector } from "@/components/features/customers/customer-technician-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorDetails } from "@/lib/api-errors";
import { createCustomerServiceRequest } from "@/services/customer-service-requests";

export function CustomerServiceRequestForm() {
  const [selectedTechnicianId, setSelectedTechnicianId] =
    useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearFieldError(field: string) {
    setFieldErrors((currentErrors) => {
      if (!(field in currentErrors)) {
        return currentErrors;
      }

      const remainingErrors = { ...currentErrors };
      delete remainingErrors[field];

      return remainingErrors;
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const technicianId = selectedTechnicianId;
    const nextFieldErrors: Record<string, string> = {};

    if (technicianId === null) {
      nextFieldErrors.selected_technician_id =
        "Select your preferred technician.";
    }

    if (!title.trim()) {
      nextFieldErrors.title =
        "Service request title is required.";
    }

    if (!description.trim()) {
      nextFieldErrors.description =
        "Problem description is required.";
    }

    if (!serviceAddress.trim()) {
      nextFieldErrors.service_address =
        "Service address is required.";
    }

    if (
      Object.keys(nextFieldErrors).length > 0 ||
      technicianId === null
    ) {
      setFieldErrors(nextFieldErrors);
      setErrorMessage(
        "Please complete the required request information.",
      );
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await createCustomerServiceRequest({
        selected_technician_id: technicianId,
        title: title.trim(),
        description: description.trim(),
        service_address: serviceAddress.trim(),
      });

      setSuccessMessage(response.message);
      setSelectedTechnicianId(null);
      setTitle("");
      setDescription("");
      setServiceAddress("");
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to submit your service request. Please try again.",
      );

      setErrorMessage(details.message);
      setFieldErrors(details.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit}
      noValidate
    >
      {errorMessage ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
          role="status"
        >
          {successMessage}
        </p>
      ) : null}

      <CustomerTechnicianSelector
        value={selectedTechnicianId}
        disabled={isSubmitting}
        errorMessage={fieldErrors.selected_technician_id}
        onValueChange={(technicianId) => {
          setSelectedTechnicianId(technicianId);
          clearFieldError("selected_technician_id");
        }}
      />

      <div className="space-y-2">
        <Label htmlFor="request-title">
          Service request title
        </Label>

        <Input
          id="request-title"
          value={title}
          aria-invalid={Boolean(fieldErrors.title)}
          onChange={(event) => {
            setTitle(event.target.value);
            clearFieldError("title");
          }}
          placeholder="Example: Air conditioner is not cooling"
          disabled={isSubmitting}
        />

        {fieldErrors.title ? (
          <p className="text-xs text-destructive">
            {fieldErrors.title}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="request-description">
          Describe the problem
        </Label>

        <Textarea
          id="request-description"
          value={description}
          aria-invalid={Boolean(fieldErrors.description)}
          onChange={(event) => {
            setDescription(event.target.value);
            clearFieldError("description");
          }}
          placeholder="Describe the issue, when it started, and any important details."
          disabled={isSubmitting}
        />

        {fieldErrors.description ? (
          <p className="text-xs text-destructive">
            {fieldErrors.description}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="service-address">
          Service address
        </Label>

        <Textarea
          id="service-address"
          value={serviceAddress}
          aria-invalid={Boolean(fieldErrors.service_address)}
          onChange={(event) => {
            setServiceAddress(event.target.value);
            clearFieldError("service_address");
          }}
          placeholder="Enter the address where service is required."
          disabled={isSubmitting}
        />

        {fieldErrors.service_address ? (
          <p className="text-xs text-destructive">
            {fieldErrors.service_address}
          </p>
        ) : null}
      </div>

      <Button
        className="w-full sm:w-auto"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Submitting request..."
          : "Submit service request"}
      </Button>
    </form>
  );
}