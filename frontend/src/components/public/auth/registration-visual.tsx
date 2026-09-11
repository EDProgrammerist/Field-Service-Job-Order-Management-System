import { ClipboardPenLine } from "lucide-react";

import fieldServiceHero from "@/assets/field-service-technician-hero.png";

export function RegistrationVisual() {
  return (
    <aside className="relative min-h-[300px] overflow-hidden border-t border-[#dfe8e2] bg-[#eaf2ed] lg:sticky lg:top-0 lg:h-svh lg:min-h-[620px] lg:border-l lg:border-t-0">
      <img
        alt="Field service technician reviewing a tablet at an industrial facility"
        className="absolute inset-0 size-full object-cover object-[76%_center] lg:object-right"
        src={fieldServiceHero}
      />

      <div className="absolute inset-x-4 bottom-4 border border-[#c7d6cd] bg-white p-5 sm:inset-x-8 sm:bottom-8 sm:p-6 lg:inset-x-10 lg:bottom-10 xl:inset-x-14 xl:p-8">
        <span className="flex size-11 items-center justify-center rounded-md bg-[#e1f2e7] text-[#0d7652]">
          <ClipboardPenLine
            aria-hidden="true"
            className="size-6"
            strokeWidth={2.1}
          />
        </span>
        <p className="mt-5 text-sm font-extrabold text-[#0d7652]">
          Customer registration
        </p>
        <h2 className="mt-2 max-w-md text-2xl font-black leading-tight tracking-[-0.025em] text-[#14221d] sm:text-3xl">
          Keep each service request connected to your account.
        </h2>
        <p className="mt-3 max-w-md text-sm font-medium leading-6 text-[#52635b] sm:text-base">
          After registration, the customer dashboard is ready for new requests
          and status updates.
        </p>
      </div>
    </aside>
  );
}
