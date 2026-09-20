import type { ReactNode } from "react";

import { AuralisAuthLayout } from "@/components/public/auralis/auralis-auth-layout";

interface RegistrationLayoutProps {
  children: ReactNode;
}

export function RegistrationLayout({ children }: RegistrationLayoutProps) {
  return (
    <AuralisAuthLayout variant="registration">
      {children}
    </AuralisAuthLayout>
  );
}