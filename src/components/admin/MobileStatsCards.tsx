import { Package, Star, Tag, BarChart3, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardData {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface MobileStatsCardsProps {
  products: any[];
  onNavigate: (section: string) => void;
}

const MobileStatsCards = ({ products, onNavigate }: MobileStatsCardsProps) => {
  const activeProducts = products.filter(p => p.is_active).length;
  const featuredProducts = products.filter(p => p.is_featured).length;
  const categoriesCount = [...new Set(products.map(p => p.category))].length;

  const statsCards: StatsCardData[] = [
    {
      id: "products",
      title: "Produtos",
      value: products.length,
      subtitle: `${activeProducts} ativos`,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: () => onNavigate("products")
    },
    {
      id: "featured",
      title: "Destaques",
      value: featuredProducts,
      subtitle: "Em destaque",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      onClick: () => onNavigate("products")
    },
    {
      id: "categories",
      title: "Categorias",
      value: categoriesCount,
      subtitle: "Diferentes tipos",
      icon: Tag,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      onClick: () => onNavigate("categories")
    },
    {
      id: "analytics",
      title: "Analytics",
      value: "Ver",
      subtitle: "Relatórios",
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50",
      onClick: () => onNavigate("analytics")
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {statsCards.map((card) => {
        const Icon = card.icon;
        
        return (
          <Card 
            key={card.id}
            className={cn(
              "transition-all duration-300 hover:shadow-lg active:scale-95 cursor-pointer border-0 shadow-sm",
              "hover:shadow-xl transform hover:-translate-y-1",
              "mobile-touch-target mobile-card-hover mobile-ripple"
            )}
            onClick={card.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  card.bgColor
                )}>
                  <Icon className={cn("h-4 w-4", card.color)} />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">
                    {card.value}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {card.subtitle}
                </p>
              </div>
              
              {/* Indicador visual de clique */}
              <div className="mt-2 flex justify-end">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  card.bgColor.replace('50', '200')
                )} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MobileStatsCards;