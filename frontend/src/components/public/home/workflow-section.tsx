import { workflowSteps } from "@/components/public/home/homepage-content";

export function WorkflowSection() {
  return (
    <section
      className="scroll-mt-16 bg-[#fbfdfb] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      id="how-it-works"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex min-h-7 items-center rounded-full bg-[#e1f2e7] px-3 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#075d40]">
            How it works
          </p>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-black leading-[1.02] tracking-[-0.04em] text-[#14221d]">
            Get from Request to Results
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-[#607068] sm:text-base">
            A straightforward process for smoother field operations.
          </p>
        </div>

        <ol className="relative mt-11 grid gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div
            aria-hidden="true"
            className="absolute left-[8%] right-[8%] top-6 hidden h-px bg-[#b9d5c3] lg:block"
          />
          {workflowSteps.map((step, index) => (
            <li className="relative text-center" key={step.title}>
              <span className="relative z-10 mx-auto flex size-12 items-center justify-center rounded-full border border-[#b2d5be] bg-[#e5f5ea] text-[#0d7652]">
                <step.icon aria-hidden="true" className="size-5" strokeWidth={2.2} />
              </span>
              <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#6b7a73]">
                Step {index + 1}
              </p>
              <h3 className="mt-1 text-base font-black text-[#1b2d25]">
                {step.title}
              </h3>
              <p className="mx-auto mt-2 max-w-[230px] text-sm leading-6 text-[#5b6c64]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
