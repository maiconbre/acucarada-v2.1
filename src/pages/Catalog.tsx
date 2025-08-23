import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, SlidersHorizontal, Grid3X3, List, Star, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

const Catalog = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState("all");
  const [showReadyDelivery, setShowReadyDelivery] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, priceRange, showReadyDelivery, sortBy]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filterProducts = useCallback(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Filter by price range
    if (priceRange !== "all") {
      switch (priceRange) {
        case "0-10":
          filtered = filtered.filter((product) => product.price <= 10);
          break;
        case "10-25":
          filtered = filtered.filter((product) => product.price > 10 && product.price <= 25);
          break;
        case "25-50":
          filtered = filtered.filter((product) => product.price > 25 && product.price <= 50);
          break;
        case "50+":
          filtered = filtered.filter((product) => product.price > 50);
          break;
      }
    }

    // Filter by ready delivery
    if (showReadyDelivery) {
      filtered = filtered.filter((product) => product.is_featured);
    }

    // Sort products
    switch (sortBy) {
      case "newest":
        // Already sorted by created_at desc from database
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceRange, showReadyDelivery, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft">
      <Header />
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-title font-bold mb-2 md:mb-4 px-4">
              Nosso <span className="gradient-primary bg-clip-text text-transparent">Catálogo</span>
            </h1>
            <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto font-text px-4">
              Explore nossa deliciosa seleção de doces artesanais
            </p>
          </div>

          {/* Search and Filter */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Mobile Filter Toggle */}
              <div className="flex items-center gap-2 sm:hidden w-full">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="px-3"
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </Button>
              </div>

              {/* Desktop Filters */}
              <div className={`flex flex-col sm:flex-row gap-3 w-full sm:w-auto ${showFilters ? 'block' : 'hidden sm:flex'}`}>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-full sm:w-40">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Preço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os preços</SelectItem>
                    <SelectItem value="0-10">Até R$ 10</SelectItem>
                    <SelectItem value="10-25">R$ 10 - R$ 25</SelectItem>
                    <SelectItem value="25-50">R$ 25 - R$ 50</SelectItem>
                    <SelectItem value="50+">Acima de R$ 50</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais recentes</SelectItem>
                    <SelectItem value="name">Nome A-Z</SelectItem>
                    <SelectItem value="price-low">Menor preço</SelectItem>
                    <SelectItem value="price-high">Maior preço</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showReadyDelivery ? "default" : "outline"}
                  onClick={() => setShowReadyDelivery(!showReadyDelivery)}
                  className="w-full sm:w-auto"
                >
                  <Star className={`h-4 w-4 mr-2 ${showReadyDelivery ? 'fill-current' : ''}`} />
                  Pronta entrega
                </Button>
              </div>

              {/* Desktop View Mode Toggle */}
              <div className="hidden sm:flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold mb-4">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termo de busca
            </p>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6' 
              : 'flex flex-col gap-4'
          }`}>
            {filteredProducts.map((product) => (
              <div key={product.id} className={viewMode === 'list' ? 'w-full' : ''}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  description={product.description || ""}
                  price={`R$ ${product.price.toFixed(2).replace(".", ",")}`}
                  image={product.image_url || ""}
                  category={product.category}
                  is_featured={product.is_featured}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back to Home */}
      <div className="container mx-auto px-4 pb-12">
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate("/")}
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Catalog;