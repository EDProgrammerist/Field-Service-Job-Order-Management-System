import type { ReactNode } from "react";

import { AuralisAuthLayout } from "@/components/public/auralis/auralis-auth-layout";

interface SignInLayoutProps {
  children: ReactNode;
}

export function SignInLayout({ children }: SignInLayoutProps) {
  return (
    <AuralisAuthLayout variant="sign-in">
      {children}
    </AuralisAuthLayout>
  );
}