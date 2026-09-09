import { Eye, Pencil, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import type { Technician } from "@/types/technician";

interface TechnicianTableProps {
  technicians: Technician[];
  isLoading: boolean;
  canManage: boolean;
  onEdit: (technician: Technician) => void;
  onView: (technician: Technician) => void;
}

export function TechnicianTable({
  technicians,
  isLoading,
  canManage,
  onEdit,
  onView,
}: TechnicianTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (technicians.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <UsersRound className="size-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-base font-semibold">No technicians found</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          There are no technician profiles matching the current filter.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 p-4 md:hidden">
        {technicians.map((technician) => (
          <article
            key={technician.id}
            className="rounded-lg border bg-card p-4 text-card-foreground"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold">
                  {technician.user.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {technician.employee_number}
                </p>
              </div>

              <Badge variant={technician.is_active ? "default" : "secondary"}>
                {technician.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <p className="truncate">{technician.user.email}</p>
              <p>{technician.phone ?? "No phone number"}</p>
              <p>{technician.specialization ?? "No specialization"}</p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onView(technician)}
              >
                <Eye />
                View
              </Button>

              {canManage ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(technician)}
                >
                  <Pencil />
                  Edit
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Technician</TableHead>
              <TableHead>Employee no.</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {technicians.map((technician) => (
              <TableRow key={technician.id}>
                <TableCell>
                  <p className="font-medium">{technician.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {technician.user.email}
                  </p>
                </TableCell>
                <TableCell>{technician.employee_number}</TableCell>
                <TableCell>{technician.phone ?? "—"}</TableCell>
                <TableCell>{technician.specialization ?? "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant={technician.is_active ? "default" : "secondary"}
                  >
                    {technician.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`View ${technician.user.name}`}
                      onClick={() => onView(technician)}
                    >
                      <Eye />
                    </Button>

                    {canManage ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${technician.user.name}`}
                        onClick={() => onEdit(technician)}
                      >
                        <Pencil />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}