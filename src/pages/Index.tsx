import { useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import HeroSlider from "@/components/sections/HeroSlider";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ConsultingSection from "@/components/sections/ConsultingSection";
import StatsSection from "@/components/sections/StatsSection";
import AboutSection from "@/components/sections/AboutSection";
import TeamSection from "@/components/sections/TeamSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import CTASection from "@/components/sections/CTASection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/layout/Footer";

const Index = () => {
  // Scroll to top on component mount (page load/refresh)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-background" style={{ scrollBehavior: 'smooth' }}>
      <TopBar />
      <Header />
      <main>
        <HeroSlider />
        <HeroSection />
        <ServicesSection />
        <ConsultingSection />
        <StatsSection />
        <AboutSection />
        <TeamSection />
        <ExperienceSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
