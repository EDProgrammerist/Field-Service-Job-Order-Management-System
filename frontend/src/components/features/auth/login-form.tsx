import { useState, type FormEvent } from "react";
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
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

const inputClassName =
  "h-12 rounded-lg border-[#b7bbd8] bg-white px-4 text-base text-[#111827] placeholder:text-[#6b7280] focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/25 dark:bg-white dark:text-[#111827]";

function isStringArrayRecord(
  value: unknown,
): value is Record<string, string[]> {
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
    <div className="w-full max-w-[520px]">
      <p
        className="auralis-enter mb-8 inline-flex rounded-full border border-indigo-200/80 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-medium text-[#4f46e5]"
        style={{ animationDelay: "220ms" }}
      >
        Account access
      </p>

      <h1
        className="auralis-enter text-[clamp(2.75rem,5vw,3.75rem)] font-light leading-[1.08] tracking-[-0.045em] text-[#111827]"
        style={{ animationDelay: "340ms" }}
      >
        Sign in to your
        <span className="block bg-gradient-to-r from-[#4f46e5] to-[#06b6d4] bg-clip-text text-transparent">
          workspace.
        </span>
      </h1>

      <p
        className="auralis-enter mt-6 max-w-md text-base leading-7 text-[#4b5563]"
        style={{ animationDelay: "460ms" }}
      >
        Use your existing account. We will open the dashboard connected to
        your role.
      </p>

      <form
        className="auralis-enter mt-8 space-y-5"
        noValidate
        onSubmit={handleSubmit}
        style={{ animationDelay: "580ms" }}
      >
        {formError ? (
          <div
            className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
            role="alert"
          >
            {formError}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label className="font-medium text-[#111827]" htmlFor="email">
            Email address
          </Label>
          <Input
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            autoComplete="email"
            className={inputClassName}
            disabled={isSubmitting || isLoading}
            id="email"
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
          {fieldErrors.email ? (
            <p className="text-sm font-semibold text-red-700" id="email-error">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label className="font-medium text-[#111827]" htmlFor="password">
            Password
          </Label>
          <Input
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.password)}
            autoComplete="current-password"
            className={inputClassName}
            disabled={isSubmitting || isLoading}
            id="password"
            onChange={(event) => {
              setPassword(event.target.value);
              clearFieldError("password");
            }}
            type="password"
            value={password}
          />
          {fieldErrors.password ? (
            <p className="text-sm font-semibold text-red-700" id="password-error">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <Button
          className="h-12 w-full rounded-full bg-[#1c1c1e] text-base font-medium text-white hover:bg-[#29292c] focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/30"
          disabled={isSubmitting || isLoading}
          type="submit"
        >
          {isLoading
            ? "Checking session..."
            : isSubmitting
              ? "Signing in..."
              : "Sign In"}
        </Button>

        <p className="border-t border-[#e5e7eb] pt-5 text-sm text-[#4b5563]">
          Need a customer account?{" "}
          <Link
            className="inline-flex min-h-11 items-center rounded-sm font-semibold text-[#4338ca] underline decoration-2 underline-offset-4 hover:text-[#3730a3] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4f46e5]"
            to="/customer/register"
          >
            Create customer account
          </Link>
        </p>
      </form>
    </div>
  );
}