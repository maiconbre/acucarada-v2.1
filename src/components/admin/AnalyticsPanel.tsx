import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Eye, MousePointer, Users, Activity, RefreshCw } from 'lucide-react';
import AnalyticsChart from './AnalyticsChart';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProductAnalytics {
  id: string;
  product_id: string;
  product_name: string;
  product_category: string;
  total_likes: number;
  total_views: number;
  total_clicks: number;
  unique_viewers: number;
  last_updated: string;
}

interface OverallStats {
  total_products: number;
  total_likes: number;
  total_views: number;
  total_clicks: number;
  total_unique_viewers: number;
  most_liked_product: string;
  most_viewed_product: string;
}

interface ClickTypeStats {
  click_type: string;
  count: number;
  percentage: number;
}

interface AnalyticsDataItem {
  id: string;
  product_id: string;
  total_likes: number;
  total_views: number;
  total_clicks: number;
  unique_viewers: number;
  products: {
    name: string;
    category: string;
  };
}

interface ClickDataItem {
  click_type: string;
}

const AnalyticsPanel = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<ProductAnalytics[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [clickStats, setClickStats] = useState<ClickTypeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'likes' | 'views' | 'clicks'>('views');

  useEffect(() => {
    fetchAnalytics();

    // Set up real-time subscriptions for analytics updates
    const analyticsSubscription = supabase
      .channel('admin_analytics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_analytics',
        },
        (payload) => {
          console.log('Admin analytics updated:', payload);
          fetchAnalytics();
        }
      )
      .subscribe();

    const likesSubscription = supabase
      .channel('admin_likes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_likes',
        },
        (payload) => {
          console.log('Admin likes updated:', payload);
          fetchAnalytics();
        }
      )
      .subscribe();

    const viewsSubscription = supabase
      .channel('admin_views')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_views',
        },
        (payload) => {
          console.log('Admin views updated:', payload);
          fetchAnalytics();
        }
      )
      .subscribe();

    const clicksSubscription = supabase
      .channel('admin_clicks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_clicks',
        },
        (payload) => {
          console.log('Admin clicks updated:', payload);
          fetchAnalytics();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      analyticsSubscription.unsubscribe();
      likesSubscription.unsubscribe();
      viewsSubscription.unsubscribe();
      clicksSubscription.unsubscribe();
    };
  }, [sortBy]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch product analytics with product details
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('product_analytics')
        .select(`
          *,
          products!inner(
            name,
            category
          )
        `);

      if (analyticsError) throw analyticsError;

      // Transform data to include product details
      const transformedData: ProductAnalytics[] = analyticsData?.map((item: AnalyticsDataItem) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.products.name,
        product_category: item.products.category,
        total_likes: item.total_likes || 0,
        total_views: item.total_views || 0,
        total_clicks: item.total_clicks || 0,
        unique_viewers: item.unique_viewers || 0,
        last_updated: new Date().toISOString(), // Default to current timestamp since last_updated is missing from AnalyticsDataItem
      })) || [];

      // Sort data
      const sortedData = transformedData.sort((a, b) => {
        switch (sortBy) {
          case 'likes':
            return b.total_likes - a.total_likes;
          case 'views':
            return b.total_views - a.total_views;
          case 'clicks':
            return b.total_clicks - a.total_clicks;
          default:
            return b.total_views - a.total_views;
        }
      });

      setAnalytics(sortedData);

      // Calculate overall stats
      const totalLikes = transformedData.reduce((sum, item) => sum + item.total_likes, 0);
      const totalViews = transformedData.reduce((sum, item) => sum + item.total_views, 0);
      const totalClicks = transformedData.reduce((sum, item) => sum + item.total_clicks, 0);
      const totalUniqueViewers = transformedData.reduce((sum, item) => sum + item.unique_viewers, 0);
      
      const mostLikedProduct = transformedData.reduce((max, item) => 
        item.total_likes > max.total_likes ? item : max, transformedData[0] || { total_likes: 0, product_name: 'N/A' }
      );
      
      const mostViewedProduct = transformedData.reduce((max, item) => 
        item.total_views > max.total_views ? item : max, transformedData[0] || { total_views: 0, product_name: 'N/A' }
      );

      setOverallStats({
        total_products: transformedData.length,
        total_likes: totalLikes,
        total_views: totalViews,
        total_clicks: totalClicks,
        total_unique_viewers: totalUniqueViewers,
        most_liked_product: mostLikedProduct.product_name,
        most_viewed_product: mostViewedProduct.product_name,
      });

      // Fetch click type statistics
      await fetchClickStats();

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de análise.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [sortBy, toast]);

  const fetchClickStats = async () => {
    try {
      const { data: clickData, error: clickError } = await supabase
        .from('product_clicks')
        .select('click_type');

      if (clickError) throw clickError;

      // Count click types
      const clickCounts: { [key: string]: number } = {};
      clickData?.forEach((click: ClickDataItem) => {
        clickCounts[click.click_type] = (clickCounts[click.click_type] || 0) + 1;
      });

      const totalClicks = Object.values(clickCounts).reduce((sum, count) => sum + count, 0);
      
      const clickStatsData: ClickTypeStats[] = Object.entries(clickCounts).map(([type, count]) => ({
        click_type: type,
        count,
        percentage: totalClicks > 0 ? (count / totalClicks) * 100 : 0,
      })).sort((a, b) => b.count - a.count);

      setClickStats(clickStatsData);
    } catch (error) {
      console.error('Error fetching click stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const getClickTypeLabel = (clickType: string) => {
    const labels: { [key: string]: string } = {
      'view_details': 'Ver Detalhes',
      'like': 'Curtir',
      'share': 'Compartilhar',
      'whatsapp_order': 'Pedido WhatsApp',
      'image_click': 'Clique na Imagem',
    };
    return labels[clickType] || clickType;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full sm:w-auto">
          <Select value={sortBy} onValueChange={(value: 'likes' | 'views' | 'clicks') => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="views">Mais Visualizados</SelectItem>
              <SelectItem value="likes">Mais Curtidos</SelectItem>
              <SelectItem value="clicks">Mais Clicados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={fetchAnalytics} variant="outline" size="sm" className="flex-1 sm:flex-none transition-all duration-200 hover:scale-105">
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas Gerais */}
      {overallStats && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="transition-all duration-200 hover:shadow-md border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gray-50">
                  <Activity className="h-4 w-4 text-gray-600" />
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">{overallStats.total_products}</div>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Produtos</h3>
                <p className="text-xs text-muted-foreground">Com dados de análise</p>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-red-50">
                  <Heart className="h-4 w-4 text-red-600" />
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-2xl font-bold text-red-500">{overallStats.total_likes}</div>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Curtidas</h3>
                <p className="text-xs text-muted-foreground truncate" title={`Produto mais curtido: ${overallStats.most_liked_product}`}>
                  <span className="hidden sm:inline">Mais curtido: </span>
                  <span className="sm:hidden">Top: </span>
                  {overallStats.most_liked_product}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-2xl font-bold text-blue-500">{overallStats.total_views}</div>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Visualizações</h3>
                <p className="text-xs text-muted-foreground truncate" title={`Produto mais visto: ${overallStats.most_viewed_product}`}>
                  <span className="hidden sm:inline">Mais visto: </span>
                  <span className="sm:hidden">Top: </span>
                  {overallStats.most_viewed_product}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-green-50">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-2xl font-bold text-green-500">{overallStats.total_unique_viewers}</div>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Visitantes</h3>
                <p className="text-xs text-muted-foreground">
                  <span className="hidden sm:inline">Cliques: </span>
                  <span className="sm:hidden">Cliques: </span>
                  {overallStats.total_clicks}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de Analytics */}
      <AnalyticsChart analytics={analytics} overallStats={overallStats} />

      {/* Tabela de Analytics por Produto */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Produto</CardTitle>
          <CardDescription>
            Estatísticas detalhadas de interação para cada produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Heart className="h-4 w-4" />
                    Curtidas
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-4 w-4" />
                    Visualizações
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <MousePointer className="h-4 w-4" />
                    Cliques
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4" />
                    Únicos
                  </div>
                </TableHead>
                <TableHead>Última Atualização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.product_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.product_category}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-red-500">{item.total_likes}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-blue-500">{item.total_views}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-purple-500">{item.total_clicks}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-green-500">{item.unique_viewers}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(item.last_updated)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Estatísticas de Tipos de Clique */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Interação</CardTitle>
          <CardDescription>
            Distribuição dos tipos de cliques realizados pelos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clickStats.map((stat) => (
              <div key={stat.click_type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{getClickTypeLabel(stat.click_type)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold">{stat.count}</div>
                    <div className="text-sm text-muted-foreground">{stat.percentage.toFixed(1)}%</div>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPanel;