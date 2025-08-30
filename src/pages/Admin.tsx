import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import AnalyticsPanel from "@/components/admin/AnalyticsPanel";
import Settings from "@/components/admin/Settings";
import MobileBottomNav from "@/components/admin/MobileBottomNav";
import MobileDashboard from "@/components/admin/MobileDashboard";
import { LogOut, Package, BarChart, Tag, TrendingUp, Settings as SettingsIcon, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  ingredientes?: string;
  validade_armazenamento_dias?: number;
  sabores?: string[];
  sabor_images?: Record<string, string>;
  is_featured: boolean;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      Promise.all([fetchProducts(), fetchCategories()]).finally(() => setLoading(false));
    }
  }, [user]);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .is("deleted_at", null) // Filtrar produtos não deletados (soft delete)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar categorias",
      });
    }
  }, [toast]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-product":
        setActiveTab("products");
        // Aqui você pode adicionar lógica para abrir modal de adicionar produto
        break;
      default:
        break;
    }
  };

  const renderMobileContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <MobileDashboard 
            products={products} 
            onNavigate={handleTabChange}
            onQuickAction={handleQuickAction}
          />
        );
      case "products":
        return (
          <ProductManagement 
            products={products} 
            onProductsChange={fetchProducts}
          />
        );
      case "categories":
        return (
          <CategoryManagement 
            onCategoriesChange={fetchProducts}
          />
        );
      case "analytics":
        return <AnalyticsPanel />;
      case "settings":
        return <Settings />;
      default:
        return (
          <MobileDashboard 
            products={products} 
            onNavigate={handleTabChange}
            onQuickAction={handleQuickAction}
          />
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-primary"></div>
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
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center">
              <div>
                <h1 className="text-lg md:text-2xl font-display font-bold gradient-primary bg-clip-text text-transparent">
                  Açucarada Admin
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  Bem-vindo, {user.email}
                </p>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/")} 
                className="transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                Ver Site
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleSignOut} 
                className="transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
            
            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/")} 
                className="px-3"
              >
                Site
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleSignOut} 
                className="px-3"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 py-4 pb-20">
          {renderMobileContent()}
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-rose-primary" />
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
                <BarChart className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-rose-primary" />
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
                <Package className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-rose-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold transition-colors duration-200">
                  {categories.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Diferentes categorias
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              <TabsTrigger value="products" className="flex-row gap-2 py-1.5 text-sm transition-all duration-200 hover:scale-105">
                <Package className="h-4 w-4 transition-transform duration-200" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex-row gap-2 py-1.5 text-sm transition-all duration-200 hover:scale-105">
                <Tag className="h-4 w-4 transition-transform duration-200" />
                Categorias
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex-row gap-2 py-1.5 text-sm transition-all duration-200 hover:scale-105">
                <TrendingUp className="h-4 w-4 transition-transform duration-200" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-row gap-2 py-1.5 text-sm transition-all duration-200 hover:scale-105">
                <SettingsIcon className="h-4 w-4 transition-transform duration-200" />
                Configurações
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="mt-6">
              <ProductManagement 
                products={products} 
                onProductsChange={fetchProducts}
              />
            </TabsContent>
            
            <TabsContent value="categories" className="mt-6">
              <CategoryManagement 
                onCategoriesChange={fetchProducts}
              />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <AnalyticsPanel />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <Settings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;