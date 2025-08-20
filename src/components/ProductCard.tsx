import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
}

const ProductCard = ({ name, description, price, image, category }: ProductCardProps) => {
  const handleOrderClick = () => {
    const whatsappNumber = "5511999999999";
    const message = encodeURIComponent(`Olá! Gostaria de encomendar: ${name} - ${price} 🍫`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
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
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className="h-4 w-4" />
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
          <Button
            variant="hero"
            size="sm"
            onClick={handleOrderClick}
            className="px-6"
          >
            <ShoppingCart className="h-4 w-4" />
            Pedir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;