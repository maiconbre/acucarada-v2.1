import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Package, Grid3X3, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promotional_price?: number;
  is_promotion: boolean;
  image_url: string;
  category: string;
  ingredientes?: string;
  validade_armazenamento_dias?: number;
  is_featured: boolean;
}

// Simple cache for encomenda products - moved inside component to prevent issues
const encomendaCache = {
  data: null as Product[] | null,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5 minutes cache
};

export const ProductGridEncomenda = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(isMobile ? 'list' : 'grid');
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Atualiza automaticamente o viewMode baseado no tamanho da tela
  useEffect(() => {
    setViewMode(isMobile ? 'list' : 'grid');
  }, [isMobile]);

  useEffect(() => {
    fetchEncomendaProducts();
  }, []);

  const fetchEncomendaProducts = async () => {
    try {
      setError(null);
      
      // Check cache first
      const now = Date.now();
      if (encomendaCache.data && (now - encomendaCache.timestamp) < encomendaCache.ttl) {
        setProducts(encomendaCache.data);
        setLoading(false);
        return;
      }

      // Set timeout to prevent infinite loading
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        setError("Tempo limite excedido. Tente novamente.");
      }, 10000); // 10 second timeout

      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price, promotional_price, is_promotion, image_url, category, is_featured")
        .eq("is_active", true)
        .eq("is_featured", false)
        .order("is_promotion", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (error) throw error;
      
      const productsData = (data || []) as Product[];
      setProducts(productsData);
      
      // Update cache
      encomendaCache.data = productsData;
      encomendaCache.timestamp = now;
      
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Erro ao carregar produtos. Tente novamente.");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="produtos-encomenda" className="py-20 bg-background">
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
              <Package className="h-5 w-5 animate-pulse" />
              <span>Preparando nossos deliciosos doces...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section id="produtos-encomenda" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 max-w-md mx-auto">
              <Package className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">Ops! Algo deu errado</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button 
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchEncomendaProducts();
                }}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="produtos-encomenda" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header with animation */}
        <div className="text-center mb-8 md:mb-16">
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 md:mb-6">
            Doces <span className="gradient-primary bg-clip-text text-transparent">Encomendas</span>
          </h2>
          <p className="text-sm md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
            Criações exclusivas feitas sob encomenda com todo carinho e dedicação. 
            Perfeitos para ocasiões especiais e momentos únicos.
          </p>
          
          {/* View Mode Toggle */}
          <div className="flex justify-center mt-4 md:mt-8">
            <div className="flex items-center gap-1 border rounded-md p-1 bg-background/50 backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-background/70">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-2 md:px-3 order-2 md:order-1 transition-all duration-300 ease-in-out hover:scale-105"
              >
                <Grid3X3 className="h-3 w-3 md:h-4 md:w-4 transition-transform duration-300 ease-in-out" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-2 md:px-3 order-1 md:order-2 transition-all duration-300 ease-in-out hover:scale-105"
              >
                <List className="h-3 w-3 md:h-4 md:w-4 transition-transform duration-300 ease-in-out" />
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
              className={`transition-all duration-300 ${
                viewMode === 'grid' ? 'hover:scale-105' : 'hover:shadow-lg'
              }`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <ProductCard
                id={product.id}
                name={product.name}
                description={product.description || ""}
                price={product.price}
                promotional_price={product.promotional_price}
                is_promotion={product.is_promotion}
                image_url={product.image_url || ""}
                category={product.category}
                is_featured={product.is_featured}
              />
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center mt-16 space-y-8">
          <div>
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/catalog")}
              className="group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Clock className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              Ver Todos os Produtos
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 max-w-lg mx-auto bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:bg-card/80 transition-colors">
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