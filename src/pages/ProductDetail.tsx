import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Heart, Share2, Eye, Star, ChefHat, Calendar, Info } from "lucide-react";
import { CommentSection } from "@/components/CommentSection";
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
  sabores?: string[];
  sabor_images?: Record<string, string>;
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
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const { analytics, toggleLike, trackShare, trackClick } = useProductAnalytics(id || '');
  const commentSectionRef = useRef<HTMLDivElement>(null);

  const handleCommentClick = () => {
    commentSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Inicializar imagem ativa quando produto for carregado
  useEffect(() => {
    if (product) {
      setActiveImage(product.image_url);
    }
  }, [product]);

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

  const handleFlavorClick = (flavor: string) => {
    setSelectedFlavor(flavor);
    
    // Verificar se existe imagem específica para este sabor
    if (product?.sabor_images && product.sabor_images[flavor]) {
      setActiveImage(product.sabor_images[flavor]);
    } else {
      // Voltar para imagem principal se não houver imagem específica
      setActiveImage(product?.image_url || '');
    }
    
    trackClick('flavor_selection', 'product_detail');
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/catalog')}
            className="p-0 h-auto font-normal hover:text-rose-primary"
          >
            Catálogo
          </Button>
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
                  src={activeImage || product.image_url}
                  alt={`${product.name}${selectedFlavor ? ` - ${selectedFlavor}` : ''}`}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  width="600"
                  height="600"
                  loading="eager"
                  decoding="async"
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
              {/* Badges e Sabores - Layout Responsivo */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs lg:text-sm font-semibold bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border-rose-200">
                    {product.category}
                  </Badge>
                  {product.is_featured && (
                    <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                      Destaque
                    </Badge>
                  )}
                </div>
                
                {/* Sabores Compactos - Mobile */}
                {product.sabores && product.sabores.length > 0 && (
                  <div className="block lg:hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-3 w-3 text-purple-600" />
                      <span className="text-xs font-medium text-purple-700 font-text">
                        {product.sabores.length} sabor{product.sabores.length > 1 ? 'es' : ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.sabores.map((sabor, index) => (
                        <Button
                          key={index}
                          variant={selectedFlavor === sabor ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFlavorClick(sabor)}
                          className={`h-6 px-2 text-xs font-medium transition-all duration-200 ${
                            selectedFlavor === sabor 
                              ? 'bg-purple-600 text-white shadow-md scale-105 border-purple-600' 
                              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 hover:border-purple-300'
                          }`}
                        >
                          {sabor}
                          {product.sabor_images?.[sabor] && (
                            <span className="ml-1 text-xs opacity-70">📸</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
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
                <div className="space-y-3">
                  <span className="text-sm text-muted-foreground block font-text flex items-center gap-1">
                    <div className="h-1 w-1 rounded-full bg-rose-primary" />
                    Preço especial
                  </span>
                  
                  {/* Preço e Sabores */}
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent font-text">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    
                    {/* Sabores Disponíveis - Desktop */}
                    {product.sabores && product.sabores.length > 0 && (
                      <div className="hidden lg:block space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-purple-600" />
                          <span className="text-xs font-medium text-purple-700 font-text">
                            Sabores disponíveis ({product.sabores.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                           {product.sabores.map((sabor, index) => (
                             <Button
                               key={index}
                               variant={selectedFlavor === sabor ? "default" : "outline"}
                               size="sm"
                               onClick={() => handleFlavorClick(sabor)}
                               className={`h-7 px-2.5 text-xs font-medium transition-all duration-200 ${
                                 selectedFlavor === sabor 
                                   ? 'bg-purple-600 text-white shadow-md scale-105 border-purple-600' 
                                   : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 hover:border-purple-300'
                               }`}
                             >
                               {sabor}
                               {product.sabor_images?.[sabor] && (
                                 <span className="ml-1 text-xs opacity-70">📸</span>
                               )}
                             </Button>
                           ))}
                         </div>
                         {selectedFlavor && (
                           <p className="text-xs text-purple-600 font-text mt-1">
                             Visualizando: {selectedFlavor}
                             {product.sabor_images?.[selectedFlavor] && " (com imagem específica)"}
                           </p>
                         )}
                      </div>
                    )}
                  </div>
                  
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

                  <Card className="border-0 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={handleCommentClick}
                  >
                    <CardContent className="p-3 lg:p-4 text-center">
                      <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6 mx-auto mb-2 text-blue-600" />
                      <div className="flex flex-col items-center">
                        <span className="text-xs lg:text-sm font-semibold text-blue-700">Comentar</span>
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


            
            <CommentSection productId={product.id} ref={commentSectionRef} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;