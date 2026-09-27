export interface PublicMediaAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  loading: "eager" | "lazy";
  fetchPriority: "high" | "auto" | "low";
}

export const publicMedia = {
  homeHero: {
    src: "/assets/public-pages/home-technician-team.png",
    alt: "Three Filipino field-service technicians ready for repair work.",
    width: 1536,
    height: 1024,
    loading: "eager",
    fetchPriority: "high",
  },
  technicianChoice: {
    src: "/assets/public-pages/home-technician-choice.png",
    alt: "",
    width: 1254,
    height: 1254,
    loading: "lazy",
    fetchPriority: "low",
  },
  dispatcherScheduling: {
    src: "/assets/public-pages/home-dispatcher-scheduling.png",
    alt: "",
    width: 1254,
    height: 1254,
    loading: "lazy",
    fetchPriority: "low",
  },
  repairProgress: {
    src: "/assets/public-pages/home-repair-progress.png",
    alt: "",
    width: 1254,
    height: 1254,
    loading: "lazy",
    fetchPriority: "low",
  },
  signIn: {
    src: "/assets/public-pages/auth-technician-sign-in.png",
    alt: "",
    width: 1024,
    height: 1536,
    loading: "eager",
    fetchPriority: "auto",
  },
  registration: {
    src: "/assets/public-pages/auth-customer-registration.png",
    alt: "",
    width: 1024,
    height: 1536,
    loading: "eager",
    fetchPriority: "auto",
  },
} as const satisfies Record<string, PublicMediaAsset>;
