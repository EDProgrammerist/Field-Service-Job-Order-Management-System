import { useCallback, useEffect, useState } from "react";
import {
  Mail,
  Phone,
  RefreshCw,
  UsersRound,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getTechnicians } from "@/services/technicians";
import type { PaginatedCollection } from "@/types/pagination";
import type { Technician } from "@/types/technician";

const PAGE_SIZE = 9;

const ACTIVE_FILTER_LABELS: Record<ActiveFilter, string> = {
  all: "All technicians",
  active: "Active only",
  inactive: "Inactive only",
};

type ActiveFilter = "all" | "active" | "inactive";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function DispatcherTechnicianDirectory() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [pagination, setPagination] =
    useState<PaginatedCollection<Technician> | null>(null);
  const [filter, setFilter] = useState<ActiveFilter>("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadTechnicians = useCallback(
    async (pageToLoad: number, selectedFilter: ActiveFilter) => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await getTechnicians({
          page: pageToLoad,
          per_page: PAGE_SIZE,
          ...(selectedFilter === "all"
            ? {}
            : { is_active: selectedFilter === "active" }),
        });

        setTechnicians(response.data.data);
        setPagination(response.data);
      } catch (error) {
        const details = getApiErrorDetails(
          error,
          "Unable to load the technician directory.",
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
      void loadTechnicians(page, filter);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [filter, loadTechnicians, page]);

  return (
    <section className="space-y-4">
      <Card className="gap-0 rounded-none py-0 shadow-none">
        <CardHeader className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base">
              Technician directory
            </CardTitle>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Review profiles and contact details. Scheduling
              availability is checked when you set a service date.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:shrink-0">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={() => void loadTechnicians(page, filter)}
            >
              <RefreshCw aria-hidden={true} />
              Refresh
            </Button>

            <Select
              value={filter}
              onValueChange={(value) => {
                const nextFilter: ActiveFilter =
                  value === "active" || value === "inactive"
                    ? value
                    : "all";
                setFilter(nextFilter);
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Filter technicians"
                className="w-full sm:w-44"
              >
                <SelectValue>{ACTIVE_FILTER_LABELS[filter]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All technicians
                </SelectItem>
                <SelectItem value="active">
                  Active only
                </SelectItem>
                <SelectItem value="inactive">
                  Inactive only
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {loadError ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
              <p
                className="max-w-md text-sm text-destructive"
                role="alert"
              >
                {loadError}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void loadTechnicians(page, filter)
                }
              >
                <RefreshCw aria-hidden={true} />
                Try again
              </Button>
            </div>
          ) : null}

          {!loadError && isLoading ? (
            <div
              className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3"
              aria-label="Loading technicians"
            >
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton
                  className="h-56 w-full rounded-none"
                  key={index}
                />
              ))}
            </div>
          ) : null}

          {!loadError &&
            !isLoading &&
            technicians.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="flex size-12 items-center justify-center border bg-muted/30">
                <UsersRound
                  aria-hidden={true}
                  className="size-5 text-muted-foreground"
                />
              </div>
              <h3 className="mt-4 font-medium">
                No technicians found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another profile-status filter.
              </p>
            </div>
          ) : null}

          {!loadError && !isLoading && technicians.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {technicians.map((technician) => (
                <article
                  className="flex flex-col border bg-background p-5 transition-colors hover:bg-muted/20"
                  key={technician.id}
                >
                  <div className="flex items-start gap-3">
                    <div
                      aria-hidden={true}
                      className="flex size-11 shrink-0 items-center justify-center border bg-muted/40 text-sm font-semibold"
                    >
                      {getInitials(technician.user.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">
                        {technician.user.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {technician.employee_number}
                      </p>
                    </div>

                    <Badge
                      variant={
                        technician.is_active
                          ? "default"
                          : "secondary"
                      }
                    >
                      {technician.is_active
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </div>

                  <div className="mt-5 space-y-3 border-t pt-4 text-sm">
                    <p className="flex items-start gap-2">
                      <Wrench
                        aria-hidden={true}
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      />
                      <span>
                        {technician.specialization ??
                          "General service"}
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Phone
                        aria-hidden={true}
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      />
                      <span>
                        {technician.phone ??
                          "No phone number"}
                      </span>
                    </p>
                    <p className="flex min-w-0 items-start gap-2">
                      <Mail
                        aria-hidden={true}
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      />
                      <span className="break-all">
                        {technician.user.email}
                      </span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </CardContent>

        {pagination && !isLoading && !loadError ? (
          <div className="flex flex-col gap-4 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              {pagination.total} technician
              {pagination.total === 1 ? "" : "s"} · Page{" "}
              {pagination.current_page} of{" "}
              {pagination.last_page}
            </p>

            {pagination.last_page > 1 ? (
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={
                        pagination.current_page === 1
                      }
                      className={
                        pagination.current_page === 1
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault();
                        if (pagination.current_page > 1) {
                          setPage(
                            pagination.current_page - 1,
                          );
                        }
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={
                        pagination.current_page ===
                        pagination.last_page
                      }
                      className={
                        pagination.current_page ===
                          pagination.last_page
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault();
                        if (
                          pagination.current_page <
                          pagination.last_page
                        ) {
                          setPage(
                            pagination.current_page + 1,
                          );
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
    </section>
  );
}