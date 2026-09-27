import {
  CalendarDays,
  ClipboardList,
  History,
  UsersRound,
} from "lucide-react";

import { publicMedia } from "@/content/public-media";

const services = [
  {
    title: "Service requests",
    description:
      "Record the equipment and the problem so the repair starts with clear details.",
    icon: ClipboardList,
    media: null,
    layout: "lg:col-span-4",
    surface: "bg-gradient-to-br from-[#eeefff] via-white to-[#e8faff]",
  },
  {
    title: "Technician profiles",
    description:
      "Review technician information and choose who receives the repair request.",
    icon: UsersRound,
    media: publicMedia.technicianChoice,
    layout: "lg:col-span-2",
    surface: "bg-white",
  },
  {
    title: "Schedule coordination",
    description:
      "The dispatcher sets service dates and checks the selected technician's availability.",
    icon: CalendarDays,
    media: publicMedia.dispatcherScheduling,
    layout: "lg:col-span-2",
    surface: "bg-[#edfbff]",
  },
  {
    title: "Job order history",
    description:
      "Follow progress and keep completed work connected to its original request.",
    icon: History,
    media: publicMedia.repairProgress,
    layout: "lg:col-span-4",
    surface: "bg-[#f3f3ff]",
  },
];

export function ServicesSection() {
  return (
    <section
      className="relative z-[2] scroll-mt-20 bg-white/95 px-6 py-20 sm:px-8 md:px-12 md:py-28 lg:px-16"
      id="services"
    >
      <div className="mx-auto w-full max-w-[88rem]">
        <h2 className="max-w-2xl text-[clamp(2rem,3.5vw,3.25rem)] font-light leading-[1.12] tracking-[-0.04em] text-[#111827]">
          Built around the repair journey.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#4b5563]">
          Requests, technician choice, scheduling, and progress stay connected
          without changing who is responsible for each step.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {services.map(
            ({ title, description, icon: Icon, media, layout, surface }) => (
            <article
              className={`relative flex min-h-56 flex-col overflow-hidden rounded-2xl border border-indigo-100 p-6 sm:p-8 lg:min-h-64 ${layout} ${surface}`}
              key={title}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="relative z-[1] flex size-12 shrink-0 items-center justify-center rounded-full border border-indigo-200 bg-white/80 text-[#4f46e5]">
                  <Icon
                    aria-hidden="true"
                    className="size-5"
                    strokeWidth={1.5}
                  />
                </span>

                {media ? (
                  <img
                    alt={media.alt}
                    aria-hidden="true"
                    className="h-28 w-auto max-w-[68%] object-contain object-right drop-shadow-[0_16px_24px_rgba(67,56,202,0.12)] sm:h-32"
                    decoding="async"
                    fetchPriority={media.fetchPriority}
                    height={media.height}
                    loading={media.loading}
                    src={media.src}
                    width={media.width}
                  />
                ) : null}
              </div>

              <div className="relative z-[1] mt-auto pt-8">
                <h3 className="text-xl font-medium tracking-tight text-[#111827]">
                  {title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#4b5563]">
                  {description}
                </p>
              </div>
            </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
