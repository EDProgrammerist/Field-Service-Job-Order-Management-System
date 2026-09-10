import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorDetails } from "@/lib/api-errors";
import { createCustomerServiceRequest } from "@/services/customer-service-requests";

export function CustomerServiceRequestForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !description.trim() || !serviceAddress.trim()) {
      setErrorMessage(
        "Title, description, and service address are required.",
      );
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await createCustomerServiceRequest({
        title: title.trim(),
        description: description.trim(),
        service_address: serviceAddress.trim(),
      });

      setSuccessMessage(response.message);
      setTitle("");
      setDescription("");
      setServiceAddress("");
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to submit your service request. Please try again.",
      );

      setErrorMessage(details.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
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

      <div className="space-y-2">
        <Label htmlFor="request-title">Service request title</Label>
        <Input
          id="request-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Example: Air conditioner is not cooling"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="request-description">Describe the problem</Label>
        <Textarea
          id="request-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the issue, when it started, and any important details."
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="service-address">Service address</Label>
        <Textarea
          id="service-address"
          value={serviceAddress}
          onChange={(event) => setServiceAddress(event.target.value)}
          placeholder="Enter the address where service is required."
          disabled={isSubmitting}
        />
      </div>

      <Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting request..." : "Submit service request"}
      </Button>
    </form>
  );
}