import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Heart, Share2, Eye, Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";

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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const { analytics, toggleLike, trackView, trackClick } = useProductAnalytics(id || '');

  useEffect(() => {
    if (id) {
      fetchProduct();
      // Removed automatic trackView to prevent excessive API calls
      // trackView will only be called on user interactions
    }
  }, [id]); // Only depend on id to avoid infinite loops

  const fetchProduct = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Produto não encontrado
          navigate("/404");
          return;
        }
        throw error;
      }
      
      setProduct(data);
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar o produto.",
      });
      navigate("/catalog");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  const handleWhatsAppOrder = () => {
    if (!product) return;
    
    // Track view when user actually engages with the product
    trackView();
    trackClick('whatsapp_order', 'product_detail');
    const whatsappNumber = "5511999999999";
    const message = encodeURIComponent(
      `Olá! Gostaria de encomendar:\n\n🍫 *${product.name}*\n💰 ${formatPrice(product.price)}\n\nPoderia me dar mais informações sobre disponibilidade e entrega?`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleLikeClick = async () => {
    await toggleLike();
    trackClick('like', 'product_detail');
  };

  const handleShare = async () => {
    if (!product) return;
    
    trackClick('share', 'product_detail');
    
    const shareData = {
      title: product.name,
      text: `Confira este delicioso ${product.name} - ${formatPrice(product.price)}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback para copiar URL
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copiado!",
          description: "O link do produto foi copiado para a área de transferência.",
        });
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24 md:pt-28">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24 md:pt-28">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-0 h-auto font-normal hover:text-rose-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <span>/</span>
          <span>Catálogo</span>
          <span>/</span>
          <span className="text-foreground font-medium font-text">{product.name}</span>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-8 lg:mb-12">
          {/* Imagem do Produto */}
          <div className="relative order-1 lg:order-1">
            <Card className="overflow-hidden border-0 shadow-elegant">
              <div className="relative aspect-square">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
                )}
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
                <div className="absolute top-3 left-3 lg:top-4 lg:left-4">
                  <Badge className="bg-rose-primary text-white text-xs lg:text-sm">
                    {product.is_featured ? 'Pronta entrega' : 'Encomenda'}
                  </Badge>
                </div>
                {/* Avaliação visual no canto superior direito */}
                <div className="absolute top-3 right-3 lg:top-4 lg:right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                    <Star className="h-3 w-3 lg:h-4 lg:w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs lg:text-sm font-semibold">4.8</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-4 lg:space-y-6 order-2 lg:order-2">
            <div>
              <Badge variant="secondary" className="mb-3 text-xs lg:text-sm">
                {product.category}
              </Badge>
              <h1 className="font-title text-2xl lg:text-4xl font-bold text-foreground mb-3 lg:mb-4 leading-tight">
                {product.name}
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed font-text">
                {product.description}
              </p>
            </div>

            <div className="border-t pt-4 lg:pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1 font-text">
                    Preço
                  </span>
                  <span className="text-3xl lg:text-4xl font-bold text-rose-primary font-text">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="h-10 w-10 lg:h-12 lg:w-12"
                  >
                    <Share2 className="h-4 w-4 lg:h-5 lg:w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleLikeClick}
                    className={`h-10 w-10 lg:h-12 lg:w-12 transition-colors ${
                      analytics.is_liked ? 'text-red-500 border-red-500' : ''
                    }`}
                  >
                    <Heart className={`h-4 w-4 lg:h-5 lg:w-5 ${analytics.is_liked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleWhatsAppOrder}
                  size="lg"
                  className="w-full h-12 lg:h-14 text-base lg:text-lg font-semibold"
                >
                  <MessageCircle className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  Pedir pelo WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-12 lg:h-14 text-base lg:text-lg font-semibold"
                  onClick={() => {
                    trackClick('comments', 'product_detail');
                    toast({
                      title: "Em breve!",
                      description: "Sistema de comentários e avaliações em desenvolvimento.",
                    });
                  }}
                >
                  <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  Ver Comentários e Avaliações
                </Button>
              </div>
            </div>

            {/* Estatísticas do Produto */}
            <Card className="border-0 bg-muted/50">
              <CardContent className="p-4 lg:p-6">
                <h3 className="font-semibold mb-3 font-title text-sm lg:text-base">Estatísticas</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-base lg:text-lg font-bold text-red-500">
                      <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
                      {analytics.total_likes}
                    </div>
                    <span className="text-xs text-muted-foreground font-text">Curtidas</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-base lg:text-lg font-bold text-yellow-500">
                      <Star className="h-3 w-3 lg:h-4 lg:w-4" />
                      4.8
                    </div>
                    <span className="text-xs text-muted-foreground font-text">Avaliação</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card className="border-0 bg-muted/50">
              <CardContent className="p-4 lg:p-6">
                <h3 className="font-semibold mb-3 font-title text-sm lg:text-base">Informações do Produto</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Disponibilidade:</span>
                    <span className="font-medium text-green-600">Em estoque</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entrega:</span>
                    <span className="font-medium">Consulte via WhatsApp</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tempo de preparo:</span>
                    <span className="font-medium">{product.is_featured ? '24h' : '2-3 dias'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Seção de Avaliações Visuais */}
            <Card className="border-0 bg-muted/50">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold font-title text-sm lg:text-base">Avaliações dos Clientes</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm">4.8</span>
                    <span className="text-xs text-muted-foreground">(24 avaliações)</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Barra de avaliações */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="w-3">{stars}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 8 : stars === 2 ? 2 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-muted-foreground w-8 text-right">
                          {stars === 5 ? '17' : stars === 4 ? '5' : stars === 3 ? '2' : stars === 2 ? '0' : '0'}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 text-rose-primary hover:text-rose-primary hover:bg-rose-primary/10"
                    onClick={() => {
                      trackClick('view_all_reviews', 'product_detail');
                      toast({
                        title: "Em breve!",
                        description: "Visualização completa de avaliações em desenvolvimento.",
                      });
                    }}
                  >
                    Ver todas as avaliações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;