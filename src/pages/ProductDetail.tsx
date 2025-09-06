import React, { useState, useEffect, useCallback, useRef, memo, lazy, Suspense } from "react";
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
}

const FlavorButton = ({ sabor, isSelected, onClick, variant }: FlavorButtonProps) => {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      onClick={() => onClick(sabor)}
      className={`font-medium transition-all duration-200 ${
        variant === 'mobile' ? 'h-6 px-2 text-xs' : 'h-7 px-2.5 text-xs'
      } ${
        isSelected 
          ? 'bg-purple-600 text-white shadow-md scale-105 border-purple-600'
          : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 hover:border-purple-300'
      }`}
    >
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

  const handleFlavorClick = (flavor: string) => {
    if (selectedFlavor === flavor) return;
    
    setSelectedFlavor(flavor);
    
    const saborImages = product?.sabor_images as Record<string, string> | null;
    const newImage = (saborImages && saborImages[flavor]) 
      ? saborImages[flavor] 
      : product?.image_url || '';
    
    if (newImage && newImage !== activeImage) {
      setActiveImage(newImage);
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

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={activeImage || product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setActiveImage(product.image_url)}
                />
                
                <div className="absolute top-4 left-4">
                  <Badge className={product.is_featured ? 'bg-green-600' : 'bg-orange-600'}>
                    {product.is_featured ? 'Em estoque' : 'Sob encomenda'}
                  </Badge>
                </div>
              </div>
            </Card>
            
            {product.sabores && product.sabores.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Sabores Disponíveis</h3>
                  <div className="flex flex-wrap gap-2">
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
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-2xl font-semibold text-rose-600 mb-4">
                {formatPrice(product.price)}
              </p>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleWhatsAppOrder}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Pedir pelo WhatsApp
              </Button>
              
              <div className="grid grid-cols-3 gap-3">
                <Card className="cursor-pointer" onClick={handleShare}>
                  <CardContent className="p-3 text-center">
                    <Share2 className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-xs">Compartilhar</span>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer" onClick={handleLikeClick}>
                  <CardContent className="p-3 text-center">
                    <Heart className={`h-5 w-5 mx-auto mb-1 ${analytics.is_liked ? 'fill-current text-red-600' : ''}`} />
                    <span className="text-xs">Curtir</span>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer" onClick={handleCommentClick}>
                  <CardContent className="p-3 text-center">
                    <MessageCircle className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-xs">Comentar</span>
                  </CardContent>
                </Card>
              </div>
            </div>

            {(product.ingredientes || product.validade_armazenamento_dias) && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Informações do Produto</h3>
                  
                  {product.ingredientes && (
                    <div className="mb-3">
                      <h4 className="font-medium mb-1">Ingredientes:</h4>
                      <p className="text-sm text-muted-foreground">{product.ingredientes}</p>
                    </div>
                  )}
                  
                  {product.validade_armazenamento_dias && (
                    <div className="text-sm text-muted-foreground">
                      Validade: {product.validade_armazenamento_dias} dias
                    </div>
                  )}
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