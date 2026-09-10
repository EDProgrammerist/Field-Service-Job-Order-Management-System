import { useState } from "react";
import { Trash2 } from "lucide-react";

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
import { getApiErrorDetails } from "@/lib/api-errors";
import { deleteJobOrder } from "@/services/job-orders";
import type { JobOrder } from "@/types/job-order";

interface DeleteJobOrderDialogProps {
  jobOrder: JobOrder;
  onDeleted: (message: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function DeleteJobOrderDialog({
  jobOrder,
  onDeleted,
  onOpenChange,
  open,
}: DeleteJobOrderDialogProps) {
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setError("");
    setIsDeleting(true);

    try {
      const response = await deleteJobOrder(jobOrder.id);

      onOpenChange(false);
      onDeleted(response.message);
    } catch (requestError) {
      const details = getApiErrorDetails(
        requestError,
        "Unable to delete this job order. Please try again.",
      );

      setError(details.message);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!isDeleting) {
      setError("");
      onOpenChange(nextOpen);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete job order?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {jobOrder.job_order_number} — {jobOrder.title}.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <p
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
          >
            <Trash2 aria-hidden="true" />
            {isDeleting ? "Deleting..." : "Delete job order"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
