import { useState, useEffect, useRef, lazy, Suspense, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Heart, Share2, Star, ChefHat, Calendar, Info, Clock, Utensils, Sparkles, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
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
    const customMessage = `Olá! Gostaria de encomendar:\n\n🍫 *${product.name}*\n💰 ${formatPrice(product.price)}\n\nPoderia me dar mais informações sobre disponibilidade e entrega?`;
    const link = getWhatsAppLink(customMessage);
    window.open(link, '_blank');
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
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Card className="overflow-hidden">
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

            {product.sabores && product.sabores.length > 0 && (
              <Card className="border-rose-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cream-500/20 to-rose-50">
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <ChefHat className="h-5 w-5 text-rose-primary mr-4" />
                    <h3 className="font-bold text-lg text-brown-primary">Sabores Disponíveis</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                    {product.sabores.map((sabor, index) => (
                      <FlavorButton
                        key={index}
                        sabor={sabor}
                        isSelected={selectedFlavor === sabor}
                        onClick={handleFlavorClick}
                        variant="mobile"
                        disabled={imageLoading}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-cream-500/20 to-rose-50 rounded-xl p-6 border border-rose-200">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-brown-primary font-title">{product.name}</h1>
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <p className="text-2xl md:text-3xl font-bold text-rose-primary">
                  {formatPrice(product.price)}
                </p>
              </div>
              <p className="text-brown-600 leading-relaxed text-lg">{product.description}</p>
            </div>

            <div className="space-y-6">
              <Button
                onClick={handleWhatsAppOrder}
                size="lg"
                className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl border-2 border-green-400 hover:border-green-500"
              >
                <ShoppingBag className="h-6 w-6 mr-3" />
                Pedir pelo WhatsApp
                <span className="ml-2 text-sm opacity-90">🍫</span>
              </Button>

              <div className="grid grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-rose-200 bg-gradient-to-br from-cream-500/10 to-rose-50" onClick={handleShare}>
                  <CardContent className="p-4 text-center">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-3 mx-auto mb-2 w-fit">
                      <Share2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-brown-primary">Compartilhar</span>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-rose-200 bg-gradient-to-br from-cream-500/10 to-rose-50" onClick={handleLikeClick}>
                  <CardContent className="p-4 text-center">
                    <div className={`rounded-full p-3 mx-auto mb-2 w-fit transition-all duration-300 ${analytics.is_liked
                      ? 'bg-gradient-to-br from-rose-100 to-rose-200'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200'
                      }`}>
                      <Heart className={`h-5 w-5 transition-all duration-300 ${analytics.is_liked ? 'fill-current text-rose-primary' : 'text-gray-600'
                        }`} />
                    </div>
                    <span className="text-sm font-medium text-brown-primary">Curtir</span>
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
              </div>
            </div>

            {(product.ingredientes || product.validade_armazenamento_dias) && (
              <Card className="border-brown-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cream-500/30 to-brown-100">
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

            <div ref={commentSectionRef}>
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner size="md" />}>
                  <CommentSection productId={product.id} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;