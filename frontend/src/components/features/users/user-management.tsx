import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, RefreshCw, X } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorDetails } from "@/lib/api-errors";
import { createUser, getUsers, updateUser } from "@/services/user";
import type { UserRole } from "@/types/auth";
import type { PaginatedCollection } from "@/types/pagination";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "@/types/user";

interface UserFormProps {
  user?: User;
  onCancel: () => void;
  onSuccess: (message: string) => void;
}

interface UserFormValues {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  passwordConfirmation: string;
}

function initialFormValues(user?: User): UserFormValues {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "technician",
    password: "",
    passwordConfirmation: "",
  };
}

function roleLabel(role: UserRole) {
  return `${role.charAt(0).toUpperCase()}${role.slice(1)}`;
}

function UserForm({ user, onCancel, onSuccess }: UserFormProps) {
  const isEditing = Boolean(user);

  const [values, setValues] = useState<UserFormValues>(() =>
    initialFormValues(user),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateValue(field: keyof UserFormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setFieldErrors((currentErrors) => {
      const errorField =
        field === "passwordConfirmation" ? "password_confirmation" : field;

      const remainingErrors = { ...currentErrors };
      delete remainingErrors[errorField];

      return remainingErrors;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors: Record<string, string> = {};

    if (!values.name.trim()) {
      nextFieldErrors.name = "Name is required.";
    }

    if (!values.email.trim()) {
      nextFieldErrors.email = "Email is required.";
    }

    if (!isEditing && values.password.length < 8) {
      nextFieldErrors.password = "Password must contain at least 8 characters.";
    }

    if (
      (!isEditing || values.password) &&
      values.password !== values.passwordConfirmation
    ) {
      nextFieldErrors.password_confirmation = "Passwords do not match.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const basePayload = {
        name: values.name.trim(),
        email: values.email.trim(),
        role: values.role,
      };

      const response = isEditing && user
        ? await updateUser(user.id, {
          ...basePayload,
          ...(values.password
            ? {
              password: values.password,
              password_confirmation: values.passwordConfirmation,
            }
            : {}),
        } satisfies UpdateUserPayload)
        : await createUser({
          ...basePayload,
          password: values.password,
          password_confirmation: values.passwordConfirmation,
        } satisfies CreateUserPayload);

      onSuccess(response.message);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        isEditing
          ? "Unable to update the user. Please try again."
          : "Unable to create the user. Please try again.",
      );

      setSubmitError(details.message);
      setFieldErrors(details.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {submitError ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="user-name">Name</Label>
        <Input
          id="user-name"
          value={values.name}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.name)}
          onChange={(event) => updateValue("name", event.target.value)}
        />
        {fieldErrors.name ? (
          <p className="text-xs text-destructive">{fieldErrors.name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-email">Email</Label>
        <Input
          id="user-email"
          type="email"
          value={values.email}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.email)}
          onChange={(event) => updateValue("email", event.target.value)}
        />
        {fieldErrors.email ? (
          <p className="text-xs text-destructive">{fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-role">Role</Label>
        <select
          id="user-role"
          value={values.role}
          disabled={isSubmitting || user?.role === "customer"}
          onChange={(event) =>
            updateValue("role", event.target.value as UserRole)
          }
          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
        >
          {user?.role === "customer" ? (
            <option value="customer">Customer</option>
          ) : null}

          <option value="admin">Admin</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="technician">Technician</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-password">
          Password
          {isEditing ? (
            <span className="ml-1 text-muted-foreground">
              (leave blank to keep current password)
            </span>
          ) : null}
        </Label>
        <Input
          id="user-password"
          type="password"
          value={values.password}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.password)}
          onChange={(event) => updateValue("password", event.target.value)}
        />
        {fieldErrors.password ? (
          <p className="text-xs text-destructive">{fieldErrors.password}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-password-confirmation">
          Confirm password
        </Label>
        <Input
          id="user-password-confirmation"
          type="password"
          value={values.passwordConfirmation}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.password_confirmation)}
          onChange={(event) =>
            updateValue("passwordConfirmation", event.target.value)
          }
        />
        {fieldErrors.password_confirmation ? (
          <p className="text-xs text-destructive">
            {fieldErrors.password_confirmation}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Save changes"
              : "Create user"}
        </Button>
      </div>
    </form>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] =
    useState<PaginatedCollection<User> | null>(null);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const loadUsers = useCallback(async (pageToLoad: number) => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await getUsers(pageToLoad);
      setUsers(response.data.data);
      setPagination(response.data);
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to load users. Please try again.",
      );

      setLoadError(details.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsers(page);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadUsers, page]);

  function handleUserSaved(message: string) {
    setSuccessMessage(message);
    setIsCreateOpen(false);
    setUserToEdit(null);
    void loadUsers(page);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Administration
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Users
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Create and manage application accounts and their roles.
          </p>
        </div>

        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          <Plus />
          Add user
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
        <CardHeader>
          <CardTitle className="text-lg">User directory</CardTitle>
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
                onClick={() => void loadUsers(page)}
              >
                <RefreshCw />
                Try again
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 p-4 md:hidden">
                {isLoading
                  ? Array.from({ length: 5 }, (_, index) => (
                    <div
                      key={index}
                      className="h-28 animate-pulse rounded-lg bg-muted"
                    />
                  ))
                  : users.map((user) => (
                    <article key={user.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {user.name}
                          </p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>

                        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                          {roleLabel(user.role)}
                        </span>
                      </div>

                      <Button
                        className="mt-4"
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setUserToEdit(user)}
                      >
                        <Pencil />
                        Edit
                      </Button>
                    </article>
                  ))}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }, (_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={4}>
                            <div className="h-7 animate-pulse rounded bg-muted" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          className="py-12 text-center text-muted-foreground"
                          colSpan={4}
                        >
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{roleLabel(user.role)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setUserToEdit(user)}
                            >
                              <Pencil />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>

        {pagination && !isLoading && !loadError && pagination.last_page > 1 ? (
          <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              {pagination.total} user{pagination.total === 1 ? "" : "s"} ·
              Page {pagination.current_page} of {pagination.last_page}
            </p>

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
          </div>
        ) : null}
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              Technician users need a separate Technician Profile before they
              can be assigned to job orders.
            </DialogDescription>
          </DialogHeader>

          <UserForm
            key="create-user"
            onCancel={() => setIsCreateOpen(false)}
            onSuccess={handleUserSaved}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(userToEdit)}
        onOpenChange={(open) => {
          if (!open) {
            setUserToEdit(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update account details, role, or password.
            </DialogDescription>
          </DialogHeader>

          <UserForm
            key={userToEdit?.id ?? "edit-user"}
            user={userToEdit ?? undefined}
            onCancel={() => setUserToEdit(null)}
            onSuccess={handleUserSaved}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
