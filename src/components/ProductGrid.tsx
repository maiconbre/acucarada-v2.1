import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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

const ProductGrid = () => {
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando nossos deliciosos doces...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="produtos" className="py-20 gradient-soft">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Nossos <span className="gradient-primary bg-clip-text text-transparent">Doces</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Cada doce é cuidadosamente preparado com ingredientes selecionados e muito carinho. 
            Descubra sabores únicos que vão despertar seus sentidos.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              description={product.description || ""}
              price={`R$ ${product.price.toFixed(2).replace(".", ",")}`}
              image={product.image_url || ""}
              category={product.category}
            />
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-16">
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => navigate("/catalog")}
            className="mb-8"
          >
            Ver Catálogo Completo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <div className="inline-flex items-center gap-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-soft">
            <span className="text-sm font-medium">📱 Pedidos personalizados via WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;