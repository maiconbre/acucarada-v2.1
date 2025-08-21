import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { lazy, Suspense } from "react";
import { ChefHat } from "lucide-react";

// Lazy load components for better performance
const ProductGrid = lazy(() => import("@/components/ProductGrid").then(module => ({ default: module.ProductGrid })));
const About = lazy(() => import("@/components/About").then(module => ({ default: module.About })));
const Testimonials = lazy(() => import("@/components/Testimonials").then(module => ({ default: module.Testimonials })));
const Contact = lazy(() => import("@/components/Contact").then(module => ({ default: module.Contact })));

// Loading component for lazy-loaded sections
const SectionLoader = ({ title }: { title: string }) => (
  <div className="py-20 flex items-center justify-center">
    <div className="text-center">
      <ChefHat className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
      <p className="text-muted-foreground">Carregando {title}...</p>
    </div>
  </div>
);

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      <Suspense fallback={<SectionLoader title="produtos" />}>
        <ProductGrid />
      </Suspense>
      
      <Suspense fallback={<SectionLoader title="sobre nós" />}>
        <About />
      </Suspense>
      
      <Suspense fallback={<SectionLoader title="depoimentos" />}>
        <Testimonials />
      </Suspense>
      
      <Suspense fallback={<SectionLoader title="contato" />}>
        <Contact />
      </Suspense>
      
      <Footer />
    </div>
  );
}
