import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
import { useToast } from "@/hooks/use-toast";
import { OptimizedImage } from "@/components/ui/optimized-image";
import type { Json } from '@/integrations/supabase/types';

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
  sabor_images?: Json;
  is_featured: boolean;
  is_on_promotion?: boolean;
  promotional_price?: number;
  promotion_start_date?: string;
  promotion_end_date?: string;
}

const ProductCard = memo(({ id, name, description, price, image_url, category, is_featured, is_on_promotion, promotional_price, promotion_start_date, promotion_end_date }: ProductCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { analytics, toggleLike, trackShare, trackClick, loading: analyticsLoading } = useProductAnalytics(id);

  const handleCardClick = useCallback(() => {
    trackClick('view_details', 'catalog');
    navigate(`/produto/${id}`);
  }, [id, navigate, trackClick]);

  const handleLikeClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLike();
    trackClick('like', 'catalog');
  }, [toggleLike, trackClick]);



  return (
    <Card 
      className="group overflow-hidden border-0 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm cursor-pointer product-card hover:scale-[1.02] transform-gpu"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden transition-all duration-300">
        <OptimizedImage
          src={image_url}
          alt={name}
          className="w-full h-48 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          containerClassName="w-full h-48 md:h-64"
          width={400}
          height={256}
          lazy={true}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {is_on_promotion && (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
              Promoção
            </span>
          )}
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
          {is_on_promotion && promotional_price ? (
            <div className="flex flex-col">
              <span className="text-sm md:text-lg text-gray-500 line-through">
                R$ {price.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-lg md:text-2xl font-bold text-green-600">
                R$ {promotional_price.toFixed(2).replace('.', ',')}
              </span>
            </div>
          ) : (
            <span className="text-lg md:text-2xl font-bold text-primary">
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`p-2 h-8 w-8 md:h-auto md:w-auto md:p-1 transition-all duration-200 rounded-full md:rounded-md transform hover:scale-110 ${
                analytics.is_liked ? 'text-red-500 bg-red-50' : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
              }`}
              onClick={handleLikeClick}
              disabled={analyticsLoading}
            >
              <Heart className={`h-4 w-4 md:h-4 md:w-4 ${analytics.is_liked ? 'fill-current' : ''}`} />
              <span className="hidden md:inline ml-1 text-xs">
                {analyticsLoading ? '...' : analytics.total_likes || 0}
              </span>
            </Button>

            <span className="text-xs md:text-sm text-muted-foreground font-medium hidden lg:inline">
              Ver detalhes
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;