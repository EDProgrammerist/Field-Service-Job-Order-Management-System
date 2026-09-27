import {
  ArrowUpRight,
  CalendarDays,
  ClipboardCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import { Link } from "react-router";

import { AuralisBackdrop } from "@/components/public/auralis/auralis-backdrop";
import { AuralisPublicHeader } from "@/components/public/auralis/auralis-public-header";
import { AboutSection } from "@/components/public/home/about-section";
import { ServicesSection } from "@/components/public/home/services-section";
import { WorkflowSection } from "@/components/public/home/workflow-section";
import { ContactSection } from "@/components/public/home/contact-section";
import { PublicFooter } from "@/components/public/home/public-footer";
import { publicMedia } from "@/content/public-media";

const features = [
  {
    title: "Choose a technician",
    description: "Review technician profiles before requesting repair.",
    icon: UsersRound,
  },
  {
    title: "Dispatcher scheduling",
    description: "The dispatcher assigns the service date.",
    icon: CalendarDays,
  },
  {
    title: "Repair progress",
    description: "Follow the status of your job order.",
    icon: ClipboardCheck,
  },
];

export default function HomePage() {
  return (
    <div className="auralis-public relative isolate min-h-[100dvh] overflow-x-clip bg-white text-[#111827] selection:bg-indigo-100 selection:text-indigo-900">
      <AuralisBackdrop />

      <div className="relative z-[1] mx-auto flex min-h-[100dvh] w-full max-w-[88rem] flex-col px-6 sm:px-8 md:px-12 lg:px-16">
        <AuralisPublicHeader />

        <main className="grid flex-1 items-center gap-8 pb-12 pt-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(24rem,1.06fr)] lg:gap-6 lg:py-10">
          <div className="max-w-2xl">
            <div
              className="auralis-enter mb-8 inline-flex w-max items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/50 px-3.5 py-1.5 text-xs font-medium text-[#4f46e5] shadow-sm backdrop-blur-md"
              style={{ animationDelay: "220ms" }}
            >
              <Wrench aria-hidden="true" className="size-4" strokeWidth={1.5} />
              Field Service Workflow
            </div>

            <h1
              className="auralis-enter text-[clamp(2rem,4vw,3.65rem)] font-light leading-[1.08] tracking-[-0.045em] text-[#111827]"
              style={{ animationDelay: "340ms" }}
            >
              Request Service.
              <br />
              Choose Your Technician.
              <br />
              <span className="bg-gradient-to-r from-[#4f46e5] to-[#06b6d4] bg-clip-text text-transparent">
                Track Every Step.
              </span>
            </h1>

            <p
              className="auralis-enter mt-7 max-w-[28rem] text-base leading-relaxed text-[#4b5563] md:text-lg"
              style={{ animationDelay: "460ms" }}
            >
              Request repairs, review technician profiles, and follow each job
              order from scheduling through completion.
            </p>

            <div
              className="auralis-enter mt-10 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "580ms" }}
            >
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#1c1c1e] px-7 py-3.5 text-sm font-medium text-white shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#29292c] hover:shadow-black/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4f46e5] motion-reduce:transform-none"
                to="/customer/register"
              >
                Create Customer Account
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 opacity-80"
                  strokeWidth={1.5}
                />
              </Link>

              <a
                className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border border-indigo-200/80 bg-white/60 px-7 py-3.5 text-sm font-medium text-[#4338ca] backdrop-blur-md transition-all duration-300 hover:border-indigo-300 hover:bg-indigo-50 hover:text-[#3730a3] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4f46e5]"
                href="#how-it-works"
              >
                Explore Workflow
              </a>
            </div>
          </div>

          <figure
            className="auralis-enter relative flex h-64 items-end justify-center overflow-visible sm:h-72 lg:h-[min(48vh,36rem)] lg:min-h-[24rem]"
            style={{ animationDelay: "640ms" }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-[12%] bottom-[6%] h-[62%] rounded-full bg-gradient-to-t from-indigo-300/40 via-cyan-200/25 to-transparent blur-3xl"
            />
            <img
              alt={publicMedia.homeHero.alt}
              className="relative h-full w-full scale-[1.05] object-contain object-bottom drop-shadow-[0_26px_34px_rgba(31,41,55,0.16)] sm:scale-100 lg:origin-right lg:scale-[1.06]"
              decoding="async"
              fetchPriority={publicMedia.homeHero.fetchPriority}
              height={publicMedia.homeHero.height}
              loading={publicMedia.homeHero.loading}
              src={publicMedia.homeHero.src}
              width={publicMedia.homeHero.width}
            />
          </figure>
        </main>

        <section
          aria-label="How Field Service works"
          className="auralis-enter flex flex-col gap-7 pb-12 pt-8 sm:flex-row sm:flex-wrap sm:gap-x-14 sm:gap-y-8"
          id="features"
          style={{ animationDelay: "700ms" }}
        >
          {features.map(({ title, description, icon: Icon }) => (
            <div className="group flex items-center gap-4" key={title}>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[#4f46e5] transition-transform duration-300 motion-safe:group-hover:scale-110">
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-sm font-medium text-[#111827]">{title}</h2>
                <p className="mt-0.5 max-w-52 text-xs text-[#4b5563]">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </section>
      </div>
      <AboutSection />
      <ServicesSection />
      <WorkflowSection />
      <ContactSection />
      <PublicFooter />
    </div>
  );
}
