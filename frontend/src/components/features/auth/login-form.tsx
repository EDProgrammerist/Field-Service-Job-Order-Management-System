import { useState, type FormEvent } from "react";
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import type { UserRole } from "@/types/auth";

interface LaravelErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

type FieldErrors = Partial<Record<"email" | "password", string>>;

const dashboardPathByRole: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  dispatcher: "/dispatcher/dashboard",
  technician: "/technician/dashboard",
  customer: "/customer/dashboard",
};

function isStringArrayRecord(value: unknown): value is Record<string, string[]> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return Object.values(value).every(
    (messages) =>
      Array.isArray(messages) &&
      messages.every((message) => typeof message === "string"),
  );
}

function isLaravelErrorResponse(value: unknown): value is LaravelErrorResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const response = value as { message?: unknown; errors?: unknown };

  return (
    (response.message === undefined || typeof response.message === "string") &&
    (response.errors === undefined || isStringArrayRecord(response.errors))
  );
}

export function LoginForm() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated && user) {
    return <Navigate to={dashboardPathByRole[user.role]} replace />;
  }

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors: FieldErrors = {};

    if (!email.trim()) {
      nextFieldErrors.email = "Email is required.";
    }

    if (!password) {
      nextFieldErrors.password = "Password is required.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setFormError("");
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setFormError("");

    try {
      const authenticatedUser = await login({
        email: email.trim(),
        password,
        device_name: "field-service-frontend",
      });

      navigate(dashboardPathByRole[authenticatedUser.role], {
        replace: true,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError<unknown>(error)) {
        const responseData = error.response?.data;

        if (isLaravelErrorResponse(responseData)) {
          setFieldErrors({
            email: responseData.errors?.email?.[0],
            password: responseData.errors?.password?.[0],
          });
          setFormError(
            responseData.message ?? "Unable to sign in. Please try again.",
          );
        } else {
          setFormError("Unable to sign in. Please try again.");
        }
      } else {
        setFormError("Unable to sign in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-svh bg-muted/40 lg:grid-cols-2">
      <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500 p-2">
            <ShieldCheck aria-hidden="true" className="size-6" />
          </div>
          <span className="text-lg font-semibold">Field Service</span>
        </div>

        <div className="max-w-md">
          <p className="text-sm font-medium text-blue-300">
            Job Order Management
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Keep service work organized from request to completion.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Securely access the tools and job information available for your
            assigned role.
          </p>
        </div>

        <p className="text-sm text-slate-400">
          Field Service Job Order Management System
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="rounded-lg bg-blue-600 p-2 text-white">
                <ShieldCheck aria-hidden="true" className="size-5" />
              </div>
              <span className="font-semibold">Field Service</span>
            </div>

            <div>
              <CardTitle className="text-2xl">Sign in to your account</CardTitle>
              <CardDescription className="mt-2">
                Enter your existing Field Service account credentials.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {formError ? (
                <div
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {formError}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearFieldError("email");
                  }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "email-error" : undefined
                  }
                  disabled={isSubmitting || isLoading}
                />
                {fieldErrors.email ? (
                  <p id="email-error" className="text-sm text-destructive">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearFieldError("password");
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? "password-error" : undefined
                  }
                  disabled={isSubmitting || isLoading}
                />
                {fieldErrors.password ? (
                  <p id="password-error" className="text-sm text-destructive">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <Button
                className="w-full"
                type="submit"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Need a customer account?{" "}
                <Link
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  to="/customer/register"
                >
                  Register here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
