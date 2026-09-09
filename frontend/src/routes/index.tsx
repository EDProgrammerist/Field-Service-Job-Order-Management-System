import { Navigate, Route, Routes } from "react-router";

import { DashboardLayout } from "@/components/common/dashboard-layout";
import { ProtectedRoute } from "@/components/features/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";
import AdminCustomersPage from "@/pages/admin/customers";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminCreateJobOrderPage from "@/pages/admin/job-orders/create";
import AdminJobOrderDetailsPage from "@/pages/admin/job-orders/details";
import AdminEditJobOrderPage from "@/pages/admin/job-orders/edit";
import AdminJobOrdersPage from "@/pages/admin/job-orders";
import AdminTechniciansPage from "@/pages/admin/technicians";
import LoginPage from "@/pages/auth/login";
import UnauthorizedPage from "@/pages/auth/unauthorized";
import DispatcherCreateJobOrderPage from "@/pages/dispatcher/job-orders/create";
import DispatcherJobOrderDetailsPage from "@/pages/dispatcher/job-orders/details";
import DispatcherEditJobOrderPage from "@/pages/dispatcher/job-orders/edit";
import DispatcherJobOrdersPage from "@/pages/dispatcher/job-orders";
import DispatcherTechniciansPage from "@/pages/dispatcher/technicians";
import DispatcherDashboardPage from "@/pages/dispatcher/dashboard";

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
        path="/admin/job-orders"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminJobOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/job-orders/create"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminCreateJobOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/job-orders/:jobOrderId/edit"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminEditJobOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/job-orders/:jobOrderId"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminJobOrderDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dispatcher/dashboard"
        element={
          <ProtectedRoute allowedRoles={["dispatcher"]}>
            <DispatcherDashboardPage />
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
        path="/dispatcher/job-orders"
        element={
          <ProtectedRoute allowedRoles={["dispatcher"]}>
            <DispatcherJobOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dispatcher/job-orders/create"
        element={
          <ProtectedRoute allowedRoles={["dispatcher"]}>
            <DispatcherCreateJobOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dispatcher/job-orders/:jobOrderId/edit"
        element={
          <ProtectedRoute allowedRoles={["dispatcher"]}>
            <DispatcherEditJobOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dispatcher/job-orders/:jobOrderId"
        element={
          <ProtectedRoute allowedRoles={["dispatcher"]}>
            <DispatcherJobOrderDetailsPage />
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