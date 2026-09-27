import { publicMedia } from "@/content/public-media";

interface AuralisAuthVisualProps {
  variant: "sign-in" | "registration";
}

export function AuralisAuthVisual({
  variant,
}: AuralisAuthVisualProps) {
  const isRegistration = variant === "registration";
  const media = isRegistration
    ? publicMedia.registration
    : publicMedia.signIn;

  return (
    <div
      aria-hidden="true"
      className={[
        "auralis-enter relative order-first flex h-44 items-end justify-center overflow-hidden rounded-3xl border border-white/70 bg-white/25 shadow-[0_24px_70px_rgba(67,56,202,0.13)] backdrop-blur-sm sm:h-56 lg:order-last lg:h-[min(68vh,44rem)] lg:min-h-[32rem]",
        isRegistration ? "lg:sticky lg:top-24" : "lg:self-center",
      ].join(" ")}
      style={{ animationDelay: "700ms" }}
    >
      <div className="absolute inset-x-[12%] bottom-[5%] h-[72%] rounded-full bg-gradient-to-t from-indigo-200/55 via-cyan-100/35 to-transparent blur-2xl" />
      <img
        alt={media.alt}
        className={[
          "relative h-full w-full object-contain object-bottom drop-shadow-[0_24px_30px_rgba(31,41,55,0.14)]",
          isRegistration
            ? "scale-[1.03] lg:scale-100"
            : "scale-[1.08] lg:scale-100",
        ].join(" ")}
        decoding="async"
        fetchPriority={media.fetchPriority}
        height={media.height}
        loading={media.loading}
        src={media.src}
        width={media.width}
      />
    </div>
  );
}
