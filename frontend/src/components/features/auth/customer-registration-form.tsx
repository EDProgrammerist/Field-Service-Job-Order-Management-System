import { useState, type FormEvent } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";

export function CustomerRegistrationForm() {
  const navigate = useNavigate();
  const { registerCustomer } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError("Name, email, phone number, and password are required.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);

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
    } catch (requestError) {
      if (axios.isAxiosError<{ message?: string }>(requestError)) {
        setError(requestError.response?.data.message ?? "Unable to register your account. Please try again.");
      } else {
        setError("Unable to register your account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-8 sm:px-6">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create customer account</CardTitle>
          <CardDescription className="mt-2">Register to submit and track your service requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p> : null}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="name">Full name</Label><Input id="name" value={name} onChange={(event) => setName(event.target.value)} disabled={isSubmitting} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isSubmitting} /></div>
              <div className="space-y-2"><Label htmlFor="phone">Phone number</Label><Input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={isSubmitting} /></div>
              <div className="space-y-2"><Label htmlFor="address">Address (optional)</Label><Textarea id="address" value={address} onChange={(event) => setAddress(event.target.value)} disabled={isSubmitting} /></div>
              <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isSubmitting} /></div>
              <div className="space-y-2"><Label htmlFor="password-confirmation">Confirm password</Label><Input id="password-confirmation" type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} disabled={isSubmitting} /></div>
            </div>
            <Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create customer account"}</Button>
            <p className="text-center text-sm text-muted-foreground">Already registered? <Link className="font-medium text-primary underline-offset-4 hover:underline" to="/login">Sign in</Link></p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
