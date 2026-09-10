import { useCallback, useEffect, useState, type FormEvent } from "react";
import { RefreshCw, UserRoundPlus } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorDetails } from "@/lib/api-errors";
import {
  assignJobOrder,
  getJobOrderAssignments,
  unassignJobOrder,
} from "@/services/job-order-assignments";
import { getTechnicians } from "@/services/technicians";
import type { JobOrder } from "@/types/job-order";
import type { JobOrderAssignment } from "@/types/job-order-assignment";
import type { Technician } from "@/types/technician";

interface JobOrderAssignmentPanelProps {
  jobOrder: JobOrder;
  onAssignmentChanged: () => void;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function JobOrderAssignmentPanel({
  jobOrder,
  onAssignmentChanged,
}: JobOrderAssignmentPanelProps) {
  const [assignments, setAssignments] = useState<JobOrderAssignment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [technicianId, setTechnicianId] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnassignDialogOpen, setIsUnassignDialogOpen] = useState(false);

  const loadAssignmentData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [assignmentResponse, technicianResponse] = await Promise.all([
        getJobOrderAssignments(jobOrder.id),
        getTechnicians({
          per_page: 100,
          is_active: true,
        }),
      ]);

      setAssignments(assignmentResponse.data.data);
      setTechnicians(technicianResponse.data.data);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load assignment information. Please try again.",
      );

      setLoadError(details.message);
    } finally {
      setIsLoading(false);
    }
  }, [jobOrder.id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAssignmentData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAssignmentData]);

  const activeAssignment =
    assignments.find((assignment) => assignment.unassigned_at === null) ??
    null;

  const canAssign =
    jobOrder.status === "created" || jobOrder.status === "assigned";

  async function refreshAfterChange() {
    await loadAssignmentData();
    onAssignmentChanged();
  }

  async function handleAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!technicianId) {
      setFieldErrors({
        technician_id: "Select an active technician.",
      });
      return;
    }

    setSubmitError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await assignJobOrder(jobOrder.id, {
        technician_id: Number(technicianId),
        notes: notes.trim() || null,
      });

      setSuccessMessage(response.message);
      setTechnicianId("");
      setNotes("");
      setFieldErrors({});
      await refreshAfterChange();
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to assign the technician. Please try again.",
      );

      setSubmitError(details.message);
      setFieldErrors(details.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUnassign() {
    if (!activeAssignment) {
      return;
    }

    setSubmitError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await unassignJobOrder(activeAssignment.id);

      setSuccessMessage(response.message);
      setIsUnassignDialogOpen(false);
      await refreshAfterChange();
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to end the assignment. Please try again.",
      );

      setSubmitError(details.message);
      setFieldErrors(details.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Technician assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-28 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Technician assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-destructive" role="alert">
            {loadError}
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={() => void loadAssignmentData()}
          >
            <RefreshCw />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Technician assignment</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {submitError ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {submitError}
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

          {activeAssignment ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                Currently assigned technician
              </p>
              <p className="mt-1 font-semibold">
                {activeAssignment.technician.user.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeAssignment.technician.employee_number} ·{" "}
                {activeAssignment.technician.specialization ??
                  "No specialization listed"}
              </p>
              <p className="mt-2 text-sm">
                Assigned {formatDate(activeAssignment.assigned_at)}
              </p>

              <Button
                className="mt-4"
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setIsUnassignDialogOpen(true)}
              >
                End assignment
              </Button>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No technician is currently assigned.
            </p>
          )}

          {!canAssign ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
              The backend only allows assignment while this job order has
              Created or Assigned status.
            </p>
          ) : (
            <form className="space-y-4 border-t pt-6" onSubmit={handleAssign}>
              <div className="space-y-2">
                <Label htmlFor="assignment-technician">
                  {activeAssignment
                    ? "Reassign to technician"
                    : "Assign technician"}
                </Label>

                <select
                  id="assignment-technician"
                  value={technicianId}
                  disabled={isSubmitting || technicians.length === 0}
                  onChange={(event) => {
                    setTechnicianId(event.target.value);
                    setFieldErrors((currentErrors) => {
                      const remainingErrors = { ...currentErrors };
                      delete remainingErrors.technician_id;
                      return remainingErrors;
                    });
                  }}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                >
                  <option value="">Select an active technician</option>
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                      {technician.user.name} — {technician.employee_number}
                    </option>
                  ))}
                </select>

                {technicians.length === 0 ? (
                  <p className="text-xs text-destructive">
                    No active technicians are available.
                  </p>
                ) : null}

                {fieldErrors.technician_id ? (
                  <p className="text-xs text-destructive">
                    {fieldErrors.technician_id}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment-notes">Assignment notes</Label>
                <Textarea
                  id="assignment-notes"
                  rows={3}
                  value={notes}
                  disabled={isSubmitting}
                  placeholder="Optional instructions for the technician"
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !technicianId ||
                  technicians.length === 0
                }
              >
                <UserRoundPlus />
                {isSubmitting
                  ? "Saving..."
                  : activeAssignment
                    ? "Reassign technician"
                    : "Assign technician"}
              </Button>
            </form>
          )}

          <div className="border-t pt-6">
            <h3 className="font-medium">Assignment history</h3>

            {assignments.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No assignment history is available.
              </p>
            ) : (
              <ol className="mt-4 space-y-4">
                {assignments.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="border-l-2 border-primary/30 pl-4 text-sm"
                  >
                    <p className="font-medium">
                      {assignment.technician.user.name}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {assignment.technician.employee_number} · Assigned by{" "}
                      {assignment.assigned_by.name}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Started {formatDate(assignment.assigned_at)}
                      {assignment.unassigned_at
                        ? ` · Ended ${formatDate(assignment.unassigned_at)}`
                        : " · Active"}
                    </p>
                    {assignment.notes ? (
                      <p className="mt-2 whitespace-pre-wrap">
                        {assignment.notes}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={isUnassignDialogOpen}
        onOpenChange={setIsUnassignDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              {activeAssignment
                ? `${activeAssignment.technician.user.name} will no longer be assigned to this job order.`
                : "This action cannot be completed because there is no active assignment."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={isSubmitting || !activeAssignment}
              onClick={() => void handleUnassign()}
            >
              {isSubmitting ? "Ending..." : "End assignment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
