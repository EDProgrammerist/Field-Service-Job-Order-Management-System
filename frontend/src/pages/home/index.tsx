import { AboutSection } from "@/components/public/home/about-section";
import { ContactSection } from "@/components/public/home/contact-section";
import { HeroSection } from "@/components/public/home/hero-section";
import { PublicFooter } from "@/components/public/home/public-footer";
import { PublicHeader } from "@/components/public/home/public-header";
import { ServicesSection } from "@/components/public/home/services-section";
import { WorkflowSection } from "@/components/public/home/workflow-section";

export default function HomePage() {
  return (
    <main className="min-h-svh overflow-x-hidden bg-white text-[#14221d]">
      <PublicHeader />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <WorkflowSection />
      <ContactSection />
      <PublicFooter />
    </main>
  );
}
