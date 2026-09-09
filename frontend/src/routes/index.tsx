import { Navigate, Route, Routes } from "react-router";

import { DashboardLayout } from "@/components/common/dashboard-layout";
import { ProtectedRoute } from "@/components/features/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";
import AdminCustomersPage from "@/pages/admin/customers";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminTechniciansPage from "@/pages/admin/technicians";
import LoginPage from "@/pages/auth/login";
import UnauthorizedPage from "@/pages/auth/unauthorized";
import DispatcherTechniciansPage from "@/pages/dispatcher/technicians";

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
          are now shared across protected pages.
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
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminCustomersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/technicians"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminTechniciansPage />
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
        path="/dispatcher/technicians"
        element={
          <ProtectedRoute allowedRoles={["dispatcher"]}>
            <DispatcherTechniciansPage />
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