import { useState } from "react";

import { getApiErrorDetails } from "@/lib/api-errors";
import { deleteCustomer } from "@/services/customers";
import type { Customer } from "@/types/customer";
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

interface DeleteCustomerDialogProps {
  customer: Customer | null;
  onDeleted: (message: string) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function DeleteCustomerDialog({
  customer,
  onDeleted,
  onOpenChange,
  open,
}: DeleteCustomerDialogProps) {
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!customer) {
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      const response = await deleteCustomer(customer.id);

      await onDeleted(response.message);
      onOpenChange(false);
    } catch (requestError) {
      const details = getApiErrorDetails(
        requestError,
        "Unable to delete this customer. Please try again.",
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
          <AlertDialogTitle>Delete customer?</AlertDialogTitle>
          <AlertDialogDescription>
            {customer
              ? `This will permanently delete ${customer.name}.`
              : "This will permanently delete the selected customer."}
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
          <AlertDialogCancel
            render={
              <Button type="button" variant="outline" disabled={isDeleting} />
            }
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            render={
              <Button type="button" variant="destructive" disabled={isDeleting} />
            }
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
          >
            {isDeleting ? "Deleting..." : "Delete customer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}