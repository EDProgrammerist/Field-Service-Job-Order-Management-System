import type { ReactNode } from "react";

import { PublicAuthHeader } from "@/components/public/auth/public-auth-header";
import { RegistrationVisual } from "@/components/public/auth/registration-visual";

interface RegistrationLayoutProps {
  children: ReactNode;
}

export function RegistrationLayout({ children }: RegistrationLayoutProps) {
  return (
    <main className="min-h-svh bg-[#f6faf7] text-[#14221d] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(460px,44%)]">
      <section className="flex min-h-svh min-w-0 flex-col bg-white px-4 sm:px-8 lg:px-10 xl:px-16">
        <PublicAuthHeader />
        <div className="flex flex-1 items-center py-8 sm:py-10 lg:py-7">
          {children}
        </div>
      </section>
      <RegistrationVisual />
    </main>
  );
}
