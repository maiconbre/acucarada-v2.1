import { useEffect } from "react";
import { Header } from "@/components/Header";
import { About as AboutSection } from "@/components/About";
import { Footer } from "@/components/Footer";

const AboutPage = () => {
  // Scroll automático para o topo ao carregar a página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 md:pt-20">
        <AboutSection />
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;