import { useState, useEffect, useRef, lazy, Suspense, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Heart, Share2, Star, ChefHat, Calendar, Info, Clock, Utensils, Sparkles, ShoppingBag, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
import { useCart } from "@/contexts/cart-context";
import { Json } from "@/integrations/supabase/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";

const CommentSection = lazy(() => import("@/components/CommentSection").then(module => ({ default: module.CommentSection })));

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
  sabor_images?: Json | null;
  is_featured: boolean;
  is_active: boolean;
}

interface FlavorButtonProps {
  sabor: string;
  isSelected: boolean;
  onClick: (sabor: string) => void;
  variant: 'mobile' | 'desktop';
  disabled?: boolean;
}

const FlavorButton = ({ sabor, isSelected, onClick, variant, disabled = false }: FlavorButtonProps) => {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      onClick={() => onClick(sabor)}
      disabled={disabled}
      className={`font-medium transition-all duration-300 transform hover:scale-105 ${variant === 'mobile' ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-sm'
        } ${isSelected
          ? 'bg-gradient-to-r from-rose-primary to-rose-600 text-white shadow-lg scale-105 border-rose-primary hover:from-rose-600 hover:to-rose-700'
          : 'bg-gradient-to-r from-cream-500/30 to-rose-100 text-rose-primary hover:from-cream-500/50 hover:to-rose-200 border-rose-300 hover:border-rose-primary shadow-sm'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Sparkles className="h-3 w-3 mr-1" />
      {sabor}
    </Button>
  );
};



// Componente de skeleton loading
const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <div className="container mx-auto px-4 py-8 pt-32 md:pt-36">
      <div className="animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Image skeleton */}
          <div className="aspect-square bg-gray-200 rounded-lg"></div>

          {/* Content skeleton */}
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [imageTransitioning, setImageTransitioning] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [nextImage, setNextImage] = useState<string>('');

  const { getWhatsAppLink } = useAppSettings();
  const { analytics, toggleLike, trackShare, trackClick } = useProductAnalytics(id || '');
  const { addItem } = useCart();
  const commentSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleCommentClick = () => {
    commentSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const fetchProduct = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          category,
          is_featured,
          is_active,
          ingredientes,
          validade_armazenamento_dias,
          sabores,
          sabor_images
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          navigate("/404");
          return;
        }
        throw error;
      }

      setProduct(data);
      setActiveImage(data.image_url);
      setLoading(false);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar o produto."
      });

      setLoading(false);
      setTimeout(() => navigate("/catalog"), 100);
    }
  };

  // Precarrega imagens dos sabores quando o produto é carregado
  useEffect(() => {
    if (product?.sabor_images) {
      const saborImages = product.sabor_images as Record<string, string>;
      Object.values(saborImages).forEach(imageUrl => {
        if (imageUrl && typeof imageUrl === 'string') {
          preloadImage(imageUrl).catch(console.error);
        }
      });
    }
  }, [product]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleWhatsAppOrder = () => {
    if (!product) return;

    trackClick('whatsapp_order', 'product_detail');
    const customMessage = `Olá! Gostaria de encomendar:\n\n*${product.name}*\n» Preço: ${formatPrice(product.price)}\n\nPoderia me dar mais informações sobre disponibilidade e entrega?`;
    const link = getWhatsAppLink(customMessage);
    window.open(link, '_blank');
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Se o produto tem sabores e nenhum foi selecionado, mostrar aviso
    if (product.sabores && product.sabores.length > 0 && !selectedFlavor) {
      toast({
        variant: "destructive",
        title: "Selecione um sabor",
        description: "Por favor, selecione um sabor antes de adicionar ao carrinho.",
      });
      return;
    }

    trackClick('add_to_cart', 'product_detail');
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      flavor: selectedFlavor || undefined,
      image_url: product.image_url,
    });
  };

  const handleLikeClick = async () => {
    await toggleLike();
    trackClick('like', 'product_detail');
  };

  // Função para precarregar imagem
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.has(src)) {
        resolve();
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, src]));
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, [preloadedImages]);

  const handleFlavorClick = async (flavor: string) => {
    if (selectedFlavor === flavor || imageLoading) return;
    
    setSelectedFlavor(flavor);
    
    const saborImages = product?.sabor_images as Record<string, string> | null;
    const newImage = (saborImages && saborImages[flavor]) 
      ? saborImages[flavor] 
      : product?.image_url || '';
    
    if (newImage && newImage !== activeImage) {
      setImageLoading(true);
      setImageTransitioning(true);
      
      try {
        // Precarrega a nova imagem
        await preloadImage(newImage);
        
        // Define a próxima imagem e inicia a transição
        setNextImage(newImage);
        
        // Aguarda um pouco para a transição de fade out
        setTimeout(() => {
          setActiveImage(newImage);
          setNextImage('');
          setImageTransitioning(false);
          setImageLoading(false);
        }, 150);
      } catch (error) {
        console.error('Erro ao carregar imagem:', error);
        setImageTransitioning(false);
        setImageLoading(false);
      }
    }
    
    trackClick('flavor_selection', 'product_detail');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: product.name,
      text: `Confira este delicioso ${product.name} por ${formatPrice(product.price)}!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        trackShare('native_share', 'product_detail');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        trackShare('copy_link', 'product_detail');
        toast({
          title: "Link copiado!",
          description: "O link do produto foi copiado para a área de transferência."
        });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 pt-32">
        {/* Header mobile com botão voltar, nome e preço */}
        <div className="flex items-start justify-between mb-6 lg:hidden">
          <Button
            variant="ghost"
            onClick={() => navigate('/catalog')}
            className="text-muted-foreground hover:text-foreground p-2 -ml-2 flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span className="text-sm">Voltar</span>
          </Button>
          
          <div className="flex-1 px-2">
            <h1 className="text-xl font-bold text-brown-primary font-title leading-tight">{product.name}</h1>
            <div className="flex items-center mt-1">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <p className="text-lg font-bold text-rose-primary">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>
        </div>

        {/* Botão voltar para desktop */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground hidden lg:flex"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Card className="overflow-hidden lg:w-[100%] lg:mx-auto">
              <div className="relative aspect-square overflow-hidden">
                {/* Imagem principal */}
                <img
                  src={activeImage || product.image_url}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-300 ease-in-out ${
                    imageTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                  }`}
                  onError={() => setActiveImage(product.image_url)}
                  loading="lazy"
                />
                
                {/* Imagem de transição */}
                {nextImage && (
                  <img
                    src={nextImage}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-in-out ${
                      imageTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    }`}
                    loading="lazy"
                  />
                )}
                
                {/* Loading overlay */}
                {imageLoading && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-3">
                      <div className="animate-spin h-6 w-6 border-2 border-rose-primary border-t-transparent rounded-full"></div>
                    </div>
                  </div>
                )}

                <div className="absolute top-4 left-4">
                  <Badge className={`${product.is_featured ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'} text-white font-semibold px-3 py-1 shadow-lg`}>
                    {product.is_featured ? '✨ Em estoque' : '📋 Sob encomenda'}
                  </Badge>
                </div>

                {selectedFlavor && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-rose-primary text-white font-semibold px-3 py-1 shadow-lg">
                      {selectedFlavor}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>

            {/* Informações do Produto - aparecem abaixo da imagem apenas em desktops */}
            {(product.ingredientes || product.validade_armazenamento_dias) && (
              <Card className="bg-gradient-to-br from-cream-500/20 to-rose-50 border-rose-200 hidden lg:block">
                <CardContent className="p-6">
                  <div className="flex items-center mb-5">
                    <Info className="h-6 w-6 text-brown-primary mr-3" />
                    <h3 className="font-bold text-xl text-brown-primary">Informações do Produto</h3>
                  </div>

                  <div className="space-y-4">
                    {product.ingredientes && (
                      <div className="bg-white/90 rounded-lg p-4 border border-brown-200 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center mb-3">
                          <Utensils className="h-5 w-5 text-brown-primary mr-2" />
                          <h4 className="font-bold text-lg text-brown-primary">Ingredientes</h4>
                        </div>
                        <p className="text-brown-600 leading-relaxed">{product.ingredientes}</p>
                      </div>
                    )}

                    {product.validade_armazenamento_dias && (
                      <div className="bg-white/90 rounded-lg p-4 border border-brown-200 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 text-brown-primary mr-2" />
                          <h4 className="font-bold text-lg text-brown-primary">Validade</h4>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-brown-500 mr-2" />
                          <span className="text-brown-600 font-medium">
                            {product.validade_armazenamento_dias} dias após o preparo
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex flex-col space-y-6 lg:block lg:space-y-6">
            {/* Header desktop com nome, preço e descrição */}
            <div className="bg-gradient-to-br from-cream-500/20 to-rose-50 rounded-xl p-6 border border-rose-200 hidden lg:block order-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-brown-primary font-title">{product.name}</h1>
              <div className="flex items-center mb-4">
                <p className="text-2xl md:text-3xl font-bold text-rose-primary">
                  {formatPrice(product.price)}
                </p>
              </div>
              <p className="text-brown-600 leading-relaxed text-lg">{product.description}</p>
            </div>

            {/* Sabores - aparecem antes dos botões */}
            {product.sabores && product.sabores.length > 0 && (
              <Card className="border-rose-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cream-500/20 to-rose-50 order-2 lg:order-2">
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <ChefHat className="h-5 w-5 text-rose-primary mr-4" />
                    <h3 className="font-bold text-lg text-brown-primary">Sabores Disponíveis</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-2 sm:gap-3">
                    {product.sabores.map((sabor, index) => (
                      <FlavorButton
                        key={index}
                        sabor={sabor}
                        isSelected={selectedFlavor === sabor}
                        onClick={handleFlavorClick}
                        variant="desktop"
                        disabled={imageLoading}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botões de Ação - aparecem após os sabores */}
            <div className="space-y-6 order-3 lg:order-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="w-full h-14 sm:h-12 md:h-16 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-base sm:text-sm md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl border-2 border-rose-400 hover:border-rose-500"
                >
                  <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4 md:h-6 md:w-6 mr-2 sm:mr-1 md:mr-3" />
                  <span className="hidden sm:inline">Adicionar ao Carrinho</span>
                  <span className="sm:hidden">Adicionar ao Carrinho</span>
                </Button>
                
                <Button
                  onClick={handleWhatsAppOrder}
                  size="lg"
                  className="w-full h-14 sm:h-12 md:h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-base sm:text-sm md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl border-2 border-green-400 hover:border-green-500"
                >
                  <ShoppingBag className="h-5 w-5 sm:h-4 sm:w-4 md:h-6 md:w-6 mr-2 sm:mr-1 md:mr-3" />
                  <span className="hidden sm:inline">Pedir pelo WhatsApp</span>
                  <span className="sm:hidden">Pedir pelo WhatsApp</span>
                </Button>
              </div>



            {/* Botões secundários - aparecem após os botões de ação */}
            <div className="order-4 lg:order-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-rose-200 bg-gradient-to-br from-cream-500/10 to-rose-50" onClick={handleShare}>
                  <CardContent className="p-4 text-center">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-3 mx-auto mb-2 w-fit">
                      <Share2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-brown-primary">Compartilhar</span>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-rose-200 bg-gradient-to-br from-cream-500/10 to-rose-50" onClick={handleCommentClick}>
                  <CardContent className="p-4 text-center">
                    <div className="bg-gradient-to-br from-rose-100 to-rose-200 rounded-full p-3 mx-auto mb-2 w-fit">
                      <MessageCircle className="h-5 w-5 text-rose-primary" />
                    </div>
                    <span className="text-sm font-medium text-brown-primary">Comentar</span>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-rose-200 bg-gradient-to-br from-cream-500/10 to-rose-50" onClick={handleLikeClick}>
                  <CardContent className="p-4 text-center">
                    <div className={`rounded-full p-3 mx-auto mb-2 w-fit transition-all duration-300 ${
                      analytics.is_liked
                        ? 'bg-gradient-to-br from-rose-100 to-rose-200'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                      }`}>
                      <Heart className={`h-5 w-5 transition-all duration-300 ${
                        analytics.is_liked ? 'fill-current text-rose-primary' : 'text-gray-600'
                        }`} />
                    </div>
                    <span className="text-sm font-medium text-brown-primary">Curtir</span>
                  </CardContent>
                </Card>
              </div>
            </div>



            <div ref={commentSectionRef} className="order-5 lg:order-5">
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner size="md" />}>
                  <CommentSection productId={product.id} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;