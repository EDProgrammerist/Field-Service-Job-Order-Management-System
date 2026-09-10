import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, ClipboardPenLine, Wrench } from "lucide-react";
import { Link, useNavigate } from "react-router";

import homeBlueprint from "@/assets/home-blueprint.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { getApiErrorDetails } from "@/lib/api-errors";

type RegistrationField =
  | "name"
  | "email"
  | "phone"
  | "address"
  | "password"
  | "password_confirmation";

type FieldErrors = Partial<Record<RegistrationField, string>>;

const displayFont = {
  fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-sm font-medium text-red-700" id={id}>
      {message}
    </p>
  );
}

export function CustomerRegistrationForm() {
  const navigate = useNavigate();
  const { registerCustomer } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearFieldError(field: RegistrationField) {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors: FieldErrors = {};

    if (!name.trim()) {
      nextFieldErrors.name = "Full name is required.";
    }

    if (!email.trim()) {
      nextFieldErrors.email = "Email address is required.";
    }

    if (!phone.trim()) {
      nextFieldErrors.phone = "Phone number is required.";
    }

    if (!password) {
      nextFieldErrors.password = "Password is required.";
    }

    if (!passwordConfirmation) {
      nextFieldErrors.password_confirmation =
        "Please confirm your password.";
    } else if (password !== passwordConfirmation) {
      nextFieldErrors.password_confirmation =
        "Password confirmation does not match.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setFormError("Check the highlighted fields and try again.");
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setFormError("");

    try {
      await registerCustomer({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim() || null,
        password,
        password_confirmation: passwordConfirmation,
        device_name: "field-service-frontend",
      });
      navigate("/customer/dashboard", { replace: true });
    } catch (requestError: unknown) {
      const errorDetails = getApiErrorDetails(
        requestError,
        "Unable to create your account. Please try again.",
      );

      setFieldErrors(errorDetails.fieldErrors as FieldErrors);
      setFormError(errorDetails.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-svh bg-white text-slate-950 lg:grid lg:grid-cols-[minmax(360px,0.78fr)_minmax(0,1.22fr)]">
      <aside className="sticky top-0 hidden h-svh self-start overflow-hidden border-r border-slate-200 bg-slate-50 lg:block">
        <img
          alt="Architectural blueprint line drawing of a residential home"
          className="absolute inset-x-0 top-0 h-[62%] w-full object-cover object-center"
          src={homeBlueprint}
        />

        <div className="absolute inset-x-0 bottom-0 min-h-[42%] bg-[#031a2f] p-10 text-white xl:p-14">
          <ClipboardPenLine
            aria-hidden="true"
            className="size-11 stroke-[1.5] text-blue-300"
          />
          <p className="mt-7 text-xs font-black uppercase tracking-[0.14em] text-blue-200">
            Customer registration
          </p>
          <h2 className="mt-4 max-w-sm text-3xl font-black leading-tight">
            Your account keeps each service request connected to you.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            After registration, you can submit repair details and return to the
            same customer workspace for status updates.
          </p>
        </div>
      </aside>

      <section className="flex min-h-svh flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-6 xl:px-16">
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

        <div className="mx-auto my-auto w-full max-w-3xl py-9 sm:py-12 lg:py-4">
          <div className="grid gap-5 border-b border-slate-200 pb-5 md:grid-cols-[1fr_0.62fr] md:items-end">
            <div>
              <div className="flex items-center gap-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">
                  New customer
                </p>
                <span aria-hidden="true" className="h-px w-16 bg-slate-400" />
              </div>
              <h1
                className="mt-5 text-[clamp(3.25rem,5vw,4.5rem)] uppercase leading-[0.82] tracking-[-0.035em]"
                style={displayFont}
              >
                Create your
                <span className="block text-blue-600">service account.</span>
              </h1>
            </div>

            <div className="border-l border-blue-500 pl-5">
              <CheckCircle2
                aria-hidden="true"
                className="size-6 text-blue-600"
              />
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Register once, then use the customer dashboard to submit and
                follow service requests.
              </p>
            </div>
          </div>

          <form className="mt-5 space-y-5" onSubmit={handleSubmit} noValidate>
            {formError ? (
              <div
                className="border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
                role="alert"
              >
                {formError}
              </div>
            ) : null}

            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label className="font-bold text-slate-800" htmlFor="name">
                  Full name
                </Label>
                <Input
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  aria-invalid={Boolean(fieldErrors.name)}
                  autoComplete="name"
                  className="h-11 rounded-md border-slate-300 bg-white px-4 focus-visible:border-blue-600 focus-visible:ring-blue-600/25"
                  disabled={isSubmitting}
                  id="name"
                  onChange={(event) => {
                    setName(event.target.value);
                    clearFieldError("name");
                  }}
                  value={name}
                />
                <FieldError id="name-error" message={fieldErrors.name} />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-800" htmlFor="email">
                  Email address
                </Label>
                <Input
                  aria-describedby={
                    fieldErrors.email ? "registration-email-error" : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.email)}
                  autoComplete="email"
                  className="h-11 rounded-md border-slate-300 bg-white px-4 focus-visible:border-blue-600 focus-visible:ring-blue-600/25"
                  disabled={isSubmitting}
                  id="email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearFieldError("email");
                  }}
                  type="email"
                  value={email}
                />
                <FieldError
                  id="registration-email-error"
                  message={fieldErrors.email}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-800" htmlFor="phone">
                  Phone number
                </Label>
                <Input
                  aria-describedby={
                    fieldErrors.phone ? "phone-error" : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.phone)}
                  autoComplete="tel"
                  className="h-11 rounded-md border-slate-300 bg-white px-4 focus-visible:border-blue-600 focus-visible:ring-blue-600/25"
                  disabled={isSubmitting}
                  id="phone"
                  onChange={(event) => {
                    setPhone(event.target.value);
                    clearFieldError("phone");
                  }}
                  type="tel"
                  value={phone}
                />
                <FieldError id="phone-error" message={fieldErrors.phone} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="font-bold text-slate-800" htmlFor="address">
                  Address <span className="font-normal text-slate-500">(optional)</span>
                </Label>
                <Textarea
                  aria-describedby={
                    fieldErrors.address ? "address-error" : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.address)}
                  autoComplete="street-address"
                  className="min-h-14 resize-y rounded-md border-slate-300 bg-white px-4 py-3 focus-visible:border-blue-600 focus-visible:ring-blue-600/25"
                  disabled={isSubmitting}
                  id="address"
                  onChange={(event) => {
                    setAddress(event.target.value);
                    clearFieldError("address");
                  }}
                  value={address}
                />
                <FieldError id="address-error" message={fieldErrors.address} />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-800" htmlFor="password">
                  Password
                </Label>
                <Input
                  aria-describedby={
                    fieldErrors.password ? "registration-password-error" : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.password)}
                  autoComplete="new-password"
                  className="h-11 rounded-md border-slate-300 bg-white px-4 focus-visible:border-blue-600 focus-visible:ring-blue-600/25"
                  disabled={isSubmitting}
                  id="password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearFieldError("password");
                  }}
                  type="password"
                  value={password}
                />
                <FieldError
                  id="registration-password-error"
                  message={fieldErrors.password}
                />
              </div>

              <div className="space-y-2">
                <Label
                  className="font-bold text-slate-800"
                  htmlFor="password-confirmation"
                >
                  Confirm password
                </Label>
                <Input
                  aria-describedby={
                    fieldErrors.password_confirmation
                      ? "password-confirmation-error"
                      : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.password_confirmation)}
                  autoComplete="new-password"
                  className="h-11 rounded-md border-slate-300 bg-white px-4 focus-visible:border-blue-600 focus-visible:ring-blue-600/25"
                  disabled={isSubmitting}
                  id="password-confirmation"
                  onChange={(event) => {
                    setPasswordConfirmation(event.target.value);
                    clearFieldError("password_confirmation");
                  }}
                  type="password"
                  value={passwordConfirmation}
                />
                <FieldError
                  id="password-confirmation-error"
                  message={fieldErrors.password_confirmation}
                />
              </div>
            </div>

            <div className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="text-sm text-slate-600">
                Already registered?{" "}
                <Link
                  className="font-black text-blue-700 underline decoration-2 underline-offset-4 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
                  to="/login"
                >
                  Sign in instead
                </Link>
              </p>

              <Button
                className="h-11 rounded-md bg-blue-600 px-7 text-base font-black text-white hover:bg-blue-700"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Creating account..." : "Create customer account"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
