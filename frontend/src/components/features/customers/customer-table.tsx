import { Eye, Pencil, Trash2, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer } from "@/types/customer";

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  onDelete: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
}

function CustomerActions({
  customer,
  onDelete,
  onEdit,
  onView,
}: Omit<CustomerTableProps, "customers" | "isLoading"> & {
  customer: Customer;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`View ${customer.name}`}
        title={`View ${customer.name}`}
        onClick={() => onView(customer)}
      >
        <Eye />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Edit ${customer.name}`}
        title={`Edit ${customer.name}`}
        onClick={() => onEdit(customer)}
      >
        <Pencil />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete ${customer.name}`}
        title={`Delete ${customer.name}`}
        onClick={() => onDelete(customer)}
      >
        <Trash2 className="text-destructive" />
      </Button>
    </div>
  );
}

function CustomerTableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}

function EmptyCustomers() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <UsersRound className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-base font-semibold">No customers found</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create a customer, or change the search term to view matching records.
      </p>
    </div>
  );
}

export function CustomerTable({
  customers,
  isLoading,
  onDelete,
  onEdit,
  onView,
}: CustomerTableProps) {
  if (isLoading) {
    return <CustomerTableSkeleton />;
  }

  if (customers.length === 0) {
    return <EmptyCustomers />;
  }

  return (
    <>
      <div className="space-y-3 p-4 md:hidden">
        {customers.map((customer) => (
          <article
            key={customer.id}
            className="rounded-lg border bg-card p-4 text-card-foreground"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{customer.name}</h3>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {customer.contact_person ?? "No contact person"}
                </p>
              </div>

              <CustomerActions
                customer={customer}
                onDelete={onDelete}
                onEdit={onEdit}
                onView={onView}
              />
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <p>
                <span className="text-muted-foreground">Phone: </span>
                {customer.phone}
              </p>
              <p className="truncate">
                <span className="text-muted-foreground">Email: </span>
                {customer.email ?? "—"}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact person</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.contact_person ?? "—"}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.email ?? "—"}</TableCell>
                <TableCell>
                  <CustomerActions
                    customer={customer}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onView={onView}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}