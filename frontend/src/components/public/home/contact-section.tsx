import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";

export function ContactSection() {
  return (
    <section
      className="relative z-[2] scroll-mt-20 bg-white/95 px-6 py-20 sm:px-8 md:px-12 md:py-28 lg:px-16"
      id="contact"
    >
      <div className="mx-auto grid w-full max-w-[88rem] overflow-hidden rounded-3xl border border-indigo-100 bg-white md:grid-cols-[1.25fr_0.75fr]">
        <div className="px-7 py-12 sm:px-10 md:py-16 lg:px-16">
          <h2 className="max-w-xl text-[clamp(2rem,3.5vw,3.25rem)] font-light leading-[1.12] tracking-[-0.04em] text-[#111827]">
            Ready to start your repair?
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#4b5563]">
            Create a customer account to choose a technician, submit a request,
            and follow the job as it moves forward.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#1c1c1e] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#29292c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4f46e5]"
              to="/customer/register"
            >
              Create Customer Account
              <ArrowUpRight
                aria-hidden="true"
                className="size-4"
                strokeWidth={1.5}
              />
            </Link>

            <Link
              className="inline-flex min-h-12 items-center text-sm font-medium text-[#4338ca] underline decoration-2 underline-offset-4 hover:text-[#3730a3] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4f46e5]"
              to="/login"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative min-h-48 overflow-hidden bg-gradient-to-br from-[#4f46e5] via-[#7770ee] to-[#06b6d4] md:min-h-full"
        >
          <div className="absolute inset-0 flex">
            <span className="flex-1 bg-white/55" />
            <span className="flex-1 border-l border-white/50 bg-white/40 backdrop-blur-md" />
            <span className="flex-1 border-l border-white/40 bg-white/25 backdrop-blur-sm" />
            <span className="flex-1 border-l border-white/30 bg-white/15" />
            <span className="flex-1 border-l border-white/20 bg-white/5" />
          </div>
        </div>
      </div>
    </section>
  );
}