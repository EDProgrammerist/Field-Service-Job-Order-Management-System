import type { ReactNode } from "react";

import { PublicAuthHeader } from "@/components/public/auth/public-auth-header";
import { SignInVisual } from "@/components/public/auth/sign-in-visual";

interface SignInLayoutProps {
  children: ReactNode;
}

export function SignInLayout({ children }: SignInLayoutProps) {
  return (
    <main className="min-h-svh bg-[#f6faf7] text-[#14221d] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(460px,44%)]">
      <section className="flex min-h-svh min-w-0 flex-col bg-white px-4 sm:px-8 lg:px-12 xl:px-20">
        <PublicAuthHeader />
        <div className="flex flex-1 items-center py-10 sm:py-14 lg:py-12">
          {children}
        </div>
      </section>
      <SignInVisual />
    </main>
  );
}
