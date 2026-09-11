import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import serviceRoad from "@/assets/service-road-cta.png";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  return (
    <section
      className="scroll-mt-16 bg-white px-4 pb-14 sm:px-6 sm:pb-18 lg:px-8"
      id="contact"
    >
      <div className="mx-auto grid max-w-[1180px] overflow-hidden rounded-lg border border-[#d3e3d8] bg-[#e3f2e7] md:grid-cols-[0.62fr_0.38fr]">
        <div className="flex items-center px-6 py-9 sm:px-9 lg:px-12">
          <div className="w-full md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-8">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#0d6849]">
                Ready to request field service?
              </p>
              <h2 className="mt-2 text-[clamp(1.8rem,3.5vw,2.75rem)] font-black leading-[1.03] tracking-[-0.035em] text-[#14221d]">
                Send Your Next Service Request
              </h2>
              <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-[#405149]">
                Create a customer account to submit a request and follow its
                recorded progress.
              </p>
            </div>

            <Button
              className="mt-6 h-11 rounded-md bg-[#0d7652] px-5 text-xs font-extrabold text-white hover:bg-[#095f42] md:mt-0"
              nativeButton={false}
              render={<Link to="/customer/register" />}
            >
              Create Account
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>

        <img
          alt="Winding service road through green hills"
          className="h-48 w-full object-cover object-[72%_center] md:h-full md:min-h-[220px]"
          src={serviceRoad}
        />
      </div>
    </section>
  );
}
