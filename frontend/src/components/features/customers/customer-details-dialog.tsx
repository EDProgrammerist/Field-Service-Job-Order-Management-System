import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Customer } from "@/types/customer";

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CustomerDetailsDialog({
  customer,
  onOpenChange,
  open,
}: CustomerDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Customer details</DialogTitle>
          <DialogDescription>
            View the saved contact information for this customer.
          </DialogDescription>
        </DialogHeader>

        {customer ? (
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Customer name</dt>
              <dd className="mt-1 font-medium">{customer.name}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Contact person</dt>
              <dd className="mt-1">{customer.contact_person ?? "—"}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Phone number</dt>
              <dd className="mt-1">{customer.phone}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Email address</dt>
              <dd className="mt-1 break-all">{customer.email ?? "—"}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Address</dt>
              <dd className="mt-1 whitespace-pre-wrap">
                {customer.address ?? "—"}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="mt-1">{formatDate(customer.created_at)}</dd>
            </div>
          </dl>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}