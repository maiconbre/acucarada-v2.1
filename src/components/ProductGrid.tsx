import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_featured: boolean;
}

export const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(6);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="produtos" className="py-20 gradient-soft">
        <div className="container mx-auto px-4">
          {/* Section Header Skeleton */}
          <div className="text-center mb-16">
            <div className="h-12 bg-muted/50 rounded-lg w-64 mx-auto mb-6 animate-pulse" />
            <div className="h-6 bg-muted/30 rounded w-96 mx-auto animate-pulse" />
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-soft animate-pulse">
                <div className="h-48 bg-muted/50 rounded-xl mb-4" />
                <div className="h-6 bg-muted/40 rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted/30 rounded w-full mb-2" />
                <div className="h-4 bg-muted/30 rounded w-2/3 mb-4" />
                <div className="h-6 bg-muted/40 rounded w-1/3" />
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <ChefHat className="h-5 w-5 animate-pulse" />
              <span>Preparando nossos deliciosos doces...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="produtos" className="py-20 gradient-soft">
      <div className="container mx-auto px-4">
        {/* Section Header with animation */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Produtos em Destaque</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Nossos <span className="gradient-primary bg-clip-text text-transparent">Doces</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Cada doce é cuidadosamente preparado com ingredientes selecionados e muito carinho. 
            Descubra sabores únicos que vão despertar seus sentidos.
          </p>
        </div>

        {/* Products Grid with staggered animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="animate-fade-in hover:scale-105 transition-all duration-300"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <ProductCard
                id={product.id}
                name={product.name}
                description={product.description || ""}
                price={`R$ ${product.price.toFixed(2)}`}
                image={product.image_url || ""}
                category={product.category}
              />
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center mt-16 space-y-8">
          <div className="animate-fade-in" style={{animationDelay: '0.8s'}}>
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/catalog")}
              className="group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ChefHat className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              Ver Catálogo Completo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 max-w-lg mx-auto animate-fade-in bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:bg-card/80 transition-colors" style={{animationDelay: '1s'}}>
            <div className="flex items-center gap-2">
              <span className="text-xl">📱</span>
              <span className="text-sm font-medium">Pedidos via WhatsApp</span>
            </div>
            <div className="w-px h-6 bg-border/50"></div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🚚</span>
              <span className="text-sm font-medium">Entrega rápida</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};