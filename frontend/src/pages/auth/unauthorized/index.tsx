import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import type { UserRole } from "@/types/auth";

const dashboardPathByRole: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  dispatcher: "/dispatcher/dashboard",
  technician: "/technician/dashboard",
};

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleNavigateToDashboard() {
    if (user) {
      navigate(dashboardPathByRole[user.role], { replace: true });
      return;
    }

    navigate("/login", { replace: true });
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-8 sm:px-6">
      <section className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert aria-hidden="true" className="size-6" />
        </div>

        <h1 className="mt-5 text-2xl font-semibold">Access denied</h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your account does not have permission to access that page.
        </p>

        <Button
          className="mt-6 w-full"
          type="button"
          onClick={handleNavigateToDashboard}
        >
          Go to my dashboard
        </Button>
      </section>
    </main>
  );
}