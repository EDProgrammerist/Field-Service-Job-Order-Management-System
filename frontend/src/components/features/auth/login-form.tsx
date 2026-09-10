import { useState, type FormEvent } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Wrench,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router";

import heroBlueprint from "@/assets/field-service-technician-blueprint.png";
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

const displayFont = {
  fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
};

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
    <main className="min-h-svh bg-white text-slate-950 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
      <section className="flex min-h-svh flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-12 lg:py-9 xl:px-20">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <Link
            className="flex items-center gap-3 font-black tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
            to="/"
          >
            <span className="flex size-9 items-center justify-center bg-blue-600 text-white">
              <Wrench aria-hidden="true" className="size-5" />
            </span>
            Field Service
          </Link>

          <Link
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
            to="/"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Home
          </Link>
        </header>

        <div className="my-auto w-full max-w-[520px] py-8 sm:py-10 lg:py-6">
          <div className="flex items-center gap-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">
              Account access
            </p>
            <span aria-hidden="true" className="h-px w-16 bg-slate-400" />
          </div>

          <h1
            className="mt-6 max-w-md text-[clamp(3.4rem,7vw,5rem)] uppercase leading-[0.82] tracking-[-0.035em]"
            style={displayFont}
          >
            Return to
            <span className="block text-blue-600">the work.</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
            Sign in with your existing account. The system will open the
            dashboard assigned to your role.
          </p>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
            {formError ? (
              <div
                className="border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
                role="alert"
              >
                {formError}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label className="font-bold text-slate-800" htmlFor="email">
                Email address
              </Label>
              <Input
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                aria-invalid={Boolean(fieldErrors.email)}
                autoComplete="email"
                className="h-12 rounded-md border-slate-300 bg-white px-4 focus-visible:border-blue-600 focus-visible:ring-blue-600/25"
                disabled={isSubmitting || isLoading}
                id="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearFieldError("email");
                }}
                type="email"
                value={email}
              />
              {fieldErrors.email ? (
                <p className="text-sm font-medium text-red-700" id="email-error">
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-800" htmlFor="password">
                Password
              </Label>
              <Input
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
                aria-invalid={Boolean(fieldErrors.password)}
                autoComplete="current-password"
                className="h-12 rounded-md border-slate-300 bg-white px-4 focus-visible:border-blue-600 focus-visible:ring-blue-600/25"
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
                  className="text-sm font-medium text-red-700"
                  id="password-error"
                >
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            <Button
              className="h-12 w-full rounded-md bg-blue-600 text-base font-black text-white hover:bg-blue-700"
              disabled={isSubmitting || isLoading}
              type="submit"
            >
              {isLoading
                ? "Checking session..."
                : isSubmitting
                  ? "Signing in..."
                  : "Sign in"}
            </Button>

            <p className="border-t border-slate-200 pt-5 text-sm text-slate-600">
              Need a customer account?{" "}
              <Link
                className="font-black text-blue-700 underline decoration-2 underline-offset-4 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
                to="/customer/register"
              >
                Create one here
              </Link>
            </p>
          </form>
        </div>
      </section>

      <aside className="relative hidden min-h-svh overflow-hidden bg-[#031a2f] text-white lg:block">
        <img
          alt="Field service technician holding a tool case against a residential blueprint"
          className="absolute inset-0 size-full object-cover object-center"
          src={heroBlueprint}
        />
        <div className="absolute inset-y-0 left-0 w-2/5 bg-[#031a2f]" />
        <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
          <div className="ml-auto flex items-center gap-3 border-b border-white/30 pb-4 text-xs font-black uppercase tracking-[0.14em]">
            <CheckCircle2 aria-hidden="true" className="size-5 text-blue-300" />
            Existing account
          </div>

          <div className="max-w-xs border-l border-blue-400 pl-7">
            <ClipboardCheck
              aria-hidden="true"
              className="size-10 stroke-[1.5] text-blue-300"
            />
            <p className="mt-5 text-sm font-black uppercase tracking-[0.12em] text-blue-200">
              One account entry
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight">
              Continue with the tools assigned to your role.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Customer, technician, dispatcher, and administrator accounts each
              return to their own working area after sign-in.
            </p>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300">
            Request. Assign. Service. Complete.
          </p>
        </div>
      </aside>
    </main>
  );
}
