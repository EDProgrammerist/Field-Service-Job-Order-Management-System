import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { AppErrorBoundary } from "@/components/common/app-error-boundary";
import { AuthProvider } from "@/contexts/auth-context";
import { AppRoutes } from "@/routes";
import "@/styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppErrorBoundary>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </AppErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);