import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, X } from "lucide-react";

import { TechnicianForm } from "@/components/features/technicians/technician-form";
import { TechnicianTable } from "@/components/features/technicians/technician-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { getApiErrorDetails } from "@/lib/api-errors";
import {
  getTechnicianUsers,
  getTechnicians,
} from "@/services/technicians";
import type { Technician, TechnicianUser } from "@/types/technician";
import type { PaginatedCollection } from "@/types/pagination";

const PAGE_SIZE = 10;

type ActiveFilter = "all" | "active" | "inactive";

export function TechnicianManagement() {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [pagination, setPagination] =
    useState<PaginatedCollection<Technician> | null>(null);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [technicianToEdit, setTechnicianToEdit] =
    useState<Technician | null>(null);
  const [technicianToView, setTechnicianToView] =
    useState<Technician | null>(null);

  const [technicianUsers, setTechnicianUsers] = useState<TechnicianUser[]>([]);
  const [isLoadingTechnicianUsers, setIsLoadingTechnicianUsers] =
    useState(false);
  const [technicianUsersError, setTechnicianUsersError] = useState("");

  const loadTechnicians = useCallback(
    async (pageToLoad: number, filter: ActiveFilter) => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await getTechnicians({
          page: pageToLoad,
          per_page: PAGE_SIZE,
          ...(filter === "all"
            ? {}
            : { is_active: filter === "active" }),
        });

        setTechnicians(response.data.data);
        setPagination(response.data);
      } catch (error) {
        const details = getApiErrorDetails(
          error,
          "Unable to load technicians. Please try again.",
        );

        setLoadError(details.message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTechnicians(page, activeFilter);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeFilter, loadTechnicians, page]);

  async function loadTechnicianUsers() {
    setIsLoadingTechnicianUsers(true);
    setTechnicianUsersError("");

    try {
      const users = await getTechnicianUsers();
      setTechnicianUsers(users);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load technician user accounts.",
      );

      setTechnicianUsersError(details.message);
    } finally {
      setIsLoadingTechnicianUsers(false);
    }
  }

  function openCreateDialog() {
    setIsCreateOpen(true);
    void loadTechnicianUsers();
  }

  function handleSaved(message: string) {
    setSuccessMessage(message);
    setIsCreateOpen(false);
    setTechnicianToEdit(null);
    void loadTechnicians(page, activeFilter);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Operations
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Technicians
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            View technician profiles, availability, and specialization details.
          </p>
        </div>

        {canManage ? (
          <Button onClick={openCreateDialog}>
            <Plus />
            Add technician
          </Button>
        ) : null}
      </div>

      {successMessage ? (
        <div
          className="flex items-start justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
          role="status"
        >
          <span>{successMessage}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Dismiss message"
            onClick={() => setSuccessMessage("")}
          >
            <X />
          </Button>
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Technician directory</CardTitle>

          <Select
            value={activeFilter}
            onValueChange={(value) => {
              const nextFilter =
                value === "active" || value === "inactive" ? value : "all";

              setPage(1);
              setActiveFilter(nextFilter);
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="inactive">Inactive only</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="p-0">
          {loadError ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="max-w-md text-sm text-destructive" role="alert">
                {loadError}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void loadTechnicians(page, activeFilter)}
              >
                <RefreshCw />
                Try again
              </Button>
            </div>
          ) : (
            <TechnicianTable
              technicians={technicians}
              isLoading={isLoading}
              canManage={canManage}
              onEdit={setTechnicianToEdit}
              onView={setTechnicianToView}
            />
          )}
        </CardContent>

        {pagination && !isLoading && !loadError ? (
          <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              {pagination.total} technician
              {pagination.total === 1 ? "" : "s"} · Page{" "}
              {pagination.current_page} of {pagination.last_page}
            </p>

            {pagination.last_page > 1 ? (
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={pagination.current_page === 1}
                      className={
                        pagination.current_page === 1
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault();

                        if (pagination.current_page > 1) {
                          setPage(pagination.current_page - 1);
                        }
                      }}
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={
                        pagination.current_page === pagination.last_page
                      }
                      className={
                        pagination.current_page === pagination.last_page
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault();

                        if (pagination.current_page < pagination.last_page) {
                          setPage(pagination.current_page + 1);
                        }
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </div>
        ) : null}
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add technician</DialogTitle>
            <DialogDescription>
              Select an existing User account with the Technician role, then add
              its technician profile.
            </DialogDescription>
          </DialogHeader>

          <TechnicianForm
            technicianUsers={technicianUsers}
            isLoadingTechnicianUsers={isLoadingTechnicianUsers}
            technicianUsersError={technicianUsersError}
            onCancel={() => setIsCreateOpen(false)}
            onSuccess={handleSaved}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(technicianToEdit)}
        onOpenChange={(open) => {
          if (!open) {
            setTechnicianToEdit(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit technician</DialogTitle>
            <DialogDescription>
              Update this technician’s employee profile and availability.
            </DialogDescription>
          </DialogHeader>

          <TechnicianForm
            technician={technicianToEdit ?? undefined}
            technicianUsers={[]}
            isLoadingTechnicianUsers={false}
            technicianUsersError=""
            onCancel={() => setTechnicianToEdit(null)}
            onSuccess={handleSaved}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(technicianToView)}
        onOpenChange={(open) => {
          if (!open) {
            setTechnicianToView(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Technician details</DialogTitle>
            <DialogDescription>
              View the selected technician’s profile information.
            </DialogDescription>
          </DialogHeader>

          {technicianToView ? (
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="mt-1 font-medium">
                  {technicianToView.user.name}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1 break-all">
                  {technicianToView.user.email}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Employee number</dt>
                <dd className="mt-1">
                  {technicianToView.employee_number}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone number</dt>
                <dd className="mt-1">{technicianToView.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Specialization</dt>
                <dd className="mt-1">
                  {technicianToView.specialization ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Availability</dt>
                <dd className="mt-1">
                  <Badge
                    variant={
                      technicianToView.is_active ? "default" : "secondary"
                    }
                  >
                    {technicianToView.is_active ? "Active" : "Inactive"}
                  </Badge>
                </dd>
              </div>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
