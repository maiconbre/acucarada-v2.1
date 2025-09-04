import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/useUser';

interface ProductAnalytics {
  total_likes: number;
  total_shares: number;
  total_clicks: number;
  is_liked: boolean;
}

interface UseProductAnalyticsReturn {
  analytics: ProductAnalytics;
  loading: boolean;
  toggleLike: () => Promise<void>;
  trackShare: (shareType: string, pageSource?: string) => Promise<void>;
  trackClick: (clickType: string, pageSource?: string) => Promise<void>;
}



export const useProductAnalytics = (productId: string): UseProductAnalyticsReturn => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<ProductAnalytics>({
    total_likes: 0,
    total_shares: 0,
    total_clicks: 0,
    is_liked: false,
  });

  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => {
    // Generate or get session ID for anonymous users
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  });

  // Use centralized user context
  const { getCurrentUser, getUserIP, getUserAgent } = useUser();

  // Cache para analytics
  const analyticsCache = useState(() => new Map<string, { data: ProductAnalytics; timestamp: number }>())[0];
  const CACHE_DURATION = 30000; // 30 segundos

  // Fetch analytics data com cache e timeout reduzido
  const fetchAnalytics = useCallback(async () => {
    // Verificar cache primeiro
    const cached = analyticsCache.get(productId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setAnalytics(cached.data);
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      console.warn('Analytics fetch timeout');
      setLoading(false);
      // Usar dados padrão em caso de timeout
      setAnalytics({
        total_likes: 0,
        total_shares: 0,
        total_clicks: 0,
        is_liked: false,
      });
    }, 3000); // Reduzido para 3 segundos

    try {
      setLoading(true);
      
      // Buscar analytics e like status em paralelo para melhor performance
      const [analyticsResult, currentUser] = await Promise.all([
        supabase
          .from('product_analytics')
          .select('total_likes, total_shares, total_clicks')
          .eq('product_id', productId)
          .limit(1),
        getCurrentUser()
      ]);

      const { data: analyticsData, error: analyticsError } = analyticsResult;
      
      if (analyticsError) {
        console.warn('Error fetching analytics:', analyticsError);
      }
      
      const analytics = analyticsData && analyticsData.length > 0 ? analyticsData[0] : null;

      // Check if user has liked this product (otimizado)
      let isLiked = false;
      try {
        if (currentUser) {
          const { data: likeData } = await supabase
            .from('product_likes')
            .select('id')
            .eq('product_id', productId)
            .eq('user_id', currentUser.id)
            .limit(1)
            .maybeSingle(); // Usar maybeSingle para melhor performance
          
          isLiked = !!likeData;
        } else {
          const { data: likeData } = await supabase
            .from('product_likes')
            .select('id')
            .eq('product_id', productId)
            .eq('session_id', sessionId)
            .limit(1)
            .maybeSingle();
          
          isLiked = !!likeData;
        }
      } catch (likeError) {
        console.warn('Error checking like status:', likeError);
        // Continuar com isLiked = false
      }

      const finalAnalytics = {
        total_likes: analytics?.total_likes || 0,
        total_shares: analytics?.total_shares || 0,
        total_clicks: analytics?.total_clicks || 0,
        is_liked: isLiked,
      };

      // Armazenar no cache
      analyticsCache.set(productId, {
        data: finalAnalytics,
        timestamp: Date.now()
      });

      setAnalytics(finalAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback para dados padrão
      setAnalytics({
        total_likes: 0,
        total_shares: 0,
        total_clicks: 0,
        is_liked: false,
      });
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [productId, sessionId, getCurrentUser, analyticsCache]);

  // Toggle like
  const toggleLike = async () => {
    try {
      const currentUser = await getCurrentUser();
      const ip = await getUserIP();

      const { data, error } = await supabase.rpc('toggle_product_like', {
        p_product_id: productId,
        p_user_id: currentUser?.id || null,
        p_session_id: currentUser ? null : sessionId,
        p_ip_address: ip,
      });

      if (error) throw error;

      // Update local state
      setAnalytics(prev => ({
        ...prev,
        is_liked: data,
        total_likes: data ? prev.total_likes + 1 : prev.total_likes - 1,
      }));

      toast({
        title: data ? 'Produto curtido!' : 'Curtida removida',
        description: data ? 'Você curtiu este produto.' : 'Você removeu a curtida deste produto.',
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua curtida. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Track share
  const trackShare = async (shareType: string, pageSource?: string) => {
    try {
      const currentUser = await getCurrentUser();
      const ip = await getUserIP();
      const userAgent = getUserAgent();

      console.log('🔗 Tentando rastrear compartilhamento:', {
        productId,
        shareType,
        pageSource: pageSource || window.location.pathname,
        userId: currentUser?.id || null,
        sessionId: currentUser ? null : sessionId
      });

      const { data, error } = await supabase.rpc('track_product_share', {
        p_product_id: productId,
        p_share_type: shareType,
        p_page_source: pageSource || window.location.pathname,
        p_user_id: currentUser?.id || null,
        p_session_id: currentUser ? null : sessionId,
        p_ip_address: ip,
        p_user_agent: userAgent,
      });

      if (error) {
        console.error('❌ Erro na função track_product_share:', error);
        throw error;
      }

      console.log('✅ Compartilhamento rastreado com sucesso:', data);

      // Update local state
      setAnalytics(prev => ({
        ...prev,
        total_shares: prev.total_shares + 1,
      }));
    } catch (error) {
      console.error('❌ Erro geral ao rastrear compartilhamento:', error);
    }
  };

  // Track click
  const trackClick = async (clickType: string, pageSource?: string) => {
    try {
      const currentUser = await getCurrentUser();
      const ip = await getUserIP();
      const userAgent = getUserAgent();

      const { error } = await supabase.rpc('track_product_click', {
        p_product_id: productId,
        p_click_type: clickType,
        p_page_source: pageSource || window.location.pathname,
        p_user_id: currentUser?.id || null,
        p_session_id: currentUser ? null : sessionId,
        p_ip_address: ip,
        p_user_agent: userAgent,
      });

      if (error) throw error;

      // Update local state
      setAnalytics(prev => ({
        ...prev,
        total_clicks: prev.total_clicks + 1,
      }));
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };



  useEffect(() => {
    if (!productId) return;
    
    fetchAnalytics();

    // Set up subscription for analytics
    const analyticsSubscription = supabase
      .channel(`product_analytics_${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_analytics',
          filter: `product_id=eq.${productId}`,
        },
        (payload) => {
          console.log('Analytics updated:', payload);
          fetchAnalytics();
        }
      )
      .subscribe();

    // Set up subscription for likes
    const likesSubscription = supabase
      .channel(`product_likes_${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_likes',
          filter: `product_id=eq.${productId}`,
        },
        (payload) => {
          console.log('Likes updated:', payload);
          fetchAnalytics();
        }
      )
      .subscribe();

    // Set up subscription for shares
    const sharesSubscription = supabase
      .channel(`product_shares_${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_shares',
          filter: `product_id=eq.${productId}`,
        },
        (payload) => {
          console.log('Shares updated:', payload);
          fetchAnalytics();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      analyticsSubscription.unsubscribe();
      likesSubscription.unsubscribe();
      sharesSubscription.unsubscribe();
    };
  }, [productId, fetchAnalytics]);

  return {
    analytics,
    loading,
    toggleLike,
    trackShare,
    trackClick,
  };
};