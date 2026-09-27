import { useEffect, type ReactNode } from "react";

import { AuralisBackdrop } from "@/components/public/auralis/auralis-backdrop";
import { AuralisAuthVisual } from "@/components/public/auralis/auralis-auth-visual";
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
          className={[
            "grid flex-1 gap-8 pb-16 pt-4 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.78fr)] lg:gap-12 lg:pt-12",
            isRegistration ? "items-start" : "items-center",
          ].join(" ")}
        >
          <div
            className={[
              "order-last lg:order-first",
              isRegistration
                ? "w-full max-w-[680px]"
                : "w-full max-w-[520px]",
            ].join(" ")}
          >
            {children}
          </div>

          <AuralisAuthVisual variant={variant} />
        </main>
      </div>
    </div>
  );
}
