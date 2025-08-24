import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Heart, Share2, Eye, Star, MessageSquare, Clock, ChefHat, Calendar, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  ingredientes?: string;
  validade_armazenamento_dias?: number;
  is_featured: boolean;
  is_active: boolean;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getWhatsAppLink } = useAppSettings();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const { analytics, toggleLike, trackShare, trackClick } = useProductAnalytics(id || '');

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

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
    
    trackClick('whatsapp_order', 'product_detail');
    const customMessage = `Olá! Gostaria de encomendar:\n\n🍫 *${product.name}*\n💰 ${formatPrice(product.price)}\n\nPoderia me dar mais informações sobre disponibilidade e entrega?`;
    const link = getWhatsAppLink(customMessage);
    window.open(link, '_blank');
  };

  const handleLikeClick = async () => {
    await toggleLike();
    trackClick('like', 'product_detail');
  };

  const handleShare = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.name,
      text: `Confira este delicioso ${product.name} - ${formatPrice(product.price)}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        trackShare('native_share', 'product_detail');
      } else {
        // Fallback para copiar URL
        await navigator.clipboard.writeText(window.location.href);
        trackShare('copy_link', 'product_detail');
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
        <div className="container mx-auto px-4 py-8 pt-32 md:pt-36">
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
      
      <div className="container mx-auto px-4 py-8 pt-32 md:pt-36">
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
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 mb-8 lg:mb-12">
          {/* Imagem do Produto */}
          <div className="relative order-1 lg:order-1">
            <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
              <div className="relative aspect-square group">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-lg" />
                )}
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Badge de status */}
                <div className="absolute top-3 left-3 lg:top-4 lg:left-4">
                  <Badge className={`text-white text-xs lg:text-sm font-semibold shadow-lg ${
                    product.is_featured 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-r from-rose-500 to-pink-600'
                  }`}>
                    {product.is_featured ? '✨ Pronta entrega' : '📋 Encomenda'}
                  </Badge>
                </div>
                
                {/* Avaliação visual */}
                <div className="absolute top-3 right-3 lg:top-4 lg:right-4">
                  <div className="bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg border border-white/20">
                    <Star className="h-3 w-3 lg:h-4 lg:w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs lg:text-sm font-bold text-gray-800">4.8</span>
                  </div>
                </div>
                
                {/* Indicador de zoom */}
                <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                    <Eye className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-4 lg:space-y-6 order-2 lg:order-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs lg:text-sm font-semibold bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border-rose-200">
                  {product.category}
                </Badge>
                {product.is_featured && (
                  <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    Destaque
                  </Badge>
                )}
              </div>
              
              <h1 className="font-title text-2xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {product.name}
              </h1>
              
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed font-text max-w-2xl">
                {product.description}
              </p>
            </div>

            <div className="border-t border-gradient-to-r from-transparent via-gray-200 to-transparent pt-6">
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground block font-text flex items-center gap-1">
                    <div className="h-1 w-1 rounded-full bg-rose-primary" />
                    Preço especial
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent font-text">
                      {formatPrice(product.price)}
                    </span></div>
                  <p className="text-xs text-muted-foreground font-text">
                    Ou consulte condições via WhatsApp
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleWhatsAppOrder}
                  size="lg"
                  className="w-full h-14 lg:h-16 text-base lg:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] border-0"
                >
                  <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6 mr-3" />
                  <span className="flex flex-col items-start">
                    <span>Pedir pelo WhatsApp</span>
                    <span className="text-xs opacity-90 font-normal">Resposta rápida garantida</span>
                  </span>
                </Button>
                
                <div className="grid grid-cols-3 gap-3">
                  <Card className="border-0 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      trackClick('comments', 'product_detail');
                      toast({
                        title: "Em breve!",
                        description: "Sistema de comentários e avaliações em desenvolvimento.",
                      });
                    }}
                  >
                    <CardContent className="p-3 lg:p-4 text-center">
                      <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6 mx-auto mb-2 text-blue-600" />
                      <div className="flex flex-col items-center">
                        <span className="text-xs lg:text-sm font-semibold text-blue-700">Comentar</span>
                        <span className="text-xs text-blue-600 font-bold">★ 4.8</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={handleShare}
                  >
                    <CardContent className="p-3 lg:p-4 text-center">
                      <Share2 className="h-5 w-5 lg:h-6 lg:w-6 mx-auto mb-2 text-purple-600" />
                      <div className="flex flex-col items-center">
                        <span className="text-xs lg:text-sm font-semibold text-purple-700">Compartilhar</span>
                        <span className="text-xs text-purple-600 font-bold">{analytics.total_shares}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className={`border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                    analytics.is_liked 
                      ? 'bg-gradient-to-br from-red-100/80 to-pink-100/80' 
                      : 'bg-gradient-to-br from-red-50/80 to-rose-50/80'
                  }`}
                    onClick={handleLikeClick}
                  >
                    <CardContent className="p-3 lg:p-4 text-center">
                      <Heart className={`h-5 w-5 lg:h-6 lg:w-6 mx-auto mb-2 text-red-600 ${
                        analytics.is_liked ? 'fill-current' : ''
                      }`} />
                      <div className="flex flex-col items-center">
                        <span className="text-xs lg:text-sm font-semibold text-red-700">Curtir</span>
                        <span className="text-xs text-red-600 font-bold">{analytics.total_likes}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>


            {/* Informações do Produto */}
            <Card className="border-0 bg-gradient-to-br from-muted/30 to-muted/60 shadow-sm">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-4 w-4 lg:h-5 lg:w-5 text-rose-primary" />
                  <h3 className="font-semibold font-title text-sm lg:text-base">Informações do Produto</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Badge className="h-3 w-3 rounded-full p-0" />
                      Categoria:
                    </span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <div className={`h-2 w-2 rounded-full ${product.is_featured ? 'bg-green-500' : 'bg-orange-500'}`} />
                      Disponibilidade:
                    </span>
                    <span className={`font-medium ${product.is_featured ? 'text-green-600' : 'text-orange-600'}`}>
                      {product.is_featured ? 'Em estoque' : 'Sob encomenda'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/50 col-span-1 sm:col-span-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      Entrega:
                    </span>
                    <span className="font-medium">
                      {product.is_featured ? 'Entrega imediata' : 'Consulte via WhatsApp'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ingredientes - Seção Opcional */}
            {product.ingredientes && (
              <Card className="border-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 shadow-sm">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ChefHat className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
                    <h3 className="font-semibold font-title text-sm lg:text-base text-orange-800">Ingredientes</h3>
                  </div>
                  <p className="text-sm text-orange-700 leading-relaxed font-text bg-white/60 p-3 rounded-lg">
                    {product.ingredientes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Validade - Seção Opcional */}
            {product.validade_armazenamento_dias && (
              <Card className="border-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 shadow-sm">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                    <h3 className="font-semibold font-title text-sm lg:text-base text-blue-800">Armazenamento</h3>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700 font-text">Validade para armazenamento:</span>
                      <span className="font-semibold text-blue-800">
                        {product.validade_armazenamento_dias} {product.validade_armazenamento_dias === 1 ? 'dia' : 'dias'}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-2 font-text">
                      Mantenha refrigerado para melhor conservação
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
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