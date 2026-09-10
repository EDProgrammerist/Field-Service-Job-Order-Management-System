import { Fragment, useCallback, useEffect, useState, type FormEvent } from "react";
import { Plus, RefreshCw, Search, X } from "lucide-react";

import { CustomerDetailsDialog } from "@/components/features/customers/customer-details-dialog";
import { CustomerForm } from "@/components/features/customers/customer-form";
import { CustomerTable } from "@/components/features/customers/customer-table";
import { DeleteCustomerDialog } from "@/components/features/customers/delete-customer-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getApiErrorDetails } from "@/lib/api-errors";
import { getCustomers } from "@/services/customers";
import type { Customer } from "@/types/customer";
import type { PaginatedCollection } from "@/types/pagination";

const PAGE_SIZE = 10;

function getPageNumbers(currentPage: number, lastPage: number) {
  return [...new Set([1, currentPage - 1, currentPage, currentPage + 1, lastPage])]
    .filter((page) => page >= 1 && page <= lastPage)
    .sort((firstPage, secondPage) => firstPage - secondPage);
}

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] =
    useState<PaginatedCollection<Customer> | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customerToView, setCustomerToView] = useState<Customer | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );

  const loadCustomers = useCallback(
    async (pageToLoad: number, searchTerm: string) => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await getCustomers({
          page: pageToLoad,
          per_page: PAGE_SIZE,
          ...(searchTerm ? { search: searchTerm } : {}),
        });

        setCustomers(response.data.data);
        setPagination(response.data);
      } catch (error) {
        const details = getApiErrorDetails(
          error,
          "Unable to load customers. Please try again.",
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
      void loadCustomers(page, appliedSearch);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [appliedSearch, loadCustomers, page]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextSearch = searchInput.trim();

    if (page === 1 && nextSearch === appliedSearch) {
      void loadCustomers(1, nextSearch);
      return;
    }

    setPage(1);
    setAppliedSearch(nextSearch);
  }

  function clearSearch() {
    setSearchInput("");

    if (page === 1 && !appliedSearch) {
      return;
    }

    setPage(1);
    setAppliedSearch("");
  }

  function handleCustomerSaved(message: string) {
    setSuccessMessage(message);
    setIsCreateOpen(false);
    setCustomerToEdit(null);
    void loadCustomers(page, appliedSearch);
  }

  async function handleCustomerDeleted(message: string) {
    const nextPage =
      customers.length === 1 && page > 1 ? page - 1 : page;

    setSuccessMessage(message);
    setCustomerToDelete(null);

    if (nextPage === page) {
      await loadCustomers(page, appliedSearch);
      return;
    }

    setPage(nextPage);
  }

  const pageNumbers = pagination
    ? getPageNumbers(pagination.current_page, pagination.last_page)
    : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Administration
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Customers
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage the customer contact information used by job orders.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus />
          Add customer
        </Button>
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
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Customer directory</CardTitle>

          <form
            className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
            onSubmit={handleSearch}
          >
            <Input
              className="sm:w-72"
              placeholder="Search customers"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              aria-label="Search customers"
            />

            <div className="flex gap-2">
              <Button type="submit" variant="outline">
                <Search />
                Search
              </Button>

              {searchInput || appliedSearch ? (
                <Button type="button" variant="ghost" onClick={clearSearch}>
                  Clear
                </Button>
              ) : null}
            </div>
          </form>
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
                onClick={() => void loadCustomers(page, appliedSearch)}
              >
                <RefreshCw />
                Try again
              </Button>
            </div>
          ) : (
            <CustomerTable
              customers={customers}
              isLoading={isLoading}
              onDelete={setCustomerToDelete}
              onEdit={setCustomerToEdit}
              onView={setCustomerToView}
            />
          )}
        </CardContent>

        {pagination && !isLoading && !loadError ? (
          <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              {pagination.total} customer{pagination.total === 1 ? "" : "s"}{" "}
              · Page {pagination.current_page} of {pagination.last_page}
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

                  {pageNumbers.map((pageNumber, index) => {
                    const previousPage = pageNumbers[index - 1];

                    return (
                      <Fragment key={pageNumber}>
                        {previousPage && pageNumber - previousPage > 1 ? (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : null}

                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            isActive={pageNumber === pagination.current_page}
                            onClick={(event) => {
                              event.preventDefault();
                              setPage(pageNumber);
                            }}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      </Fragment>
                    );
                  })}

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
            <DialogTitle>Add customer</DialogTitle>
            <DialogDescription>
              Enter the contact information for the new customer.
            </DialogDescription>
          </DialogHeader>

          <CustomerForm
            onCancel={() => setIsCreateOpen(false)}
            onSuccess={handleCustomerSaved}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(customerToEdit)}
        onOpenChange={(open) => {
          if (!open) {
            setCustomerToEdit(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit customer</DialogTitle>
            <DialogDescription>
              Update the customer contact information.
            </DialogDescription>
          </DialogHeader>

          <CustomerForm
            customer={customerToEdit ?? undefined}
            onCancel={() => setCustomerToEdit(null)}
            onSuccess={handleCustomerSaved}
          />
        </DialogContent>
      </Dialog>

      <CustomerDetailsDialog
        customer={customerToView}
        open={Boolean(customerToView)}
        onOpenChange={(open) => {
          if (!open) {
            setCustomerToView(null);
          }
        }}
      />

      <DeleteCustomerDialog
        customer={customerToDelete}
        open={Boolean(customerToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setCustomerToDelete(null);
          }
        }}
        onDeleted={handleCustomerDeleted}
      />
    </section>
  );
}
