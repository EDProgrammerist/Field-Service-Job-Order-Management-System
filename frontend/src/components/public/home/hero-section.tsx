import {
  ArrowRight,
  ClipboardCheck,
  SearchCheck,
  UserCheck,
  Wrench,
} from "lucide-react";
import { Link } from "react-router";

import fieldServiceHero from "@/assets/field-service-technician-hero.png";
import { Button } from "@/components/ui/button";

const requestStages = [
  { label: "Request", icon: Wrench },
  { label: "Review", icon: SearchCheck },
  { label: "Assignment", icon: UserCheck },
  { label: "Completion", icon: ClipboardCheck },
];

export function HeroSection() {
  return (
    <section className="scroll-mt-[72px] bg-[#f6faf7]" id="home">
      <div className="relative isolate mx-auto min-h-[560px] max-w-[1440px] overflow-hidden lg:min-h-[620px]">
        <img
          alt="Field service technician reviewing a tablet at an industrial facility"
          className="absolute inset-0 hidden h-full w-full object-cover object-[62%_center] lg:block"
          src={fieldServiceHero}
        />
        <div className="absolute inset-y-0 left-0 hidden w-[62%] bg-white/95 lg:block" />

        <div className="relative mx-auto grid max-w-[1240px] lg:min-h-[620px] lg:grid-cols-[0.58fr_0.42fr] lg:items-center">
          <div className="px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
            <p className="inline-flex min-h-8 items-center rounded-full bg-[#e1f2e7] px-3.5 text-xs font-extrabold text-[#075d40]">
              Field Service Management
            </p>
            <h1 className="mt-6 max-w-3xl text-[clamp(2.7rem,6vw,5.15rem)] font-black leading-[0.98] tracking-[-0.045em] text-[#14221d]">
              Keep field work clear.
              <span className="block text-[#0d7652]">Keep every job moving.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-7 text-[#405149] sm:text-lg sm:leading-8">
              Customers submit service requests, staff organize job orders, and
              technicians record progress in one connected workflow.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 bg-[#0d7652] px-6 text-base font-bold text-white hover:bg-[#095f42]"
                nativeButton={false}
                render={<Link to="/customer/register" />}
              >
                Create Customer Account
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
              <Button
                className="h-12 border-[#b8c9bf] bg-white px-6 text-base font-bold text-[#21352c] hover:bg-[#edf5f0]"
                nativeButton={false}
                render={<a href="#services" />}
                variant="outline"
              >
                View Service Options
              </Button>
            </div>
          </div>

          <div className="relative h-[360px] overflow-hidden border-t border-[#dfe8e2] lg:hidden">
            <img
              alt="Field service technician reviewing a tablet at an industrial facility"
              className="h-full w-full object-cover object-[72%_center]"
              src={fieldServiceHero}
            />
          </div>
        </div>
      </div>

      <div className="border-y border-[#dfe8e2] bg-white">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {requestStages.map((stage, index) => (
            <div
              className={`flex min-h-24 items-center gap-3 py-5 ${
                index % 2 === 0 ? "border-r border-[#dfe8e2] pr-3" : "pl-3"
              } ${index < 2 ? "border-b border-[#dfe8e2] lg:border-b-0" : ""} ${
                index > 0 ? "lg:border-l lg:border-[#dfe8e2] lg:pl-6" : "lg:pr-6"
              }`}
              key={stage.label}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e4f3e9] text-[#0d7652]">
                <stage.icon aria-hidden="true" className="size-5" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-xs font-semibold text-[#65756d]">Step {index + 1}</p>
                <p className="mt-0.5 text-sm font-black text-[#21352c]">{stage.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
