import { ArrowRight, LogIn } from "lucide-react";
import { Link } from "react-router";

import fieldServiceHero from "@/assets/field-service-technician-hero.png";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  return (
    <section
      className="scroll-mt-[72px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24"
      id="contact"
    >
      <div className="relative isolate mx-auto max-w-[1240px] overflow-hidden bg-[#dceee2]">
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-y-0 right-0 hidden h-full w-[44%] object-cover object-[70%_center] opacity-90 lg:block"
          src={fieldServiceHero}
        />
        <div className="relative max-w-3xl px-6 py-10 sm:px-10 sm:py-12 lg:w-[66%] lg:px-14 lg:py-14">
          <p className="text-sm font-extrabold text-[#0d6849]">Customer access</p>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-black leading-[1.02] tracking-[-0.035em] text-[#14221d]">
            Ready to submit or check a service request?
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#405149]">
            Create a customer account for a new request, or sign in to return to
            the requests already connected to your account.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-12 bg-[#0d7652] px-6 font-bold text-white hover:bg-[#095f42]"
              nativeButton={false}
              render={<Link to="/customer/register" />}
            >
              Create Customer Account
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
            <Button
              className="h-12 border-[#a8c2b0] bg-white px-6 font-bold text-[#21352c] hover:bg-[#f2f7f4]"
              nativeButton={false}
              render={<Link to="/login" />}
              variant="outline"
            >
              <LogIn aria-hidden="true" className="size-4" />
              Sign In
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-[1240px] border border-[#dfe8e2] bg-white px-5 py-4 text-sm leading-6 text-[#52635b] sm:px-7">
        Official public phone and email details have not been provided. Add them
        here once the service team confirms the correct contact information.
      </div>
    </section>
  );
}
