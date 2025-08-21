import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductAnalytics {
  total_likes: number;
  total_views: number;
  total_clicks: number;
  unique_viewers: number;
  is_liked: boolean;
}

interface UseProductAnalyticsReturn {
  analytics: ProductAnalytics;
  loading: boolean;
  toggleLike: () => Promise<void>;
  trackView: () => Promise<void>;
  trackClick: (clickType: string, pageSource?: string) => Promise<void>;
}

export const useProductAnalytics = (productId: string): UseProductAnalyticsReturn => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<ProductAnalytics>({
    total_likes: 0,
    total_views: 0,
    total_clicks: 0,
    unique_viewers: 0,
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

  // Get user IP address (simplified)
  const getUserIP = async (): Promise<string | null> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return null;
    }
  };

  // Get user agent
  const getUserAgent = (): string => {
    return navigator.userAgent;
  };

  // Get current user
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get analytics summary
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('product_analytics')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (analyticsError && analyticsError.code !== 'PGRST116') {
        throw analyticsError;
      }

      // Check if user has liked this product
      const user = await getCurrentUser();
      let isLiked = false;

      if (user) {
        const { data: likeData } = await supabase
          .from('product_likes')
          .select('id')
          .eq('product_id', productId)
          .eq('user_id', user.id)
          .single();
        isLiked = !!likeData;
      } else {
        const { data: likeData } = await supabase
          .from('product_likes')
          .select('id')
          .eq('product_id', productId)
          .eq('session_id', sessionId)
          .single();
        isLiked = !!likeData;
      }

      setAnalytics({
        total_likes: analyticsData?.total_likes || 0,
        total_views: analyticsData?.total_views || 0,
        total_clicks: analyticsData?.total_clicks || 0,
        unique_viewers: analyticsData?.unique_viewers || 0,
        is_liked: isLiked,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [productId, sessionId]);

  // Toggle like
  const toggleLike = async () => {
    try {
      const user = await getCurrentUser();
      const ip = await getUserIP();

      const { data, error } = await supabase.rpc('toggle_product_like', {
        p_product_id: productId,
        p_user_id: user?.id || null,
        p_session_id: user ? null : sessionId,
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

  // Track view
  const trackView = async () => {
    try {
      const user = await getCurrentUser();
      const ip = await getUserIP();
      const userAgent = getUserAgent();
      const referrer = document.referrer;

      const { error } = await supabase.rpc('track_product_view', {
        p_product_id: productId,
        p_user_id: user?.id || null,
        p_session_id: user ? null : sessionId,
        p_ip_address: ip,
        p_user_agent: userAgent,
        p_referrer: referrer || null,
      });

      if (error) throw error;

      // Update local state
      setAnalytics(prev => ({
        ...prev,
        total_views: prev.total_views + 1,
      }));
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Track click
  const trackClick = async (clickType: string, pageSource?: string) => {
    try {
      const user = await getCurrentUser();
      const ip = await getUserIP();
      const userAgent = getUserAgent();

      const { error } = await supabase.rpc('track_product_click', {
        p_product_id: productId,
        p_click_type: clickType,
        p_page_source: pageSource || window.location.pathname,
        p_user_id: user?.id || null,
        p_session_id: user ? null : sessionId,
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
    if (productId) {
      fetchAnalytics();

      // Set up real-time subscription for analytics updates
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
            // Refetch analytics when there's a change
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

      // Set up subscription for views
      const viewsSubscription = supabase
        .channel(`product_views_${productId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'product_views',
            filter: `product_id=eq.${productId}`,
          },
          (payload) => {
            console.log('Views updated:', payload);
            fetchAnalytics();
          }
        )
        .subscribe();

      // Cleanup subscriptions on unmount
      return () => {
        analyticsSubscription.unsubscribe();
        likesSubscription.unsubscribe();
        viewsSubscription.unsubscribe();
      };
    }
  }, [productId, fetchAnalytics]);

  return {
    analytics,
    loading,
    toggleLike,
    trackView,
    trackClick,
  };
};