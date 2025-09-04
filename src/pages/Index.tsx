import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductGridEncomenda } from "@/components/ProductGridEncomenda";
import { Testimonials } from "@/components/Testimonials";
import ErrorBoundary from "@/components/ErrorBoundary";



export default function Index() {
  // Scroll automático para o topo ao carregar a página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 md:pt-20">
        <Hero />
      </div>
      
      <ErrorBoundary>
        <ProductGrid />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <ProductGridEncomenda />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Testimonials />
      </ErrorBoundary>
      
      
      <Footer />
    </div>
  );
}
