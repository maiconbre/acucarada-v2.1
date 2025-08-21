import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import AnalyticsPanel from "@/components/admin/AnalyticsPanel";
import { LogOut, Package, BarChart, Tag, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
}

const Admin = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar produtos",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const activeProducts = products.filter(p => p.is_active).length;
  const featuredProducts = products.filter(p => p.is_featured).length;

  return (
    <div className="min-h-screen gradient-soft">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-display font-bold gradient-primary bg-clip-text text-transparent">
                Açucarada Admin
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Bem-vindo, {user.email}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/")} 
                className="flex-1 sm:flex-none transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                <span className="hidden sm:inline">Ver Site</span>
                <span className="sm:hidden">Site</span>
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleSignOut} 
                className="flex-1 sm:flex-none transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-200">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeProducts} ativos
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos em Destaque</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-200">{featuredProducts}</div>
              <p className="text-xs text-muted-foreground">
                Exibidos na página inicial
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-200">
                {[...new Set(products.map(p => p.category))].length}
              </div>
              <p className="text-xs text-muted-foreground">
                Diferentes categorias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 h-auto p-1">
            <TabsTrigger value="products" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm transition-all duration-200 hover:scale-105">
              <Package className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" />
              <span className="hidden xs:inline">Produtos</span>
              <span className="xs:hidden">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm transition-all duration-200 hover:scale-105">
              <Tag className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" />
              <span className="hidden xs:inline">Categorias</span>
              <span className="xs:hidden">Categorias</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm col-span-2 sm:col-span-1 transition-all duration-200 hover:scale-105">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" disabled className="hidden lg:flex flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm transition-all duration-200">Configurações (Em Breve)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-4 sm:mt-6">
            <ProductManagement 
              products={products} 
              onProductsChange={fetchProducts}
            />
          </TabsContent>
          
          <TabsContent value="categories" className="mt-4 sm:mt-6">
            <CategoryManagement 
              onCategoriesChange={fetchProducts}
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-4 sm:mt-6">
            <AnalyticsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;