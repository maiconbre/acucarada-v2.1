import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Heart, MousePointer, Users, Package } from 'lucide-react';

interface ProductAnalytics {
  id: string;
  product_id: string;
  product_name: string;
  product_category: string;
  total_likes: number;
  total_clicks: number;
  unique_viewers: number; // Sempre 0 - tracking removido
  last_updated: string;
}

interface OverallStats {
  total_products: number;
  total_likes: number;
  total_clicks: number;
  total_shares: number;
  total_unique_viewers: number; // Sempre 0 - tracking removido
  most_liked_product: string;
}

interface AnalyticsChartProps {
  analytics: ProductAnalytics[];
  overallStats: OverallStats | null;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ analytics, overallStats }) => {
  if (!overallStats) {
    return (
      <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Métricas de Analytics
          </CardTitle>
          <CardDescription>
            Carregando dados de analytics...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topProducts = analytics
    .sort((a, b) => b.total_likes - a.total_likes)
    .slice(0, 5);

  const mostEngagedProducts = analytics
    .sort((a, b) => (b.total_likes + b.total_clicks) - (a.total_likes + a.total_clicks))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Grid Principal - Top 5 Produtos e Maior Engajamento lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos Mais Curtidos */}
        <Card className="hidden sm:block transition-all duration-300 hover:shadow-lg border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Top 5 Produtos Mais Curtidos
            </CardTitle>
            <CardDescription>
              Produtos com maior número de curtidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.product_name}</p>
                      <p className="text-xs text-muted-foreground">{product.product_category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{product.total_likes.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">curtidas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Produtos com Maior Engajamento */}
        <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Produtos com Maior Engajamento
            </CardTitle>
            <CardDescription>
              Produtos com mais curtidas e cliques combinados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostEngagedProducts.map((product, index) => {
                const totalEngagement = product.total_likes + product.total_clicks;
                return (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.product_name}</p>
                        <p className="text-xs text-muted-foreground">{product.product_category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">{totalEngagement.toLocaleString()}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{product.total_likes} ❤️</span>
                        <span>{product.total_clicks} 👆</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card className="transition-all duration-300 hover:shadow-lg border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              Produto Mais Curtido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-green-600">
              {overallStats.most_liked_product || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Produto com maior número de curtidas
            </p>
          </CardContent>
        </Card>
        {/* Card "Produto Mais Visto" removido - tracking eliminado */}
      </div>
    </div>
  );
};

export default AnalyticsChart;