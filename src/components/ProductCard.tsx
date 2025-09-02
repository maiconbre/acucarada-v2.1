import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
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
}

const ProductCard = ({ id, name, description, price, image_url, category, is_featured }: ProductCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { analytics, toggleLike, trackShare, trackClick } = useProductAnalytics(id);

  const handleCardClick = () => {
    trackClick('view_details', 'catalog');
    navigate(`/produto/${id}`);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLike();
    trackClick('like', 'catalog');
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareData = {
      title: name,
      text: `Confira este delicioso ${name} - ${price}`,
      url: `${window.location.origin}/produto/${id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        trackShare('native_share', 'catalog');
      } else {
        // Fallback para copiar URL
        await navigator.clipboard.writeText(`${window.location.origin}/produto/${id}`);
        trackShare('copy_link', 'catalog');
        toast({
          title: "Link copiado!",
          description: "O link do produto foi copiado para a área de transferência.",
        });
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  return (
    <Card 
      className="group overflow-hidden border-0 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={image_url}
          alt={name}
          className="w-full h-48 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          width="400"
          height="256"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-primary-soft/90 backdrop-blur-sm text-primary text-xs px-3 py-1 rounded-full font-medium">
            {is_featured ? 'Pronta entrega' : 'Encomenda'}
          </span>
        </div>

      </div>
      
      <CardContent className="p-3 md:p-6">
        <h3 className="font-display font-semibold text-sm md:text-xl mb-1 md:mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {name}
        </h3>
        <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-4 leading-relaxed line-clamp-2 md:line-clamp-3">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-lg md:text-2xl font-bold text-primary">
            R$ {price.toFixed(2).replace('.', ',')}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`p-2 h-8 w-8 md:h-auto md:w-auto md:p-1 transition-colors rounded-full md:rounded-md ${
                analytics.is_liked ? 'text-red-500 bg-red-50' : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
              }`}
              onClick={handleLikeClick}
            >
              <Heart className={`h-4 w-4 md:h-4 md:w-4 ${analytics.is_liked ? 'fill-current' : ''}`} />
              <span className="hidden md:inline ml-1 text-xs">{analytics.total_likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-8 w-8 md:h-auto md:w-auto md:p-1 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-colors rounded-full md:rounded-md"
              onClick={handleShareClick}
            >
              <Share2 className="h-4 w-4 md:h-4 md:w-4" />
              <span className="hidden md:inline ml-1 text-xs">{analytics.total_shares}</span>
            </Button>
            <span className="text-xs md:text-sm text-muted-foreground font-medium hidden lg:inline">
              Ver detalhes
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;