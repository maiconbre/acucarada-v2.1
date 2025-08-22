import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { lazy, Suspense } from "react";
import { ChefHat } from "lucide-react";

// Lazy load components for better performance
const ProductGrid = lazy(() => import("@/components/ProductGrid").then(module => ({ default: module.ProductGrid })));
const ProductGridEncomenda = lazy(() => import("@/components/ProductGridEncomenda").then(module => ({ default: module.ProductGridEncomenda })));
const Testimonials = lazy(() => import("@/components/Testimonials").then(module => ({ default: module.Testimonials })));

// Loading component for lazy-loaded sections
const SectionLoader = ({ title }: { title: string }) => (
  <div className="py-20 flex items-center justify-center">
    <div className="text-center">
      <ChefHat className="h-12 w-12 text-rose-primary mx-auto mb-4 animate-pulse" />
      <p className="text-muted-foreground">Carregando {title}...</p>
    </div>
  </div>
);

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 md:pt-20">
        <Hero />
      </div>
      
      <Suspense fallback={<SectionLoader title="produtos" />}>
        <ProductGrid />
      </Suspense>
      
      <Suspense fallback={<SectionLoader title="encomendas" />}>
        <ProductGridEncomenda />
      </Suspense>
      
      <Suspense fallback={<SectionLoader title="depoimentos" />}>
        <Testimonials />
      </Suspense>
      
      <Footer />
    </div>
  );
}
