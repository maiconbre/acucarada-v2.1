import { Header } from "@/components/Header";

import { About as AboutSection } from "@/components/About";
import { Footer } from "@/components/Footer";
import { WaveTransition } from "@/components/WaveTransition";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 md:pt-20">
        <AboutSection />
      </div>
      <WaveTransition />
      <Footer />
    </div>
  );
};

export default AboutPage;