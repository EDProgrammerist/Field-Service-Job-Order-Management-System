import { workflowSteps } from "@/components/public/home/homepage-content";

export function WorkflowSection() {
  return (
    <section
      className="scroll-mt-[72px] bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      id="how-it-works"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="max-w-2xl">
          <p className="text-sm font-extrabold text-[#0d7652]">How it works</p>
          <h2 className="mt-4 text-[clamp(2.1rem,4.5vw,3.8rem)] font-black leading-[1.02] tracking-[-0.04em] text-[#14221d]">
            A visible path from request to completed work
          </h2>
        </div>

        <ol className="relative mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div
            aria-hidden="true"
            className="absolute left-6 right-6 top-6 hidden h-px bg-[#b8d2c1] lg:block"
          />
          {workflowSteps.map((step, index) => (
            <li
              className="relative grid grid-cols-[48px_1fr] gap-4 lg:block"
              key={step.title}
            >
              <span className="relative z-10 flex size-12 items-center justify-center rounded-full border border-[#acd0b9] bg-white text-[#0d7652]">
                <step.icon aria-hidden="true" className="size-5" strokeWidth={2.2} />
              </span>
              <div className="lg:mt-6">
                <p className="text-xs font-bold text-[#6b7a73]">Step {index + 1}</p>
                <h3 className="mt-1.5 text-lg font-black text-[#1b2d25]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#5b6c64]">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
