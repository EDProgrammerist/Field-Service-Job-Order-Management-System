import { MapPinOff } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import type { UserRole } from "@/types/auth";

const dashboardPathByRole: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  dispatcher: "/dispatcher/dashboard",
  technician: "/technician/dashboard",
  customer: "/customer/dashboard",
};

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleReturn() {
    navigate(user ? dashboardPathByRole[user.role] : "/login", {
      replace: true,
    });
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-8 sm:px-6">
      <section className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <MapPinOff aria-hidden="true" className="size-6" />
        </div>

        <p className="mt-5 text-sm font-medium text-muted-foreground">404</p>

        <h1 className="mt-1 text-2xl font-semibold">Page not found</h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The page you requested does not exist or is no longer available.
        </p>

        <Button className="mt-6 w-full" type="button" onClick={handleReturn}>
          {user ? "Go to my dashboard" : "Go to login"}
        </Button>
      </section>
    </main>
  );
}
