import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorDetails } from "@/lib/api-errors";
import {
  getAdminJobOrder,
  updateAdminJobOrder,
} from "@/services/admin-job-orders";
import type { JobOrderPriority } from "@/types/job-order";

interface Props {
  jobOrderId: number;
}

export function AdminJobOrderEditForm({
  jobOrderId,
}: Props) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [priority, setPriority] =
    useState<JobOrderPriority>("normal");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const response = await getAdminJobOrder(
        jobOrderId,
      );
      setTitle(response.data.title);
      setDescription(
        response.data.description ?? "",
      );
      setAddress(
        response.data.service_address ?? "",
      );
      setPriority(response.data.priority);
    } catch (requestError) {
      setLoadError(
        getApiErrorDetails(
          requestError,
          "Unable to load this job order.",
        ).message,
      );
    } finally {
      setLoading(false);
    }
  }, [jobOrderId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitError("");

    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = "Enter a title.";
    }
    if (!address.trim()) {
      errors.service_address =
        "Enter a service address.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);

    try {
      await updateAdminJobOrder(jobOrderId, {
        title: title.trim(),
        description: description.trim() || null,
        service_address: address.trim(),
        priority,
      });
      navigate(`/admin/job-orders/${jobOrderId}`, {
        replace: true,
      });
    } catch (requestError) {
      const details = getApiErrorDetails(
        requestError,
        "Unable to save changes.",
      );
      setSubmitError(details.message);
      setFieldErrors(details.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading job order...
      </p>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-3">
        <p
          className="text-sm text-destructive"
          role="alert"
        >
          {loadError}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void load()}
        >
          <RefreshCw aria-hidden={true} />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <form
      className="max-w-3xl space-y-5 rounded-lg border bg-card p-6"
      onSubmit={handleSubmit}
    >
      <p className="text-sm text-muted-foreground">
        Customer, selected technician, official
        schedule, and workflow status cannot be changed
        here.
      </p>

      {submitError ? (
        <p
          className="text-sm text-destructive"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="admin-job-title">Title</Label>
        <Input
          id="admin-job-title"
          maxLength={255}
          value={title}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.title)}
          onChange={(event) =>
            setTitle(event.target.value)
          }
        />
        {fieldErrors.title ? (
          <p className="text-xs text-destructive">
            {fieldErrors.title}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-job-description">
          Description
        </Label>
        <Textarea
          id="admin-job-description"
          maxLength={5000}
          rows={5}
          value={description}
          disabled={submitting}
          onChange={(event) =>
            setDescription(event.target.value)
          }
        />
        {fieldErrors.description ? (
          <p className="text-xs text-destructive">
            {fieldErrors.description}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-job-address">
          Service address
        </Label>
        <Textarea
          id="admin-job-address"
          maxLength={2000}
          rows={3}
          value={address}
          disabled={submitting}
          aria-invalid={Boolean(
            fieldErrors.service_address,
          )}
          onChange={(event) =>
            setAddress(event.target.value)
          }
        />
        {fieldErrors.service_address ? (
          <p className="text-xs text-destructive">
            {fieldErrors.service_address}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-job-priority">
          Priority
        </Label>
        <select
          id="admin-job-priority"
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          value={priority}
          disabled={submitting}
          onChange={(event) =>
            setPriority(
              event.target.value as JobOrderPriority,
            )
          }
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button
          render={
            <Link
              to={`/admin/job-orders/${jobOrderId}`}
            />
          }
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}