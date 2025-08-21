import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Heart, Share2, Eye } from "lucide-react";
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
      // Track view when component mounts
      trackView();
    }
  }, [id]);

  const fetchProduct = async () => {
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
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;
    
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <div className="container mx-auto px-4 py-8">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-0 h-auto font-normal hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <span>/</span>
          <span>Catálogo</span>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Imagem do Produto */}
          <div className="relative">
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
                {product.is_featured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground">
                      Destaque
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="font-display text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">
                    Preço
                  </span>
                  <span className="text-4xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="h-12 w-12"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleLikeClick}
                    className={`h-12 w-12 transition-colors ${
                      analytics.is_liked ? 'text-red-500 border-red-500' : ''
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${analytics.is_liked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleWhatsAppOrder}
                size="lg"
                className="w-full h-14 text-lg font-semibold"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Pedir pelo WhatsApp
              </Button>
            </div>

            {/* Estatísticas do Produto */}
            <Card className="border-0 bg-muted/50 mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Estatísticas</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-lg font-bold text-red-500">
                      <Heart className="h-4 w-4" />
                      {analytics.total_likes}
                    </div>
                    <span className="text-xs text-muted-foreground">Curtidas</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-lg font-bold text-blue-500">
                      <Eye className="h-4 w-4" />
                      {analytics.total_views}
                    </div>
                    <span className="text-xs text-muted-foreground">Visualizações</span>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card className="border-0 bg-muted/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Informações do Produto</h3>
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