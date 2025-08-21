import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

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

interface AnalyticsChartProps {
  analytics: ProductAnalytics[];
  overallStats: OverallStats | null;
}

type ChartType = 'bar' | 'line' | 'area' | 'pie';
type MetricType = 'views' | 'likes' | 'clicks' | 'all';

const COLORS = {
  primary: '#8B5CF6',
  secondary: '#06B6D4',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.success, COLORS.warning, COLORS.error];

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ analytics, overallStats }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('views');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Prepare data for charts
  const prepareChartData = () => {
    if (!analytics.length) return [];

    // Get top 10 products for better visualization
    const topProducts = analytics.slice(0, 10);

    return topProducts.map((item, index) => ({
      name: item.product_name.length > 15 
        ? `${item.product_name.substring(0, 15)}...` 
        : item.product_name,
      fullName: item.product_name,
      category: item.product_category,
      views: item.total_views,
      likes: item.total_likes,
      clicks: item.total_clicks,
      unique: item.unique_viewers,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  };

  // Prepare pie chart data
  const preparePieData = () => {
    if (!overallStats) return [];

    return [
      { name: 'Visualizações', value: overallStats.total_views, color: COLORS.primary },
      { name: 'Curtidas', value: overallStats.total_likes, color: COLORS.secondary },
      { name: 'Cliques', value: overallStats.total_clicks, color: COLORS.accent },
    ];
  };

  // Prepare category data
  const prepareCategoryData = () => {
    const categoryStats = analytics.reduce((acc, item) => {
      const category = item.product_category;
      if (!acc[category]) {
        acc[category] = {
          name: category,
          views: 0,
          likes: 0,
          clicks: 0,
          products: 0,
        };
      }
      acc[category].views += item.total_views;
      acc[category].likes += item.total_likes;
      acc[category].clicks += item.total_clicks;
      acc[category].products += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categoryStats);
  };

  const chartData = prepareChartData();
  const pieData = preparePieData();
  const categoryData = prepareCategoryData();

  // Handle smooth transitions
  const handleChartTypeChange = (newType: ChartType) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setChartType(newType);
      setIsTransitioning(false);
    }, 150);
  };

  const handleMetricChange = (newMetric: MetricType) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMetric(newMetric);
      setIsTransitioning(false);
    }, 150);
  };

  const getMetricKey = () => {
    switch (selectedMetric) {
      case 'views': return 'views';
      case 'likes': return 'likes';
      case 'clicks': return 'clicks';
      default: return 'views';
    }
  };

  const getMetricColor = () => {
    switch (selectedMetric) {
      case 'views': return COLORS.primary;
      case 'likes': return COLORS.secondary;
      case 'clicks': return COLORS.accent;
      default: return COLORS.primary;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.fullName || label}</p>
          <p className="text-sm text-gray-600 mb-2">{data.category}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-purple-600">Visualizações:</span> {data.views}
            </p>
            <p className="text-sm">
              <span className="text-cyan-600">Curtidas:</span> {data.likes}
            </p>
            <p className="text-sm">
              <span className="text-amber-600">Cliques:</span> {data.clicks}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado disponível</p>
          </div>
        </div>
      );
    }

    const dataToUse = chartType === 'pie' ? categoryData : chartData;
    const metricKey = getMetricKey();
    const metricColor = getMetricColor();

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dataToUse} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                stroke="#666"
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedMetric === 'all' ? (
                <>
                  <Bar dataKey="views" fill={COLORS.primary} name="Visualizações" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="likes" fill={COLORS.secondary} name="Curtidas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" fill={COLORS.accent} name="Cliques" radius={[4, 4, 0, 0]} />
                </>
              ) : (
                <Bar 
                  dataKey={metricKey} 
                  fill={metricColor} 
                  name={selectedMetric === 'views' ? 'Visualizações' : selectedMetric === 'likes' ? 'Curtidas' : 'Cliques'}
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dataToUse} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                stroke="#666"
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedMetric === 'all' ? (
                <>
                  <Line type="monotone" dataKey="views" stroke={COLORS.primary} strokeWidth={3} name="Visualizações" />
                  <Line type="monotone" dataKey="likes" stroke={COLORS.secondary} strokeWidth={3} name="Curtidas" />
                  <Line type="monotone" dataKey="clicks" stroke={COLORS.accent} strokeWidth={3} name="Cliques" />
                </>
              ) : (
                <Line 
                  type="monotone" 
                  dataKey={metricKey} 
                  stroke={metricColor} 
                  strokeWidth={3}
                  name={selectedMetric === 'views' ? 'Visualizações' : selectedMetric === 'likes' ? 'Curtidas' : 'Cliques'}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dataToUse} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                stroke="#666"
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedMetric === 'all' ? (
                <>
                  <Area type="monotone" dataKey="views" stackId="1" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} name="Visualizações" />
                  <Area type="monotone" dataKey="likes" stackId="1" stroke={COLORS.secondary} fill={COLORS.secondary} fillOpacity={0.6} name="Curtidas" />
                  <Area type="monotone" dataKey="clicks" stackId="1" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.6} name="Cliques" />
                </>
              ) : (
                <Area 
                  type="monotone" 
                  dataKey={metricKey} 
                  stroke={metricColor} 
                  fill={metricColor}
                  fillOpacity={0.6}
                  name={selectedMetric === 'views' ? 'Visualizações' : selectedMetric === 'likes' ? 'Curtidas' : 'Cliques'}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [
                  value.toLocaleString(), 
                  name
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg border-0 shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise Visual de Dados
            </CardTitle>
            <CardDescription>
              Visualização interativa das métricas de engajamento dos produtos
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={chartType} onValueChange={handleChartTypeChange}>
              <SelectTrigger className="w-full sm:w-40 transition-all duration-200 hover:border-primary">
                <SelectValue placeholder="Tipo de gráfico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar" className="transition-colors duration-150 hover:bg-primary/10">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Barras
                  </div>
                </SelectItem>
                <SelectItem value="line" className="transition-colors duration-150 hover:bg-primary/10">
                  <div className="flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4" />
                    Linha
                  </div>
                </SelectItem>
                <SelectItem value="area" className="transition-colors duration-150 hover:bg-primary/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Área
                  </div>
                </SelectItem>
                <SelectItem value="pie" className="transition-colors duration-150 hover:bg-primary/10">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4" />
                    Pizza
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {chartType !== 'pie' && (
              <Select value={selectedMetric} onValueChange={handleMetricChange}>
                <SelectTrigger className="w-full sm:w-40 transition-all duration-200 hover:border-primary">
                  <SelectValue placeholder="Métrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="views" className="transition-colors duration-150 hover:bg-primary/10">Visualizações</SelectItem>
                  <SelectItem value="likes" className="transition-colors duration-150 hover:bg-primary/10">Curtidas</SelectItem>
                  <SelectItem value="clicks" className="transition-colors duration-150 hover:bg-primary/10">Cliques</SelectItem>
                  <SelectItem value="all" className="transition-colors duration-150 hover:bg-primary/10">Todas</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={`w-full transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          {renderChart()}
        </div>
        
        {chartData.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-sm">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Insights:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="transition-all duration-200 hover:text-gray-800">
                <span className="font-medium">Produto mais visualizado:</span>
                <br />
                <span className="text-primary font-medium">{overallStats?.most_viewed_product || 'N/A'}</span>
              </div>
              <div className="transition-all duration-200 hover:text-gray-800">
                <span className="font-medium">Produto mais curtido:</span>
                <br />
                <span className="text-secondary font-medium">{overallStats?.most_liked_product || 'N/A'}</span>
              </div>
              <div className="transition-all duration-200 hover:text-gray-800">
                <span className="font-medium">Total de produtos:</span>
                <br />
                <span className="text-accent font-medium">{overallStats?.total_products || 0} produtos analisados</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;