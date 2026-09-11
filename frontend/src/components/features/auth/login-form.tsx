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
    <div className="w-full max-w-[520px]">
      <p className="text-sm font-extrabold text-[#0d7652]">Account access</p>

      <h1 className="mt-4 max-w-lg text-[clamp(2.7rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.045em] text-[#14221d]">
        Sign in to your
        <span className="block text-[#0d7652]">workspace.</span>
      </h1>

      <p className="mt-5 max-w-md text-base font-medium leading-7 text-[#52635b] sm:text-lg">
        Use your existing account. We will open the dashboard connected to your
        role.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div
            className="border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
            role="alert"
          >
            {formError}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label className="font-bold text-[#21352c]" htmlFor="email">
            Email address
          </Label>
          <Input
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            autoComplete="email"
            className="h-12 rounded-md border-[#afc2b7] bg-white px-4 text-base focus-visible:border-[#0d7652] focus-visible:ring-[#0d7652]/25"
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
          <Label className="font-bold text-[#21352c]" htmlFor="password">
            Password
          </Label>
          <Input
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.password)}
            autoComplete="current-password"
            className="h-12 rounded-md border-[#afc2b7] bg-white px-4 text-base focus-visible:border-[#0d7652] focus-visible:ring-[#0d7652]/25"
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
            <p
              className="text-sm font-semibold text-red-700"
              id="password-error"
            >
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <Button
          className="h-12 w-full rounded-md bg-[#0d7652] text-base font-black text-white hover:bg-[#095f42] focus-visible:border-[#0d7652] focus-visible:ring-[#0d7652]/30"
          disabled={isSubmitting || isLoading}
          type="submit"
        >
          {isLoading
            ? "Checking session..."
            : isSubmitting
              ? "Signing in..."
              : "Sign In"}
        </Button>

        <p className="border-t border-[#dfe8e2] pt-5 text-sm font-medium text-[#52635b]">
          Need a customer account?{" "}
          <Link
            className="inline-flex min-h-11 items-center rounded-sm font-extrabold text-[#0d7652] underline decoration-2 underline-offset-4 hover:text-[#075d40] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652] focus-visible:ring-offset-4"
            to="/customer/register"
          >
            Create customer account
          </Link>
        </p>
      </form>
    </div>
  );
}
