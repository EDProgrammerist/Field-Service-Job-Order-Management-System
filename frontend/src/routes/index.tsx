import { Route, Routes } from "react-router";

import { ProtectedRoute } from "@/components/features/auth/protected-route";
import AdminCustomersPage from "@/pages/admin/customers";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminCreateJobOrderPage from "@/pages/admin/job-orders/create";
import AdminJobOrderDetailsPage from "@/pages/admin/job-orders/details";
import AdminEditJobOrderPage from "@/pages/admin/job-orders/edit";
import AdminJobOrdersPage from "@/pages/admin/job-orders";
import AdminTechniciansPage from "@/pages/admin/technicians";
import AdminUsersPage from "@/pages/admin/users";
import LoginPage from "@/pages/auth/login";
import CustomerDashboardPage from "@/pages/customer/dashboard";
import CustomerRegisterPage from "@/pages/customer/register";
import CustomerNewServiceRequestPage from "@/pages/customer/service-requests/new";
import UnauthorizedPage from "@/pages/auth/unauthorized";
import DispatcherDashboardPage from "@/pages/dispatcher/dashboard";
import DispatcherCreateJobOrderPage from "@/pages/dispatcher/job-orders/create";
import DispatcherJobOrderDetailsPage from "@/pages/dispatcher/job-orders/details";
import DispatcherEditJobOrderPage from "@/pages/dispatcher/job-orders/edit";
import DispatcherJobOrdersPage from "@/pages/dispatcher/job-orders";
import DispatcherTechniciansPage from "@/pages/dispatcher/technicians";
import NotFoundPage from "@/pages/not-found";
import TechnicianDashboardPage from "@/pages/technician/dashboard";
import TechnicianJobOrderDetailsPage from "@/pages/technician/my-jobs/details";
import TechnicianMyJobsPage from "@/pages/technician/my-jobs";
import CustomerServiceRequestsPage from "@/pages/customer/service-requests";
import CustomerServiceRequestDetailsPage from "@/pages/customer/service-requests/details";
import HomePage from "@/pages/home";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/customer/register" element={<CustomerRegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/service-requests/new"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerNewServiceRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/service-requests"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerServiceRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/service-requests/:jobOrderId"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerServiceRequestDetailsPage />
          </ProtectedRoute>
        }
      />

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
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsersPage />
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
            <TechnicianDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/my-jobs"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <TechnicianMyJobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/my-jobs/:jobOrderId"
        element={
          <ProtectedRoute allowedRoles={["technician"]}>
            <TechnicianJobOrderDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}