import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Headphones,
  Menu,
  Wrench,
  X,
} from "lucide-react";
import { Link } from "react-router";

import heroBlueprint from "@/assets/field-service-technician-blueprint.png";
import homeBlueprint from "@/assets/home-blueprint.png";
import { Button } from "@/components/ui/button";

const displayFont = {
  fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
};

const navigationItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

const serviceStages = [
  { label: "Request", detail: "Submitted" },
  { label: "Review", detail: "Checked" },
  { label: "Service", detail: "In progress" },
  { label: "Complete", detail: "Recorded" },
];

const services = [
  {
    title: "Repair and maintenance requests",
    description:
      "Create a service request with the details the team needs to review and organize the work.",
    icon: Wrench,
  },
  {
    title: "Visible job progress",
    description:
      "Follow the request from review and assignment through active work and completion.",
    icon: ClipboardCheck,
  },
  {
    title: "Service coordination",
    description:
      "Keep request information and status updates together instead of chasing separate messages.",
    icon: Headphones,
  },
];

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <main className="min-h-svh overflow-x-hidden bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:h-[76px] lg:px-10"
        >
          <a
            className="flex items-center gap-3 text-lg font-black tracking-tight text-slate-950 sm:text-xl"
            href="#home"
            onClick={closeMenu}
          >
            <span className="flex size-9 items-center justify-center bg-blue-600 text-white">
              <Wrench aria-hidden="true" className="size-5" />
            </span>
            Field Service
          </a>

          <div className="hidden items-center gap-8 lg:flex">
            {navigationItems.map((item) => (
              <a
                className="text-sm font-semibold text-slate-700 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              className="h-11 border-slate-300 px-5 font-bold"
              nativeButton={false}
              variant="outline"
              render={<Link to="/login" />}
            >
              Sign In
            </Button>
            <Button
              className="h-11 bg-blue-600 px-5 font-bold text-white hover:bg-blue-700"
              nativeButton={false}
              render={<Link to="/customer/register" />}
            >
              Create Account
            </Button>
          </div>

          <Button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="size-11 lg:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            size="icon"
            type="button"
            variant="outline"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </nav>

        {isMenuOpen ? (
          <div
            className="border-t border-slate-200 bg-white px-4 py-5 lg:hidden"
            id="mobile-navigation"
          >
            <div className="mx-auto flex max-w-[1440px] flex-col gap-1">
              {navigationItems.map((item) => (
                <a
                  className="min-h-11 px-3 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  href={item.href}
                  key={item.href}
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 min-[380px]:grid-cols-2">
                <Button
                  className="h-11 font-bold"
                  nativeButton={false}
                  variant="outline"
                  render={<Link to="/login" onClick={closeMenu} />}
                >
                  Sign In
                </Button>
                <Button
                  className="h-11 bg-blue-600 font-bold text-white hover:bg-blue-700"
                  nativeButton={false}
                  render={
                    <Link to="/customer/register" onClick={closeMenu} />
                  }
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <section
        className="relative isolate overflow-hidden bg-[#031a2f] text-white"
        id="home"
      >
        <img
          alt="Field service technician holding a tool case against a residential blueprint"
          className="absolute inset-y-0 right-0 hidden h-full w-full object-contain object-right md:block"
          src={heroBlueprint}
        />
        <div className="absolute inset-y-0 left-0 hidden w-[58%] bg-[#031a2f] md:block" />

        <div className="relative mx-auto flex min-h-[620px] max-w-[1440px] items-center px-4 py-16 sm:px-6 md:min-h-[700px] lg:px-10">
          <div className="max-w-3xl md:max-w-[56%]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">
              Field service job orders
            </p>
            <h1
              className="mt-7 text-[clamp(4rem,8.5vw,7.8rem)] uppercase leading-[0.84] tracking-[-0.04em]"
              style={displayFont}
            >
              Field work,
              <span className="mt-2 block text-blue-500">under control.</span>
            </h1>
            <p className="mt-8 max-w-xl text-base font-medium leading-7 text-slate-200 sm:text-lg">
              Submit a service request, follow each status change, and keep the
              job details together from review to completion.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 bg-blue-600 px-7 text-base font-black text-white hover:bg-blue-500"
                nativeButton={false}
                render={<Link to="/customer/register" />}
              >
                Create Customer Account
                <ArrowRight aria-hidden="true" className="size-5" />
              </Button>
              <Button
                className="h-12 border-white/70 bg-[#031a2f] px-7 text-base font-black text-white hover:bg-white hover:text-slate-950"
                nativeButton={false}
                variant="outline"
                render={<a href="#services" />}
              >
                View Services
              </Button>
            </div>
          </div>
        </div>

        <img
          alt="Field service technician holding a tool case against a residential blueprint"
          className="h-[92vw] min-h-[360px] max-h-[540px] w-full object-cover object-[68%_center] md:hidden"
          src={heroBlueprint}
        />
      </section>

      <section
        aria-label="Service request lifecycle"
        className="border-b border-slate-300 bg-white"
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 sm:grid-cols-4">
          {serviceStages.map((stage, index) => (
            <div
              className={`flex min-h-28 items-center gap-4 px-4 py-6 sm:px-6 lg:px-10 ${
                index % 2 === 0 ? "border-r border-slate-300" : ""
              } ${index < 2 ? "border-b border-slate-300 sm:border-b-0" : ""} ${
                index > 0 ? "sm:border-l sm:border-slate-300" : ""
              }`}
              key={stage.label}
            >
              {index === serviceStages.length - 1 ? (
                <CheckCircle2
                  aria-hidden="true"
                  className="size-6 shrink-0 text-blue-600"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center border border-slate-400 text-xs font-black text-slate-700"
                >
                  {index + 1}
                </span>
              )}
              <div>
                <p className="font-black text-slate-950">{stage.label}</p>
                <p className="mt-1 text-sm text-slate-600">{stage.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden bg-white" id="about">
        <div className="mx-auto grid max-w-[1440px] lg:min-h-[570px] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
              What the system does
            </p>
            <h2
              className="mt-7 max-w-2xl text-[clamp(3.4rem,5.5vw,6.2rem)] uppercase leading-[0.86] tracking-[-0.035em] text-slate-950"
              style={displayFont}
            >
              One request.
              <span className="block">One visible history.</span>
            </h2>
            <p className="mt-8 max-w-xl text-base font-medium leading-8 text-slate-700 sm:text-lg">
              Customers can send the work details once and return to the same
              record for assignment, progress, and completion updates.
            </p>
            <div className="mt-10 flex max-w-lg items-start gap-4 border-t border-slate-300 pt-6">
              <ClipboardCheck
                aria-hidden="true"
                className="mt-1 size-6 shrink-0 text-blue-700"
              />
              <p className="text-sm font-semibold leading-6 text-slate-700">
                The job order remains the source of truth from the first request
                through the final recorded status.
              </p>
            </div>
          </div>

          <figure className="relative min-h-[360px] overflow-hidden border-t border-slate-300 lg:min-h-full lg:border-l lg:border-t-0">
            <img
              alt="Architectural blueprint line drawing of a residential home"
              className="absolute inset-0 h-full w-full origin-right object-cover object-right lg:scale-[1.45]"
              src={homeBlueprint}
            />
            <figcaption className="absolute bottom-0 left-0 bg-white px-5 py-4 text-xs font-bold text-slate-700 sm:px-6">
              Planned work begins with a clear request.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="bg-[#031a2f] text-white" id="services">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.78fr_1.22fr]">
          <div className="border-b border-blue-200/30 px-4 py-16 sm:px-6 lg:border-b-0 lg:border-r lg:px-10 lg:py-24">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">
              Services and support
            </p>
            <h2
              className="mt-7 text-[clamp(3.6rem,6vw,6.8rem)] uppercase leading-[0.84] tracking-[-0.035em]"
              style={displayFont}
            >
              The work,
              <span className="block text-blue-500">kept together.</span>
            </h2>
            <p className="mt-8 max-w-md text-base leading-7 text-slate-300">
              The public entry point focuses on what customers need: submit the
              issue, see where it stands, and return when an update is needed.
            </p>
          </div>

          <div>
            <article className="border-b border-blue-200/30 px-4 py-14 sm:px-8 lg:px-12 lg:py-16">
              <div className="grid gap-8 sm:grid-cols-[80px_1fr]">
                <Wrench
                  aria-hidden="true"
                  className="size-14 stroke-[1.5] text-blue-300"
                />
                <div>
                  <p className="text-sm font-bold text-blue-200">Primary service</p>
                  <h3 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                    {services[0].title}
                  </h3>
                  <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                    {services[0].description}
                  </p>
                  <Link
                    className="mt-8 inline-flex min-h-11 items-center font-black text-white underline decoration-blue-500 decoration-2 underline-offset-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#031a2f]"
                    to="/customer/register"
                  >
                    Create a service request account
                  </Link>
                </div>
              </div>
            </article>

            <div className="grid sm:grid-cols-2">
              {services.slice(1).map((service, index) => (
                <article
                  className={`px-4 py-12 sm:px-8 lg:px-12 ${
                    index === 0
                      ? "border-b border-blue-200/30 sm:border-b-0 sm:border-r"
                      : ""
                  }`}
                  key={service.title}
                >
                  <service.icon
                    aria-hidden="true"
                    className="size-10 stroke-[1.5] text-blue-300"
                  />
                  <h3 className="mt-8 text-2xl font-black tracking-tight">
                    {service.title}
                  </h3>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
                    {service.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white" id="contact">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-b border-slate-300 px-4 py-16 sm:px-6 lg:border-b-0 lg:border-r lg:px-10 lg:py-20">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
              Contact and access
            </p>
            <h2
              className="mt-7 text-[clamp(3.4rem,5vw,5.8rem)] uppercase leading-[0.86] tracking-[-0.035em] text-slate-950"
              style={displayFont}
            >
              Start in the
              <span className="block">right place.</span>
            </h2>
            <p className="mt-7 max-w-md text-base leading-7 text-slate-700">
              New customers create an account first. Returning customers sign in
              to review or submit service requests.
            </p>
          </div>

          <div className="grid sm:grid-cols-2">
            <div className="border-b border-slate-300 p-7 sm:border-b-0 sm:border-r sm:p-10 lg:p-12">
              <p className="text-sm font-bold text-blue-700">New customer</p>
              <h3 className="mt-4 text-2xl font-black text-slate-950">
                Create your customer account
              </h3>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Register before submitting and tracking a service request.
              </p>
              <Button
                className="mt-8 h-11 bg-blue-600 px-5 font-black text-white hover:bg-blue-700"
                nativeButton={false}
                render={<Link to="/customer/register" />}
              >
                Create Account
              </Button>
            </div>

            <div className="p-7 sm:p-10 lg:p-12">
              <p className="text-sm font-bold text-slate-600">Returning customer</p>
              <h3 className="mt-4 text-2xl font-black text-slate-950">
                Open your service workspace
              </h3>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Sign in to see the requests and updates connected to your account.
              </p>
              <Button
                className="mt-8 h-11 border-slate-400 px-5 font-black"
                nativeButton={false}
                variant="outline"
                render={<Link to="/login" />}
              >
                Sign In
              </Button>
            </div>

            <div className="border-t border-slate-300 bg-slate-100 p-7 sm:col-span-2 sm:p-10 lg:px-12 lg:py-8">
              <p className="text-sm font-black text-slate-950">
                Public phone and email details are pending confirmation.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                They should be added here only after the service team provides the
                official contact information.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/15 bg-[#031a2f] text-white">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-9 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-10">
          <div>
            <div className="flex items-center gap-3 text-lg font-black">
              <Wrench aria-hidden="true" className="size-5" />
              Field Service
            </div>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
              Public access to customer service requests and job-order updates.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold"
          >
            <a
              className="hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              href="#about"
            >
              About
            </a>
            <a
              className="hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              href="#services"
            >
              Services
            </a>
            <Link
              className="hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              to="/login"
            >
              Sign In
            </Link>
            <Link
              className="hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              to="/customer/register"
            >
              Create Account
            </Link>
          </nav>

          <p className="border-t border-white/15 pt-6 text-sm text-slate-400 md:col-span-2">
            © 2026 Field Service. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
