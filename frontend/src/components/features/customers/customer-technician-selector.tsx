import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  UserRoundCheck,
  X,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorDetails } from "@/lib/api-errors";
import api from "@/lib/axios";
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

function getProfilePhotoUrl(value: string | null) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, api.defaults.baseURL).toString();
  } catch {
    return undefined;
  }
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
  const [selectedProfile, setSelectedProfile] =
    useState<CustomerTechnicianProfile | null>(null);
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
        ...(appliedSearch ? { search: appliedSearch } : {}),
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
    const search = searchInput.trim();

    if (page === 1 && appliedSearch === search) {
      void loadTechnicians();
      return;
    }

    setPage(1);
    setAppliedSearch(search);
  }

  function clearSearch() {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  }

  const selectedName =
    technicians.find((technician) => technician.id === value)?.name ??
    (selectedProfile?.id === value ? selectedProfile.name : null);

  const selectedIsOnCurrentPage = technicians.some(
    (technician) => technician.id === value,
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold">Preferred technician</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the profiles and choose who should handle your
          request. The dispatcher will schedule the visit.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <Input
          aria-label="Search technicians"
          disabled={disabled}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applySearch();
            }
          }}
          placeholder="Search by name, employee number, or specialization"
          type="search"
          value={searchInput}
        />

        <Button
          disabled={disabled || isLoading}
          onClick={applySearch}
          type="button"
          variant="outline"
        >
          <Search aria-hidden={true} />
          Search
        </Button>

        {appliedSearch ? (
          <Button
            disabled={disabled || isLoading}
            onClick={clearSearch}
            type="button"
            variant="ghost"
          >
            <X aria-hidden={true} />
            Clear
          </Button>
        ) : null}
      </div>

      {loadError ? (
        <div
          className="flex flex-col items-start gap-3 border border-destructive/30 bg-destructive/10 p-4"
          role="alert"
        >
          <p className="text-sm text-destructive">{loadError}</p>

          <Button
            disabled={disabled}
            onClick={() => void loadTechnicians()}
            type="button"
            variant="outline"
          >
            <RefreshCw aria-hidden={true} />
            Try again
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div
          aria-label="Loading technician profiles"
          className="grid gap-3 md:grid-cols-2"
          role="status"
        >
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <Skeleton
              className="h-64 w-full rounded-none"
              key={index}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && !loadError && technicians.length === 0 ? (
        <div className="border border-dashed p-8 text-center">
          <UserRoundCheck
            aria-hidden={true}
            className="mx-auto size-8 text-muted-foreground"
          />

          <p className="mt-3 font-medium">
            No active technicians found
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {appliedSearch
              ? "Try another search or clear your search."
              : "Technician profiles will appear here when available."}
          </p>
        </div>
      ) : null}

      {!isLoading && !loadError && technicians.length > 0 ? (
        <div
          aria-describedby={
            errorMessage ? "technician-selection-error" : undefined
          }
          aria-invalid={Boolean(errorMessage)}
          aria-label="Preferred technician"
          className="grid gap-3 md:grid-cols-2"
          role="radiogroup"
        >
          {technicians.map((technician) => {
            const isSelected = technician.id === value;
            const photoUrl = getProfilePhotoUrl(
              technician.profile_photo_url,
            );

            return (
              <label
                className={[
                  "block h-full border p-4 text-left transition-colors duration-200",
                  "focus-within:ring-2 focus-within:ring-ring",
                  "motion-reduce:transition-none",
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-muted/40",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card",
                ].join(" ")}
                key={technician.id}
              >
                <input
                  checked={isSelected}
                  className="sr-only"
                  disabled={disabled}
                  name="preferred-technician"
                  onChange={() => {
                    setSelectedProfile(technician);
                    onValueChange(technician.id, technician);
                  }}
                  type="radio"
                  value={technician.id}
                />

                <div className="flex items-start gap-3">
                  <Avatar size="lg">
                    {photoUrl ? (
                      <AvatarImage alt="" src={photoUrl} />
                    ) : null}
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
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {technician.employee_number}
                        </p>
                      </div>

                      {isSelected ? <Badge>Selected</Badge> : null}
                    </div>

                    <p className="mt-2 text-sm font-medium">
                      {technician.specialization ??
                        "General field service"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 border-t pt-4 text-sm">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Introduction
                    </p>
                    <p className="mt-1 whitespace-pre-wrap leading-6">
                      {technician.introduction ??
                        "No introduction is available."}
                    </p>
                  </div>

                  {technician.qualifications ? (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Qualifications
                      </p>
                      <p className="mt-1 whitespace-pre-wrap leading-6">
                        {technician.qualifications}
                      </p>
                    </div>
                  ) : null}

                  {technician.availability_notes ? (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Availability notes
                      </p>
                      <p className="mt-1 whitespace-pre-wrap leading-6">
                        {technician.availability_notes}
                      </p>
                    </div>
                  ) : null}
                </div>
              </label>
            );
          })}
        </div>
      ) : null}

      {!isLoading &&
      !loadError &&
      value !== null &&
      selectedName &&
      !selectedIsOnCurrentPage ? (
        <p className="border-l-2 border-primary pl-3 text-sm">
          Selected technician:{" "}
          <span className="font-medium">{selectedName}</span>
        </p>
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
                disabled={
                  disabled || pagination.current_page <= 1
                }
                onClick={() =>
                  setPage((currentPage) =>
                    Math.max(currentPage - 1, 1),
                  )
                }
                type="button"
                variant="outline"
              >
                Previous
              </Button>

              <Button
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
                type="button"
                variant="outline"
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {errorMessage ? (
        <p
          className="text-xs text-destructive"
          id="technician-selection-error"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}