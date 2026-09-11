import { ClipboardCheck, RadioTower, UsersRound } from "lucide-react";

const aboutHighlights = [
  {
    title: "Connected Job Records",
    description: "Request details stay with the job order.",
    icon: ClipboardCheck,
  },
  {
    title: "Clear Responsibility",
    description: "Assignments stay visible to the service team.",
    icon: UsersRound,
  },
  {
    title: "Recorded Progress",
    description: "Status updates remain available to each role.",
    icon: RadioTower,
  },
];

export function AboutSection() {
  return (
    <section
      className="scroll-mt-16 border-y border-[#dfe8e2] bg-white"
      id="about"
    >
      <div className="mx-auto grid max-w-[1180px] md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div className="px-4 py-6 sm:px-8 lg:px-10">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#0d7652]">
            About the system
          </p>
          <p className="mt-2 max-w-sm text-sm font-bold leading-5 text-[#21352c]">
            One shared workflow for customers, dispatchers, and technicians.
          </p>
        </div>

        {aboutHighlights.map((item) => (
          <div
            className="flex items-center gap-3 border-t border-[#dfe8e2] px-4 py-5 sm:px-8 md:border-l md:[&:nth-child(2)]:border-t-0 lg:border-t-0 lg:px-6"
            key={item.title}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e4f3e9] text-[#0d7652]">
              <item.icon aria-hidden="true" className="size-5" strokeWidth={2.1} />
            </span>
            <div>
              <h2 className="text-sm font-black text-[#1b2d25]">{item.title}</h2>
              <p className="mt-1 text-xs leading-5 text-[#607068]">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
