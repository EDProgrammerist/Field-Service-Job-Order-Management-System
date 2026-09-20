import { useEffect, type ReactNode } from "react";

import { AuralisBackdrop } from "@/components/public/auralis/auralis-backdrop";
import { AuralisPublicHeader } from "@/components/public/auralis/auralis-public-header";

interface AuralisAuthLayoutProps {
  children: ReactNode;
  variant: "sign-in" | "registration";
}


export function AuralisAuthLayout({
  children,
  variant,
}: AuralisAuthLayoutProps) {
  const isRegistration = variant === "registration";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div className="auralis-public relative isolate min-h-[100dvh] overflow-x-clip bg-white text-[#111827] selection:bg-indigo-100 selection:text-indigo-900">
      <AuralisBackdrop />

      <div className="relative z-[1] mx-auto flex min-h-[100dvh] w-full max-w-[88rem] flex-col px-6 sm:px-8 md:px-12 lg:px-16">
        <AuralisPublicHeader
          action={isRegistration ? "sign-in" : "register"}
        />

        <main
          className={
            isRegistration
              ? "flex flex-1 items-start pb-16 pt-8 md:pt-12"
              : "flex flex-1 items-center pb-16 pt-8 md:pt-12"
          }
        >
          <div
            className={
              isRegistration
                ? "w-full max-w-[680px]"
                : "w-full max-w-[520px]"
            }
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}