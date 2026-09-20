import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  UserRoundCheck,
} from "lucide-react";

const workflow = [
  {
    title: "Request and choose",
    description:
      "Describe the equipment issue and select a technician from their profile.",
    icon: ClipboardList,
  },
  {
    title: "Dispatcher schedules",
    description:
      "The dispatcher sets the service time and checks the selected technician's availability.",
    icon: CalendarDays,
  },
  {
    title: "Technician responds",
    description:
      "The technician accepts or rejects the scheduled visit based on availability.",
    icon: UserRoundCheck,
  },
  {
    title: "Follow the job",
    description:
      "Track status changes and keep the completed work connected to the job order.",
    icon: ClipboardCheck,
  },
];

export function WorkflowSection() {
  return (
    <section
      className="relative z-[2] scroll-mt-20 border-y border-indigo-100 bg-[#f7f8ff]/95 px-6 py-20 sm:px-8 md:px-12 md:py-28 lg:px-16"
      id="how-it-works"
    >
      <div className="mx-auto w-full max-w-[88rem]">
        <h2 className="max-w-2xl text-[clamp(2rem,3.5vw,3.25rem)] font-light leading-[1.12] tracking-[-0.04em] text-[#111827]">
          A clear path from request to repair.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#4b5563]">
          Each role has a defined part in the process, while the job order keeps
          its progress together.
        </p>

        <ol className="mt-12 grid gap-x-8 gap-y-10 border-t border-indigo-200 pt-8 md:grid-cols-2 xl:grid-cols-4">
          {workflow.map(({ title, description, icon: Icon }) => (
            <li className="max-w-sm" key={title}>
              <span className="flex size-12 items-center justify-center rounded-full border border-indigo-200 bg-white text-[#4f46e5]">
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
              </span>
              <h3 className="mt-6 text-lg font-medium tracking-tight text-[#111827]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#4b5563]">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}