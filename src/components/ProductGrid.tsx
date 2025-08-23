import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ChefHat, Grid3X3, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(isMobile ? 'list' : 'grid');
  const navigate = useNavigate();

  // Atualiza automaticamente o viewMode baseado no tamanho da tela
  useEffect(() => {
    setViewMode(isMobile ? 'list' : 'grid');
  }, [isMobile]);

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
    <section id="produtos" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header with animation */}
        <div className="text-center mb-8 md:mb-16 animate-fade-in">
          
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold mb-4 md:mb-6">
            Doces <span className="gradient-primary bg-clip-text text-transparent">do dia</span>
          </h2>
          <p className="text-sm md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
            Cada doce é cuidadosamente preparado com ingredientes selecionados e muito carinho. 
            Descubra sabores únicos que vão despertar seus sentidos.
          </p>
          
          {/* View Mode Toggle */}
          <div className="flex justify-center mt-4 md:mt-8">
            <div className="flex items-center gap-1 border rounded-md p-1 bg-background/50 backdrop-blur-sm">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-2 md:px-3 order-2 md:order-1"
              >
                <Grid3X3 className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-2 md:px-3 order-1 md:order-2"
              >
                <List className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid/List with staggered animation */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8' 
            : 'flex flex-col gap-4 max-w-2xl mx-auto'
        }`}>
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className={`animate-fade-in transition-all duration-300 ${
                viewMode === 'grid' ? 'hover:scale-105' : 'hover:shadow-lg'
              }`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <ProductCard
                id={product.id}
                name={product.name}
                description={product.description || ""}
                price={`R$ ${product.price.toFixed(2)}`}
                image={product.image_url || ""}
                category={product.category}
                is_featured={product.is_featured}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};