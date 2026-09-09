import { useEffect, useState, type FormEvent } from "react";

import { getApiErrorDetails } from "@/lib/api-errors";
import {
  createTechnician,
  updateTechnician,
} from "@/services/technicians";
import type {
  CreateTechnicianPayload,
  Technician,
  TechnicianPayload,
  TechnicianUser,
} from "@/types/technician";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TechnicianFormProps {
  technician?: Technician;
  technicianUsers: TechnicianUser[];
  isLoadingTechnicianUsers: boolean;
  technicianUsersError: string;
  onCancel: () => void;
  onSuccess: (message: string) => void;
}

interface TechnicianFormValues {
  userId: string;
  employeeNumber: string;
  phone: string;
  specialization: string;
  isActive: "active" | "inactive";
}

const emptyValues: TechnicianFormValues = {
  userId: "",
  employeeNumber: "",
  phone: "",
  specialization: "",
  isActive: "active",
};

function technicianToFormValues(
  technician?: Technician,
): TechnicianFormValues {
  if (!technician) {
    return emptyValues;
  }

  return {
    userId: String(technician.user_id),
    employeeNumber: technician.employee_number,
    phone: technician.phone ?? "",
    specialization: technician.specialization ?? "",
    isActive: technician.is_active ? "active" : "inactive",
  };
}

function createPayload(
  values: TechnicianFormValues,
): CreateTechnicianPayload {
  return {
    user_id: Number(values.userId),
    employee_number: values.employeeNumber.trim(),
    phone: values.phone.trim() || null,
    specialization: values.specialization.trim() || null,
    is_active: values.isActive === "active",
  };
}

function updatePayload(values: TechnicianFormValues): TechnicianPayload {
  return {
    employee_number: values.employeeNumber.trim(),
    phone: values.phone.trim() || null,
    specialization: values.specialization.trim() || null,
    is_active: values.isActive === "active",
  };
}

export function TechnicianForm({
  technician,
  technicianUsers,
  isLoadingTechnicianUsers,
  technicianUsersError,
  onCancel,
  onSuccess,
}: TechnicianFormProps) {
  const [values, setValues] = useState<TechnicianFormValues>(
    technicianToFormValues(technician),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(technicianToFormValues(technician));
    setFieldErrors({});
    setSubmitError("");
  }, [technician]);

  function updateValue(field: keyof TechnicianFormValues, value: string) {
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

    const nextFieldErrors: Record<string, string> = {};

    if (!values.employeeNumber.trim()) {
      nextFieldErrors.employee_number = "Employee number is required.";
    }

    if (!technician && !values.userId) {
      nextFieldErrors.user_id = "Select a technician user account.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = technician
        ? await updateTechnician(technician.id, updatePayload(values))
        : await createTechnician(createPayload(values));

      onSuccess(response.message);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        technician
          ? "Unable to update this technician."
          : "Unable to create this technician.",
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

      {!technician ? (
        <div className="space-y-2">
          <Label htmlFor="technician-user">Technician user account</Label>

          <Select
            value={values.userId}
            onValueChange={(value) => updateValue("userId", value ?? "")}
            disabled={isLoadingTechnicianUsers || isSubmitting}
          >
            <SelectTrigger
              id="technician-user"
              aria-invalid={Boolean(fieldErrors.user_id)}
            >
              <SelectValue placeholder="Select a user with Technician role" />
            </SelectTrigger>

            <SelectContent>
              {technicianUsers.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.name} — {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isLoadingTechnicianUsers ? (
            <p className="text-xs text-muted-foreground">
              Loading technician user accounts...
            </p>
          ) : null}

          {technicianUsersError ? (
            <p className="text-xs text-destructive">
              {technicianUsersError}
            </p>
          ) : null}

          {fieldErrors.user_id ? (
            <p className="text-xs text-destructive">{fieldErrors.user_id}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="employee-number">Employee number</Label>
          <Input
            id="employee-number"
            value={values.employeeNumber}
            onChange={(event) =>
              updateValue("employeeNumber", event.target.value)
            }
            aria-invalid={Boolean(fieldErrors.employee_number)}
            disabled={isSubmitting}
          />
          {fieldErrors.employee_number ? (
            <p className="text-xs text-destructive">
              {fieldErrors.employee_number}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="technician-status">Status</Label>

          <Select
            value={values.isActive}
            onValueChange={(value) =>
              updateValue(
                "isActive",
                value === "inactive" ? "inactive" : "active",
              )
            }
            disabled={isSubmitting}
          >
            <SelectTrigger id="technician-status">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="technician-phone">Phone number</Label>
          <Input
            id="technician-phone"
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
          <Label htmlFor="technician-specialization">Specialization</Label>
          <Input
            id="technician-specialization"
            value={values.specialization}
            onChange={(event) =>
              updateValue("specialization", event.target.value)
            }
            aria-invalid={Boolean(fieldErrors.specialization)}
            disabled={isSubmitting}
          />
          {fieldErrors.specialization ? (
            <p className="text-xs text-destructive">
              {fieldErrors.specialization}
            </p>
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
            : technician
              ? "Save changes"
              : "Create technician"}
        </Button>
      </div>
    </form>
  );
}