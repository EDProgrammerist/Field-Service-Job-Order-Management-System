import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

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

const inputClassName =
  "h-12 rounded-lg border-[#b7bbd8] bg-white px-4 text-base text-[#111827] placeholder:text-[#6b7280] focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/25 dark:bg-white dark:text-[#111827]";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-sm font-semibold text-red-700" id={id}>
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
    <div className="w-full max-w-[680px]">
      <p
        className="auralis-enter mb-8 inline-flex rounded-full border border-indigo-200/80 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-medium text-[#4f46e5]"
        style={{ animationDelay: "220ms" }}
      >
        New customer
      </p>

      <h1
        className="auralis-enter text-[clamp(2.5rem,5vw,3.9rem)] font-light leading-[1.08] tracking-[-0.045em] text-[#111827]"
        style={{ animationDelay: "340ms" }}
      >
        Create your
        <span className="block bg-gradient-to-r from-[#4f46e5] to-[#06b6d4] bg-clip-text text-transparent">
          customer account.
        </span>
      </h1>

      <p
        className="auralis-enter mt-6 max-w-md text-base leading-7 text-[#4b5563]"
        style={{ animationDelay: "460ms" }}
      >
        Add your contact details to open the customer dashboard and submit
        service requests.
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

        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="font-medium text-[#111827]" htmlFor="name">
              Full name
            </Label>
            <Input
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              aria-invalid={Boolean(fieldErrors.name)}
              autoComplete="name"
              className={inputClassName}
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
            <Label className="font-medium text-[#111827]" htmlFor="email">
              Email address
            </Label>
            <Input
              aria-describedby={
                fieldErrors.email ? "registration-email-error" : undefined
              }
              aria-invalid={Boolean(fieldErrors.email)}
              autoComplete="email"
              className={inputClassName}
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
            <Label className="font-medium text-[#111827]" htmlFor="phone">
              Phone number
            </Label>
            <Input
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
              aria-invalid={Boolean(fieldErrors.phone)}
              autoComplete="tel"
              className={inputClassName}
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

          <div className="space-y-2">
            <Label className="font-medium text-[#111827]" htmlFor="address">
              Address
              <span className="font-normal text-[#4b5563]">(optional)</span>
            </Label>
            <Textarea
              aria-describedby={
                fieldErrors.address ? "address-error" : undefined
              }
              aria-invalid={Boolean(fieldErrors.address)}
              autoComplete="street-address"
              className="min-h-12 resize-y rounded-lg border-[#b7bbd8] bg-white px-4 py-3 text-base text-[#111827] focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/25 dark:bg-white dark:text-[#111827]"
              disabled={isSubmitting}
              id="address"
              onChange={(event) => {
                setAddress(event.target.value);
                clearFieldError("address");
              }}
              rows={1}
              value={address}
            />
            <FieldError id="address-error" message={fieldErrors.address} />
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-[#111827]" htmlFor="password">
              Password
            </Label>
            <Input
              aria-describedby={
                fieldErrors.password ? "registration-password-error" : undefined
              }
              aria-invalid={Boolean(fieldErrors.password)}
              autoComplete="new-password"
              className={inputClassName}
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
              className="font-medium text-[#111827]"
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
              className={inputClassName}
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

        <div className="grid gap-4 border-t border-[#e5e7eb] pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="text-sm text-[#4b5563]">
            Already registered?{" "}
            <Link
              className="inline-flex min-h-11 items-center rounded-sm font-semibold text-[#4338ca] underline decoration-2 underline-offset-4 hover:text-[#3730a3] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4f46e5]"
              to="/login"
            >
              Sign in instead
            </Link>
          </p>

          <Button
            className="h-12 w-full rounded-full bg-[#1c1c1e] px-7 text-base font-medium text-white hover:bg-[#29292c] focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/30 sm:w-auto"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating account..." : "Create Customer Account"}
          </Button>
        </div>
      </form>
    </div>
  );
}