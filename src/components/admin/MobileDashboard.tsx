import { Package, Star, Tag, BarChart3, TrendingUp, Users, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionButton {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface MobileDashboardProps {
  products: any[];
  onNavigate: (section: string) => void;
  onQuickAction?: (action: string) => void;
}

const MobileDashboard = ({ products, onNavigate, onQuickAction }: MobileDashboardProps) => {
  const activeProducts = products.filter(p => p.is_active).length;
  const featuredProducts = products.filter(p => p.is_featured).length;
  const categoriesCount = [...new Set(products.map(p => p.category))].length;

  const quickActions: QuickActionButton[] = [
    {
      id: "add-product",
      title: "Novo Produto",
      description: "Adicionar produto",
      icon: Plus,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: () => onQuickAction?.("add-product")
    },
    {
      id: "view-products",
      title: "Ver Produtos",
      description: "Lista completa",
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-50",
      onClick: () => onNavigate("products")
    },
    {
      id: "manage-categories",
      title: "Categorias",
      description: "Gerenciar tipos",
      icon: Tag,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      onClick: () => onNavigate("categories")
    },
    {
      id: "view-analytics",
      title: "Relatórios",
      description: "Analytics",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      onClick: () => onNavigate("analytics")
    }
  ];

  return (
    <div className="space-y-6 pb-20"> {/* pb-20 para espaço do menu inferior */}
      {/* Resumo Rápido */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col items-center space-y-1">
              <Package className="h-5 w-5 text-blue-600" />
              <div className="text-lg font-bold">{products.length}</div>
              <div className="text-xs text-muted-foreground">Produtos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col items-center space-y-1">
              <Star className="h-5 w-5 text-yellow-600" />
              <div className="text-lg font-bold">{featuredProducts}</div>
              <div className="text-xs text-muted-foreground">Destaques</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col items-center space-y-1">
              <Tag className="h-5 w-5 text-purple-600" />
              <div className="text-lg font-bold">{categoriesCount}</div>
              <div className="text-xs text-muted-foreground">Categorias</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground px-1">Ações Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Card 
                key={action.id}
                className={cn(
                  "transition-all duration-300 hover:shadow-lg active:scale-95 cursor-pointer border-0 shadow-sm",
                  "hover:shadow-xl transform hover:-translate-y-1",
                  "mobile-touch-target mobile-card-hover mobile-ripple"
                )}
                onClick={action.onClick}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={cn(
                      "p-3 rounded-full",
                      action.bgColor
                    )}>
                      <Icon className={cn("h-6 w-6", action.color)} />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-foreground">
                        {action.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Status Rápido */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Produtos Ativos</span>
            <span className="text-sm font-medium">{activeProducts}/{products.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Em Destaque</span>
            <span className="text-sm font-medium">{featuredProducts}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Categorias</span>
            <span className="text-sm font-medium">{categoriesCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileDashboard;