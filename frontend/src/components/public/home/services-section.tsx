import { services } from "@/components/public/home/homepage-content";

export function ServicesSection() {
  return (
    <section
      className="scroll-mt-[72px] bg-[#f5f9f6] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      id="services"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-extrabold text-[#0d7652]">Service tools</p>
          <h2 className="mt-4 text-[clamp(2.1rem,4.5vw,3.8rem)] font-black leading-[1.02] tracking-[-0.04em] text-[#14221d]">
            Support for every stage of a field-service job
          </h2>
          <p className="mt-5 text-base leading-7 text-[#56675f]">
            The public request and the internal work stay connected as the job
            moves through review, assignment, active service, and completion.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <article
              className="group border border-[#d8e5dc] bg-white p-6 transition-colors hover:border-[#9fc5ad] sm:min-h-[270px]"
              key={service.title}
            >
              <span className="flex size-12 items-center justify-center rounded-lg bg-[#e3f3e8] text-[#0d7652] transition-colors group-hover:bg-[#d7ecdf]">
                <service.icon aria-hidden="true" className="size-6" strokeWidth={2.1} />
              </span>
              <h3 className="mt-7 text-xl font-black leading-6 tracking-[-0.02em] text-[#1b2d25]">
                {service.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-[#5b6c64]">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
