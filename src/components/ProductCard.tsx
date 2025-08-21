import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
import { useEffect } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
}

const ProductCard = ({ id, name, description, price, image, category }: ProductCardProps) => {
  const navigate = useNavigate();
  const { analytics, toggleLike, trackView, trackClick } = useProductAnalytics(id);

  // Track view when component mounts
  useEffect(() => {
    trackView();
  }, []);

  const handleCardClick = () => {
    trackClick('view_details', 'catalog');
    navigate(`/produto/${id}`);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLike();
    trackClick('like', 'catalog');
  };

  return (
    <Card 
      className="group overflow-hidden border-0 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-primary-soft/90 backdrop-blur-sm text-primary text-xs px-3 py-1 rounded-full font-medium">
            {category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <Button
            variant="soft"
            size="icon"
            className={`h-8 w-8 opacity-0 group-hover:opacity-100 transition-all ${
              analytics.is_liked ? 'text-red-500 opacity-100' : ''
            }`}
            onClick={handleLikeClick}
          >
            <Heart className={`h-4 w-4 ${analytics.is_liked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="font-display font-semibold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            {price}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>{analytics.total_likes}</span>
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              Ver detalhes
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;