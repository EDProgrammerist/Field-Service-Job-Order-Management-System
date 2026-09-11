import { ArrowRight } from "lucide-react";

import { services } from "@/components/public/home/homepage-content";

export function ServicesSection() {
  return (
    <section
      className="scroll-mt-16 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      id="services"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="inline-flex min-h-7 items-center rounded-full bg-[#e1f2e7] px-3 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#075d40]">
            Our services
          </p>
          <h2 className="mt-4 text-[clamp(2rem,3.9vw,3rem)] font-black leading-[1.02] tracking-[-0.04em] text-[#14221d]">
            Tools for Every Step
            <span className="block">of Your Field Service Operations</span>
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-[#607068] sm:text-base">
            Keep service requests, assignments, progress, and completed records
            connected.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <article
              className="group flex min-h-[238px] flex-col rounded-lg border border-[#dce8e0] bg-[#f7fbf8] p-5 transition-colors hover:border-[#9fc5ad] hover:bg-[#f1f8f3]"
              key={service.title}
            >
              <span className="flex size-11 items-center justify-center rounded-md bg-[#dff1e5] text-[#0d7652] transition-colors group-hover:bg-[#d2eadb]">
                <service.icon aria-hidden="true" className="size-5" strokeWidth={2.2} />
              </span>
              <h3 className="mt-5 text-base font-black leading-5 tracking-[-0.02em] text-[#1b2d25]">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#5b6c64]">
                {service.description}
              </p>
              <a
                className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 text-xs font-extrabold text-[#0d6849] hover:text-[#074e38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652] focus-visible:ring-offset-2"
                href="#how-it-works"
              >
                See the job flow
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
