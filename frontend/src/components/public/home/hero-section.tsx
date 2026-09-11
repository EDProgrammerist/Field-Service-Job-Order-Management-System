import { ArrowDownLeft, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router";

import fieldServiceHero from "@/assets/field-service-technician-hero.png";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="scroll-mt-16 bg-[#f5f9f6]" id="home">
      <div className="relative isolate min-h-[520px] overflow-hidden lg:min-h-[560px]">
        <img
          alt="Field service technician reviewing a tablet at an industrial facility"
          className="absolute inset-0 hidden size-full object-cover object-[72%_center] lg:block"
          src={fieldServiceHero}
        />
        <div className="absolute inset-y-0 left-0 hidden w-[62%] bg-white/95 lg:block" />

        <div className="relative mx-auto grid max-w-[1180px] lg:min-h-[560px] lg:grid-cols-[0.64fr_0.36fr] lg:items-center">
          <div className="px-4 py-12 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
            <p className="inline-flex min-h-7 items-center rounded-full bg-[#e1f2e7] px-3 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#075d40]">
              Field Service Management
            </p>
            <h1 className="mt-5 max-w-[720px] text-[clamp(2.65rem,4.3vw,3.75rem)] font-black leading-[0.98] tracking-[-0.045em] text-[#14221d]">
              People in the Field.
              <span className="block text-[#0d7652]">Progress for Every Job.</span>
            </h1>
            <p className="mt-5 max-w-[560px] text-base font-medium leading-7 text-[#405149] sm:text-lg">
              Manage service requests, organize job orders, and keep every
              technician update connected in one place.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 rounded-md bg-[#0d7652] px-6 text-sm font-extrabold text-white hover:bg-[#095f42]"
                nativeButton={false}
                render={<Link to="/customer/register" />}
              >
                Create Service Account
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
              <Button
                className="h-12 rounded-md border-[#71847a] bg-white px-6 text-sm font-extrabold text-[#21352c] hover:bg-[#edf5f0]"
                nativeButton={false}
                render={<a href="#services" />}
                variant="outline"
              >
                <Play aria-hidden="true" className="size-4 fill-current" />
                View Service Tools
              </Button>
            </div>
          </div>

          <div className="pointer-events-none absolute right-[10%] top-10 hidden rotate-[-5deg] text-[#14221d] xl:block">
            <p className="max-w-36 text-center text-base font-bold italic leading-5">
              Better service happens out there.
            </p>
            <ArrowDownLeft
              aria-hidden="true"
              className="ml-9 mt-2 size-10 rotate-[-8deg]"
              strokeWidth={1.4}
            />
          </div>

          <div className="relative h-[330px] overflow-hidden border-t border-[#dfe8e2] lg:hidden">
            <img
              alt="Field service technician reviewing a tablet at an industrial facility"
              className="size-full object-cover object-[76%_center]"
              src={fieldServiceHero}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
