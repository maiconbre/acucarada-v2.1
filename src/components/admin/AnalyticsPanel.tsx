import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, MousePointer, Users, Activity, RefreshCw, Share } from 'lucide-react';
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
  total_clicks: number;
  total_shares: number;
  last_updated: string;
}

interface OverallStats {
  total_products: number;
  total_likes: number;
  total_clicks: number;
  total_shares: number;
  most_liked_product: string;
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
  total_clicks: number;
  total_shares: number;
  last_updated: string;
  updated_at: string;
  products: {
    name: string;
    category: string;
    is_active: boolean;
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
  const [sortBy, setSortBy] = useState<'likes' | 'clicks'>('likes');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch product analytics with product details (only active products)
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('product_analytics')
        .select(`
          *,
          products!inner(
            name,
            category,
            is_active
          )
        `)
        .eq('products.is_active', true);

      if (analyticsError) throw analyticsError;

      // Transform data to include product details
      const transformedData: ProductAnalytics[] = analyticsData?.map((item: AnalyticsDataItem) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.products.name,
        product_category: item.products.category,
        total_likes: item.total_likes || 0,
        total_clicks: item.total_clicks || 0,
        total_shares: item.total_shares || 0,
        last_updated: item.last_updated,
      })) || [];

      // Sort data
      const sortedData = transformedData.sort((a, b) => {
        switch (sortBy) {
          case 'likes':
            return b.total_likes - a.total_likes;
          case 'clicks':
            return b.total_clicks - a.total_clicks;
          default:
            return b.total_likes - a.total_likes;
        }
      });

      setAnalytics(sortedData);

      // Calculate overall stats
      const totalLikes = transformedData.reduce((sum, item) => sum + (item.total_likes || 0), 0);
      const totalClicks = transformedData.reduce((sum, item) => sum + (item.total_clicks || 0), 0);
      const totalShares = transformedData.reduce((sum, item) => sum + (item.total_shares || 0), 0);
      
      const mostLikedProduct = transformedData.length > 0 
        ? transformedData.reduce((max, item) => 
            (item.total_likes || 0) > (max.total_likes || 0) ? item : max
          )
        : { total_likes: 0, product_name: 'N/A' };

      setOverallStats({
        total_products: transformedData.length,
        total_likes: totalLikes,
        total_clicks: totalClicks,
        total_shares: totalShares,
        most_liked_product: mostLikedProduct.product_name,
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

    // Views subscription removido - tracking de views foi eliminado

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

    const sharesSubscription = supabase
      .channel('admin_shares')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_shares',
        },
        (payload) => {
          console.log('Admin shares updated:', payload);
          fetchAnalytics();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      analyticsSubscription.unsubscribe();
      likesSubscription.unsubscribe();
      clicksSubscription.unsubscribe();
      sharesSubscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClickStats = async () => {
    try {
      // Fetch click stats only for active products
      const { data: clickData, error: clickError } = await supabase
        .from('product_clicks')
        .select(`
          click_type,
          products!inner(
            is_active
          )
        `)
        .eq('products.is_active', true);

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
      {/* Filtros - Ocultos no mobile */}
      <div className="hidden sm:flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full sm:w-auto">
          <Select value={sortBy} onValueChange={(value: 'likes' | 'clicks') => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
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
        <>
          {/* Layout Mobile - 4 cards em grade 2x2 */}
          <div className="grid grid-cols-2 gap-3 sm:hidden">
            {/* Card de Engajamento (Cliques) - Primeiro no mobile */}
            <Card className="transition-all duration-200 hover:shadow-md border-0 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <MousePointer className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-500">{overallStats.total_clicks}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Engajamento</h3>
                  <p className="text-xs text-muted-foreground">Total de cliques</p>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md border-0 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <Activity className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{overallStats.total_products}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Produtos</h3>
                  <p className="text-xs text-muted-foreground">Com dados de análise</p>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md border-0 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <Share className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-500">{overallStats.total_shares}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Compartilhamentos</h3>
                  <p className="text-xs text-muted-foreground">Total de shares</p>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md border-0 shadow-sm">
              <CardContent className="p-3">

              </CardContent>
            </Card>
          </div>

          {/* Layout Desktop - 5 cards */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="transition-all duration-200 hover:shadow-md border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <Activity className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{overallStats.total_products}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Produtos</h3>
                  <p className="text-xs text-muted-foreground">Com dados de análise</p>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-red-50">
                    <Heart className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-500">{overallStats.total_likes}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Curtidas</h3>
                  <p className="text-xs text-muted-foreground truncate" title={`Produto mais curtido: ${overallStats.most_liked_product}`}>
                    Mais curtido: {overallStats.most_liked_product}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <MousePointer className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-500">{overallStats.total_clicks}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Engajamento</h3>
                  <p className="text-xs text-muted-foreground">Total de cliques</p>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <Share className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-500">{overallStats.total_shares}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Compartilhamentos</h3>
                  <p className="text-xs text-muted-foreground">Total de shares</p>
                </div>
              </CardContent>
            </Card>


          </div>
        </>
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
                {/* Coluna de visualizações removida - tracking eliminado */}
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <MousePointer className="h-4 w-4" />
                    Cliques
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Share className="h-4 w-4" />
                    Shares
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
                  {/* Célula de visualizações removida - tracking eliminado */}
                  <TableCell className="text-center">
                    <span className="font-bold text-blue-500">{item.total_clicks}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-purple-500">{item.total_shares}</span>
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