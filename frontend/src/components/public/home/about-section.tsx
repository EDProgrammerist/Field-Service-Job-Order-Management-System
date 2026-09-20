const highlights = [
  {
    title: "Customers choose",
    description:
      "Review technician profiles and request a preferred repair specialist.",
  },
  {
    title: "Dispatchers schedule",
    description:
      "Dispatchers set service dates and check availability for the selected technician.",
  },
  {
    title: "Technicians respond",
    description:
      "Technicians accept or reject the scheduled visit based on availability.",
  },
];

export function AboutSection() {
  return (
    <section
      className="relative z-[2] scroll-mt-20 border-t border-indigo-100 bg-gradient-to-b from-white/95 to-[#f6f7ff]/95 px-6 py-20 sm:px-8 md:px-12 md:py-28 lg:px-16"
      id="about"
    >
      <div className="mx-auto grid w-full max-w-[88rem] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <h2 className="max-w-2xl text-[clamp(2rem,3.5vw,3.25rem)] font-light leading-[1.12] tracking-[-0.04em] text-[#111827]">
            From first request to completed work.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#4b5563]">
            Field Service keeps technician choice, scheduling, and repair
            progress connected to each job order.
          </p>
        </div>

        <dl className="border-y border-indigo-100">
          {highlights.map((item) => (
            <div
              className="grid gap-2 border-b border-indigo-100 py-6 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:gap-5"
              key={item.title}
            >
              <dt className="font-medium text-[#4338ca]">{item.title}</dt>
              <dd className="text-sm leading-6 text-[#4b5563]">
                {item.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}