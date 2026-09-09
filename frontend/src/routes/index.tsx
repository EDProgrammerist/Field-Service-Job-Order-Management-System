import { Navigate, Route, Routes } from "react-router";

import { DashboardLayout } from "@/components/common/dashboard-layout";
import { ProtectedRoute } from "@/components/features/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";
import LoginPage from "@/pages/auth/login";
import UnauthorizedPage from "@/pages/auth/unauthorized";

function RoleDestinationPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <p className="text-sm font-medium text-muted-foreground">
          {user?.role ?? "Authenticated"} workspace
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Dashboard shell is ready
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Navigation, responsive sidebar behavior, account controls, and logout
          are now shared across protected pages. Dashboard data will be added in
          the next step.
        </p>
      </section>
    </DashboardLayout>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <RoleDestinationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dispatcher/dashboard"
        element={
          <ProtectedRoute allowedRoles={["dispatcher"]}>
            <RoleDestinationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/technician/dashboard"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <RoleDestinationPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}