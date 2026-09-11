import { CheckCircle2 } from "lucide-react";

const aboutPoints = [
  "Customers keep service requests tied to their own account.",
  "Staff manage job details, assignments, and recorded status changes.",
  "Technicians see the work assigned to them and update its progress.",
];

export function AboutSection() {
  return (
    <section
      className="scroll-mt-[72px] bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      id="about"
    >
      <div className="mx-auto grid max-w-[1160px] gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20">
        <div>
          <p className="text-sm font-extrabold text-[#0d7652]">About the system</p>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.6rem)] font-black leading-[1.04] tracking-[-0.035em] text-[#14221d]">
            One place for the service request and the work that follows.
          </h2>
        </div>

        <div className="lg:pt-8">
          <p className="max-w-2xl text-base leading-7 text-[#4c5d55] sm:text-lg sm:leading-8">
            The Field Service Job Order Management System connects the public
            request process with the staff workflow behind each job. Every role
            returns to the same job information instead of keeping separate records.
          </p>
          <ul className="mt-8 grid gap-4">
            {aboutPoints.map((point) => (
              <li
                className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#31463c] sm:text-base"
                key={point}
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-[#0d7652]"
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
