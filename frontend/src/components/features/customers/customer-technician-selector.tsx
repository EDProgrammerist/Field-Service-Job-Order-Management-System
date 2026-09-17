import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  RefreshCw,
  Search,
  UserRoundCheck,
  X,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getCustomerTechnicians } from "@/services/customer-technicians";
import type { CustomerTechnicianProfile } from "@/types/customer-technician";
import type { ResourceCollectionMeta } from "@/types/pagination";

interface CustomerTechnicianSelectorProps {
  value: number | null;
  onValueChange: (
    technicianId: number,
    technician: CustomerTechnicianProfile,
  ) => void;
  disabled?: boolean;
  errorMessage?: string;
}

const PAGE_SIZE = 6;

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function CustomerTechnicianSelector({
  value,
  onValueChange,
  disabled = false,
  errorMessage = "",
}: CustomerTechnicianSelectorProps) {
  const [technicians, setTechnicians] = useState<
    CustomerTechnicianProfile[]
  >([]);
  const [pagination, setPagination] =
    useState<ResourceCollectionMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadTechnicians = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await getCustomerTechnicians({
        page,
        per_page: PAGE_SIZE,
        ...(appliedSearch
          ? {
              search: appliedSearch,
            }
          : {}),
      });

      setTechnicians(response.data);
      setPagination(response.meta);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load active technicians. Please try again.",
      );

      setLoadError(details.message);
    } finally {
      setIsLoading(false);
    }
  }, [appliedSearch, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTechnicians();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadTechnicians]);

  function applySearch() {
    setPage(1);
    setAppliedSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-medium">Preferred technician</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Select the active technician you want to handle this request.
          Dispatchers can schedule the visit but cannot replace your
          selection.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <Input
          type="search"
          value={searchInput}
          disabled={disabled}
          placeholder="Search by name, employee number, or specialization"
          aria-label="Search technicians"
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applySearch();
            }
          }}
        />

        <Button
          type="button"
          variant="outline"
          disabled={disabled || isLoading}
          onClick={applySearch}
        >
          <Search />
          Search
        </Button>

        {appliedSearch ? (
          <Button
            type="button"
            variant="ghost"
            disabled={disabled || isLoading}
            onClick={clearSearch}
          >
            <X />
            Clear
          </Button>
        ) : null}
      </div>

      {loadError ? (
        <div
          className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
          role="alert"
        >
          <p className="text-sm text-destructive">{loadError}</p>

          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => void loadTechnicians()}
          >
            <RefreshCw />
            Try again
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <Skeleton key={index} className="h-48 w-full" />
          ))}
        </div>
      ) : null}

      {!isLoading && !loadError && technicians.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <UserRoundCheck
            aria-hidden="true"
            className="mx-auto size-8 text-muted-foreground"
          />

          <p className="mt-3 font-medium">
            No active technicians found
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Try another search or clear the current search.
          </p>
        </div>
      ) : null}

      {!isLoading && !loadError && technicians.length > 0 ? (
        <div
          className="grid gap-3 md:grid-cols-2"
          role="radiogroup"
          aria-label="Preferred technician"
          aria-invalid={Boolean(errorMessage)}
        >
          {technicians.map((technician) => {
            const isSelected = technician.id === value;

            return (
              <button
                key={technician.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() =>
                  onValueChange(technician.id, technician)
                }
                className={[
                  "rounded-lg border p-4 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:bg-muted/50",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <Avatar size="lg">
                    <AvatarFallback>
                      {getInitials(technician.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">
                          {technician.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {technician.employee_number}
                        </p>
                      </div>

                      {isSelected ? (
                        <Badge>Selected</Badge>
                      ) : null}
                    </div>

                    <p className="mt-3 text-sm font-medium">
                      {technician.specialization ??
                        "General field service"}
                    </p>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {technician.introduction ??
                        "No technician introduction is available."}
                    </p>

                    {technician.qualifications ? (
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        Qualifications: {technician.qualifications}
                      </p>
                    ) : null}

                    {technician.availability_notes ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        Availability notes:{" "}
                        {technician.availability_notes}
                      </p>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {pagination && !isLoading && !loadError ? (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.total} active technician
            {pagination.total === 1 ? "" : "s"} · Page{" "}
            {pagination.current_page} of {pagination.last_page}
          </p>

          {pagination.last_page > 1 ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={
                  disabled || pagination.current_page <= 1
                }
                onClick={() =>
                  setPage((currentPage) =>
                    Math.max(currentPage - 1, 1),
                  )
                }
              >
                Previous
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={
                  disabled ||
                  pagination.current_page >= pagination.last_page
                }
                onClick={() =>
                  setPage((currentPage) =>
                    Math.min(
                      currentPage + 1,
                      pagination.last_page,
                    ),
                  )
                }
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {errorMessage ? (
        <p className="text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}