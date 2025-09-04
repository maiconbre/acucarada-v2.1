import React, { useState, useEffect, useCallback, useRef, useMemo, memo, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Heart, Share2, Eye, Star, ChefHat, Calendar, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
import { useProductCache } from "@/hooks/useProductCache";
import { Json } from "@/integrations/supabase/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load CommentSection for better performance
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
}

const FlavorButton = memo(({ sabor, isSelected, onClick, variant }: FlavorButtonProps) => {
  const handleClick = useCallback(() => {
    onClick(sabor);
  }, [onClick, sabor]);

  const baseClasses = "font-medium transition-all duration-200";
  const mobileClasses = `h-6 px-2 text-xs ${baseClasses}`;
  const desktopClasses = `h-7 px-2.5 text-xs ${baseClasses}`;
  
  const selectedClasses = "bg-purple-600 text-white shadow-md scale-105 border-purple-600";
  const unselectedClasses = "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 hover:border-purple-300";

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      className={`${
        variant === 'mobile' ? mobileClasses : desktopClasses
      } ${
        isSelected ? selectedClasses : unselectedClasses
      }`}
    >
      {sabor}
    </Button>
  );
});

FlavorButton.displayName = 'FlavorButton';

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

const ProductDetail = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getWhatsAppLink } = useAppSettings();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [imageTransitioning, setImageTransitioning] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [imageError, setImageError] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { analytics, toggleLike, trackShare, trackClick } = useProductAnalytics(id || '');
  const { getProduct, setProduct: cacheProduct, updateProduct } = useProductCache();
  const commentSectionRef = useRef<HTMLDivElement>(null);

  // Scroll automático para o topo ao carregar a página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]); // Executa sempre que o ID do produto mudar

  const handleCommentClick = () => {
    commentSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    try {
      // Verificar cache primeiro
      const cachedProduct = getProduct(id);
      if (cachedProduct) {
        setProduct(cachedProduct.data);
        requestAnimationFrame(() => {
          setLoading(false);
          setIsInitialLoad(false);
        });
        
        // Se o cache não está completo, buscar dados adicionais em background
        if (!cachedProduct.isComplete) {
          // Remove timeout for immediate background fetch
          (async () => {
            try {
              const { data: fullData, error: fullError } = await supabase
                .from("products")
                .select(`
                  ingredientes,
                  validade_armazenamento_dias,
                  sabores,
                  sabor_images
                `)
                .eq("id", id)
                .single();
                
              if (!fullError && fullData) {
                const completeProduct = { ...cachedProduct.data, ...fullData };
                setProduct(completeProduct);
                updateProduct(id, fullData);
              }
            } catch (error) {
              console.error("Erro ao carregar dados adicionais do cache:", error);
            }
          })(); // Execute immediately
        }
        return;
      }
      
      // Primeira query: apenas campos essenciais para renderização inicial
      const { data: basicData, error: basicError } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          category,
          is_featured,
          is_active
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (basicError) {
        if (basicError.code === 'PGRST116') {
          navigate("/404");
          return;
        }
        throw basicError;
      }
      
      // Definir produto com dados básicos primeiro
      setProduct(basicData);
      cacheProduct(id, basicData, false); // Salvar no cache
      
      // Aguardar um frame para garantir que o produto foi definido antes de remover o loading
      requestAnimationFrame(() => {
        setLoading(false);
        setIsInitialLoad(false);
      });
      
      // Segunda query: campos adicionais (não bloqueante)
      (async () => {
        try {
          const { data: fullData, error: fullError } = await supabase
            .from("products")
            .select(`
              ingredientes,
              validade_armazenamento_dias,
              sabores,
              sabor_images
            `)
            .eq("id", id)
            .single();
            
          if (!fullError && fullData) {
            const completeProduct = { ...basicData, ...fullData };
            setProduct(completeProduct);
            cacheProduct(id, completeProduct, true); // Atualizar cache com dados completos
          }
        } catch (error) {
          console.error("Erro ao carregar dados adicionais:", error);
        }
      })(); // Execute immediately
      
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar o produto.",
      });
      navigate("/catalog");
      setLoading(false);
    }
  }, [id, navigate, toast, getProduct, cacheProduct, updateProduct]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  // Memoização das URLs de imagens de sabores
  const saborImageUrls = useMemo(() => {
    if (!product?.sabor_images) return [];
    const saborImages = product.sabor_images as Record<string, string> | null;
    return saborImages ? Object.values(saborImages) : [];
  }, [product?.sabor_images]);

  // Inicializar imagem ativa quando produto for carregado
  useEffect(() => {
    if (product) {
      setActiveImage(product.image_url);
    }
  }, [product]);

  // Preload inteligente das imagens de sabores
  useEffect(() => {
    if (saborImageUrls.length > 0) {
      // Preload apenas a primeira imagem imediatamente
      const firstImage = saborImageUrls[0];
      if (firstImage) {
        const img = new Image();
        img.onload = () => {
          setPreloadedImages(prev => new Set(prev).add(firstImage));
        };
        img.src = firstImage;
      }
      
      // Preload das outras imagens com delay para não bloquear a renderização
      const remainingImages = saborImageUrls.slice(1);
      
      if (remainingImages.length > 0) {
        const timeoutId = setTimeout(() => {
          remainingImages.forEach((url, index) => {
            setTimeout(() => {
              const img = new Image();
              img.onload = () => {
                setPreloadedImages(prev => {
                  const newSet = new Set(prev);
                  newSet.add(url);
                  return newSet;
                });
              };
              img.onerror = () => {
                console.warn(`Falha ao carregar imagem de sabor: ${url}`);
              };
              img.src = url;
            }, index * 100); // Reduced delay to 100ms between images
          });
        }, 200); // Reduced initial delay to 200ms
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [saborImageUrls]);

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

  const handleFlavorClick = useCallback((flavor: string) => {
    if (selectedFlavor === flavor) return; // Evita re-render desnecessário
    
    setSelectedFlavor(flavor);
    setImageTransitioning(true);
    
    // Verificar se existe imagem específica para este sabor
    const saborImages = product?.sabor_images as Record<string, string> | null;
    
    const newImage = (saborImages && saborImages[flavor]) 
      ? saborImages[flavor] 
      : product?.image_url || '';
    
    // Transição suave da imagem apenas se a imagem for diferente
    if (newImage !== activeImage) {
      setImageError(false);
      
      // Se a imagem já foi precarregada, usar imediatamente
      if (preloadedImages.has(newImage)) {
        setTimeout(() => {
          setActiveImage(newImage);
          setImageTransitioning(false);
        }, 50); // Reduced from 150ms to 50ms for faster transitions
      } else {
        // Carregar imagem sob demanda com feedback visual
        setImageLoading(true);
        const img = new Image();
        img.onload = () => {
          setPreloadedImages(prev => new Set(prev).add(newImage));
          setActiveImage(newImage);
          setImageLoading(false);
          setImageTransitioning(false);
        };
        img.onerror = () => {
          setImageTransitioning(false);
          setImageLoading(false);
          console.error('Erro ao carregar imagem do sabor:', flavor);
          // Fallback para imagem principal
          setActiveImage(product?.image_url || '');
        };
        img.src = newImage;
      }
    } else {
      setImageTransitioning(false);
    }
    
    trackClick('flavor_selection', 'product_detail');
  }, [selectedFlavor, product?.sabor_images, product?.image_url, activeImage, preloadedImages, trackClick]);

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
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-32 md:pt-36">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 mt-8 text-sm text-muted-foreground animate-slide-up" style={{animationDelay: '0.1s'}}>
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
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 mb-8 lg:mb-12 animate-slide-up" style={{animationDelay: '0.2s'}}>
          {/* Imagem do Produto */}
          <div className="relative order-1 lg:order-1 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 hover:shadow-3xl transition-all duration-300">
              <div className="relative aspect-square group">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-lg" />
                )}
                {imageError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Imagem não disponível</span>
                  </div>
                )}
                <img
                  src={activeImage || product.image_url}
                  alt={`${product.name}${selectedFlavor ? ` - ${selectedFlavor}` : ''}`}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                    (imageLoading && isInitialLoad) || imageError ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                  } ${
                    imageTransitioning ? 'opacity-90 scale-105' : ''
                  }`}
                  width="600"
                  height="600"
                  loading="eager"
                  decoding="async"
                  onLoad={() => {
                  setImageLoading(false);
                  setImageTransitioning(false);
                  setImageError(false);
                  if (isInitialLoad) {
                    setIsInitialLoad(false);
                  }
                }}
                onError={() => {
                  setImageLoading(false);
                  setImageTransitioning(false);
                  setImageError(true);
                }}
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
                    <span className="text-xs lg:text-sm font-bold text-gray-800">5</span>
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
          <div className="space-y-4 lg:space-y-6 order-2 lg:order-2 animate-slide-up" style={{animationDelay: '0.4s'}}>
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
                        <FlavorButton
                          key={index}
                          sabor={sabor}
                          isSelected={selectedFlavor === sabor}
                          onClick={handleFlavorClick}
                          variant="mobile"
                        />
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
                            <FlavorButton
                              key={index}
                              sabor={sabor}
                              isSelected={selectedFlavor === sabor}
                              onClick={handleFlavorClick}
                              variant="desktop"
                            />
                          ))}
                        </div>

                      </div>
                    )}
                  </div>
                  

                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleWhatsAppOrder}
                  size="lg"
                  className="w-full h-14 lg:h-16 text-base lg:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] border-0 hover:scale-105"
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
            <Card className="border-0 bg-gradient-to-br from-muted/30 to-muted/60 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up" style={{animationDelay: '0.5s'}}>
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
              <Card className="border-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up" style={{animationDelay: '0.6s'}}>
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
              <Card className="border-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up" style={{animationDelay: '0.7s'}}>
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


            
            <div className="animate-slide-up" style={{animationDelay: '0.8s'}}>
              <ErrorBoundary>
                <Suspense fallback={
                  <div className="py-8">
                    <LoadingSpinner size="md" text="Carregando comentários..." />
                  </div>
                }>
                  <CommentSection productId={product.id} ref={commentSectionRef} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
});

ProductDetail.displayName = 'ProductDetail';

export default ProductDetail;